import { auth } from "@/lib/auth";
import { apiUrl } from "@/lib/api";
import { normalizeRelayPubkeyParam } from "@/lib/relay-pubkey";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; pubkey: string }> }
) {
  const session = await auth();
  const apiKey = process.env.RELAY_API_KEY;
  const providerUserId = (session?.user as { id?: string })?.id;

  if (!apiKey || !providerUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id, pubkey: pubkeyRaw } = await params;
  const pubkey = normalizeRelayPubkeyParam(pubkeyRaw);
  if (!pubkey) {
    return NextResponse.json({ error: "invalid_pubkey" }, { status: 400 });
  }

  const res = await fetch(apiUrl(`relay/${id}/policy/allow/${pubkey}`), {
    method: "DELETE",
    headers: {
      "X-API-Key": apiKey,
      "X-Provider-User-Id": providerUserId,
    },
    signal: AbortSignal.timeout(12_000),
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
  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
