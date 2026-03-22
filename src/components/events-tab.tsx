"use client";

import { useState, useEffect } from "react";

const KIND_STYLES: Record<number, string> = {
  0: "bg-[#2a1a4a] text-[#a78bfa]",
  1: "bg-[#0c2a4a] text-[#60a5fa]",
  3: "bg-[#0a2a1a] text-[#4ade80]",
  4: "bg-[#2a1a0a] text-[#fb923c]",
  6: "bg-[#2a0a0a] text-[#f87171]",
};

interface NostrEvent {
  id: string;
  pubkey: string;
  kind: number;
  created_at: number;
  content: string;
  tags?: string[][];
  sig?: string;
}

function formatAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} dias`;
  return new Date(ts * 1000).toLocaleDateString("pt-PT");
}

function truncatePubkey(pubkey: string): string {
  if (pubkey.length <= 12) return pubkey;
  return `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`;
}

function truncateContent(content: string, max = 60): string {
  if (!content) return "—";
  if (content.length <= max) return content;
  return `${content.slice(0, max)}…`;
}

function formatEventsError(err: unknown): string {
  const msg = typeof err === "string" ? err : err instanceof Error ? err.message : String(err);
  if (msg.includes("relay unavailable"))
    return "Relay indisponível (LMDB). O strfry pode estar bloqueado ou maxreaders é insuficiente. Verifica strfry.conf no servidor e aumenta maxreaders.";
  if (msg.includes("agent unavailable") || msg.includes("agent_unavailable"))
    return "O agente não respondeu. Pode estar ocupado ou o pedido demorou demasiado. Tenta atualizar.";
  if (msg.includes("timeout") || msg.includes("agent_timeout"))
    return "O pedido demorou demasiado. Tenta atualizar.";
  if (msg.includes("502") || msg.includes("503"))
    return "Proxy ou agente indisponível. Verifica a ligação ao relay-agent.";
  return msg || "Erro ao carregar eventos.";
}

interface EventsTabProps {
  selectedId: string | null;
  refreshTrigger?: number;
}

export function EventsTab({ selectedId, refreshTrigger }: EventsTabProps) {
  const [events, setEvents] = useState<NostrEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("24h");
  const [searchAuthors, setSearchAuthors] = useState("");

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
    if (filterKind) params.set("kinds", filterKind);
    if (filterTime === "24h") {
      params.set("since", String(Math.floor(Date.now() / 1000 - 86400)));
    } else if (filterTime === "7d") {
      params.set("since", String(Math.floor(Date.now() / 1000 - 604800)));
    }
    if (searchAuthors.trim()) {
      const v = searchAuthors.trim();
      if (/^[0-9a-fA-F]{64}$/.test(v)) {
        params.set("authors", v);
      }
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
  }, [selectedId, filterKind, filterTime, searchAuthors, refreshTrigger]);

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-medium text-[#ccc]">Eventos</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
            className="rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888]"
          >
            <option value="">Todos os kinds</option>
            <option value="1">Kind 1</option>
            <option value="0">Kind 0</option>
            <option value="3">Kind 3</option>
            <option value="4">Kind 4</option>
            <option value="6">Kind 6</option>
          </select>
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888]"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Última semana</option>
            <option value="all">Tudo</option>
          </select>
          <input
            type="text"
            value={searchAuthors}
            onChange={(e) => setSearchAuthors(e.target.value)}
            placeholder="hex pubkey (64 chars)"
            className="w-[160px] rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888] placeholder:text-[#555]"
          />
        </div>
      </div>

      {error && (
        <p className="rounded border border-[#5a1a1a] bg-[#2a0a0a] px-3 py-2 text-[12px] text-[#f87171]">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <table className="w-full table-fixed border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="w-12 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Kind
              </th>
              <th className="w-[120px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Pubkey
              </th>
              <th className="w-20 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Data
              </th>
              <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Conteúdo
              </th>
              <th className="w-[110px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-[11px] font-medium text-[#555]"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[#666]">
                  A carregar…
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-[#222] transition-colors last:border-b-0 hover:bg-[#1f1f1f]"
                >
                  <td className="overflow-hidden px-2.5 py-2 align-middle text-ellipsis whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        KIND_STYLES[e.kind] ?? "bg-[#252525] text-[#888]"
                      }`}
                    >
                      {e.kind}
                    </span>
                  </td>
                  <td className="overflow-hidden px-2.5 py-2 font-mono text-[11px] text-[#555] text-ellipsis whitespace-nowrap">
                    {truncatePubkey(e.pubkey)}
                  </td>
                  <td className="overflow-hidden px-2.5 py-2 text-[11px] text-[#555] text-ellipsis whitespace-nowrap">
                    {formatAgo(e.created_at)}
                  </td>
                  <td className="overflow-hidden px-2.5 py-2 text-[11px] text-[#666] text-ellipsis whitespace-nowrap">
                    {truncateContent(e.content)}
                  </td>
                  <td className="px-2.5 py-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      className="rounded border border-[#5a1a1a] px-2 py-0.5 text-[10px] text-[#f87171] transition-colors hover:bg-[#2a0a0a]"
                      title="Remove da lista (não apaga no relay)"
                    >
                      Remover
                    </button>
                    <button
                      type="button"
                      className="ml-1 rounded border border-[#333] px-2 py-0.5 text-[10px] text-[#888] transition-colors hover:bg-[#252525]"
                      title="Em breve"
                    >
                      Block
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && events.length === 0 && !error && (
        <p className="py-8 text-center text-[12px] text-[#666]">
          Nenhum evento. Ajuste os filtros ou aguarde novos eventos.
        </p>
      )}
    </div>
  );
}
