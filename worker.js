export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    // Трекинг визита: GET /track
    if (url.pathname === "/track" && request.method === "GET") {
      const today = new Date().toISOString().slice(0, 10);
      const current = await env.STATS.get(today);
      const count = current ? parseInt(current) + 1 : 1;
      await env.STATS.put(today, String(count));
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // Получить статистику: GET /stats
    if (url.pathname === "/stats" && request.method === "GET") {
      const pass = url.searchParams.get("pass");
      if (pass !== env.ADMIN_PASS) {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: cors });
      }
      const list = await env.STATS.list();
      const data = {};
      for (const key of list.keys) {
        data[key.name] = await env.STATS.get(key.name);
      }
      return new Response(JSON.stringify(data), { headers: cors });
    }

    // Gemini AI: POST /
    const body = await request.json();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: cors });
  }
};
