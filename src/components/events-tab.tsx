"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  getKindInfo,
  type KindCategory,
} from "@/lib/nostr-kinds";
import {
  type NostrEventRow,
  authorFilterToHex,
  hexToNpubDisplay,
  truncateNpub,
  getContentPreview,
  parseKind0Profile,
  EVENTS_VIEW_MODE_KEY,
  type EventsViewMode,
  ocultarSensitiveKindDescription,
} from "@/lib/events-display";
import { kindBadgeMetaI18n } from "@/lib/dashboard-kind-i18n";
import {
  legacyStorageKeyForPubkey,
  MY_NOSTR_PUBKEY_KEY,
  MY_NOSTR_SOURCE_KEY,
  notifyNostrPrefsChanged,
} from "@/lib/local-preferences";
import { EventFeedCard } from "@/components/events-feed-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Categoria no filtro: inclui modos especiais além de KindCategory */
type CategoryFilterValue = "all" | "no_ephemeral" | KindCategory;

const CATEGORY_OPTIONS: { value: CategoryFilterValue; key: string }[] = [
  { value: "all", key: "categories.all" },
  { value: "no_ephemeral", key: "categories.no_ephemeral" },
  { value: "content", key: "categories.content" },
  { value: "dms", key: "categories.dms" },
  { value: "ephemeral", key: "categories.ephemeral" },
  { value: "replaceable", key: "categories.replaceable" },
  { value: "system", key: "categories.system" },
];

function isEphemeralKind(kind: number): boolean {
  return kind >= 20000 && kind <= 29999;
}

function readStoredPubkeyHex(userId: string | null): string | null {
  if (typeof window === "undefined") return null;
  const g = window.localStorage.getItem(MY_NOSTR_PUBKEY_KEY);
  if (g && /^[0-9a-f]{64}$/i.test(g)) return g.toLowerCase();
  if (userId) {
    const leg = window.localStorage.getItem(legacyStorageKeyForPubkey(userId));
    if (leg && /^[0-9a-f]{64}$/i.test(leg)) {
      window.localStorage.setItem(MY_NOSTR_PUBKEY_KEY, leg.toLowerCase());
      return leg.toLowerCase();
    }
  }
  return null;
}

interface EventsTabProps {
  selectedId: string | null;
  refreshTrigger?: number;
}

export function EventsTab({ selectedId, refreshTrigger }: EventsTabProps) {
  const t = useTranslations("EventsTab");
  const td = useTranslations("dashboard");
  const { data: session } = useSession();
  
  const userId =
    session?.user &&
    "id" in session.user &&
    typeof (session.user as { id?: string }).id === "string"
      ? (session.user as { id: string }).id
      : null;
  const sessionNostrHex = (
    session?.user as { nostrPubkeyHex?: string | null } | undefined
  )?.nostrPubkeyHex;

  const [events, setEvents] = useState<NostrEventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] =
    useState<CategoryFilterValue>("no_ephemeral");
  const [filterKind, setFilterKind] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("24h");
  const [authorFilterInput, setAuthorFilterInput] = useState("");
  const [blockTarget, setBlockTarget] = useState<{ pubkey: string } | null>(
    null
  );
  const [blockPending, setBlockPending] = useState(false);
  const [ocultarConfirm, setOcultarConfirm] = useState<{
    id: string;
    kind: number;
  } | null>(null);
  const [detailEvent, setDetailEvent] = useState<NostrEventRow | null>(null);
  const [pubkeyFilterHint, setPubkeyFilterHint] = useState<string | null>(
    null
  );
  const [, setProfileBump] = useState(0);
  const profileCacheRef = useRef<
    Map<string, { display: string; picture?: string }>
  >(new Map());
  const [viewMode, setViewMode] = useState<EventsViewMode>("table");

  useEffect(() => {
    const v = localStorage.getItem(EVENTS_VIEW_MODE_KEY);
    if (v === "feed" || v === "table") setViewMode(v);
  }, []);

  const formatAgo = useCallback((ts: number): string => {
    const diff = Math.floor(Date.now() / 1000 - ts);
    if (diff < 60) return t("time.now");
    if (diff < 3600) return t("time.minutesAgo", { count: Math.floor(diff / 60) });
    if (diff < 86400) return t("time.hoursAgo", { count: Math.floor(diff / 3600) });
    if (diff < 604800) return t("time.daysAgo", { count: Math.floor(diff / 86400) });
    return new Date(ts * 1000).toLocaleDateString(undefined);
  }, [t]);

  const formatEventsError = useCallback((err: unknown): string => {
    const msg =
      typeof err === "string"
        ? err
        : err instanceof Error
          ? err.message
          : String(err);
    if (msg.includes("relay unavailable")) return t("errors.relayUnavailable");
    if (msg.includes("agent unavailable") || msg.includes("agent_unavailable")) return t("errors.agentUnavailable");
    if (msg.includes("timeout") || msg.includes("agent_timeout")) return t("errors.timeout");
    if (msg.includes("502") || msg.includes("503")) return t("errors.proxyError");
    return msg || t("errors.default");
  }, [t]);

  function setViewModePersist(next: EventsViewMode) {
    setViewMode(next);
    localStorage.setItem(EVENTS_VIEW_MODE_KEY, next);
  }

  const authorHexForApi = useMemo(
    () => authorFilterToHex(authorFilterInput),
    [authorFilterInput]
  );

  const kindOptions = useMemo(() => {
    const unique = [...new Set(events.map((e) => e.kind))].sort((a, b) => a - b);
    if (filterCategory === "all") return unique;
    if (filterCategory === "no_ephemeral") {
      return unique.filter((k) => !isEphemeralKind(k));
    }
    return unique.filter((k) => getKindInfo(k).category === filterCategory);
  }, [events, filterCategory]);

  useEffect(() => {
    if (filterKind && !kindOptions.includes(Number(filterKind))) {
      setFilterKind("");
    }
  }, [filterKind, kindOptions]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const info = getKindInfo(event.kind);
      const matchesCategory =
        filterCategory === "all"
          ? true
          : filterCategory === "no_ephemeral"
            ? !isEphemeralKind(event.kind)
            : info.category === filterCategory;
      const matchesKind =
        filterKind === "" || event.kind === Number(filterKind);
      return matchesCategory && matchesKind;
    });
  }, [events, filterCategory, filterKind]);

  useEffect(() => {
    if (!selectedId) {
      queueMicrotask(() => setEvents([]));
      return;
    }
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (filterTime === "24h") {
      params.set("since", String(Math.floor(Date.now() / 1000 - 86400)));
    } else if (filterTime === "7d") {
      params.set("since", String(Math.floor(Date.now() / 1000 - 604800)));
    }
    if (authorHexForApi) {
      params.set("authors", authorHexForApi);
    }
    fetch(`/api/relay/${selectedId}/events?${params.toString()}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) {
          const err = json?.error ?? json?.detail ?? "agent unavailable";
          throw new Error(err);
        }
        if (json?.error && !Array.isArray(json)) throw new Error(json.error);
        return Array.isArray(json) ? json : [];
      })
      .then(setEvents)
      .catch((err) => {
        setEvents([]);
        setError(formatEventsError(err));
      })
      .finally(() => setLoading(false));
  }, [selectedId, filterTime, authorHexForApi, refreshTrigger, formatEventsError]);

  const resolveDisplayPubkey = useCallback((hex: string) => {
    const meta = profileCacheRef.current.get(hex);
    if (meta?.display) return meta.display;
    try {
      return truncateNpub(hexToNpubDisplay(hex));
    } catch {
      return hex.length <= 16 ? hex : `${hex.slice(0, 8)}…${hex.slice(-6)}`;
    }
  }, []);

  useEffect(() => {
    if (!selectedId || filteredEvents.length === 0) return;
    const pubkeys = [...new Set(filteredEvents.map((e) => e.pubkey))];
    const need = pubkeys.filter((pk) => !profileCacheRef.current.has(pk));
    if (need.length === 0) return;

    const chunkSize = 35;
    let cancelled = false;

    (async () => {
      for (let i = 0; i < need.length; i += chunkSize) {
        if (cancelled) break;
        const slice = need.slice(i, i + chunkSize);
        const params = new URLSearchParams();
        params.set("kinds", "0");
        params.set("authors", slice.join(","));
        params.set("limit", String(Math.min(slice.length + 20, 100)));
        try {
          const r = await fetch(
            `/api/relay/${selectedId}/events?${params.toString()}`
          );
          if (!r.ok) continue;
          const arr = (await r.json()) as NostrEventRow[];
          if (!Array.isArray(arr)) continue;
          for (const ev of arr) {
            if (ev.kind !== 0 || !ev.pubkey) continue;
            const { name: displayRaw, picture } = parseKind0Profile(ev.content);
            const display = displayRaw?.trim() ?? "";
            const prev = profileCacheRef.current.get(ev.pubkey);
            const mergedDisplay = display || prev?.display || "";
            const mergedPicture = picture ?? prev?.picture;
            if (mergedDisplay || mergedPicture) {
              profileCacheRef.current.set(ev.pubkey, {
                display: mergedDisplay,
                picture: mergedPicture,
              });
            }
          }
          setProfileBump((t) => t + 1);
        } catch {
          /* non-blocking */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, filteredEvents, refreshTrigger]);

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function requestOcultar(id: string, kind: number) {
    if (ocultarSensitiveKindDescription(kind)) {
      setOcultarConfirm({ id, kind });
    } else {
      handleDelete(id);
    }
  }

  function confirmOcultarAnyway() {
    if (ocultarConfirm) {
      handleDelete(ocultarConfirm.id);
      setOcultarConfirm(null);
    }
  }

  async function handleBlockConfirm() {
    if (!selectedId || !blockTarget || blockPending) return;
    setBlockPending(true);
    try {
      const res = await fetch(`/api/relay/${selectedId}/policy/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: blockTarget.pubkey }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? json?.detail ?? t("errors.blockError"));
        return;
      }
      setEvents((prev) => prev.filter((e) => e.pubkey !== blockTarget.pubkey));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.networkError"));
    } finally {
      setBlockTarget(null);
      setBlockPending(false);
    }
  }

  function loadMyEventsPubkey() {
    setPubkeyFilterHint(null);
    const fromSession =
      sessionNostrHex &&
      /^[0-9a-f]{64}$/i.test(sessionNostrHex)
        ? sessionNostrHex.toLowerCase()
        : null;
    let hex = fromSession;
    if (!hex) {
      const stored = readStoredPubkeyHex(userId);
      if (stored) hex = stored;
    }
    if (hex) {
      setAuthorFilterInput(hexToNpubDisplay(hex));
    } else {
      setPubkeyFilterHint(t("hints.howToStore"));
    }
  }

  function memorizeAuthorFilter() {
    if (!userId) {
      setPubkeyFilterHint(t("hints.loginToMemorize"));
      return;
    }
    const hex = authorHexForApi;
    if (!hex) {
      setPubkeyFilterHint(t("hints.invalidPubkey"));
      return;
    }
    localStorage.setItem(MY_NOSTR_PUBKEY_KEY, hex);
    localStorage.setItem(MY_NOSTR_SOURCE_KEY, "manual");
    notifyNostrPrefsChanged();
    setPubkeyFilterHint(null);
    setAuthorFilterInput(hexToNpubDisplay(hex));
  }

  async function copyText(labelKey: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setPubkeyFilterHint(t("hints.copied", { label: t(`detail.${labelKey}`) }));
      window.setTimeout(() => setPubkeyFilterHint(null), 2000);
    } catch {
      setPubkeyFilterHint(t("hints.copyFailed"));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-medium text-[#ccc]">{t("title")}</span>
        <div
          className="inline-flex rounded-md border border-[#333] bg-[#1a1a1a] p-0.5 text-[11px]"
          role="group"
          aria-label={t("aria.viewToggle")}
        >
          <button
            type="button"
            onClick={() => setViewModePersist("table")}
            className={`rounded px-2 py-1 transition-colors ${
              viewMode === "table"
                ? "bg-[#333] text-[#eee]"
                : "text-[#888] hover:text-[#ccc]"
            }`}
          >
            {t("viewMode.table")}
          </button>
          <button
            type="button"
            onClick={() => setViewModePersist("feed")}
            className={`rounded px-2 py-1 transition-colors ${
              viewMode === "feed"
                ? "bg-[#333] text-[#eee]"
                : "text-[#888] hover:text-[#ccc]"
            }`}
          >
            {t("viewMode.feed")}
          </button>
        </div>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as CategoryFilterValue)
            }
            className="rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888]"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.key)}
              </option>
            ))}
          </select>
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
            className="min-w-[120px] rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888]"
          >
            <option value="">{t("filters.allKinds")}</option>
            {kindOptions.map((k) => {
              const info = getKindInfo(k);
              return (
                <option key={k} value={String(k)}>
                  {t("filters.kindLabel", { k })}
                  {info.name !== `Kind ${k}` ? ` — ${info.name}` : ""}
                </option>
              );
            })}
          </select>
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888]"
          >
            <option value="24h">{t("filters.periods.24h")}</option>
            <option value="7d">{t("filters.periods.7d")}</option>
            <option value="all">{t("filters.periods.all")}</option>
          </select>
          <input
            type="text"
            value={authorFilterInput}
            onChange={(e) => setAuthorFilterInput(e.target.value)}
            placeholder={t("filters.authorPlaceholder")}
            className="w-[200px] rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888] placeholder:text-[#555]"
            title={t("filters.authorTitle")}
          />
          <button
            type="button"
            onClick={loadMyEventsPubkey}
            className="rounded-md border border-[#444] bg-[#252525] px-2 py-1 text-[11px] text-[#ccc] hover:bg-[#333]"
          >
            {t("filters.myEvents")}
          </button>
          <button
            type="button"
            onClick={memorizeAuthorFilter}
            className="rounded-md border border-[#444] bg-[#252525] px-2 py-1 text-[11px] text-[#888] hover:bg-[#333]"
            title={t("filters.memorizeTitle")}
          >
            {t("filters.memorize")}
          </button>
        </div>
      </div>

      {pubkeyFilterHint && (
        <p className="text-[11px] text-amber-500/90 px-0.5">{pubkeyFilterHint}</p>
      )}

      {error && (
        <p className="rounded border border-[#5a1a1a] bg-[#2a0a0a] px-3 py-2 text-[12px] text-[#f87171]">
          {error}
        </p>
      )}

      {!loading &&
      events.length > 0 &&
      filteredEvents.length === 0 &&
      !error ? (
        <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] py-12 text-center text-muted-foreground">
          <p className="text-[13px]">
            {t("empty.noEventsInCategory", { 
              category: t(CATEGORY_OPTIONS.find(o => o.value === filterCategory)?.key || "categories.all") 
            })}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterCategory("all");
              setFilterKind("");
            }}
            className="mt-3 text-sm text-[#f7931a] underline underline-offset-2 hover:text-[#e07b10]"
          >
            {t("empty.viewAll")}
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
          <table className="w-full table-fixed border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="w-[100px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                  {t("table.kind")}
                </th>
                <th className="w-[120px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                  {t("table.pubkey")}
                </th>
                <th className="w-[72px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                  {t("table.date")}
                </th>
                <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                  {t("table.content")}
                </th>
                <th className="w-[200px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-right text-[11px] font-medium text-[#555]">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[12px] text-[#666]"
                  >
                    {t("status.loading")}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e) => {
                  const meta = kindBadgeMetaI18n(e.kind, td);
                  return (
                    <tr
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetailEvent(e)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          setDetailEvent(e);
                        }
                      }}
                      className="border-b border-[#222] transition-colors last:border-b-0 hover:bg-[#1f1f1f] cursor-pointer"
                    >
                      <td className="px-2.5 py-2 align-middle">
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td
                        className="overflow-hidden px-2.5 py-2 text-[11px] text-[#555] text-ellipsis whitespace-nowrap"
                        title={e.pubkey}
                      >
                        {resolveDisplayPubkey(e.pubkey)}
                      </td>
                      <td className="overflow-hidden px-2.5 py-2 text-[11px] text-[#555] text-ellipsis whitespace-nowrap">
                        {formatAgo(e.created_at)}
                      </td>
                      <td className="overflow-hidden px-2.5 py-2 text-[11px] text-[#666] text-ellipsis whitespace-nowrap">
                        {getContentPreview(e)}
                      </td>
                      <td className="px-2.5 py-2 align-middle">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              requestOcultar(e.id, e.kind);
                            }}
                            className="h-8 shrink-0 rounded-md border border-border/50 bg-transparent px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-secondary/60"
                            title={t("actions.hideTitle")}
                          >
                            {t("actions.hide")}
                          </button>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setBlockTarget({ pubkey: e.pubkey });
                            }}
                            className="h-8 shrink-0 rounded-md border border-amber-500/35 bg-amber-500/10 px-2.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-300"
                            title={t("actions.spamTitle")}
                          >
                            {t("actions.spam")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-10 text-center text-[12px] text-[#666]">
              {t("status.loading")}
            </div>
          ) : (
            filteredEvents.map((e) => {
              const parsed0 =
                e.kind === 0 ? parseKind0Profile(e.content) : null;
              const nameFromEvent = parsed0?.name?.trim() ?? "";
              const cached = profileCacheRef.current.get(e.pubkey);
              const cachedName = cached?.display?.trim() ?? "";
              const displayNameForInitials =
                nameFromEvent || cachedName || null;
              const authorPicture =
                parsed0?.picture ?? cached?.picture ?? null;

              return (
                <EventFeedCard
                  key={e.id}
                  event={e}
                  authorLabel={
                    displayNameForInitials || resolveDisplayPubkey(e.pubkey)
                  }
                  authorHasProfileName={!!displayNameForInitials}
                  profileDisplayNameForInitials={displayNameForInitials}
                  authorPicture={authorPicture}
                  formatAgo={formatAgo}
                  resolvePubkeyLabel={resolveDisplayPubkey}
                  onOpenDetail={() => setDetailEvent(e)}
                  onDelete={() => requestOcultar(e.id, e.kind)}
                  onBlock={() => setBlockTarget({ pubkey: e.pubkey })}
                />
              );
            })
          )}
        </div>
      )}

      {!loading && events.length === 0 && !error && (
        <p className="py-8 text-center text-[12px] text-[#666]">
          {t("empty.noEvents")}
        </p>
      )}

      <Sheet
        open={detailEvent !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setDetailEvent(null);
        }}
      >
        <SheetContent side="right" className="max-h-full overflow-y-auto">
          {detailEvent && (
            <>
              <SheetHeader>
                <SheetTitle>{t("detail.title")}</SheetTitle>
                <p className="text-[11px] text-muted-foreground font-mono break-all">
                  {detailEvent.id}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => copyText("id", detailEvent.id)}
                    className="rounded border border-border px-2 py-1 text-[11px] hover:bg-secondary"
                  >
                    {t("detail.copyId")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyText("json", JSON.stringify(detailEvent, null, 2))
                    }
                    className="rounded border border-border px-2 py-1 text-[11px] hover:bg-secondary"
                  >
                    {t("detail.copyJson")}
                  </button>
                </div>
              </SheetHeader>
              <div className="space-y-4 px-6 pb-8 text-[12px]">
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("detail.pubkeyHex")}
                  </div>
                  <pre className="whitespace-pre-wrap break-all rounded border border-border bg-secondary/50 p-2 text-[11px] font-mono">
                    {detailEvent.pubkey}
                  </pre>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("detail.pubkeyNpub")}
                  </div>
                  <pre className="whitespace-pre-wrap break-all rounded border border-border bg-secondary/50 p-2 text-[11px] font-mono">
                    {hexToNpubDisplay(detailEvent.pubkey)}
                  </pre>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("detail.createdAt")}
                  </div>
                  <div className="text-foreground">
                    {new Date(detailEvent.created_at * 1000).toLocaleString(
                      undefined,
                      { dateStyle: "full", timeStyle: "medium" }
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("detail.kind")}
                  </div>
                  <div>
                    {kindBadgeMetaI18n(detailEvent.kind, td).label} ({detailEvent.kind})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("detail.tags")}
                  </div>
                  <div className="overflow-x-auto rounded border border-border max-h-48 overflow-y-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-secondary/80 text-left text-muted-foreground">
                          <th className="px-2 py-1 w-8">#</th>
                          <th className="px-2 py-1">{t("detail.values")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detailEvent.tags ?? []).map((tag, i) => (
                          <tr
                            key={i}
                            className="border-t border-border/60 font-mono"
                          >
                            <td className="px-2 py-1 text-muted-foreground">
                              {i}
                            </td>
                            <td className="px-2 py-1 break-all">
                              {JSON.stringify(tag)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!(detailEvent.tags?.length) && (
                      <p className="p-2 text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("detail.contentRaw")}
                  </div>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded border border-border bg-secondary/50 p-3 text-[11px] font-mono text-foreground">
                    {detailEvent.content || "—"}
                  </pre>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {t("detail.sig")}
                  </div>
                  <pre className="whitespace-pre-wrap break-all rounded border border-border bg-secondary/50 p-2 text-[11px] font-mono">
                    {detailEvent.sig ?? "—"}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={ocultarConfirm !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setOcultarConfirm(null);
        }}
      >
        <AlertDialogContent className="border-[#333] bg-[#1a1a1a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e5e5e5]">{t("confirmModal.attention")}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#999]">
              {ocultarConfirm
                ? ocultarSensitiveKindDescription(ocultarConfirm.kind)
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="border-[#444] bg-[#222] text-[#ccc] hover:bg-[#2a2a2a]">
              {t("confirmModal.cancel")}
            </AlertDialogCancel>
            <button
              type="button"
              onClick={() => confirmOcultarAnyway()}
              className="inline-flex h-9 items-center justify-center rounded-md border border-red-600/45 bg-red-600/15 px-4 text-sm font-medium text-red-200 hover:bg-red-600/25"
            >
              {t("confirmModal.removeAnyway")}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={blockTarget !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setBlockTarget(null);
        }}
      >
        <AlertDialogContent className="border-[#333] bg-[#1a1a1a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e5e5e5]">
              {t("blockModal.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#999]">
              {t("blockModal.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              disabled={blockPending}
              className="border-[#444] bg-[#222] text-[#ccc] hover:bg-[#2a2a2a]"
            >
              {t("blockModal.cancel")}
            </AlertDialogCancel>
            <button
              type="button"
              disabled={blockPending}
              onClick={() => void handleBlockConfirm()}
              className="inline-flex h-9 items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/15 px-4 text-sm font-medium text-amber-800 hover:bg-amber-500/25 disabled:opacity-50 dark:text-amber-200"
            >
              {blockPending ? t("blockModal.processing") : t("blockModal.confirm")}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}