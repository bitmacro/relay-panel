import { nip19 } from "nostr-tools";

/** Kinds shown in Help “quick reference” (labels/descriptions from kindBadgeMeta + dashboardKindLongDescription). */
export const HELP_REFERENCE_KINDS = [0, 1, 3, 6, 7, 10002, 1059] as const;

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

/** Navbar / espaços estreitos: início + `...` + fim curto (ex. `npub1sjx7...d34h`). */
export function truncateNpubNav(npub: string): string {
  const s = npub.trim();
  const head = 10;
  const tail = 4;
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}...${s.slice(-tail)}`;
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

/** Persist feed vs table in Eventos tab */
export const EVENTS_VIEW_MODE_KEY = "relay-panel:events-view-mode";
export type EventsViewMode = "table" | "feed";

const AVATAR_PALETTE = [
  "bg-[#f7931a] text-black",
  "bg-blue-600 text-white",
  "bg-emerald-600 text-white",
  "bg-violet-600 text-white",
  "bg-rose-600 text-white",
];

/** Deterministic colour from first hex char of pubkey (5 fixed palettes) */
export function pubkeyAvatarClasses(pubkey: string): string {
  const c = pubkey.charAt(0).toLowerCase();
  const i = parseInt(c, 16);
  const idx = Number.isNaN(i) ? 0 : i % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

export function displayInitials(displayName: string | null | undefined, pubkey: string): string {
  const n = (displayName ?? "").trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    return n.slice(0, 2).toUpperCase();
  }
  return pubkey.slice(0, 2).toUpperCase();
}

export function firstTagValue(
  tags: string[][] | undefined,
  key: string
): string | undefined {
  const row = tags?.find((t) => t[0] === key);
  return row?.[1];
}

export function truncateEventId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export function parseKind0Profile(content: string): { name: string; about: string } {
  try {
    const j = JSON.parse(content) as Record<string, unknown>;
    const name =
      (typeof j.display_name === "string" && j.display_name) ||
      (typeof j.displayName === "string" && j.displayName) ||
      (typeof j.name === "string" && j.name) ||
      "";
    const about = typeof j.about === "string" ? j.about : "";
    return { name, about };
  } catch {
    return { name: "", about: "" };
  }
}

/** Image URL only if it appears as a raw URL in content (not parsed from tags) */
export function extractNoteImageUrl(content: string): string | null {
  if (!content?.trim()) return null;
  const direct =
    /https?:\/\/[^\s<>[\]()'"]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>[\]()'"]*)?/i.exec(
      content
    );
  if (direct) return direct[0];
  const cdn =
    /https?:\/\/[^\s<>[\]()'"]*(?:nostr\.build|cdn\.nostr\.build|void\.cat)\/[^\s<>[\]()'"]*/i.exec(
      content
    );
  if (cdn) return cdn[0];
  return null;
}

export function feedOtherContentPreview(event: NostrEventRow): string {
  const t = event.content?.trim();
  if (!t) return "— sem conteúdo —";
  if (t.length <= 140) return t;
  return `${t.slice(0, 140)}…`;
}

export function truncateAbout(s: string, max: number): string {
  if (!s.trim()) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

/** Uma linha para a coluna «Descrição» no dashboard (Atividade por kind). */
export function dashboardKindLongDescription(kind: number): string {
  if (kind === 0)
    return "Perfil de utilizador — nome, bio, avatar. Não apagar.";
  if (kind === 1)
    return "Post / nota de texto — conteúdo principal do feed.";
  if (kind === 3)
    return "Lista de contactos — follows do utilizador. Não apagar.";
  if (kind === 6)
    return "Repost — partilha de um kind 1. Pode apagar.";
  if (kind === 7)
    return "Reação / curtida — emoji em resposta a nota. Pode apagar.";
  if (kind === 1059)
    return "DM encriptada (NIP-59) — ilegível pelo operador. Normal em relay privado.";
  if (kind === 10002)
    return "Lista de relays do utilizador — configuração do cliente. Não apagar.";
  if (kind >= 20000 && kind <= 29999)
    return "Evento efémero — desaparece automaticamente.";
  if (kind >= 30000 && kind <= 39999)
    return "Conteúdo addressable — artigos, listas nomeadas.";
  return `Kind ${kind} — tipo desconhecido.`;
}

/** Referência NIP principal para o operador (não exaustivo). */
export function kindNipReference(kind: number): string {
  if (kind === 0 || kind === 1) return "NIP-01";
  if (kind === 3) return "NIP-02";
  if (kind === 6) return "NIP-18";
  if (kind === 7) return "NIP-25";
  if (kind === 1059) return "NIP-59";
  if (kind === 10002) return "NIP-65";
  return "—";
}

/** Mensagem para AlertDialog ao ocultar perfil / follows / relay list. */
export function ocultarSensitiveKindDescription(kind: number): string | null {
  if (kind === 0)
    return "Este evento é o perfil do utilizador. Removê-lo apaga o nome, bio e avatar deste utilizador no relay.";
  if (kind === 3)
    return "Este evento contém a lista de contactos do utilizador. Removê-lo apaga os seus follows neste relay.";
  if (kind === 10002)
    return "Este evento é a configuração de relays do utilizador. Removê-lo pode desligar o cliente deste relay.";
  return null;
}

/** Tooltip de uma frase ao hover da linha no dashboard. */
export function dashboardKindRowTooltip(kind: number): string {
  if (kind === 0)
    return "O kind 0 expõe nome e bio públicos; remover só em caso de abuso claro.";
  if (kind === 1)
    return "Nota de texto pública — uso típico para moderar spam ou conteúdo ilícito.";
  if (kind === 3)
    return "Grafo de follows; apagar pode deixar o estado incoerente para clientes Nostr.";
  if (kind === 6)
    return "Republica outro evento; pode remover sem quebrar o perfil do autor.";
  if (kind === 7)
    return "Emoji de reação; em geral seguro apagar em limpezas de abuso.";
  if (kind === 1059)
    return "Mensagem cifrada — o operador não vê o texto; apagar só por pedido ou política.";
  if (kind === 10002)
    return "Preferências de relay; evite apagar para não desconfigurar utilizadores.";
  if (kind >= 20000 && kind <= 29999)
    return "Efémero, pouco persistente; impacto da remoção costuma ser baixo.";
  if (kind >= 30000 && kind <= 39999)
    return "Dados substituíveis por d-tag; avalie antes de apagar listas ou artigos.";
  return "Tipo menos comum neste painel; confira a NIP antes de remover.";
}
