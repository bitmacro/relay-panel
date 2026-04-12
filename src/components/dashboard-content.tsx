"use client";

import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CATEGORY_COLORS,
  CATEGORY_SUMMARY_ORDER,
  getKindInfo,
  type KindCategory,
} from "@/lib/nostr-kinds";
import { kindNipReference } from "@/lib/events-display";
import {
  kindBadgeClass,
  kindBadgeMetaI18n,
  kindDashboardRowTooltip,
  kindLongDescription,
} from "@/lib/dashboard-kind-i18n";
import type { DashboardKindTableRow, KindActivityRow } from "@/lib/dashboard-kind-activity";
import { buildGroupedKindTableRows, formatMemberKindsList } from "@/lib/dashboard-kind-activity";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
}

interface RelayStats {
  total_events?: number;
  db_size?: string;
  uptime?: number;
  version?: string;
  error?: string;
  detail?: string;
  _status?: number;
  _ok?: boolean;
}

interface RelayHealth {
  status?: string;
  timestamp?: string;
  /** relay-agent package version from GET /health */
  version?: string;
  /** strfry binary version from GET /health (per relay instance in v0.2) */
  strfry_version?: string;
  error?: string;
  detail?: string;
  _status?: number;
  _ok?: boolean;
}

interface DashboardContentProps {
  stats: RelayStats | null;
  health: RelayHealth | null;
  selectedRelay: Relay | null;
  loading: boolean;
  refreshTrigger?: number;
  /** From GET /users — unique pubkeys count; null if loading failed or unknown */
  uniquePubkeysCount: number | null;
  /** From GET /policy/blocked — blocked pubkeys count; null if loading failed or unknown */
  blockedCount: number | null;
  pubkeysCountLoading: boolean;
  blockedCountLoading: boolean;
}

function formatUptime(seconds?: number): string {
  if (seconds == null) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function DashboardContent({
  stats,
  health,
  selectedRelay,
  loading,
  refreshTrigger,
  uniquePubkeysCount,
  blockedCount,
  pubkeysCountLoading,
  blockedCountLoading,
}: DashboardContentProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tErr = useTranslations("errors");
  const tc = useTranslations("common");
  const tRelayStatus = useTranslations("relayStatus");

  const nfLocale =
    locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  const formatNumber = (n?: number | null) =>
    n == null ? "—" : n.toLocaleString(nfLocale);

  const formatHealthError = useCallback(
    (health: RelayHealth | null): string => {
      if (!health) return tErr("health.dash");
      const status = health._status;
      const err = health.error ?? health.detail;
      const suffix = status != null ? ` (${status})` : "";
      if (err === "agent_unavailable") return tErr("health.agentUnavailable", { suffix });
      if (err === "agent_timeout") return tErr("health.agentTimeout", { suffix });
      if (err === "gateway_timeout" || err === "supabase_timeout")
        return tErr("health.gatewayTimeout", { suffix });
      if (err === "relay not found") return tErr("health.relayNotFound", { suffix });
      if (status === 502) return tErr("health.badGateway502", { suffix });
      if (status === 503) return tErr("health.serviceUnavailable503", { suffix });
      if (err) return `${err}${suffix}`;
      return tErr("health.genericError", { suffix });
    },
    [tErr]
  );

  const formatEventsError = useCallback(
    (err: unknown): string => {
      const msg =
        typeof err === "string" ? err : err instanceof Error ? err.message : String(err);
      if (msg.includes("relay unavailable")) return tErr("events.relayLmdb");
      if (msg.includes("agent unavailable") || msg.includes("agent_unavailable"))
        return tErr("events.agentNoResponse");
      if (msg.includes("timeout") || msg.includes("agent_timeout")) return tErr("events.timeout");
      if (msg.includes("502") || msg.includes("503")) return tErr("events.badGateway");
      return msg || tErr("events.genericLoad");
    },
    [tErr]
  );

  const [kindActivity, setKindActivity] = useState<KindActivityRow[]>([]);
  const [kindLoading, setKindLoading] = useState(false);
  const [kindError, setKindError] = useState<string | null>(null);
  const [kindSheetKind, setKindSheetKind] = useState<number | null>(null);
  const [kindTableExpanded, setKindTableExpanded] = useState(false);
  const [expandedKindGroups, setExpandedKindGroups] = useState<Set<string>>(
    () => new Set()
  );

  const toggleKindGroup = useCallback((id: string) => {
    setExpandedKindGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    setKindTableExpanded(false);
    setExpandedKindGroups(new Set());
  }, [selectedRelay?.id]);

  const fetchKindActivity = useCallback(async (relayId: string) => {
    setKindLoading(true);
    setKindError(null);
    try {
      const res = await fetch(`/api/relay/${relayId}/events?limit=1000`, {
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
      const json = (await res.json()) as { kind?: number }[] | { error?: string; detail?: string };
      if (!res.ok) {
        const err = json && typeof json === "object" && !Array.isArray(json)
          ? (json as { error?: string; detail?: string }).error ?? (json as { detail?: string }).detail
          : "agent unavailable";
        throw new Error(err);
      }
      const events = Array.isArray(json) ? json : [];
      const counts: Record<number, number> = {};
      for (const e of events) {
        const k = (e as { kind?: number }).kind ?? 0;
        counts[k] = (counts[k] ?? 0) + 1;
      }
      const total = events.length;
      const rows: KindActivityRow[] = Object.entries(counts)
        .map(([k, n]) => ({
          kind: parseInt(k, 10),
          events: n,
          pct: total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "0%",
        }))
        .sort((a, b) => b.events - a.events);
      setKindActivity(rows);
    } catch (err) {
      setKindActivity([]);
      setKindError(formatEventsError(err));
    } finally {
      setKindLoading(false);
    }
  }, [formatEventsError]);

  useEffect(() => {
    if (selectedRelay?.id && !loading) {
      fetchKindActivity(selectedRelay.id);
    } else {
      setKindActivity([]);
      setKindError(null);
    }
  }, [selectedRelay?.id, loading, refreshTrigger, fetchKindActivity]);

  const categorySummary = useMemo(() => {
    const totals: Record<KindCategory, number> = {
      content: 0,
      dms: 0,
      ephemeral: 0,
      replaceable: 0,
      system: 0,
    };
    for (const row of kindActivity) {
      const cat = getKindInfo(row.kind).category;
      totals[cat] += row.events;
    }
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return { totals, total };
  }, [kindActivity]);

  const groupedKindTableRows = useMemo(
    () => buildGroupedKindTableRows(kindActivity),
    [kindActivity]
  );

  const kindSampleTotal = useMemo(
    () => kindActivity.reduce((s, r) => s + r.events, 0),
    [kindActivity]
  );

  const primaryKindTableRow = (row: KindActivityRow, opts?: { nested?: boolean; reactKey?: string }) => {
    const meta = kindBadgeMetaI18n(row.kind, t);
    const rk = opts?.reactKey ?? String(row.kind);
    const trClass = opts?.nested
      ? "border-b border-[#222] bg-[#151515] transition-colors last:border-b-0 hover:bg-[#1c1c1c] cursor-help"
      : "border-b border-[#222] transition-colors last:border-b-0 hover:bg-[#1f1f1f] cursor-help";
    const padFirst = opts?.nested ? "pl-8" : "";

    return (
      <Tooltip key={rk}>
        <TooltipTrigger asChild>
          <tr className={trClass}>
            <td className={`px-2.5 py-2 align-top ${padFirst}`}>
              <button
                type="button"
                className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer transition-opacity hover:opacity-90 ${meta.badgeClass}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setKindSheetKind(row.kind);
                }}
              >
                {meta.label}
              </button>
            </td>
            <td className="min-w-0 break-words px-2.5 py-2 text-[#ccc] align-top leading-snug">
              {kindLongDescription(row.kind, t)}
            </td>
            <td className="px-2.5 py-2 align-top font-mono text-[11px] text-[#888]">
              {kindNipReference(row.kind)}
            </td>
            <td className="px-2.5 py-2 text-right text-[#ccc] align-top tabular-nums">
              {row.events.toLocaleString(nfLocale)}
            </td>
            <td className="px-2.5 py-2 text-right text-[#ccc] align-top tabular-nums">
              {row.pct}
            </td>
          </tr>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] text-left leading-snug whitespace-pre-line">
          {kindDashboardRowTooltip(row.kind, t)}
        </TooltipContent>
      </Tooltip>
    );
  };

  const groupedAggregateTableRow = (
    row: Exclude<DashboardKindTableRow, { rowType: "primary" }>,
    expanded: boolean
  ) => {
    const expandId = row.expandId;
    const meta =
      row.rowType === "group-addressable"
        ? kindBadgeMetaI18n(30000, t)
        : row.rowType === "group-ephemeral"
          ? kindBadgeMetaI18n(20000, t)
          : {
              label: t("groupOthersBadge"),
              badgeClass: kindBadgeClass(12345),
            };
    const description =
      row.rowType === "group-addressable"
        ? t("groupAddressableTableDescription")
        : row.rowType === "group-ephemeral"
          ? t("groupEphemeralDescription")
          : t("groupOthersTableDescription");
    const nipCol =
      row.rowType === "group-addressable" ? t("groupAddressableNip") : "—";
    const hint =
      row.rowType === "group-addressable"
        ? t("groupAddressableHint")
        : row.rowType === "group-ephemeral"
          ? t("groupEphemeralHint")
          : t("groupUnknownHint");
    const kindNums = row.memberRows.map((r) => r.kind);
    const { shown, extra } = formatMemberKindsList(kindNums);
    const kindsLine =
      extra > 0
        ? t("groupedKindsLineMore", { shown, extra })
        : t("groupedKindsLine", { shown });
    const tooltip = `${hint}\n\n${t("groupRowExpandHint")}\n\n${kindsLine}`;

    return (
      <Tooltip key={`grp-${expandId}`}>
        <TooltipTrigger asChild>
          <tr
            role="button"
            tabIndex={0}
            className="border-b border-[#222] transition-colors last:border-b-0 hover:bg-[#252525] cursor-pointer"
            onClick={() => toggleKindGroup(expandId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleKindGroup(expandId);
              }
            }}
          >
            <td className="px-2.5 py-2 align-top">
              <div className="flex items-center gap-1.5">
                <span className="w-3 shrink-0 text-[10px] text-[#666]" aria-hidden>
                  {expanded ? "▼" : "▶"}
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                >
                  {meta.label}
                </span>
              </div>
            </td>
            <td className="min-w-0 break-words px-2.5 py-2 text-[#ccc] align-top leading-snug">
              {description}
            </td>
            <td className="px-2.5 py-2 align-top font-mono text-[11px] text-[#888]">{nipCol}</td>
            <td className="px-2.5 py-2 text-right text-[#ccc] align-top tabular-nums">
              {row.events.toLocaleString(nfLocale)}
            </td>
            <td className="px-2.5 py-2 text-right text-[#ccc] align-top tabular-nums">
              {row.pct}
            </td>
          </tr>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[320px] text-left leading-snug whitespace-pre-line">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
          <div className="text-[11px] text-[#555]">{t("metrics.totalEvents")}</div>
          <div className="text-xl font-semibold text-[#f0f0f0]">
            {loading ? "…" : formatNumber(stats?.total_events)}
          </div>
          <div className="mt-0.5 text-[11px] text-[#444]">strfry</div>
        </div>
        <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
          <div className="text-[11px] text-[#555]">{t("metrics.dbSize")}</div>
          <div className="text-xl font-semibold text-[#f0f0f0]">
            {loading ? "…" : stats?.db_size ?? "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-[#444]">LMDB</div>
        </div>
        <div
          className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3"
          title={t("metrics.uniquePubkeysTitle")}
        >
          <div className="text-[11px] text-[#555]">{t("metrics.uniquePubkeys")}</div>
          <div className="text-xl font-semibold text-[#f0f0f0]">
            {pubkeysCountLoading
              ? "…"
              : uniquePubkeysCount != null
                ? formatNumber(uniquePubkeysCount)
                : "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-[#444]">{t("metrics.uniquePubkeysHint")}</div>
        </div>
        <div
          className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3"
          title={t("metrics.blockedTitle")}
        >
          <div className="text-[11px] text-[#555]">{t("metrics.blocked")}</div>
          <div className="text-xl font-semibold text-[#f0f0f0]">
            {blockedCountLoading
              ? "…"
              : blockedCount != null
                ? formatNumber(blockedCount)
                : "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-[#444]">{t("metrics.whitelistHint")}</div>
        </div>
      </div>

      {/* Category summary */}
      <div>
        <div className="mb-2.5 text-[13px] font-medium text-[#ccc]">
          {t("categorySummary")}
        </div>
        <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-3">
          {kindLoading ? (
            <p className="text-[12px] text-[#666]">{tc("loading")}</p>
          ) : kindError ? (
            <p className="text-[12px] text-[#f87171]">{kindError}</p>
          ) : categorySummary.total === 0 ? (
            <p className="text-[12px] text-[#555]">{t("noDataSelect")}</p>
          ) : (
            <ul className="space-y-2.5">
              {CATEGORY_SUMMARY_ORDER.map((cat) => {
                const n = categorySummary.totals[cat];
                const pct =
                  categorySummary.total > 0
                    ? (n / categorySummary.total) * 100
                    : 0;
                /* Bar width must match the % column (share of total), not share of max category */
                const barWidthPct = pct;
                return (
                  <li
                    key={cat}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]"
                  >
                    <span
                      className={`w-[100px] shrink-0 font-medium ${CATEGORY_COLORS[cat]}`}
                    >
                      {t(`category.${cat}`)}
                    </span>
                    <span className="w-12 shrink-0 text-right tabular-nums text-[#ccc]">
                      {n.toLocaleString(nfLocale)}
                    </span>
                    <span className="w-12 shrink-0 text-right tabular-nums text-[#555]">
                      {pct.toFixed(1)}%
                    </span>
                    <div className="h-2 min-w-[120px] flex-1 overflow-hidden rounded bg-[#252525]">
                      <div
                        className="h-full rounded bg-[#3a3a3a]"
                        style={{ width: `${barWidthPct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-[#555]">
          {kindActivity.length > 0
            ? t("sampleFooter", {
                count: categorySummary.total.toLocaleString(nfLocale),
              })
            : t("sampleHint")}
        </p>
      </div>

      {/* Activity by kind */}
      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[13px] font-medium text-[#ccc]">{t("kindActivity")}</div>
          {kindActivity.length > 0 && !kindLoading && !kindError ? (
            <button
              type="button"
              className="shrink-0 rounded-md border border-[#333] bg-[#252525] px-2.5 py-1 text-[11px] font-medium text-[#ccc] transition-colors hover:bg-[#2a2a2a]"
              onClick={() => setKindTableExpanded((v) => !v)}
            >
              {kindTableExpanded ? t("showGrouped") : t("showAllKinds")}
            </button>
          ) : null}
        </div>
        <div className="overflow-x-auto rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
          <TooltipProvider delayDuration={300}>
            <table className="w-full min-w-[640px] table-fixed border-collapse text-[12px]">
              <colgroup>
                <col className="w-[124px]" />
                <col />
                <col className="w-[76px]" />
                <col className="w-[88px]" />
                <col className="w-[52px]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                    {t("colKind")}
                  </th>
                  <th className="min-w-0 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                    {t("colDescription")}
                  </th>
                  <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                    {t("colNip")}
                  </th>
                  <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-right text-[11px] font-medium text-[#555]">
                    {t("colEvents")}
                  </th>
                  <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-right text-[11px] font-medium text-[#555]">
                    {t("colPct")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {kindLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-2.5 py-6 text-center text-[12px] text-[#666]"
                    >
                      {tc("loading")}
                    </td>
                  </tr>
                ) : kindError ? (
                  <tr>
                    <td colSpan={5} className="px-2.5 py-6 text-center">
                      <p className="text-[12px] text-[#f87171]">{kindError}</p>
                    </td>
                  </tr>
                ) : kindActivity.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-2.5 py-6 text-center text-[12px] text-[#555]"
                    >
                      {t("noDataSelect")}
                    </td>
                  </tr>
                ) : kindTableExpanded ? (
                  kindActivity.map((r) => primaryKindTableRow(r))
                ) : (
                  groupedKindTableRows.flatMap((row) => {
                    if (row.rowType === "primary") {
                      return [primaryKindTableRow(row)];
                    }
                    const exp = expandedKindGroups.has(row.expandId);
                    return [
                      groupedAggregateTableRow(row, exp),
                      ...(exp
                        ? row.memberRows.map((m) =>
                            primaryKindTableRow(m, {
                              nested: true,
                              reactKey: `${row.expandId}-${m.kind}`,
                            })
                          )
                        : []),
                    ];
                  })
                )}
              </tbody>
            </table>
          </TooltipProvider>
        </div>
        <p className="mt-1.5 text-[11px] text-[#555]">
          {kindActivity.length > 0
            ? t("sampleFooterKinds", {
                count: kindSampleTotal.toLocaleString(nfLocale),
              })
            : t("sampleHint")}
        </p>
      </div>

      <Sheet
        open={kindSheetKind !== null}
        onOpenChange={(open) => {
          if (!open) setKindSheetKind(null);
        }}
      >
        <SheetContent side="right" className="max-h-full overflow-y-auto">
          {kindSheetKind !== null && (
            <>
              <SheetHeader>
                <SheetTitle className="text-foreground">
                  {kindBadgeMetaI18n(kindSheetKind, t).label}
                </SheetTitle>
                <p className="text-[11px] font-mono text-muted-foreground">
                  kind {kindSheetKind}
                </p>
              </SheetHeader>
              <div className="space-y-4 px-6 pb-8 text-[13px] text-foreground">
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("sheetKindNumber")}
                  </div>
                  <div className="font-mono text-xl tabular-nums">{kindSheetKind}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("sheetNip")}
                  </div>
                  <div className="font-mono">{kindNipReference(kindSheetKind)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("sheetDescription")}
                  </div>
                  <p className="text-muted-foreground leading-snug">
                    {kindLongDescription(kindSheetKind, t)}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("sheetNote")}
                  </div>
                  <p className="text-muted-foreground text-[12px] leading-snug">
                    {kindDashboardRowTooltip(kindSheetKind, t)}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Connection status */}
      <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="mb-3 text-[13px] font-medium text-[#ddd]">{t("connection")}</div>
        <div className="flex flex-wrap gap-5 text-sm">
          <div className="min-w-0 max-w-[20rem]">
            <div>
              <span className="text-[#555]">{t("strfryVersion")} </span>
              <strong className="text-[#ccc]">
                {loading
                  ? "…"
                  : (health?.strfry_version &&
                      health.strfry_version !== "unknown" &&
                      health.strfry_version) ||
                    stats?.version ||
                    "—"}
              </strong>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-[#555]">
              {t("strfryVersionHint")}
            </p>
          </div>
          {!loading && health?.status === "ok" && health?.version ? (
            <div>
              <span className="text-[#555]">{t("relayAgentPackageVersion")} </span>
              <strong className="text-[#ccc]">{health.version}</strong>
            </div>
          ) : null}
          <div>
            <span className="text-[#555]">{t("uptime")} </span>
            <strong className="text-[#ccc]">
              {loading ? "…" : formatUptime(stats?.uptime)}
            </strong>
          </div>
          <div>
            <span className="text-[#555]">{t("relayAgent")} </span>
            <strong
              className={
                health?.status === "ok"
                  ? "text-[#22c55e]"
                  : health?.error
                  ? "text-[#f87171]"
                  : "text-[#ccc]"
              }
              title={health?.detail ?? health?.error}
            >
              {loading
                ? "…"
                : health?.status === "ok"
                ? tRelayStatus("online")
                : formatHealthError(health)}
            </strong>
          </div>
          <div>
            <span className="text-[#555]">{t("endpoint")} </span>
            <strong className="font-mono text-[11px] text-[#666]">
              {selectedRelay?.endpoint ?? "—"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
