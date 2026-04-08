/**
 * Dashboard "Atividade por kind": agrupa addressable (30000–39999), efémeros (20000–29999)
 * e kinds sem etiqueta dedicada; mantém kinds principais sempre em linhas próprias.
 */

export type KindActivityRow = { kind: number; events: number; pct: string };

/** Kinds com badge dedicado (sempre linha individual no modo agrupado). */
export const DASHBOARD_PRIMARY_KINDS: ReadonlySet<number> = new Set([
  0, 1, 3, 6, 7, 10002, 1059,
]);

/** Identificadores de grupos expansíveis na tabela (modo agrupado). */
export const KIND_TABLE_EXPAND_ADDRESSABLE = "addressable" as const;
export const KIND_TABLE_EXPAND_EPHEMERAL = "ephemeral" as const;
export const KIND_TABLE_EXPAND_UNKNOWN = "unknown" as const;

export type DashboardKindTableRow =
  | { rowType: "primary"; kind: number; events: number; pct: string }
  | {
      rowType: "group-addressable";
      events: number;
      pct: string;
      expandId: typeof KIND_TABLE_EXPAND_ADDRESSABLE;
      memberRows: KindActivityRow[];
    }
  | {
      rowType: "group-ephemeral";
      events: number;
      pct: string;
      expandId: typeof KIND_TABLE_EXPAND_EPHEMERAL;
      memberRows: KindActivityRow[];
    }
  | {
      rowType: "group-unknown";
      events: number;
      pct: string;
      expandId: typeof KIND_TABLE_EXPAND_UNKNOWN;
      memberRows: KindActivityRow[];
    };

function isAddressable(kind: number): boolean {
  return kind >= 30000 && kind <= 39999;
}

function isEphemeralRange(kind: number): boolean {
  return kind >= 20000 && kind <= 29999;
}

/** Amostra total de eventos (soma das contagens por kind). */
export function kindActivitySampleTotal(rows: KindActivityRow[]): number {
  return rows.reduce((s, r) => s + r.events, 0);
}

/** Soma das percentagens já arredondadas por linha (como pedido no UI). */
export function sumRowPercents(rows: KindActivityRow[]): string {
  let s = 0;
  for (const r of rows) {
    const raw = String(r.pct).replace(/%/g, "").replace(",", ".").trim();
    const n = parseFloat(raw);
    if (Number.isFinite(n)) s += n;
  }
  return `${s.toFixed(1)}%`;
}

function sortByEventsDesc(rows: KindActivityRow[]): KindActivityRow[] {
  return [...rows].sort((a, b) => b.events - a.events);
}

/**
 * Constrói linhas da tabela em modo agrupado (default).
 * Ordenação: por eventos (desc).
 */
export function buildGroupedKindTableRows(
  kindRows: KindActivityRow[]
): DashboardKindTableRow[] {
  const primary: DashboardKindTableRow[] = [];
  const addressableMembers: KindActivityRow[] = [];
  const ephemeralMembers: KindActivityRow[] = [];
  const unknownMembers: KindActivityRow[] = [];

  for (const r of kindRows) {
    if (DASHBOARD_PRIMARY_KINDS.has(r.kind)) {
      primary.push({
        rowType: "primary",
        kind: r.kind,
        events: r.events,
        pct: r.pct,
      });
      continue;
    }
    if (isAddressable(r.kind)) {
      addressableMembers.push(r);
      continue;
    }
    if (isEphemeralRange(r.kind)) {
      ephemeralMembers.push(r);
      continue;
    }
    unknownMembers.push(r);
  }

  const out: DashboardKindTableRow[] = [...primary];

  const addrSorted = sortByEventsDesc(addressableMembers);
  const addrEvents = addrSorted.reduce((s, r) => s + r.events, 0);
  if (addrEvents > 0) {
    out.push({
      rowType: "group-addressable",
      events: addrEvents,
      pct: sumRowPercents(addrSorted),
      expandId: KIND_TABLE_EXPAND_ADDRESSABLE,
      memberRows: addrSorted,
    });
  }

  const ephSorted = sortByEventsDesc(ephemeralMembers);
  const ephEvents = ephSorted.reduce((s, r) => s + r.events, 0);
  if (ephEvents > 0) {
    out.push({
      rowType: "group-ephemeral",
      events: ephEvents,
      pct: sumRowPercents(ephSorted),
      expandId: KIND_TABLE_EXPAND_EPHEMERAL,
      memberRows: ephSorted,
    });
  }

  const unkSorted = sortByEventsDesc(unknownMembers);
  const unkEvents = unkSorted.reduce((s, r) => s + r.events, 0);
  if (unkEvents > 0) {
    out.push({
      rowType: "group-unknown",
      events: unkEvents,
      pct: sumRowPercents(unkSorted),
      expandId: KIND_TABLE_EXPAND_UNKNOWN,
      memberRows: unkSorted,
    });
  }

  out.sort((a, b) => b.events - a.events);
  return out;
}

/** Lista kinds para tooltip (truncada). */
export function formatMemberKindsList(
  kinds: number[],
  maxShow = 24
): { shown: string; extra: number } {
  if (kinds.length <= maxShow) {
    return { shown: kinds.join(", "), extra: 0 };
  }
  return {
    shown: kinds.slice(0, maxShow).join(", "),
    extra: kinds.length - maxShow,
  };
}
