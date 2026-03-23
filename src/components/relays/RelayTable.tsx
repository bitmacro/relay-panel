"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RelayStatusBadge } from "./RelayStatusBadge";
import { NewRelayModal } from "./NewRelayModal";

type RelayStatus = "online" | "unhealthy" | "offline" | "loading";

interface RelayInput {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
  agent_relay_id?: string | null;
}

interface RelayRow extends RelayInput {
  total_events?: number | null;
  db_size?: string | null;
  status: RelayStatus;
}

interface RelayTableProps {
  relays: RelayInput[];
}

function formatNumber(n?: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-PT");
}

export function RelayTable({ relays: initialRelays }: RelayTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<RelayRow[]>(
    initialRelays.map((r) => ({ ...r, status: "loading" as const }))
  );
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch stats + health for each relay client-side
  useEffect(() => {
    for (const relay of initialRelays) {
      Promise.all([
        fetch(`/api/relay/${relay.id}/stats`).then((r) =>
          r.ok ? (r.json() as Promise<{ total_events?: number; db_size?: string }>) : Promise.resolve({})
        ),
        fetch(`/api/relay/${relay.id}/health`).then((r) =>
          r.ok ? (r.json() as Promise<{ status?: string; error?: string }>) : Promise.resolve({})
        ),
      ])
        .then(([stats, health]) => {
          const status: RelayStatus =
            (health as { status?: string })?.status === "ok"
              ? "online"
              : (health as { error?: string })?.error
              ? "unhealthy"
              : "offline";
          setRows((prev) =>
            prev.map((row) =>
              row.id === relay.id
                ? {
                    ...row,
                    total_events: (stats as { total_events?: number })?.total_events ?? null,
                    db_size: (stats as { db_size?: string })?.db_size ?? null,
                    status,
                  }
                : row
            )
          );
        })
        .catch(() => {
          setRows((prev) =>
            prev.map((row) =>
              row.id === relay.id ? { ...row, status: "offline" as const } : row
            )
          );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.name ?? "").toLowerCase().includes(q) ||
      (r.endpoint ?? "").toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="p-7 pb-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight">Relay Hosts</h1>
            <div className="text-[12px] text-muted-foreground font-mono mt-0.5">
              {rows.length} relay{rows.length !== 1 ? "s" : ""} configurado{rows.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#f7931a] text-black px-3.5 py-1.5 rounded-md text-[13px] font-semibold hover:bg-[#e07b10] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M5 5V1h2v4h4v2H7v4H5V7H1V5h4z" />
            </svg>
            Novo relay
          </button>
        </div>

        {/* Search toolbar */}
        <div className="mb-3.5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome ou URL…"
            className="w-60 bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] outline-none focus:border-muted-foreground/30 placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                  Relay
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                  Endpoint do agente
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                  Agent Relay ID
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                  Eventos
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                  DB size
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[13px] text-muted-foreground"
                  >
                    {search
                      ? "Nenhum relay encontrado."
                      : "Adicione o seu primeiro relay."}
                  </td>
                </tr>
              ) : (
                filtered.map((relay) => {
                  const color = relay.color ?? "#8892a4";
                  const letter = (relay.name ?? relay.id).charAt(0).toUpperCase();
                  let agentDisplay = relay.endpoint ?? "—";
                  try {
                    if (relay.endpoint) agentDisplay = new URL(relay.endpoint).hostname;
                  } catch {
                    /* keep original */
                  }

                  return (
                    <tr
                      key={relay.id}
                      onClick={() => router.push(`/relays/${relay.id}`)}
                      className="border-b border-border last:border-b-0 hover:bg-secondary cursor-pointer transition-colors"
                    >
                      {/* Relay name + URL */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[13px] font-bold text-black font-mono shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {letter}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium">
                              {relay.name ?? relay.id}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {relay.endpoint
                                ? `wss://${relay.endpoint.replace(/^https?:\/\//, "")}`
                                : "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-muted-foreground font-mono">
                        {agentDisplay}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-muted-foreground font-mono">
                          {relay.agent_relay_id ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <RelayStatusBadge status={relay.status} />
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-muted-foreground font-mono">
                        {formatNumber(relay.total_events)}
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-muted-foreground font-mono">
                        {relay.db_size ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/relays/${relay.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-muted-foreground/30 transition-colors text-[14px]"
                            title="Gerir"
                          >
                            ⚙
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <NewRelayModal
          onClose={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
