import { auth } from "@/lib/auth";
import { apiUrl } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

const BASE_URL = process.env.RELAY_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

function relayApiUrl(path: string): string {
  return `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

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

  if (!BASE_URL) {
    return NextResponse.json(
      { error: "config_error", detail: "RELAY_API_URL ou NEXT_PUBLIC_API_URL não configurado" },
      { status: 500 }
    );
  }

  const opts: RequestInit = {
    method,
    headers: {
      "X-API-Key": apiKey,
      "X-Provider-User-Id": providerUserId,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(280_000),
  };
  if (body && (method === "PATCH" || method === "POST")) {
    opts.headers = { ...opts.headers, "Content-Type": "application/json" } as HeadersInit;
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(relayApiUrl(`relay/${id}`), opts).catch((err) => {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return new Response(
      JSON.stringify({
        error: isTimeout ? "gateway_timeout" : "api_unavailable",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 504, headers: { "Content-Type": "application/json" } }
    ) as Response;
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {
      error: "invalid_response",
      detail: res.status === 504 ? "O gateway excedeu o tempo limite. Tenta novamente." : "Resposta inválida do servidor.",
    };
  }
  return NextResponse.json(json, { status: res.ok ? res.status : res.status >= 400 ? res.status : 500 });
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
