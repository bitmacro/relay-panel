import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function normalizeAgentBase(raw: string): string {
  let u = raw.trim().replace(/\/$/, "");
  if (u.startsWith("wss://")) u = `https://${u.slice(6)}`;
  if (u.startsWith("ws://")) u = `http://${u.slice(5)}`;
  return u;
}

/**
 * POST body: { endpoint: string, token: string, agent_relay_id: string }
 * Probes relay-agent GET /:agent_relay_id/health (v2 multi-relay; id must match RELAY_INSTANCES).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const endpointRaw = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const agentRelayId =
    typeof body.agent_relay_id === "string" ? body.agent_relay_id.trim() : "";

  if (!endpointRaw || !token || !agentRelayId) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_fields",
        detail: "endpoint, token, and agent_relay_id required",
      },
      { status: 400 }
    );
  }

  const base = normalizeAgentBase(endpointRaw);
  const path = `/${agentRelayId}/health`;
  const url = `${base}${path}`;
  const start = Date.now();

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const elapsed = Date.now() - start;
    const json = await res.json().catch(() => ({}));
    const ok = res.ok && (json as { status?: string })?.status === "ok";
    return NextResponse.json(
      {
        ok,
        status: res.status,
        elapsed,
        endpoint: base,
        detail: !ok
          ? (json as { error?: string })?.error ??
            (json as { detail?: string })?.detail
          : undefined,
      },
      { status: 200 }
    );
  } catch (err) {
    const elapsed = Date.now() - start;
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return NextResponse.json({
      ok: false,
      error: isTimeout ? "agent_timeout" : "agent_unavailable",
      elapsed,
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
