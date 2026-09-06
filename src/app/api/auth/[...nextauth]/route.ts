import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { serverLogger } from "@/utils/logger";

export const runtime = "nodejs";

function authAction(req: NextRequest): string {
  const path = req.nextUrl.pathname.replace(/^\/api\/auth\/?/, "");
  return path || "(root)";
}

async function wrap(method: "GET" | "POST", req: NextRequest): Promise<Response> {
  const action = authAction(req);
  const handle = method === "GET" ? handlers.GET : handlers.POST;
  try {
    const res = await handle(req);
    if (res.status >= 400) {
      await serverLogger.warn("AUTH", `${method} /api/auth/${action} HTTP ${res.status}`, {
        event: "auth.http",
        method,
        status: res.status,
        action,
      });
    }
    return res;
  } catch (err) {
    await serverLogger.error("AUTH", `${method} /api/auth/${action} threw`, undefined, {
      event: "auth.unhandled",
      method,
      action,
      err_name: err instanceof Error ? err.name : "unknown",
    });
    throw err;
  }
}

export function GET(req: NextRequest) {
  return wrap("GET", req);
}

export function POST(req: NextRequest) {
  return wrap("POST", req);
}
