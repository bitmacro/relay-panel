/** Server-side: prefer RELAY_API_URL (avoids cold-start cross-region). Client: NEXT_PUBLIC_API_URL only. */
const BASE =
  typeof window === "undefined"
    ? (process.env.RELAY_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "")
    : (process.env.NEXT_PUBLIC_API_URL ?? "");

export function apiUrl(path: string): string {
  return `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
