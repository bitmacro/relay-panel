import { auth } from "@/lib/auth";
import { apiUrl } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  const apiKey = process.env.RELAY_API_KEY;
  const providerUserId = (session?.user as { id?: string })?.id;

  if (!apiKey || !providerUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const agentRelayId =
    typeof body.agent_relay_id === "string" ? body.agent_relay_id.trim() : "";
  if (!agentRelayId) {
    return NextResponse.json(
      { error: "validation_error", detail: "agent_relay_id is required" },
      { status: 400 }
    );
  }
  const payload = { ...body, agent_relay_id: agentRelayId };
  const res = await fetch(apiUrl("relays"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-Provider-User-Id": providerUserId,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  }).catch((err) => {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return new Response(
      JSON.stringify({
        error: isTimeout ? "gateway_timeout" : "api_unavailable",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 504, headers: { "Content-Type": "application/json" } }
    ) as Response;
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
