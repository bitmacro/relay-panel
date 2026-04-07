/**
 * NextAuth (JWT) and Nostr NIP-07 challenge HMAC use the same secret.
 * In production, AUTH_SECRET or NEXTAUTH_SECRET must be set.
 */
export function getAuthSecret(): string | undefined {
  const fromEnv = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "development") return undefined;

  if (typeof console !== "undefined") {
    console.warn(
      "[auth] AUTH_SECRET is not set. Using a development-only placeholder. " +
        "Set AUTH_SECRET in .env.local (see .env.example) for real sessions."
    );
  }
  return "relay-panel-dev-placeholder-not-for-production";
}
