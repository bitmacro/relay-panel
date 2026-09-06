import { handlers } from "@/lib/auth";
import { serverLogger } from "@/utils/logger";

export const runtime = "nodejs";

function authAction(req: Request): string {
  try {
    const path = new URL(req.url).pathname.replace(/^\/api\/auth\/?/, "");
    return path || "(root)";
  } catch {
    return "(unknown)";
  }
}

async function wrap(
  method: "GET" | "POST",
  req: Request,
  ctx?: unknown
): Promise<Response> {
  const action = authAction(req);
  const handle = method === "GET" ? handlers.GET : handlers.POST;
  try {
    const res = await handle(req, ctx as never);
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

export function GET(req: Request, ctx: unknown) {
  return wrap("GET", req, ctx);
}

export function POST(req: Request, ctx: unknown) {
  return wrap("POST", req, ctx);
}
