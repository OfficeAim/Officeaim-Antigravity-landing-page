/**
 * Netlify Serverless Function: gemini
 * Server-side proxy for Google Gemini API using process.env.GEMINI_API_KEY.
 * Accepts POST { model, contents, config } and returns { text, candidates, model }.
 */

const MAX_BODY_BYTES = 4 * 1024 * 1024; // 4 MB max payload

const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
]);

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

  if (!model || typeof model !== 'string' || !ALLOWED_MODELS.has(model)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: `Unsupported or disallowed model. Allowed models: ${Array.from(ALLOWED_MODELS).join(', ')}`,
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
      geminiRequestBody.generationConfig = { ...config.generationConfig };
    }

    const genKeys = ['temperature', 'topP', 'topK', 'maxOutputTokens', 'responseMimeType'];
    for (const k of genKeys) {
      if (config[k] !== undefined) {
        geminiRequestBody.generationConfig = geminiRequestBody.generationConfig || {};
        geminiRequestBody.generationConfig[k] = config[k];
      }
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
