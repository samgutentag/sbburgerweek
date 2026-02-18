export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { action, label } = await request.json();
      if (!action || !label) {
        return new Response("Missing fields", { status: 400, headers: corsHeaders });
      }

      env.TRACKER.writeDataPoint({
        blobs: [action, label],
        indexes: [action],
      });

      return new Response("ok", { headers: corsHeaders });
    } catch (e) {
      return new Response("Bad request", { status: 400, headers: corsHeaders });
    }
  },
};
