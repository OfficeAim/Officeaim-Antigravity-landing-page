/**
 * Netlify Serverless Function: gemini
 * Server-side proxy for Google Gemini API using process.env.GEMINI_API_KEY.
 * Requires either:
 *   1) A valid Supabase session token in `Authorization: Bearer <access_token>` (validated against GET {SUPABASE_URL}/auth/v1/user), OR
 *   2) For explicitly allowed public routes (`mascot-widget`, `library-tracker`), an allowed Origin (`https://officeaimhq.netlify.app` or localhost in dev),
 *      restricted to the cheapest model (`gemini-3.5-flash`), maxOutputTokens <= 512,
 *      and rate-limited to max 10 requests per IP per 10 minutes + a daily global cap.
 */

const crypto = require('crypto');

const MAX_BODY_BYTES = 4 * 1024 * 1024; // 4 MB max payload
const MAX_OUTPUT_TOKENS = 2048; // Hard server-side ceiling for authenticated requests
const PUBLIC_MAX_OUTPUT_TOKENS = 512; // Hard ceiling for public routes (mascot-widget, library-tracker)

// Ordered from highest tier to cheapest tier; gemini-3.5-flash is the cheapest active model
const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
]);
const PUBLIC_CHEAPEST_MODEL = 'gemini-3.5-flash';

const ALLOWED_PUBLIC_SCOPES = new Set(['mascot-widget', 'library-tracker']);

// Public route rate-limit constants (fixed server-side: 10 per IP / 10 min, 200 per day)
const PUBLIC_IP_MAX_REQUESTS = 10;
const PUBLIC_IP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const PUBLIC_DAILY_GLOBAL_LIMIT = 200;

// Warm-instance rate-limit store (paired with Supabase RLS table `public.gemini_public_rate_limits`)
const ipRateWindows = new Map(); // ipHash -> { count, resetAt }
let dailyGlobalState = {
  dayKey: '',
  count: 0,
};
let hasLoggedMissingServiceRoleWarning = false;

function resetRateLimitsForTest() {
  ipRateWindows.clear();
  dailyGlobalState = { dayKey: '', count: 0 };
  hasLoggedMissingServiceRoleWarning = false;
}

function getUtcDayKey(nowMs = Date.now()) {
  return new Date(nowMs).toISOString().slice(0, 10);
}

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

function extractClientIp(headers) {
  const nfIp = getHeader(headers, 'x-nf-client-connection-ip').trim();
  if (nfIp) return nfIp;

  const clientIp = getHeader(headers, 'client-ip').trim();
  if (clientIp) return clientIp;

  const xff = getHeader(headers, 'x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }

  return 'unknown-ip';
}

function hashIp(ip) {
  return crypto
    .createHash('sha256')
    .update(String(ip || 'unknown-ip'))
    .digest('hex')
    .slice(0, 32);
}

function checkLocalRateLimit(ipHash) {
  const now = Date.now();
  const todayKey = getUtcDayKey(now);

  if (dailyGlobalState.dayKey !== todayKey) {
    dailyGlobalState = { dayKey: todayKey, count: 0 };
  }

  // Cleanup expired IP entries
  for (const [key, entry] of ipRateWindows.entries()) {
    if (entry.resetAt <= now) {
      ipRateWindows.delete(key);
    }
  }

  if (dailyGlobalState.count >= PUBLIC_DAILY_GLOBAL_LIMIT) {
    return { allowed: false, reason: 'daily_limit' };
  }

  let ipEntry = ipRateWindows.get(ipHash);
  if (!ipEntry || ipEntry.resetAt <= now) {
    ipEntry = { count: 0, resetAt: now + PUBLIC_IP_WINDOW_MS };
  }

  if (ipEntry.count >= PUBLIC_IP_MAX_REQUESTS) {
    return { allowed: false, reason: 'ip_limit' };
  }

  ipEntry.count += 1;
  ipRateWindows.set(ipHash, ipEntry);
  dailyGlobalState.count += 1;

  return {
    allowed: true,
    reason: 'ok',
    ipCount: ipEntry.count,
    dailyCount: dailyGlobalState.count,
  };
}

async function checkPublicRateLimit(ipHash, publicScope) {
  // 1. Always enforce in-memory window first (fast path & fallback)
  const localDecision = checkLocalRateLimit(ipHash);
  if (!localDecision.allowed) {
    return localDecision;
  }

  // 2. Persist & cross-check in Supabase RLS table via SECURITY DEFINER RPC using ONLY SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    if (!hasLoggedMissingServiceRoleWarning) {
      hasLoggedMissingServiceRoleWarning = true;
      console.warn(
        '[gemini] SUPABASE_SERVICE_ROLE_KEY is not configured; using in-memory rate limit only for public routes.'
      );
    }
    return localDecision;
  }

  try {
    const rpcEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/check_gemini_public_rate_limit`;
    const res = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        p_ip_hash: ipHash,
        p_scope: publicScope,
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && typeof data.allowed === 'boolean' && !data.allowed) {
        return {
          allowed: false,
          reason: data.reason || 'ip_limit',
        };
      }
    }
  } catch {
    // Fall back gracefully to localDecision if RPC is unreachable
  }

  return localDecision;
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

  let isAuthenticatedUser = false;
  let publicScope = '';

  if (accessToken) {
    const isValidUser = await verifySupabaseToken(accessToken);
    if (!isValidUser) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: invalid or expired session token.' }),
      };
    }
    isAuthenticatedUser = true;
  } else {
    publicScope = getHeader(event.headers, 'x-officeaim-public-scope').trim().toLowerCase();
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

  // 3. Validate model (do not expose allowed models list in error message)
  if (!model || typeof model !== 'string' || !ALLOWED_MODELS.has(model)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Unsupported or disallowed model.',
      }),
    };
  }

  // 4. For public routes (mascot-widget & library-tracker), enforce cheapest model + rate limit
  if (!isAuthenticatedUser) {
    if (model !== PUBLIC_CHEAPEST_MODEL) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Public routes are restricted to the default lightweight model.',
        }),
      };
    }

    const clientIp = extractClientIp(event.headers);
    const ipHash = hashIp(clientIp);
    const rateDecision = await checkPublicRateLimit(ipHash, publicScope);

    if (!rateDecision.allowed) {
      const errMsg =
        rateDecision.reason === 'daily_limit'
          ? 'Daily public quota reached. Please sign in or try again tomorrow.'
          : 'Too many requests. Please wait 10 minutes before trying again.';
      return {
        statusCode: 429,
        headers: { ...headers, 'Retry-After': '600' },
        body: JSON.stringify({ error: errMsg }),
      };
    }
  }

  const normalizedContents = normalizeContents(contents);
  if (!normalizedContents) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid or empty "contents" parameter.' }),
    };
  }

  const effectiveMaxTokensCeiling = isAuthenticatedUser
    ? MAX_OUTPUT_TOKENS
    : PUBLIC_MAX_OUTPUT_TOKENS;

  const geminiRequestBody = {
    contents: normalizedContents,
    generationConfig: {
      maxOutputTokens: effectiveMaxTokensCeiling,
      thinkingConfig: { thinkingBudget: 0 },
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
          effectiveMaxTokensCeiling
        );
      }
    }

    const genKeys = ['temperature', 'topP', 'topK', 'responseMimeType'];
    for (const k of genKeys) {
      if (config[k] !== undefined) {
        geminiRequestBody.generationConfig[k] = config[k];
      }
    }

    // 5. Enforce server-side ceiling on maxOutputTokens (512 for public, 2048 for authenticated)
    if (
      typeof config.maxOutputTokens === 'number' &&
      Number.isFinite(config.maxOutputTokens) &&
      config.maxOutputTokens > 0
    ) {
      geminiRequestBody.generationConfig.maxOutputTokens = Math.min(
        Math.floor(config.maxOutputTokens),
        effectiveMaxTokensCeiling
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

exports._resetRateLimitsForTest = resetRateLimitsForTest;
