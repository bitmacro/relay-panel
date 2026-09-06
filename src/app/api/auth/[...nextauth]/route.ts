import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { serverLogger } from "@/utils/logger";

export const runtime = "nodejs";

function oauthCheckNames(req: NextRequest): string {
  return req.cookies
    .getAll()
    .map((c) => c.name)
    .filter((n) => /authjs|next-auth/i.test(n))
    .sort()
    .join(",") || "(none)";
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.pathname.includes("/callback/")) {
    await serverLogger.warn("AUTH", "oauth callback checks", {
      event: "auth.callback.checks",
      oauth_checks: oauthCheckNames(req),
      has_code: req.nextUrl.searchParams.has("code"),
      has_state: req.nextUrl.searchParams.has("state"),
      oauth_error: req.nextUrl.searchParams.get("error") ?? undefined,
    });
  }
  return handlers.GET(req);
}

export const { POST } = handlers;
