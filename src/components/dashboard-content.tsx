"use client";

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

const KIND_ACTIVITY_MOCK = [
  { kind: 1, desc: "Notas de texto", events: 51240, pct: "60.8%" },
  { kind: 0, desc: "Perfil de utilizador", events: 18920, pct: "22.4%" },
  { kind: 3, desc: "Listas de contactos", events: 8110, pct: "9.6%" },
  { kind: 4, desc: "DMs encriptados", events: 3900, pct: "4.6%" },
  { kind: 6, desc: "Reposts", events: 2142, pct: "2.5%" },
];

const KIND_STYLES: Record<number, string> = {
  0: "bg-[#2a1a4a] text-[#a78bfa]",
  1: "bg-[#0c2a4a] text-[#60a5fa]",
  3: "bg-[#0a2a1a] text-[#4ade80]",
  4: "bg-[#2a1a0a] text-[#fb923c]",
  6: "bg-[#2a0a0a] text-[#f87171]",
};

export function DashboardContent({
  stats,
  health,
  selectedRelay,
  loading,
}: DashboardContentProps) {
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
              {KIND_ACTIVITY_MOCK.map((row) => (
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
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-[11px] text-[#555]">
          Dados de exemplo. A API de breakdown por kind será integrada em breve.
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
                : health?._status
                ? `${health.error ?? "erro"} (${health._status}${health.detail ? ` — ${health.detail}` : ""})`
                : health?.error ?? "—"}
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
