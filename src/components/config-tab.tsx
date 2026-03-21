"use client";

import { useState, useEffect } from "react";

interface ConfigTabProps {
  endpoint?: string | null;
  statsVersion?: string;
  statsUptime?: number;
  healthOk?: boolean;
  loading?: boolean;
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

export function ConfigTab({
  endpoint,
  statsVersion,
  statsUptime,
  healthOk,
  loading,
}: ConfigTabProps) {
  const [agentUrl, setAgentUrl] = useState(endpoint ?? "https://relay.bitmacro.io:7811");
  const [token, setToken] = useState("");
  const [displayName, setDisplayName] = useState("relay.bitmacro.io — Comunidade");

  useEffect(() => {
    setAgentUrl(endpoint ?? "https://relay.bitmacro.io:7811");
  }, [endpoint]);

  return (
    <div className="space-y-3">
      <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="mb-3 text-[13px] font-medium text-[#ddd]">
          relay-agent endpoint
        </div>
        <div className="mb-3 flex flex-wrap gap-2.5">
          <div className="min-w-[200px] flex-1">
            <div className="mb-1 text-[11px] text-[#555]">URL do agente</div>
            <input
              type="text"
              value={agentUrl}
              onChange={(ev) => setAgentUrl(ev.target.value)}
              className="w-full rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc]"
            />
          </div>
          <div className="min-w-[150px] flex-1">
            <div className="mb-1 text-[11px] text-[#555]">Bearer token</div>
            <input
              type="password"
              value={token}
              onChange={(ev) => setToken(ev.target.value)}
              placeholder="bm_tok_…"
              className="w-full rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
            />
          </div>
        </div>
        <div className="mb-2">
          <div className="mb-1 text-[11px] text-[#555]">Nome de display</div>
          <input
            type="text"
            value={displayName}
            onChange={(ev) => setDisplayName(ev.target.value)}
            className="max-w-[300px] rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc]"
          />
        </div>
        <button
          type="button"
          className="rounded-md border border-[#5a3a0a] px-4 py-1.5 text-[12px] text-[#f7931a] transition-colors hover:bg-[#1e1a0e]"
        >
          Guardar
        </button>
        <p className="mt-2 text-[11px] text-[#555]">
          As alterações de endpoint e token devem ser guardadas no Supabase
          (relay_configs). Esta UI é um placeholder.
        </p>
      </div>

      <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="mb-3 text-[13px] font-medium text-[#ddd]">
          Estado da ligação
        </div>
        <div className="flex flex-wrap gap-5 text-[12px]">
          <div>
            <span className="text-[#555]">Versão strfry: </span>
            <strong className="text-[#ccc]">
              {loading ? "…" : statsVersion ?? "—"}
            </strong>
          </div>
          <div>
            <span className="text-[#555]">Uptime: </span>
            <strong className="text-[#ccc]">
              {loading ? "…" : formatUptime(statsUptime)}
            </strong>
          </div>
          <div>
            <span className="text-[#555]">relay-agent: </span>
            <strong
              className={
                loading
                  ? "text-[#888]"
                  : healthOk
                  ? "text-[#22c55e]"
                  : "text-[#f87171]"
              }
            >
              {loading ? "…" : healthOk ? "online" : "offline"}
            </strong>
          </div>
          <div>
            <span className="text-[#555]">Endpoint: </span>
            <strong className="font-mono text-[11px] text-[#666]">
              {endpoint ?? "—"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
