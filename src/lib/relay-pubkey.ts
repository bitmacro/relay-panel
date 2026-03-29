/** Relay policy routes: lowercase hex pubkey (64 chars). */
const PUBKEY_HEX = /^[0-9a-f]{64}$/;

export function normalizeRelayPubkeyParam(raw: string | undefined): string | null {
  if (raw == null) return null;
  try {
    const decoded = decodeURIComponent(raw).trim().toLowerCase();
    return PUBKEY_HEX.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}
