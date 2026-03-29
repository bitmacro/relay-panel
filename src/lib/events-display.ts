import { nip19 } from "nostr-tools";

export interface NostrEventRow {
  id: string;
  pubkey: string;
  kind: number;
  created_at: number;
  content: string;
  tags?: string[][];
  sig?: string;
}

/** Hex pubkey for API `authors` param, or null if filter is empty/invalid */
export function authorFilterToHex(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return trimmed.toLowerCase();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("npub")) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === "npub" && typeof decoded.data === "string") {
        return decoded.data;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function hexToNpubDisplay(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}

export function truncateNpub(npub: string): string {
  if (npub.length <= 20) return npub;
  return `${npub.slice(0, 10)}…${npub.slice(-8)}`;
}

export function kindBadgeMeta(kind: number): {
  label: string;
  badgeClass: string;
} {
  if (kind === 0)
    return { label: "Profile", badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
  if (kind === 1)
    return { label: "Note", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
  if (kind === 3)
    return { label: "Contacts", badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40" };
  if (kind === 6)
    return { label: "Repost", badgeClass: "bg-amber-500/20 text-amber-200 border-amber-500/40" };
  if (kind === 7)
    return { label: "Reaction", badgeClass: "bg-pink-500/20 text-pink-300 border-pink-500/40" };
  if (kind === 1059)
    return { label: "DM", badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/40" };
  if (kind === 10002)
    return { label: "Relay List", badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
  if (kind >= 20000 && kind <= 29999)
    return { label: "Ephemeral", badgeClass: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40" };
  if (kind >= 30000 && kind <= 39999)
    return {
      label: "Addressable",
      badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    };
  return {
    label: `Kind ${kind}`,
    badgeClass: "bg-zinc-600/30 text-zinc-400 border-zinc-500/30",
  };
}

function countTagName(tags: string[][] | undefined, name: string): number {
  if (!tags?.length) return 0;
  return tags.filter((t) => t[0] === name).length;
}

export function getContentPreview(event: NostrEventRow): string {
  const { kind, content, tags } = event;
  if (kind === 0) {
    if (!content?.trim()) return "—";
    try {
      const j = JSON.parse(content) as Record<string, unknown>;
      const dn =
        (typeof j.display_name === "string" && j.display_name) ||
        (typeof j.displayName === "string" && j.displayName) ||
        (typeof j.name === "string" && j.name) ||
        "";
      return dn ? `👤 ${dn}` : truncateRaw(content, 80);
    } catch {
      return truncateRaw(content, 80);
    }
  }
  if (kind === 1) return truncateRaw(content, 80);
  if (kind === 3) {
    const n = countTagName(tags, "p");
    return `📋 ${n} contactos`;
  }
  if (kind === 7) {
    const t = content?.trim();
    return t || "—";
  }
  if (kind === 1059) return "🔒 DM encriptada";
  if (kind === 10002) {
    const n = countTagName(tags, "r");
    return `📡 ${n} relays`;
  }
  if (kind >= 20000 && kind <= 29999) return "⚡ Ephemeral";
  if (kind >= 30000 && kind <= 39999) return "📝 Addressable";
  if (!content?.trim()) return "—";
  return truncateRaw(content, 80);
}

function truncateRaw(s: string, max: number): string {
  if (!s) return "—";
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}
