/** Auth.js `?error=` codes shown on /auth/signin — no tokens, no emails. */

const MESSAGES: Record<string, string> = {
  Configuration:
    "GitHub sign-in failed on the server (OAuth callback). Try again, or use Nostr.",
  AccessDenied: "GitHub denied access. Grant the app and try again.",
  Callback: "GitHub came back but the session could not be created. Try again.",
  OAuthCallback:
    "GitHub came back but the session could not be created. Try again.",
  OAuthSignin: "Could not start GitHub sign-in. Try again.",
  OAuthAccountNotLinked:
    "This GitHub account is already linked another way. Use the original method.",
  Verification: "The sign-in link expired. Start again.",
  Default: "Sign-in failed. Try GitHub again, or use Nostr (NIP-07).",
};

export function signInErrorMessage(code: string | null): string | null {
  if (!code?.trim()) return null;
  return MESSAGES[code] ?? MESSAGES.Default;
}

export function publicAuthErrorFields(err: unknown): {
  name: string;
  message: string;
  cause_name?: string;
} {
  if (!(err instanceof Error)) {
    return { name: "Error", message: "non_error" };
  }
  const type = authJsType(err);
  const inner = innerAuthError(err);
  const innerType = inner ? authJsType(inner) : undefined;
  return {
    name: stableName(type, err.name),
    message: truncate(stripSecrets(inner?.message ?? err.message), 180),
    ...(innerType || inner?.name
      ? { cause_name: stableName(innerType, inner?.name ?? "") }
      : {}),
  };
}

function authJsType(err: object): string | undefined {
  const t = (err as { type?: unknown }).type;
  return typeof t === "string" && t.length > 1 ? t : undefined;
}

function stableName(type: string | undefined, name: string): string {
  if (type && type.length > 2) return type;
  if (name && name.length > 2) return name;
  return type || name || "Error";
}

function innerAuthError(err: Error): Error | undefined {
  const cause = err.cause;
  if (!cause || typeof cause !== "object") return undefined;
  const nested = (cause as { err?: unknown }).err;
  if (nested instanceof Error) return nested;
  if (cause instanceof Error) return cause;
  return undefined;
}

function stripSecrets(text: string): string {
  return text
    .replace(/ghp_[A-Za-z0-9_]+/g, "[redacted]")
    .replace(/github_pat_[A-Za-z0-9_]+/g, "[redacted]")
    .replace(/Ov23li[A-Za-z0-9]+/g, "[client_id]")
    .replace(/(secret|token|bearer|code_verifier|pkce)[=:]\s*\S+/gi, "$1=[redacted]");
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}
