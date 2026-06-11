export const config = { runtime: 'edge' };

export default async function handler(request) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  const body = await request.json();
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: body.messages
      })
    }
  );
  const data = await response.json();
  return new Response(JSON.stringify(data), { headers: cors });
}
