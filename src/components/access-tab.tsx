"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Copy, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  authorFilterToHex,
  hexToNpubDisplay,
  truncateNpub,
  pubkeyAvatarClasses,
  displayInitials,
  parseKind0Profile,
  type NostrEventRow,
} from "@/lib/events-display";

type PolicyEntry = { pubkey: string; status: "allowed" | "blocked" };

type ProfileMeta = {
  name: string;
  picture?: string;
  nip05?: string;
  lud16?: string;
  lud06?: string;
};

function parseKind0ProfileExtended(content: string): ProfileMeta {
  const base = parseKind0Profile(content);
  try {
    const j = JSON.parse(content) as Record<string, unknown>;
    const nip05 =
      typeof j.nip05 === "string" && j.nip05.trim() ? j.nip05.trim() : undefined;
    const lud16 =
      typeof j.lud16 === "string" && j.lud16.trim() ? j.lud16.trim() : undefined;
    const lud06 =
      typeof j.lud06 === "string" && j.lud06.trim() ? j.lud06.trim() : undefined;
    let picture: string | undefined;
    if (typeof j.picture === "string" && j.picture.trim()) {
      picture = j.picture.trim();
    }
    return { name: base.name, picture, nip05, lud16, lud06 };
  } catch {
    return { name: base.name };
  }
}

function AccessProfileAvatar({
  pubkey,
  picture,
  displayName,
}: {
  pubkey: string;
  picture?: string;
  displayName?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(picture && !imgFailed);

  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={picture}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center text-[11px] font-semibold ${pubkeyAvatarClasses(pubkey)}`}
        >
          {displayInitials(displayName, pubkey)}
        </div>
      )}
    </div>
  );
}

interface AccessTabProps {
  selectedId: string | null;
}

type DisplayEntry = PolicyEntry & { source: "whitelist" | "users" | "blocked" };

const PAGE_SIZE = 20;
const PROFILE_CHUNK = 50;

function truncateHex(hex: string): string {
  if (hex.length <= 14) return hex;
  return `${hex.slice(0, 6)}…${hex.slice(-4)}`;
}

export function AccessTab({ selectedId }: AccessTabProps) {
  const t = useTranslations("AccessTab");
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [blockedPubkeys, setBlockedPubkeys] = useState<string[]>([]);
  const [addValue, setAddValue] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageWhitelist, setPageWhitelist] = useState(1);
  const [pageUsers, setPageUsers] = useState(1);
  const [pageBlocked, setPageBlocked] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policyFailed, setPolicyFailed] = useState(false);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const profileCacheRef = useRef<Map<string, ProfileMeta>>(new Map());
  const [, profileBump] = useState(0);

  /** Explicit allow-list in policy → separate Whitelist vs event publishers. */
  const splitSections = useMemo(
    () =>
      entries.some((e) => e.source === "whitelist" && e.status === "allowed"),
    [entries]
  );

  const q = search.trim().toLowerCase();
  const hexFromSearch = search.trim() ? authorFilterToHex(search) : null;

  const filtered = useMemo(() => {
    void profileBump;
    return entries.filter((e) => {
      if (!q && !hexFromSearch) return true;
      const hex = e.pubkey.toLowerCase();
      if (hex.includes(q)) return true;
      if (hexFromSearch && hex === hexFromSearch) return true;
      const fullNpub = hexToNpubDisplay(e.pubkey).toLowerCase();
      if (fullNpub.includes(q)) return true;
      if (truncateNpub(hexToNpubDisplay(e.pubkey)).toLowerCase().includes(q))
        return true;
      const meta = profileCacheRef.current.get(e.pubkey);
      const name = (meta?.name ?? "").toLowerCase();
      if (name.includes(q)) return true;
      if ((meta?.nip05 ?? "").toLowerCase().includes(q)) return true;
      if ((meta?.lud16 ?? "").toLowerCase().includes(q)) return true;
      return false;
    });
  }, [entries, q, hexFromSearch, profileBump]);

  const filteredWhitelist = useMemo(
    () => filtered.filter((e) => e.source === "whitelist"),
    [filtered]
  );
  const filteredUsers = useMemo(
    () => filtered.filter((e) => e.source === "users"),
    [filtered]
  );

  const blockedEntries = useMemo(
    () =>
      blockedPubkeys.map((pk) => ({
        pubkey: pk,
        status: "blocked" as const,
        source: "blocked" as const,
      })),
    [blockedPubkeys]
  );

  const filteredBlocked = useMemo(() => {
    void profileBump;
    return blockedEntries.filter((e) => {
      if (!q && !hexFromSearch) return true;
      const hex = e.pubkey.toLowerCase();
      if (hex.includes(q)) return true;
      if (hexFromSearch && hex === hexFromSearch) return true;
      const fullNpub = hexToNpubDisplay(e.pubkey).toLowerCase();
      if (fullNpub.includes(q)) return true;
      if (truncateNpub(hexToNpubDisplay(e.pubkey)).toLowerCase().includes(q))
        return true;
      const meta = profileCacheRef.current.get(e.pubkey);
      const name = (meta?.name ?? "").toLowerCase();
      if (name.includes(q)) return true;
      if ((meta?.nip05 ?? "").toLowerCase().includes(q)) return true;
      if ((meta?.lud16 ?? "").toLowerCase().includes(q)) return true;
      return false;
    });
  }, [blockedEntries, q, hexFromSearch, profileBump]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const totalPagesWl = Math.max(
    1,
    Math.ceil(filteredWhitelist.length / PAGE_SIZE)
  );
  const totalPagesUs = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const totalPagesBlocked = Math.max(
    1,
    Math.ceil(filteredBlocked.length / PAGE_SIZE)
  );

  const paginated = splitSections
    ? null
    : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const paginatedWl = splitSections
    ? filteredWhitelist.slice(
        (pageWhitelist - 1) * PAGE_SIZE,
        pageWhitelist * PAGE_SIZE
      )
    : null;
  const paginatedUs = splitSections
    ? filteredUsers.slice((pageUsers - 1) * PAGE_SIZE, pageUsers * PAGE_SIZE)
    : null;
  const paginatedBlocked = splitSections
    ? filteredBlocked.slice(
        (pageBlocked - 1) * PAGE_SIZE,
        pageBlocked * PAGE_SIZE
      )
    : null;
  const paginatedBlockedUnified = !splitSections
    ? filteredBlocked.slice(
        (pageBlocked - 1) * PAGE_SIZE,
        pageBlocked * PAGE_SIZE
      )
    : null;

  const fetchData = useCallback(async () => {
    if (!selectedId) {
      setEntries([]);
      setBlockedPubkeys([]);
      return;
    }
    setLoading(true);
    setError(null);
    setPolicyFailed(false);
    try {
      const [policyRes, usersRes, blockedRes] = await Promise.all([
        fetch(`/api/relay/${selectedId}/policy`, { cache: "no-store" }),
        fetch(`/api/relay/${selectedId}/users?limit=200`, { cache: "no-store" }),
        fetch(`/api/relay/${selectedId}/policy/blocked`, { cache: "no-store" }),
      ]);
      const policyJson = await policyRes.json().catch(() => ({}));
      const usersJson = await usersRes.json().catch(() => ({}));
      const blockedJson = await blockedRes.json().catch(() => ({}));
      if (!policyRes.ok) {
        setPolicyFailed(true);
        setError(
          policyJson?.error ?? policyJson?.detail ?? t("errors.loadPolicy")
        );
        setEntries([]);
        setBlockedPubkeys([]);
        return;
      }
      const policyEntries = (policyJson?.entries ?? []) as PolicyEntry[];
      const users = (usersJson?.users ?? []) as string[];
      const policyMap = new Map(policyEntries.map((e) => [e.pubkey, e.status]));
      const merged: DisplayEntry[] = [];
      for (const e of policyEntries) {
        if (e.status === "allowed") {
          merged.push({ ...e, source: "whitelist" });
        }
      }
      for (const pubkey of users) {
        if (!policyMap.has(pubkey)) {
          merged.push({ pubkey, status: "allowed", source: "users" });
        }
      }
      setEntries(merged);
      const blockedList = Array.isArray(blockedJson?.blocked)
        ? (blockedJson.blocked as string[])
        : [];
      setBlockedPubkeys(blockedRes.ok ? blockedList : []);
    } catch (err) {
      setPolicyFailed(true);
      setError(err instanceof Error ? err.message : t("errors.network"));
      setEntries([]);
      setBlockedPubkeys([]);
    } finally {
      setLoading(false);
    }
  }, [selectedId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
    setPageWhitelist(1);
    setPageUsers(1);
    setPageBlocked(1);
  }, [search, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const pkSet = new Set<string>();
    for (const e of entries) pkSet.add(e.pubkey);
    for (const pk of blockedPubkeys) pkSet.add(pk);
    const pubkeys = [...pkSet];
    if (pubkeys.length === 0) return;
    const need = pubkeys.filter((pk) => !profileCacheRef.current.has(pk));
    if (need.length === 0) return;

    let cancelled = false;

    (async () => {
      for (let i = 0; i < need.length; i += PROFILE_CHUNK) {
        if (cancelled) break;
        const slice = need.slice(i, i + PROFILE_CHUNK);
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
            const parsed = parseKind0ProfileExtended(ev.content);
            profileCacheRef.current.set(ev.pubkey, parsed);
          }
          profileBump((t) => t + 1);
        } catch {
          /* non-blocking */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, entries, blockedPubkeys]);

  /** Whitelist: toggle off removes plain allow line (does not POST block). */
  async function toggleAccess(entry: DisplayEntry) {
    if (!selectedId || actionPending) return;
    if (entry.source !== "whitelist" || entry.status !== "allowed") return;
    setActionPending(entry.pubkey);
    setError(null);
    try {
      const res = await fetch(
        `/api/relay/${selectedId}/policy/allow/${entry.pubkey}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (json as { detail?: string; error?: string })?.detail ??
            (json as { error?: string })?.error ??
            t("errors.removeWhitelist")
        );
        return;
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.network"));
    } finally {
      setActionPending(null);
    }
  }

  async function unblockPublisher(pubkey: string) {
    if (!selectedId || actionPending) return;
    setActionPending(pubkey);
    setError(null);
    try {
      const res = await fetch(
        `/api/relay/${selectedId}/policy/block/${pubkey}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (json as { detail?: string; error?: string })?.detail ??
            (json as { error?: string })?.error ??
            t("errors.unblock")
        );
        return;
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.network"));
    } finally {
      setActionPending(null);
    }
  }

  function canToggle(entry: DisplayEntry) {
    return entry.source === "whitelist" && entry.status === "allowed";
  }

  async function handleAdd() {
    const hex = authorFilterToHex(addValue);
    if (!hex || !selectedId || actionPending) {
      if (addValue.trim() && !hex)
        setError(t("errors.invalidPubkey"));
      return;
    }
    setActionPending(hex);
    setError(null);
    try {
      const res = await fetch(`/api/relay/${selectedId}/policy/allow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: hex }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? json?.detail ?? t("errors.add"));
        return;
      }
      setEntries((prev) => {
        if (prev.some((e) => e.pubkey === hex)) {
          return prev.map((e) =>
            e.pubkey === hex
              ? { ...e, status: "allowed" as const, source: "whitelist" as const }
              : e
          );
        }
        return [
          ...prev,
          { pubkey: hex, status: "allowed" as const, source: "whitelist" as const },
        ];
      });
      setAddValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.network"));
    } finally {
      setActionPending(null);
    }
  }

  function renderRow(e: DisplayEntry) {
    const meta = profileCacheRef.current.get(e.pubkey);
    const npubFull = hexToNpubDisplay(e.pubkey);
    const npubTrunc = truncateNpub(npubFull);
    const profileName = meta?.name?.trim() ?? "";
    const primaryLabel = profileName || npubTrunc;
    const profileUrl = `https://njump.me/${npubFull}`;
    const hasExtras =
      Boolean(meta?.nip05) ||
      Boolean(meta?.lud16) ||
      Boolean(meta?.lud06);
    const secondLineNeeded = Boolean(profileName) || hasExtras;

    return (
      <div
        key={`${e.pubkey}-${e.source}`}
        className="flex items-center gap-3 border-b border-[#222] px-3 py-2.5 text-[12px] last:border-b-0"
      >
        <AccessProfileAvatar
          key={`${e.pubkey}:${meta?.picture ?? ""}`}
          pubkey={e.pubkey}
          picture={meta?.picture}
          displayName={meta?.name}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate font-medium text-[#ddd]">
              {primaryLabel}
            </span>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[#666] hover:text-[#f7931a]"
              title={t("titles.viewProfile")}
              onClick={(ev) => ev.stopPropagation()}
            >
              <ExternalLink className="size-3.5 opacity-70" strokeWidth={1.5} />
            </a>
          </div>
          {secondLineNeeded ? (
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {profileName ? (
                <span className="max-w-full truncate text-[11px] text-[#666]">
                  {npubTrunc}
                </span>
              ) : null}
              {meta?.nip05 ? (
                <span
                  title={t("titles.nip05")}
                  className="inline-flex max-w-[min(100%,12rem)] shrink-0 items-center gap-0.5 rounded border border-sky-500/35 bg-sky-500/10 px-1.5 py-px text-[10px] text-sky-200/90"
                >
                  <span aria-hidden className="shrink-0 opacity-90">
                    🛡️
                  </span>
                  <span className="min-w-0 truncate">{meta.nip05}</span>
                </span>
              ) : null}
              {meta?.lud16 ? (
                <span
                  title={meta.lud16}
                  className="inline-flex max-w-[min(100%,11rem)] shrink-0 items-center gap-0.5 text-[11px] text-[#888]"
                >
                  <span aria-hidden>⚡</span>
                  <span className="min-w-0 truncate">{meta.lud16}</span>
                </span>
              ) : meta?.lud06 ? (
                <span
                  title={meta.lud06}
                  className="inline-flex shrink-0 items-center gap-0.5 text-[11px] text-[#888]"
                >
                  <span aria-hidden>⚡</span>
                  <span>{t("labels.lnurl")}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="font-mono text-[11px] text-[#888]">
            {truncateHex(e.pubkey)}
          </span>
          <button
            type="button"
            title={t("titles.copyPubkeyHex")}
            className="rounded p-1 text-[#666] hover:bg-[#2a2a2a] hover:text-[#ccc]"
            onClick={() => void navigator.clipboard.writeText(e.pubkey)}
          >
            <Copy className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>
        <span
          className={`min-w-[72px] shrink-0 rounded-full px-1.5 py-0.5 text-center text-[10px] font-medium ${
            e.status === "allowed"
              ? "bg-[#0a2a1a] text-[#4ade80]"
              : "bg-[#2a0a0a] text-[#f87171]"
          }`}
        >
          {e.status === "allowed" ? t("status.allowed") : t("status.blocked")}
        </span>
        <div className="min-w-[5.5rem] shrink-0 text-right">
          {e.source === "blocked" ? (
            <button
              type="button"
              onClick={() => void unblockPublisher(e.pubkey)}
              disabled={actionPending !== null}
              className="rounded-md border border-[#333] px-2 py-1 text-[10px] text-[#ccc] transition-colors hover:bg-[#2a2a2a] disabled:opacity-50"
            >
              {t("btnUnblock")}
            </button>
          ) : canToggle(e) ? (
            <button
              type="button"
              onClick={() => void toggleAccess(e)}
              disabled={actionPending !== null}
              title={t("titles.removeWhitelist")}
              className={`relative ml-auto block h-4 w-7 shrink-0 cursor-pointer rounded-full border transition-colors disabled:opacity-50 ${
                e.status === "allowed"
                  ? "border-[#f7931a] bg-[#f7931a]"
                  : "border-[#333] bg-[#252525]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-[left] ${
                  e.status === "allowed" ? "left-3.5" : "left-0.5"
                }`}
              />
            </button>
          ) : (
            <span className="text-[10px] text-[#555]">{t("dash")}</span>
          )}
        </div>
      </div>
    );
  }

  function renderSectionHeader(label: string, count: number) {
    return (
      <div className="border-b border-[#2a2a2a] bg-[#181818] px-3 py-2">
        <div className="text-[12px] font-medium text-[#aaa]">{label}</div>
        <div className="text-[11px] text-[#555]">
          {t("section.usersCount", { count })}
        </div>
      </div>
    );
  }

  function renderAddWhitelistBar() {
    return (
      <div className="flex gap-2 border-b border-[#222] bg-[#1f1f1f] px-3 py-2.5">
        <input
          type="text"
          value={addValue}
          onChange={(ev) => {
            setAddValue(ev.target.value);
            setError(null);
          }}
          onKeyDown={(ev) => ev.key === "Enter" && void handleAdd()}
          placeholder={t("placeholders.addWhitelist")}
          className="flex-1 rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={actionPending !== null || loading}
          className="shrink-0 rounded-md border border-[#5a3a0a] px-3 py-1.5 text-[12px] text-[#f7931a] transition-colors hover:bg-[#1e1a0e] disabled:opacity-50"
        >
          {t("btnAdd")}
        </button>
      </div>
    );
  }

  function renderPagination(
    pageNum: number,
    setPageNum: (n: number | ((p: number) => number)) => void,
    len: number,
    totalP: number
  ) {
    if (len === 0) return null;
    return (
      <div className="flex items-center justify-between border-t border-[#222] px-3 py-2.5">
        <span className="text-[11px] text-[#555]">
          {t("pagination.showing", {
            start: (pageNum - 1) * PAGE_SIZE + 1,
            end: Math.min(pageNum * PAGE_SIZE, len),
            total: len,
          })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            disabled={pageNum <= 1}
            className="rounded-md border border-[#333] px-2 py-1 text-[11px] text-[#888] hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("btnPrevious")}
          </button>
          <span className="px-2 text-[11px] text-[#666]">
            {pageNum} / {totalP}
          </span>
          <button
            type="button"
            onClick={() => setPageNum((p) => Math.min(totalP, p + 1))}
            disabled={pageNum >= totalP}
            className="rounded-md border border-[#333] px-2 py-1 text-[11px] text-[#888] hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("btnNext")}
          </button>
        </div>
      </div>
    );
  }

  if (!selectedId) {
    return (
      <div className="py-4 text-center text-[12px] text-[#666]">
        {t("empty.selectRelay")}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="mb-3 text-[13px] font-medium text-[#ccc]">
        {t("title")}
      </div>
      {error && (
        <div className="mb-3 rounded-md border border-[#5a2a0a] bg-[#2a1510] px-3 py-2 text-[12px] text-[#f87171]">
          {error}
        </div>
      )}
      {policyFailed && !loading ? (
        <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] py-8 text-center">
          <p className="mb-3 text-[13px] text-[#f87171]">{t("errors.loadPolicy")}</p>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-secondary"
          >
            {t("btnTryAgain")}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
          <div className="border-b border-[#222] bg-[#1f1f1f] px-3 py-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("placeholders.search")}
              className="w-full rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
            />
          </div>
          <div className="flex items-center gap-2.5 border-b border-[#222] bg-[#1f1f1f] px-3 py-2 text-[11px] font-medium text-[#555]">
            <span className="w-9 shrink-0" />
            <span className="min-w-0 flex-1">{t("table.identity")}</span>
            <span className="w-[120px] shrink-0 text-right">{t("table.pubkey")}</span>
            <span className="w-[72px] shrink-0 text-center">{t("table.status")}</span>
            <span className="min-w-[5.5rem] shrink-0 text-center">{t("table.access")}</span>
          </div>
          {loading ? (
            <div className="px-3 py-6 text-center text-[12px] text-[#666]">
              {t("loading")}
            </div>
          ) : splitSections ? (
            <>
              {renderSectionHeader(t("sections.whitelist"), filteredWhitelist.length)}
              {renderAddWhitelistBar()}
              {filteredWhitelist.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-[#555]">
                  {entries.filter((x) => x.source === "whitelist").length === 0
                    ? t("empty.whitelist")
                    : t("empty.noSearchResults")}
                </div>
              ) : (
                paginatedWl!.map(renderRow)
              )}
              {renderPagination(
                pageWhitelist,
                setPageWhitelist,
                filteredWhitelist.length,
                totalPagesWl
              )}

              {renderSectionHeader(t("sections.publishedEvents"), filteredUsers.length)}
              {filteredUsers.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-[#555]">
                  {entries.filter((x) => x.source === "users").length === 0
                    ? t("empty.noExtraUsers")
                    : t("empty.noSearchResults")}
                </div>
              ) : (
                paginatedUs!.map(renderRow)
              )}
              {renderPagination(
                pageUsers,
                setPageUsers,
                filteredUsers.length,
                totalPagesUs
              )}

              {renderSectionHeader(t("sections.blocked"), filteredBlocked.length)}
              {filteredBlocked.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-[#555]">
                  {blockedPubkeys.length === 0
                    ? t("empty.noBlockedUsers")
                    : t("empty.noSearchResults")}
                </div>
              ) : (
                paginatedBlocked!.map(renderRow)
              )}
              {renderPagination(
                pageBlocked,
                setPageBlocked,
                filteredBlocked.length,
                totalPagesBlocked
              )}
            </>
          ) : (
            <>
              {renderSectionHeader(t("sections.activeUsers"), filtered.length)}
              {renderAddWhitelistBar()}
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-[12px] text-[#555]">
                  {entries.length === 0
                    ? t("empty.noEntries")
                    : t("empty.noSearchResultsForQuery")}
                </div>
              ) : (
                paginated!.map(renderRow)
              )}
              {renderPagination(page, setPage, filtered.length, totalPages)}

              {filteredBlocked.length > 0 || blockedPubkeys.length > 0 ? (
                <>
                  {renderSectionHeader(t("sections.blocked"), filteredBlocked.length)}
                  {filteredBlocked.length === 0 ? (
                    <div className="px-3 py-4 text-center text-[12px] text-[#555]">
                      {t("empty.noSearchResults")}
                    </div>
                  ) : (
                    paginatedBlockedUnified!.map(renderRow)
                  )}
                  {renderPagination(
                    pageBlocked,
                    setPageBlocked,
                    filteredBlocked.length,
                    totalPagesBlocked
                  )}
                </>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}

