/** Used when env is empty during `next dev` only (production builds must set NEXT_PUBLIC_API_URL). */
const DEFAULT_DEV_RELAY_API = "https://relay-api.bitmacro.io";

function normalizeBase(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/** True if the origin looks like a local relay-api URL (often set by mistake to localhost:3000). */
function isLoopbackRelayApiHost(base: string): boolean {
  const s = normalizeBase(base);
  if (!s) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    const h = url.hostname.toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "::1";
  } catch {
    return false;
  }
}

/**
 * relay-api origin (no trailing slash).
 * Server: `RELAY_API_URL` → `NEXT_PUBLIC_API_URL` → dev default.
 * Browser: `NEXT_PUBLIC_API_URL` → dev default.
 *
 * In `next dev`, a loopback URL in those vars is ignored (uses production relay-api)
 * unless `RELAY_API_ALLOW_LOCALHOST_UPSTREAM=1` — so a mistaken
 * `NEXT_PUBLIC_API_URL=http://localhost:3000` does not proxy the panel to itself.
 */
export function relayApiBaseUrl(): string {
  const fromEnv =
    typeof window === "undefined"
      ? (process.env.RELAY_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "")
      : (process.env.NEXT_PUBLIC_API_URL ?? "");

  let trimmed = normalizeBase(fromEnv);

  if (
    trimmed &&
    process.env.NODE_ENV === "development" &&
    isLoopbackRelayApiHost(trimmed) &&
    process.env.RELAY_API_ALLOW_LOCALHOST_UPSTREAM !== "1"
  ) {
    trimmed = "";
  }

  if (trimmed) return trimmed;

  if (process.env.NODE_ENV === "development") {
    return DEFAULT_DEV_RELAY_API;
  }

  return "";
}

export function apiUrl(path: string): string {
  const base = relayApiBaseUrl();
  return `${base}/${path.replace(/^\//, "")}`;
}
