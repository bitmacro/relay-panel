"use client";

import { useState, useEffect } from "react";
import type { User } from "next-auth";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
}

interface RelayStats {
  total_events?: number;
  db_size?: string;
  uptime?: number;
  version?: string;
  error?: string;
}

interface RelayHealth {
  status?: string;
  timestamp?: string;
  error?: string;
}

interface DashboardContentProps {
  relays: Relay[];
  providerUserId?: string | null;
  user: User | null;
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

function formatNumber(n?: number): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-PT");
}

export function DashboardContent({
  relays,
  providerUserId,
}: DashboardContentProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    relays[0]?.id ?? null
  );
  const [stats, setStats] = useState<RelayStats | null>(null);
  const [health, setHealth] = useState<RelayHealth | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedId(relays[0]?.id ?? null);
  }, [relays]);

  useEffect(() => {
    if (!selectedId) {
      setStats(null);
      setHealth(null);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/api/relay/${selectedId}/stats`).then((r) => r.json()),
      fetch(`/api/relay/${selectedId}/health`).then((r) => r.json()),
    ])
      .then(([s, h]) => {
        setStats(s);
        setHealth(h);
      })
      .catch(() => {
        setStats({ error: "fetch_error" });
        setHealth({ error: "fetch_error" });
      })
      .finally(() => setLoading(false));
  }, [selectedId]);

  const selectedRelay = relays.find((r) => r.id === selectedId);

  return (
    <>
      {/* Relay chips */}
      <div className="flex flex-wrap gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2">
        {relays.length === 0 ? (
          <p className="text-xs text-[#666]">
            No relays. Add relay_configs in Supabase with provider_user_id ={" "}
            {providerUserId && (
              <code className="rounded bg-[#252525] px-1.5 py-0.5 font-mono">
                {providerUserId}
              </code>
            )}
          </p>
        ) : (
          relays.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedId(r.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                selectedId === r.id
                  ? "border-[#5a3a0a] bg-[#1e1a0e] text-[#f7931a]"
                  : "border-[#333] bg-[#1f1f1f] text-[#888] hover:border-[#444] hover:text-[#ccc]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i === 0 ? "bg-[#22c55e]" : i === 1 ? "bg-[#3b82f6]" : "bg-[#f7931a]"
                }`}
              />
              {r.name ?? r.endpoint ?? r.id.slice(0, 8)}
            </button>
          ))
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {relays.length === 0 ? null : (
          <>
            {/* Metrics */}
            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
                <div className="text-[11px] text-[#555]">Total eventos</div>
                <div className="text-xl font-semibold text-[#f0f0f0]">
                  {loading ? "…" : formatNumber(stats?.total_events)}
                </div>
                <div className="mt-0.5 text-[11px] text-[#444]">strfry</div>
              </div>
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
                <div className="text-[11px] text-[#555]">DB size</div>
                <div className="text-xl font-semibold text-[#f0f0f0]">
                  {loading ? "…" : stats?.db_size ?? "—"}
                </div>
                <div className="mt-0.5 text-[11px] text-[#444]">LMDB</div>
              </div>
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
                <div className="text-[11px] text-[#555]">Uptime</div>
                <div className="text-xl font-semibold text-[#f0f0f0]">
                  {loading ? "…" : formatUptime(stats?.uptime)}
                </div>
                <div className="mt-0.5 text-[11px] text-[#444]">strfry</div>
              </div>
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
                <div className="text-[11px] text-[#555]">Versão strfry</div>
                <div className="text-xl font-semibold text-[#f0f0f0]">
                  {loading ? "…" : stats?.version ?? "—"}
                </div>
                <div className="mt-0.5 text-[11px] text-[#444]">binário</div>
              </div>
            </div>

            {/* Config / Estado da ligação */}
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <div className="mb-3 text-[13px] font-medium text-[#ddd]">
                Estado da ligação
              </div>
              <div className="flex flex-wrap gap-5 text-sm">
                <div>
                  <span className="text-[#555]">Versão strfry: </span>
                  <strong className="text-[#ccc]">
                    {loading ? "…" : stats?.version ?? "—"}
                  </strong>
                </div>
                <div>
                  <span className="text-[#555]">Uptime: </span>
                  <strong className="text-[#ccc]">
                    {loading ? "…" : formatUptime(stats?.uptime)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#555]">relay-agent: </span>
                  <strong
                    className={
                      health?.status === "ok"
                        ? "text-[#22c55e]"
                        : health?.error
                        ? "text-[#f87171]"
                        : "text-[#ccc]"
                    }
                  >
                    {loading ? "…" : health?.status === "ok" ? "online" : health?.error ?? "—"}
                  </strong>
                </div>
                <div>
                  <span className="text-[#555]">Endpoint: </span>
                  <strong className="font-mono text-[11px] text-[#666]">
                    {selectedRelay?.endpoint ?? "—"}
                  </strong>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
