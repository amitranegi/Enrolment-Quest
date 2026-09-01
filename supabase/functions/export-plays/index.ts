// Supabase Edge Function: export-plays
// Secrets: ADMIN_EXPORT_SECRET (required). SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are auto-injected.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-secret, x-company",
};

const companyTable: Record<string, string> = {
  tarento: "plays_tarento",
  demo: "plays_demo",
  partner: "plays_partner",
  livspace: "plays_livspace",
  expleo: "plays_expleo",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  const adminSecret = Deno.env.get("ADMIN_EXPORT_SECRET") || "";
  const provided = req.headers.get("x-admin-secret") || "";
  if (!adminSecret || provided !== adminSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, key);
  const qs = new URL(req.url).searchParams;
  const company = (qs.get("company") || req.headers.get("x-company") || "tarento").toLowerCase();
  const table = companyTable[company];
  if (!table) {
    return new Response(JSON.stringify({ error: "Unknown company" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const format = qs.get("format") || "json";
  if (format === "csv") {
    const cols = [
      "created_at",
      "full_name",
      "department",
      "mode",
      "score",
      "grade",
      "duration_sec",
      "coins",
      "stomps",
      "deaths",
      "payload",
    ];
    const lines = [cols.join(",")];
    for (const row of data || []) {
      lines.push(
        cols
          .map((c) => {
            let v = (row as Record<string, unknown>)[c];
            if (c === "payload") v = JSON.stringify(v);
            return `"${String(v ?? "").replace(/"/g, '""')}"`;
          })
          .join(","),
      );
    }
    return new Response(lines.join("\n"), {
      headers: {
        ...cors,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${company}_plays.csv"`,
      },
    });
  }

  return new Response(JSON.stringify(data ?? []), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
