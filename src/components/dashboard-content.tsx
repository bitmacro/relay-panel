"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CATEGORY_COLORS,
  CATEGORY_SUMMARY_ORDER,
  getKindInfo,
  type KindCategory,
} from "@/lib/nostr-kinds";
import {
  kindBadgeMeta,
  dashboardKindLongDescription,
  dashboardKindRowTooltip,
  kindNipReference,
} from "@/lib/events-display";
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

type KindRow = { kind: number; events: number; pct: string };

export function DashboardContent({
  stats,
  health,
  selectedRelay,
  loading,
  refreshTrigger,
}: DashboardContentProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tErr = useTranslations("errors");
  const tc = useTranslations("common");

  const nfLocale = locale === "en" ? "en-US" : "pt-PT";
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

  const [kindActivity, setKindActivity] = useState<KindRow[]>([]);
  const [kindLoading, setKindLoading] = useState(false);
  const [kindError, setKindError] = useState<string | null>(null);
  const [pubkeySampleCount, setPubkeySampleCount] = useState<number | null>(null);
  const [blockedPolicyCount, setBlockedPolicyCount] = useState<number | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [kindSheetKind, setKindSheetKind] = useState<number | null>(null);

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
      const rows: KindRow[] = Object.entries(counts)
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

  const fetchDashboardMetrics = useCallback(async (relayId: string) => {
    setMetricsLoading(true);
    try {
      const [usersRes, policyRes] = await Promise.all([
        fetch(`/api/relay/${relayId}/users?limit=10000`, {
          cache: "no-store",
          signal: AbortSignal.timeout(25_000),
        }),
        fetch(`/api/relay/${relayId}/policy`, {
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        }),
      ]);
      if (usersRes.ok) {
        const j = (await usersRes.json()) as { users?: string[] };
        setPubkeySampleCount(Array.isArray(j.users) ? j.users.length : null);
      } else {
        setPubkeySampleCount(null);
      }
      if (policyRes.ok) {
        const j = (await policyRes.json()) as {
          entries?: { status?: string }[];
        };
        const blocked = (j.entries ?? []).filter(
          (e) => e.status === "blocked"
        ).length;
        setBlockedPolicyCount(blocked);
      } else {
        setBlockedPolicyCount(null);
      }
    } catch {
      setPubkeySampleCount(null);
      setBlockedPolicyCount(null);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRelay?.id && !loading) {
      fetchKindActivity(selectedRelay.id);
      fetchDashboardMetrics(selectedRelay.id);
    } else {
      setKindActivity([]);
      setKindError(null);
      setPubkeySampleCount(null);
      setBlockedPolicyCount(null);
    }
  }, [
    selectedRelay?.id,
    loading,
    refreshTrigger,
    fetchKindActivity,
    fetchDashboardMetrics,
  ]);

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
            {loading || metricsLoading
              ? "…"
              : pubkeySampleCount != null
                ? formatNumber(pubkeySampleCount)
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
            {loading || metricsLoading
              ? "…"
              : blockedPolicyCount != null
                ? formatNumber(blockedPolicyCount)
                : "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-[#444]">{t("metrics.whitelistHint")}</div>
        </div>
      </div>

      {/* Resumo por categoria */}
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

      {/* Atividade por kind */}
      <div>
        <div className="mb-2.5 text-[13px] font-medium text-[#ccc]">{t("kindActivity")}</div>
        <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
          <TooltipProvider delayDuration={300}>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="w-[104px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                    {t("colKind")}
                  </th>
                  <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                    {t("colDescription")}
                  </th>
                  <th className="w-[72px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                    {t("colNip")}
                  </th>
                  <th className="w-20 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-right text-[11px] font-medium text-[#555]">
                    {t("colEvents")}
                  </th>
                  <th className="w-16 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-right text-[11px] font-medium text-[#555]">
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
                ) : (
                  kindActivity.map((row) => {
                    const meta = kindBadgeMeta(row.kind);
                    return (
                      <Tooltip key={row.kind}>
                        <TooltipTrigger asChild>
                          <tr className="border-b border-[#222] transition-colors last:border-b-0 hover:bg-[#1f1f1f] cursor-help">
                            <td className="px-2.5 py-2 align-top">
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
                            <td className="px-2.5 py-2 text-[#ccc] align-top leading-snug">
                              {dashboardKindLongDescription(row.kind)}
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
                        <TooltipContent side="top" className="max-w-[280px] text-left leading-snug">
                          {dashboardKindRowTooltip(row.kind)}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                )}
              </tbody>
            </table>
          </TooltipProvider>
        </div>
        <p className="mt-1.5 text-[11px] text-[#555]">
          {kindActivity.length > 0
            ? t("sampleFooterKinds", {
                count: kindActivity.reduce((s, r) => s + r.events, 0).toLocaleString(nfLocale),
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
                  {kindBadgeMeta(kindSheetKind).label}
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
                    {dashboardKindLongDescription(kindSheetKind)}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("sheetNote")}
                  </div>
                  <p className="text-muted-foreground text-[12px] leading-snug">
                    {dashboardKindRowTooltip(kindSheetKind)}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Estado da ligação */}
      <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="mb-3 text-[13px] font-medium text-[#ddd]">{t("connection")}</div>
        <div className="flex flex-wrap gap-5 text-sm">
          <div>
            <span className="text-[#555]">{t("strfryVersion")} </span>
            <strong className="text-[#ccc]">
              {loading ? "…" : stats?.version ?? "—"}
            </strong>
          </div>
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
                ? "online"
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
