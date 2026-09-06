/** Resolve GitHub OAuth App credentials without logging values. */

function envTrim(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function githubOAuthCredentials(): {
  clientId: string;
  clientSecret: string;
} | undefined {
  const clientId =
    envTrim("AUTH_GITHUB_ID") ?? envTrim("GITHUB_ID") ?? envTrim("GITHUB_CLIENT_ID");
  const clientSecret =
    envTrim("AUTH_GITHUB_SECRET") ??
    envTrim("GITHUB_SECRET") ??
    envTrim("GITHUB_CLIENT_SECRET");
  if (!clientId || !clientSecret) return undefined;
  return { clientId, clientSecret };
}

export function githubOAuthConfigured(): boolean {
  return Boolean(githubOAuthCredentials());
}

/** Auth.js v5 reads AUTH_URL / AUTH_SECRET; Vercel still has the v4 names. */
export function syncAuthJsEnvFromLegacy(): void {
  if (!envTrim("AUTH_URL") && envTrim("NEXTAUTH_URL")) {
    process.env.AUTH_URL = envTrim("NEXTAUTH_URL");
  }
  if (!envTrim("AUTH_SECRET") && envTrim("NEXTAUTH_SECRET")) {
    process.env.AUTH_SECRET = envTrim("NEXTAUTH_SECRET");
  }
}
