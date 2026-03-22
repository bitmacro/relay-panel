"use client";

import { useState, useEffect, useCallback } from "react";

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

function formatHealthError(health: RelayHealth | null): string {
  if (!health) return "—";
  const status = health._status;
  const err = health.error ?? health.detail;
  const suffix = status != null ? ` (${status})` : "";
  if (err === "agent_unavailable")
    return `Agente indisponível${suffix}. O relay-agent não responde; verifica se está a correr e se o proxy encaminha corretamente.`;
  if (err === "agent_timeout")
    return `Agente não respondeu a tempo${suffix}. O relay-agent demorou demasiado.`;
  if (err === "gateway_timeout" || err === "supabase_timeout")
    return `Tempo limite excedido${suffix}. Tenta novamente.`;
  if (err === "relay not found")
    return `Relay não encontrado${suffix}.`;
  if (status === 502)
    return `Proxy 502 Bad Gateway${suffix}. O relay-agent pode estar offline ou o proxy não encaminha corretamente.`;
  if (status === 503)
    return `Serviço indisponível (503)${suffix}. O relay-agent pode estar offline ou em estado unhealthy.`;
  if (err) return `${err}${suffix}`;
  return `Erro${suffix}`;
}

interface DashboardContentProps {
  stats: RelayStats | null;
  health: RelayHealth | null;
  selectedRelay: Relay | null;
  loading: boolean;
  refreshTrigger?: number;
}

const KIND_DESC: Record<number, string> = {
  0: "Perfil de utilizador",
  1: "Notas de texto",
  2: "Recomendação de relay",
  3: "Listas de contactos",
  4: "DMs encriptados",
  5: "Eliminação de eventos",
  6: "Reposts",
  7: "Reação",
  8: "Badge",
  9: "Generic repost",
  10: "Unknown",
  11: "Lista de definições",
};

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

const KIND_STYLES: Record<number, string> = {
  0: "bg-[#2a1a4a] text-[#a78bfa]",
  1: "bg-[#0c2a4a] text-[#60a5fa]",
  3: "bg-[#0a2a1a] text-[#4ade80]",
  4: "bg-[#2a1a0a] text-[#fb923c]",
  6: "bg-[#2a0a0a] text-[#f87171]",
};

type KindRow = { kind: number; desc: string; events: number; pct: string };

function formatEventsError(err: unknown): string {
  const msg = typeof err === "string" ? err : err instanceof Error ? err.message : String(err);
  if (msg.includes("relay unavailable"))
    return "Relay indisponível (LMDB). O strfry pode estar bloqueado ou maxreaders é insuficiente. Verifica strfry.conf no servidor e aumenta maxreaders.";
  if (msg.includes("agent unavailable") || msg.includes("agent_unavailable"))
    return "O agente não respondeu. Pode estar ocupado ou o pedido demorou demasiado. Tenta atualizar.";
  if (msg.includes("timeout") || msg.includes("agent_timeout"))
    return "O pedido demorou demasiado. O relay pode ter muitos eventos. Tenta atualizar.";
  if (msg.includes("502") || msg.includes("503"))
    return "Proxy ou agente indisponível. Verifica a ligação ao relay-agent.";
  return msg || "Erro ao carregar eventos.";
}

export function DashboardContent({
  stats,
  health,
  selectedRelay,
  loading,
  refreshTrigger,
}: DashboardContentProps) {
  const [kindActivity, setKindActivity] = useState<KindRow[]>([]);
  const [kindLoading, setKindLoading] = useState(false);
  const [kindError, setKindError] = useState<string | null>(null);

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
          desc: KIND_DESC[parseInt(k, 10)] ?? `Kind ${k}`,
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
  }, []);

  useEffect(() => {
    if (selectedRelay?.id && !loading) {
      fetchKindActivity(selectedRelay.id);
    } else {
      setKindActivity([]);
      setKindError(null);
    }
  }, [selectedRelay?.id, loading, refreshTrigger, fetchKindActivity]);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
          <div className="text-[11px] text-[#555]">Pubkeys ativas</div>
          <div className="text-xl font-semibold text-[#f0f0f0]">—</div>
          <div className="mt-0.5 text-[11px] text-[#444]">7 dias</div>
        </div>
        <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
          <div className="text-[11px] text-[#555]">Bloqueados</div>
          <div className="text-xl font-semibold text-[#f0f0f0]">—</div>
          <div className="mt-0.5 text-[11px] text-[#444]">na blacklist</div>
        </div>
      </div>

      {/* Atividade por kind */}
      <div>
        <div className="mb-2.5 text-[13px] font-medium text-[#ccc]">
          Atividade por kind
        </div>
        <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
          <table className="w-full table-fixed border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="w-[60px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                  Kind
                </th>
                <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                  Descrição
                </th>
                <th className="w-20 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-right text-[11px] font-medium text-[#555]">
                  Eventos
                </th>
                <th className="w-20 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-right text-[11px] font-medium text-[#555]">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {kindLoading ? (
                <tr>
                  <td colSpan={4} className="px-2.5 py-6 text-center text-[12px] text-[#666]">
                    A carregar…
                  </td>
                </tr>
              ) : kindError ? (
                <tr>
                  <td colSpan={4} className="px-2.5 py-6 text-center">
                    <p className="text-[12px] text-[#f87171]">{kindError}</p>
                  </td>
                </tr>
              ) : kindActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2.5 py-6 text-center text-[12px] text-[#555]">
                    Sem dados. Seleciona um relay com eventos.
                  </td>
                </tr>
              ) : (
                kindActivity.map((row) => (
                  <tr
                    key={row.kind}
                    className="border-b border-[#222] transition-colors last:border-b-0 hover:bg-[#1f1f1f]"
                  >
                    <td className="px-2.5 py-2">
                      <span
                        className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          KIND_STYLES[row.kind] ?? "bg-[#252525] text-[#888]"
                        }`}
                      >
                        {row.kind}
                      </span>
                    </td>
                    <td className="overflow-hidden px-2.5 py-2 text-[#ccc] text-ellipsis whitespace-nowrap">
                      {row.desc}
                    </td>
                    <td className="px-2.5 py-2 text-right text-[#ccc]">
                      {row.events.toLocaleString("pt-PT")}
                    </td>
                    <td className="px-2.5 py-2 text-right text-[#ccc]">
                      {row.pct}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-[11px] text-[#555]">
          {kindActivity.length > 0
            ? `Baseado em amostra de ${kindActivity.reduce((s, r) => s + r.events, 0).toLocaleString("pt-PT")} eventos.`
            : "Amostra dos eventos mais recentes do relay."}
        </p>
      </div>

      {/* Estado da ligação */}
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
            <span className="text-[#555]">Endpoint: </span>
            <strong className="font-mono text-[11px] text-[#666]">
              {selectedRelay?.endpoint ?? "—"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
