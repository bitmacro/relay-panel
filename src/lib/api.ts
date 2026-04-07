/** Used when env is empty during `next dev` only (production builds must set NEXT_PUBLIC_API_URL). */
const DEFAULT_DEV_RELAY_API = "https://relay-api.bitmacro.io";

function normalizeBase(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/**
 * relay-api origin (no trailing slash).
 * Server: `RELAY_API_URL` → `NEXT_PUBLIC_API_URL` → dev default.
 * Browser: `NEXT_PUBLIC_API_URL` → dev default.
 */
export function relayApiBaseUrl(): string {
  const fromEnv =
    typeof window === "undefined"
      ? (process.env.RELAY_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "")
      : (process.env.NEXT_PUBLIC_API_URL ?? "");

  const trimmed = normalizeBase(fromEnv);
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
