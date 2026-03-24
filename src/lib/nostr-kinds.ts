export type KindCategory =
  | "content"
  | "dms"
  | "ephemeral"
  | "replaceable"
  | "system";

export interface KindInfo {
  name: string;
  category: KindCategory;
}

export const KIND_MAP: Record<number, KindInfo> = {
  0: { name: "Perfil", category: "system" },
  1: { name: "Notas de texto", category: "content" },
  3: { name: "Lista de contactos", category: "system" },
  4: { name: "DM (legacy)", category: "dms" },
  5: { name: "Eliminação", category: "system" },
  6: { name: "Reposts", category: "content" },
  7: { name: "Reação", category: "content" },
  10002: { name: "Lista de relays", category: "system" },
  1059: { name: "Gift Wrap (DM)", category: "dms" },
  1018: { name: "Kind 1018", category: "system" },
};

export function getKindInfo(kind: number): KindInfo {
  if (KIND_MAP[kind]) return KIND_MAP[kind];
  if (kind >= 20000 && kind <= 29999)
    return { name: `Kind ${kind}`, category: "ephemeral" };
  if (kind >= 10000 && kind <= 19999)
    return { name: `Kind ${kind}`, category: "replaceable" };
  if (kind >= 30000 && kind <= 39999)
    return { name: `Kind ${kind}`, category: "replaceable" };
  return { name: `Kind ${kind}`, category: "content" };
}

export const CATEGORY_LABELS: Record<KindCategory, string> = {
  content: "Conteúdo",
  dms: "DMs",
  ephemeral: "Ephemeral",
  replaceable: "Replaceable",
  system: "Sistema",
};

export const CATEGORY_COLORS: Record<KindCategory, string> = {
  content: "text-blue-400",
  dms: "text-purple-400",
  ephemeral: "text-muted-foreground",
  replaceable: "text-yellow-400",
  system: "text-green-400",
};

/** Order for dashboard summary rows */
export const CATEGORY_SUMMARY_ORDER: KindCategory[] = [
  "content",
  "ephemeral",
  "dms",
  "system",
  "replaceable",
];
