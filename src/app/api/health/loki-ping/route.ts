import { NextResponse } from "next/server";

import { getCorrelationIds } from "@/lib/observability/correlation";
import { serverLogger } from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/health/loki-ping
 * Smoke test: push Loki com label service=relay-panel.
 * Grafana: {service="relay-panel"} |= "panel.loki.ping"
 */
export async function GET(request: Request) {
  const ids = getCorrelationIds(request);
  await serverLogger.info("LOKI_PING", "Loki connectivity probe (relay-panel)", {
    ...ids,
    event: "panel.loki.ping",
    probe: true,
  });
  return NextResponse.json({
    ok: true,
    service: (process.env.BITMACRO_LOG_SERVICE as string | undefined) || "relay-panel",
    event: "panel.loki.ping",
    at: new Date().toISOString(),
  });
}
