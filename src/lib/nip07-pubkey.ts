import { decode as nip19Decode } from "nostr-tools/nip19";

/** Normalizes NIP-07 getPublicKey / event.pubkey to lowercase hex (64 chars). */
export function normalizeNip07PubkeyHex(pk: string): string | null {
  const s = pk.trim();
  if (/^[0-9a-fA-F]{64}$/.test(s)) return s.toLowerCase();
  const lower = s.toLowerCase();
  if (lower.startsWith("npub1")) {
    try {
      const d = nip19Decode(s);
      if (d.type === "npub" && typeof d.data === "string" && /^[0-9a-f]{64}$/i.test(d.data)) {
        return d.data.toLowerCase();
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}
