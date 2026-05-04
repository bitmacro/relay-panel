/**
 * Relay list /dashboard stats pipeline: relay-panel → relay-api → relay-agent → `strfry scan`.
 * relay-agent wraps LMDB reads with timeouts up to ~60s (`SCAN_COUNT_TIMEOUT_MS`).
 * Keep panel route timeout slightly above API proxy timeout.
 */
export const RELAY_STATS_API_PROXY_MS = 95_000;
