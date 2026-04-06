import { NextResponse } from "next/server";

/** BitMacro production default; override with AGENT_PUBLIC_HEALTH_URL or disable with AGENT_PUBLIC_HEALTH_URL=none */
const DEFAULT_HEALTH = "https://relay-agent.bitmacro.io/health";

export async function GET() {
  const raw = process.env.AGENT_PUBLIC_HEALTH_URL?.trim().toLowerCase();
  const url =
    raw === "none" || raw === "false" || raw === "0" ? null : raw || DEFAULT_HEALTH;

  if (!url) {
    return NextResponse.json({ version: null, ok: false });
  }

  try {
    const r = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(6000),
    });
    const json = (await r.json()) as { status?: string; version?: string };
    if (r.ok && json.status === "ok" && typeof json.version === "string") {
      return NextResponse.json({ version: json.version, ok: true });
    }
  } catch {
    /* ignore */
  }
  return NextResponse.json({ version: null, ok: false });
}
