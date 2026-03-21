import { auth } from "@/lib/auth";
import { apiUrl } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

async function proxy(
  method: string,
  id: string,
  body?: unknown
): Promise<Response> {
  const session = await auth();
  const apiKey = process.env.RELAY_API_KEY;
  const providerUserId = (session?.user as { id?: string })?.id;

  if (!apiKey || !providerUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const opts: RequestInit = {
    method,
    headers: {
      "X-API-Key": apiKey,
      "X-Provider-User-Id": providerUserId,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(14_000),
  };
  if (body && (method === "PATCH" || method === "POST")) {
    opts.headers = { ...opts.headers, "Content-Type": "application/json" } as HeadersInit;
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(apiUrl(`relay/${id}`), opts).catch((err) => {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return proxy("PATCH", id, body);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy("DELETE", id);
}
