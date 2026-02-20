export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET — return aggregated counts (?upvotes=true for upvotes, otherwise detail breakdown)
    if (request.method === "GET") {
      const url = new URL(request.url);
      const upvotes = url.searchParams.get("upvotes") === "true";

      try {
        const sql = upvotes
          ? `SELECT blob2 AS name,
             SUM(IF(blob1 = 'upvote', 1, 0)) - SUM(IF(blob1 = 'un-upvote', 1, 0)) AS net
             FROM sbburgerweek
             WHERE timestamp >= toDateTime('2026-02-19 09:00:00')
               AND (blob1 = 'upvote' OR blob1 = 'un-upvote')
             GROUP BY blob2
             HAVING net > 0
             ORDER BY net DESC
             LIMIT 500`
          : `SELECT blob2 AS name, blob1 AS action, SUM(1) AS count
             FROM sbburgerweek
             WHERE timestamp >= toDateTime('2026-02-19 09:00:00')
               AND blob1 != 'test'
             GROUP BY blob2, blob1
             ORDER BY count DESC
             LIMIT 2000`;

        const resp = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.CF_API_TOKEN}`,
              "Content-Type": "text/plain",
            },
            body: sql,
          },
        );

        if (!resp.ok) {
          return new Response("{}", {
            headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
          });
        }

        const data = await resp.json();
        const result = {};

        if (upvotes) {
          if (data.data) {
            data.data.forEach(function (row) {
              if (row.name) {
                var net = Number(row.net) || 0;
                if (net > 0) result[row.name] = net;
              }
            });
          }
        } else {
          if (data.data) {
            data.data.forEach(function (row) {
              if (row.name) {
                if (!result[row.name]) result[row.name] = {};
                result[row.name][row.action] = Number(row.count) || 0;
              }
            });
          }
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
        });
      } catch (e) {
        return new Response("{}", {
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
        });
      }
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
