import { verifyEvent, type Event } from "nostr-tools";
import { npubEncode } from "nostr-tools/nip19";
import { parseNostrChallengeToken } from "@/lib/nostr-challenge-token";

function normalizeHexPubkey(s: string): string | null {
  const t = s.trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(t) ? t : null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseSignedEvent(json: string): Event | null {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (!isRecord(raw)) return null;
  if (typeof raw.kind !== "number") return null;
  if (typeof raw.pubkey !== "string") return null;
  if (typeof raw.content !== "string") return null;
  if (typeof raw.created_at !== "number") return null;
  if (!Array.isArray(raw.tags)) return null;
  if (typeof raw.sig !== "string") return null;
  if (typeof raw.id !== "string") return null;

  const ev = raw as Event;
  if (!verifyEvent(ev)) return null;
  return ev;
}

/**
 * NextAuth Credentials `authorize` for NIP-07: signed kind-1 event with content === challenge.
 */
export async function authorizeNostrNip07(
  credentials: Partial<Record<"challengeToken" | "eventJson" | "pubkey", unknown>> | undefined
): Promise<{ id: string; name: string } | null> {
  const challengeToken =
    typeof credentials?.challengeToken === "string" ? credentials.challengeToken : "";
  const eventJson = typeof credentials?.eventJson === "string" ? credentials.eventJson : "";
  const pubkeyClaim = typeof credentials?.pubkey === "string" ? credentials.pubkey : "";

  if (!challengeToken || !eventJson || !pubkeyClaim) return null;

  const parsed = parseNostrChallengeToken(challengeToken);
  if (!parsed) return null;

  const pubkeyHex = normalizeHexPubkey(pubkeyClaim);
  if (!pubkeyHex) return null;

  const event = parseSignedEvent(eventJson);
  if (!event) return null;

  const signedPub = normalizeHexPubkey(event.pubkey);
  if (!signedPub || signedPub !== pubkeyHex) return null;

  if (event.kind !== 1) return null;
  if (event.content !== parsed.challenge) return null;

  try {
    const name = npubEncode(pubkeyHex);
    return { id: pubkeyHex, name };
  } catch {
    return { id: pubkeyHex, name: `${pubkeyHex.slice(0, 16)}…` };
  }
}
