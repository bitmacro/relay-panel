"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { DashboardContent } from "./dashboard-content";
import { EventsTab } from "./events-tab";
import { AccessTab } from "./access-tab";
import { ConfigTab } from "./config-tab";
import { RelaySelectorRow } from "./relay-selector-row";

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

interface RelayPanelShellProps {
  user: User | null;
  relays: Relay[];
  providerUserId?: string | null;
}

const STORAGE_KEY = "relay-panel-selected-id";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "events", label: "Eventos" },
  { id: "access", label: "Acesso" },
  { id: "config", label: "Config" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function RelayPanelShell({
  user: _user, // eslint-disable-line @typescript-eslint/no-unused-vars -- reserved for future use
  relays,
  providerUserId,
}: RelayPanelShellProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(relays[0]?.id ?? null);
  const [stats, setStats] = useState<RelayStats | null>(null);
  const [health, setHealth] = useState<RelayHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const ids = new Set(relays.map((r) => r.id));
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const preferred = stored && ids.has(stored) ? stored : relays[0]?.id ?? null;
    setSelectedId(preferred);
  }, [relays]);

  useEffect(() => {
    if (selectedId && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, selectedId);
    }
  }, [selectedId]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!selectedId) {
      queueMicrotask(() => {
        setStats(null);
        setHealth(null);
      });
      return;
    }
    queueMicrotask(() => setLoading(true));
    const fetchWithStatus = (path: string) =>
      fetch(path).then(async (r) => {
        const json = await r.json().catch(() => ({}));
        return { ...json, _status: r.status, _ok: r.ok };
      });
    Promise.all([
      fetchWithStatus(`/api/relay/${selectedId}/stats`),
      fetchWithStatus(`/api/relay/${selectedId}/health`),
    ])
      .then(([s, h]) => {
        setStats(s);
        setHealth(h);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "network_error";
        setStats({ error: "fetch_error", detail: msg });
        setHealth({ error: "fetch_error", detail: msg });
      })
      .finally(() => setLoading(false));
  }, [selectedId, refreshTrigger]);

  const selectedRelay = relays.find((r) => r.id === selectedId);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e2e2e2]">
      <div className="mx-auto max-w-[900px] rounded-xl border border-[#2a2a2a] bg-[#141414] p-0 shadow-xl">
        {/* Topbar */}
        <div className="flex items-center gap-3 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Image
              src="/bitmacro-logo.png"
              alt="BitMacro"
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 rounded-full object-contain"
            />
            <span
              className="text-[16px] font-bold tracking-wide text-white"
              style={{ fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              BitMacro Relay Manager
            </span>
          </div>
          <span className="text-[11px] text-[#444]">
            {typeof window !== "undefined"
              ? window.location.hostname
              : "relay-panel.bitmacro.io"}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="rounded-md border border-[#333] px-3 py-1.5 text-xs text-[#888] transition-colors hover:bg-[#252525] hover:text-[#ccc]"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Relay selector + Add relay (global) */}
        <RelaySelectorRow
          relays={relays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          providerUserId={providerUserId}
        />

        {/* Nav tabs + Refresh */}
        <nav className="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 pt-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-3 py-2 text-[12px] transition-colors ${
                activeTab === tab.id
                  ? "border-[#f7931a] font-medium text-[#f0f0f0]"
                  : "border-transparent text-[#666] hover:text-[#ccc]"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto rounded border border-[#333] px-2.5 py-1 text-[11px] text-[#888] transition-colors hover:border-[#444] hover:bg-[#252525] hover:text-[#ccc]"
            title="Atualizar dados do relay"
          >
            Atualizar
          </button>
        </nav>

        {/* Tab content */}
        <div className="p-5">
          {relays.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#666]">
              Adicione relays em Supabase para começar.
            </p>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardContent
                  stats={stats}
                  health={health}
                  selectedRelay={selectedRelay ?? null}
                  loading={loading}
                  refreshTrigger={refreshTrigger}
                />
              )}
              {activeTab === "events" && (
                <EventsTab selectedId={selectedId} refreshTrigger={refreshTrigger} />
              )}
              {activeTab === "access" && <AccessTab selectedId={selectedId} />}
              {activeTab === "config" && (
                <ConfigTab
                  selectedId={selectedId}
                  endpoint={selectedRelay?.endpoint ?? null}
                  statsVersion={stats?.version}
                  statsUptime={stats?.uptime}
                  healthOk={health?.status === "ok"}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
