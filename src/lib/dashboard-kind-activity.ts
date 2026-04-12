/**
 * Dashboard “activity by kind”: groups addressable (30000–39999), ephemeral (20000–29999),
 * and kinds without a dedicated label; main kinds always stay on their own rows.
 */

export type KindActivityRow = { kind: number; events: number; pct: string };

/** Kinds with a dedicated badge (always an individual row in grouped mode). */
export const DASHBOARD_PRIMARY_KINDS: ReadonlySet<number> = new Set([
  0, 1, 3, 6, 7, 10002, 1059,
]);

/** Expandable group ids in the table (grouped mode). */
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

/** Total events in the sample (sum of per-kind counts). */
export function kindActivitySampleTotal(rows: KindActivityRow[]): number {
  return rows.reduce((s, r) => s + r.events, 0);
}

/** Sum of row percentages (already rounded per row, as shown in the UI). */
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
 * Builds grouped table rows (default mode).
 * Sort order: by events (desc).
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

  const ephemSorted = sortByEventsDesc(ephemeralMembers);
  const ephemEvents = ephemSorted.reduce((s, r) => s + r.events, 0);
  if (ephemEvents > 0) {
    out.push({
      rowType: "group-ephemeral",
      events: ephemEvents,
      pct: sumRowPercents(ephemSorted),
      expandId: KIND_TABLE_EXPAND_EPHEMERAL,
      memberRows: ephemSorted,
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

/** Formats kind list for tooltips (truncated). */
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
