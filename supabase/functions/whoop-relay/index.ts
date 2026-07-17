/* Hill Climbing — whoop-relay (Supabase Edge Function)
   ────────────────────────────────────────────────────────────────────────────
   A STATELESS relay between the browser and WHOOP's API, needed only because
   WHOOP's OAuth token endpoint and developer API do not answer browsers
   directly (no CORS, and the token exchange wants a client secret POST).

   Trust posture — read this before changing anything (REQUIREMENTS §1.1):
   · This is the suite's FIRST operator-run hop in a user-content path. It is
     kept tolerable by being a dumb pipe: no storage, no logging of bodies or
     tokens, no secrets of its own. The user's WHOOP client ID/secret and
     tokens live only in their browser and ride each request end-to-end over
     TLS; health data flows back through the same single response.
   · Upstream is pinned to api.prod.whoop.com, and only to the OAuth token
     path plus an allowlist of read-only v2 data paths. This function cannot
     be aimed anywhere else.
   · verify_jwt is OFF: the suite's static pages have no Supabase session, and
     the publishable key is public anyway. The bound is the upstream pin —
     the worst an abuser gets is a WHOOP-only proxy billed as invocations
     (KNOWN_RISKS L41).
   ──────────────────────────────────────────────────────────────────────────── */

const WHOOP = "https://api.prod.whoop.com";
const TOKEN_URL = `${WHOOP}/oauth/oauth2/token`;

// Read-only v2 data paths the relay will forward (query strings allowed).
const API_PATH_OK =
  /^\/developer\/v2\/(recovery|cycle|activity\/sleep|activity\/workout|user\/profile\/basic|user\/measurement\/body)(\/[A-Za-z0-9-]+)?(\?[\w\-.~%=&:+]*)?$/;

// Origins the suite is actually served from ("null" = file:// during local dev).
const ORIGIN_OK = new Set([
  "https://www.hillclimbing.me",
  "https://hillclimbing.me",
  "https://cognitivemirrors.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "null",
]);

function cors(origin: string | null): HeadersInit {
  const o = origin && ORIGIN_OK.has(origin) ? origin : "https://www.hillclimbing.me";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function json(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json(405, { error: "POST only" }, origin);

  let body: { kind?: string; params?: Record<string, string>; path?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid JSON" }, origin);
  }

  try {
    if (body.kind === "token") {
      // OAuth code exchange / refresh — form-encoded pass-through to WHOOP.
      const params = body.params;
      if (!params || typeof params !== "object") return json(400, { error: "missing params" }, origin);
      const grant = params.grant_type;
      if (grant !== "authorization_code" && grant !== "refresh_token") {
        return json(400, { error: "unsupported grant_type" }, origin);
      }
      const form = new URLSearchParams();
      for (const k of ["grant_type", "code", "refresh_token", "client_id", "client_secret", "redirect_uri", "scope"]) {
        if (typeof params[k] === "string" && params[k]) form.set(k, params[k]);
      }
      const r = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      const text = await r.text();
      return new Response(text, {
        status: r.status,
        headers: { "Content-Type": "application/json", ...cors(origin) },
      });
    }

    if (body.kind === "api") {
      // Read-only data GET on the caller's own bearer token.
      const path = body.path;
      if (typeof path !== "string" || !API_PATH_OK.test(path)) {
        return json(400, { error: "path not allowed" }, origin);
      }
      if (typeof body.token !== "string" || !body.token) return json(400, { error: "missing token" }, origin);
      const r = await fetch(WHOOP + path, {
        headers: { Authorization: `Bearer ${body.token}` },
      });
      const text = await r.text();
      return new Response(text, {
        status: r.status,
        headers: { "Content-Type": "application/json", ...cors(origin) },
      });
    }

    return json(400, { error: "unknown kind" }, origin);
  } catch {
    // Never echo internals; nothing is logged by design.
    return json(502, { error: "upstream unreachable" }, origin);
  }
});
