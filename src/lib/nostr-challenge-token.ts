import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TTL_MS = 5 * 60 * 1000;

function authSecret(): string | null {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? null;
}

export function mintNostrChallengeToken(): { challenge: string; challengeToken: string } | null {
  const secret = authSecret();
  if (!secret || secret.length < 16) return null;

  const challenge = randomBytes(32).toString("hex");
  const exp = Date.now() + TTL_MS;
  const payload = JSON.stringify({ ch: challenge, exp });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return { challenge, challengeToken: `${payloadB64}.${sig}` };
}

export function parseNostrChallengeToken(challengeToken: string): {
  challenge: string;
} | null {
  const secret = authSecret();
  if (!secret || secret.length < 16) return null;

  const parts = challengeToken.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expected = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(sig, "utf8");
  if (a.length !== b.length) return null;
  try {
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  let payload: { ch?: unknown; exp?: unknown };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof payload.ch !== "string" || typeof payload.exp !== "number") return null;
  if (Date.now() > payload.exp) return null;
  return { challenge: payload.ch };
}
