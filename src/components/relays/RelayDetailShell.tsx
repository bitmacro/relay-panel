"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RelayStatusBadge } from "./RelayStatusBadge";
import { DashboardContent } from "@/components/dashboard-content";
import { EventsTab } from "@/components/events-tab";
import { AccessTab } from "@/components/access-tab";
import { ConfigTab } from "@/components/config-tab";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
  agent_relay_id?: string | null;
}

interface RelayStats {
  total_events?: number;
  db_size?: string;
  uptime?: number;
  version?: string;
  error?: string;
  _status?: number;
  _ok?: boolean;
}

interface RelayHealth {
  status?: string;
  error?: string;
  detail?: string;
  _status?: number;
  _ok?: boolean;
}

const TABS = [
  { id: "dashboard" },
  { id: "events" },
  { id: "access" },
  { id: "config" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface RelayDetailShellProps {
  relay: Relay;
}

export function RelayDetailShell({ relay }: RelayDetailShellProps) {
  const router = useRouter();
  const t = useTranslations("RelayDetailShell");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [stats, setStats] = useState<RelayStats | null>(null);
  const [health, setHealth] = useState<RelayHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const fetchWithStatus = (path: string) =>
      fetch(path).then(async (r) => {
        const json = await r.json().catch(() => ({}));
        return { ...json, _status: r.status, _ok: r.ok };
      });
    try {
      const [s, h] = await Promise.all([
        fetchWithStatus(`/api/relay/${relay.id}/stats`),
        fetchWithStatus(`/api/relay/${relay.id}/health`),
      ]);
      setStats(s);
      setHealth(h);
    } catch {
      setStats({ error: "fetch_error" });
      setHealth({ error: "fetch_error" });
    } finally {
      setLoading(false);
    }
  }, [relay.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((t) => t + 1);
    router.refresh();
  };

  const color = relay.color ?? "#8892a4";
  const letter = (relay.name ?? relay.id).charAt(0).toUpperCase();

  const status = loading
    ? "loading"
    : health?.status === "ok"
    ? "online"
    : health?.error
    ? "unhealthy"
    : "offline";

  const wssUrl = relay.endpoint
    ? `wss://${relay.endpoint.replace(/^https?:\/\//, "")}`
    : "—";

  return (
    <div>
      {/* Detail header */}
      <div className="border-b border-border px-7 pt-5 pb-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-3.5">
          <Link
            href="/relays"
            className="hover:text-foreground transition-colors"
          >
            {t("breadcrumb.backToRelays")}
          </Link>
          <span>/</span>
          <span className="text-muted-foreground/60">{relay.name ?? relay.id}</span>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-bold text-black font-mono shrink-0"
            style={{ backgroundColor: color }}
          >
            {letter}
          </div>
          <div>
            <div className="text-[18px] font-semibold">{relay.name ?? relay.id}</div>
            <div className="text-[12px] text-muted-foreground font-mono">{wssUrl}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <RelayStatusBadge status={status as "online" | "unhealthy" | "offline" | "loading"} />
            <button
              type="button"
              onClick={handleRefresh}
              className="w-[30px] h-[30px] flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-[16px]"
              title={t("btnRefresh")}
            >
              ↺
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-[18px] py-2.5 text-[13px] border-b-2 transition-colors relative top-px ${
                activeTab === tab.id
                  ? "border-[#f7931a] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {t(`tabs.${tab.id}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-7">
        {activeTab === "dashboard" && (
          <DashboardContent
            stats={stats}
            health={health}
            selectedRelay={relay}
            loading={loading}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === "events" && (
          <EventsTab selectedId={relay.id} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === "access" && <AccessTab selectedId={relay.id} />}
        {activeTab === "config" && (
          <ConfigTab
            selectedId={relay.id}
            endpoint={relay.endpoint}
            statsVersion={stats?.version}
            statsUptime={stats?.uptime}
            healthOk={health?.status === "ok"}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
