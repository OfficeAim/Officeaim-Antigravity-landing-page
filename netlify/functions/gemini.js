/**
 * Netlify Serverless Function: gemini
 * Server-side proxy for Google Gemini API using process.env.GEMINI_API_KEY.
 * Requires either:
 *   1) A valid Supabase session token in `Authorization: Bearer <access_token>` (validated against GET {SUPABASE_URL}/auth/v1/user), OR
 *   2) For explicitly allowed public routes (`mascot-widget`, `library-tracker`), an allowed Origin (`https://officeaimhq.netlify.app` or localhost in dev).
 */

const MAX_BODY_BYTES = 4 * 1024 * 1024; // 4 MB max payload
const MAX_OUTPUT_TOKENS = 2048; // Hard server-side ceiling for maxOutputTokens

const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
]);

const ALLOWED_PUBLIC_SCOPES = new Set(['mascot-widget', 'library-tracker']);

function isAllowedOrigin(originHeader) {
  if (!originHeader || typeof originHeader !== 'string') return false;
  const normalized = originHeader.trim().replace(/\/+$/, '').toLowerCase();
  if (normalized === 'https://officeaimhq.netlify.app') return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) return true;
  return false;
}

function getHeader(headers, name) {
  if (!headers || typeof headers !== 'object') return '';
  const target = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === target && typeof v === 'string') {
      return v;
    }
  }
  return '';
}

function sanitizeErrorMessage(message, apiKey) {
  if (!message || typeof message !== 'string') {
    return 'Upstream Gemini API request failed.';
  }
  let sanitized = message;
  if (apiKey) {
    sanitized = sanitized.split(apiKey).join('[REDACTED]');
  }
  sanitized = sanitized.replace(/AIza[A-Za-z0-9_-]+/g, '[REDACTED]');
  return sanitized;
}

function normalizeContents(contents) {
  if (typeof contents === 'string') {
    if (!contents.trim()) return null;
    return [{ role: 'user', parts: [{ text: contents }] }];
  }

  if (Array.isArray(contents) && contents.length > 0) {
    const isContentObjects = contents.every(
      (item) => item && typeof item === 'object' && Array.isArray(item.parts)
    );
    if (isContentObjects) {
      return contents;
    }

    const parts = contents.map((part) =>
      typeof part === 'string' ? { text: part } : part
    );
    return [{ role: 'user', parts }];
  }

  return null;
}

async function verifySupabaseToken(token) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !token) {
    return false;
  }

  try {
    const userEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/user`;
    const res = await fetch(userEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!res.ok) return false;
    const user = await res.json().catch(() => null);
    return Boolean(user && user.id);
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...headers, Allow: 'POST' },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  // 1. Reject any request carrying a foreign Origin header
  const origin = getHeader(event.headers, 'origin');
  if (origin && !isAllowedOrigin(origin)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden origin.' }),
    };
  }

  // 2. Authenticate via Supabase session token OR validate public route Origin
  const authHeader = getHeader(event.headers, 'authorization');
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const accessToken = bearerMatch ? bearerMatch[1].trim() : '';

  if (accessToken) {
    const isValidUser = await verifySupabaseToken(accessToken);
    if (!isValidUser) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: invalid or expired session token.' }),
      };
    }
  } else {
    const publicScope = getHeader(event.headers, 'x-officeaim-public-scope').trim().toLowerCase();
    if (!ALLOWED_PUBLIC_SCOPES.has(publicScope) || !isAllowedOrigin(origin)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: valid session token required.' }),
      };
    }
  }

  const rawBody = event.body || '';
  const bodySize = Buffer.byteLength(rawBody, 'utf8');
  if (!rawBody || bodySize === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Request body is required.' }),
    };
  }

  if (bodySize > MAX_BODY_BYTES) {
    return {
      statusCode: 413,
      headers,
      body: JSON.stringify({ error: 'Request payload exceeds maximum allowed size (4MB).' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error: GEMINI_API_KEY is not configured.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON in request body.' }),
    };
  }

  const { model, contents, config } = payload || {};

  // 3. Do not expose the allowed models list in the error message
  if (!model || typeof model !== 'string' || !ALLOWED_MODELS.has(model)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Unsupported or disallowed model.',
      }),
    };
  }

  const normalizedContents = normalizeContents(contents);
  if (!normalizedContents) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid or empty "contents" parameter.' }),
    };
  }

  const geminiRequestBody = {
    contents: normalizedContents,
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  };

  if (config && typeof config === 'object') {
    if (config.systemInstruction) {
      if (typeof config.systemInstruction === 'string') {
        geminiRequestBody.systemInstruction = {
          parts: [{ text: config.systemInstruction }],
        };
      } else if (config.systemInstruction.parts) {
        geminiRequestBody.systemInstruction = config.systemInstruction;
      }
    }

    if (config.generationConfig && typeof config.generationConfig === 'object') {
      const { maxOutputTokens: nestedMax, ...restGenConfig } = config.generationConfig;
      Object.assign(geminiRequestBody.generationConfig, restGenConfig);
      if (typeof nestedMax === 'number' && Number.isFinite(nestedMax) && nestedMax > 0) {
        geminiRequestBody.generationConfig.maxOutputTokens = Math.min(
          Math.floor(nestedMax),
          MAX_OUTPUT_TOKENS
        );
      }
    }

    const genKeys = ['temperature', 'topP', 'topK', 'responseMimeType'];
    for (const k of genKeys) {
      if (config[k] !== undefined) {
        geminiRequestBody.generationConfig[k] = config[k];
      }
    }

    // 4. Enforce server-side ceiling on maxOutputTokens (ignore higher values)
    if (
      typeof config.maxOutputTokens === 'number' &&
      Number.isFinite(config.maxOutputTokens) &&
      config.maxOutputTokens > 0
    ) {
      geminiRequestBody.generationConfig.maxOutputTokens = Math.min(
        Math.floor(config.maxOutputTokens),
        MAX_OUTPUT_TOKENS
      );
    }

    if (Array.isArray(config.safetySettings)) {
      geminiRequestBody.safetySettings = config.safetySettings;
    }
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiRequestBody),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const rawErrMsg = data?.error?.message || `Gemini API returned status ${response.status}`;
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: sanitizeErrorMessage(rawErrMsg, apiKey),
        }),
      };
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('') || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text,
        candidates: data.candidates || [],
        model,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: sanitizeErrorMessage(err?.message || 'Internal server error calling Gemini API.', apiKey),
      }),
    };
  }
};
