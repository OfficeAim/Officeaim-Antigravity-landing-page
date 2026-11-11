/**
 * Netlify Serverless Function: send-newsletter
 * Dispatches transactional emails or newsletter broadcasts via Resend REST API
 */

export const handler = async (event) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error: RESEND_API_KEY is not defined.' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { to, subject, html, text, from } = payload;

    if (!to || (!Array.isArray(to) && typeof to !== 'string')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing recipient "to" address.' })
      };
    }

    if (!subject) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email "subject".' })
      };
    }

    if (!html && !text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email content (html or text required).' })
      };
    }

    const recipients = Array.isArray(to) ? to : [to];
    const sender = from || process.env.RESEND_FROM_EMAIL || 'OfficeAIM <onboarding@resend.dev>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: sender,
        to: recipients,
        subject,
        html: html || undefined,
        text: text || undefined
      })
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      return {
        statusCode: resendResponse.status,
        headers,
        body: JSON.stringify({ error: data.message || 'Resend API error', details: data })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        id: data.id,
        recipientsCount: recipients.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error while sending email' })
    };
  }
};

