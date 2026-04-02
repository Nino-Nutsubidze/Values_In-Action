export async function GET() {
  return json({
    ok: true,
    route: '/api/chat',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    message: process.env.ANTHROPIC_API_KEY ? 'API key detected.' : 'Missing ANTHROPIC_API_KEY environment variable.'
  });
}

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || request.headers.get('x-api-key');

    if (!apiKey) {
      return json({ error: 'Missing ANTHROPIC_API_KEY environment variable.' }, 500);
    }

    const body = await request.json();

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const text = await anthropicResponse.text();

    return new Response(text, {
      status: anthropicResponse.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });
  } catch (error) {
    return json({ error: 'Proxy request failed', details: error.message || String(error) }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, x-api-key'
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store'
    }
  });
}
