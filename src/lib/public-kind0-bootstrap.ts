import type { Event } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";

/** Public relays used to backfill kind 0 when the managed relay has no metadata yet. */
export const PUBLIC_KIND0_RELAYS = [
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.damus.io",
  "wss://relay.primal.net",
] as const;

const HEX64 = /^[0-9a-f]{64}$/;

export type Kind0ProfilePayload = {
  name: string;
  picture?: string;
  nip05?: string;
};

function parseKind0Content(content: string): Kind0ProfilePayload {
  try {
    const j = JSON.parse(content) as Record<string, unknown>;
    const name =
      (typeof j.display_name === "string" && j.display_name.trim() && j.display_name.trim()) ||
      (typeof j.displayName === "string" && j.displayName.trim() && j.displayName.trim()) ||
      (typeof j.name === "string" && j.name.trim() && j.name.trim()) ||
      "";
    const picture =
      typeof j.picture === "string" && j.picture.trim() ? j.picture.trim() : undefined;
    const nip05 =
      typeof j.nip05 === "string" && j.nip05.trim() ? j.nip05.trim() : undefined;
    return { name, picture, nip05 };
  } catch {
    return { name: "" };
  }
}

/** Latest kind 0 per author from public relays (best-effort, bounded wait). */
export async function fetchKind0ProfilesFromPublic(
  pubkeysHex: string[]
): Promise<Record<string, Kind0ProfilePayload>> {
  const valid = pubkeysHex
    .map((p) => p.trim().toLowerCase())
    .filter((p) => HEX64.test(p));
  if (valid.length === 0) return {};

  const pool = new SimplePool({ enablePing: true });
  const relays = [...PUBLIC_KIND0_RELAYS];
  try {
    const events: Event[] = await pool.querySync(
      relays,
      {
        kinds: [0],
        authors: valid,
        limit: Math.min(valid.length * 3, 100),
      },
      { maxWait: 4000 }
    );
    const byPk: Record<string, Event> = {};
    for (const ev of events) {
      if (ev.kind !== 0) continue;
      const hex = ev.pubkey.toLowerCase();
      const prev = byPk[hex];
      if (!prev || ev.created_at > prev.created_at) {
        byPk[hex] = ev;
      }
    }
    const out: Record<string, Kind0ProfilePayload> = {};
    for (const hex of valid) {
      const ev = byPk[hex];
      if (!ev) continue;
      const meta = parseKind0Content(ev.content);
      if (meta.name || meta.picture || meta.nip05) {
        out[hex] = meta;
      }
    }
    return out;
  } finally {
    try {
      pool.close(relays);
    } catch {
      /* ignore */
    }
  }
}
