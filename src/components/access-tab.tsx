"use client";

import { useState, useEffect, useCallback } from "react";
import { nip19 } from "nostr-tools";

type PolicyEntry = { pubkey: string; status: "allowed" | "blocked" };

function toHex(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (/^[0-9a-f]{64}$/.test(trimmed)) return trimmed;
  if (trimmed.startsWith("npub1")) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded?.type === "npub" && typeof decoded.data === "string") {
        return decoded.data;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function formatPubkey(pubkey: string): string {
  if (pubkey.length <= 16) return pubkey;
  return `${pubkey.slice(0, 8)}…${pubkey.slice(-8)}`;
}

interface AccessTabProps {
  selectedId: string | null;
}

type DisplayEntry = PolicyEntry & { source: "whitelist" | "users" };

const PAGE_SIZE = 20;

export function AccessTab({ selectedId }: AccessTabProps) {
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [addValue, setAddValue] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policyFailed, setPolicyFailed] = useState(false);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const hexFromSearch = q ? toHex(search) : null;
  const filtered = entries.filter(
    (e) =>
      e.pubkey.toLowerCase().includes(q) ||
      (hexFromSearch && e.pubkey === hexFromSearch)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const fetchData = useCallback(async () => {
    if (!selectedId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    setPolicyFailed(false);
    try {
      const [policyRes, usersRes] = await Promise.all([
        fetch(`/api/relay/${selectedId}/policy`, { cache: "no-store" }),
        fetch(`/api/relay/${selectedId}/users?limit=200`, { cache: "no-store" }),
      ]);
      const policyJson = await policyRes.json().catch(() => ({}));
      const usersJson = await usersRes.json().catch(() => ({}));
      if (!policyRes.ok) {
        setPolicyFailed(true);
        setError(
          policyJson?.error ?? policyJson?.detail ?? "Erro ao carregar policy"
        );
        setEntries([]);
        return;
      }
      const policyEntries = (policyJson?.entries ?? []) as PolicyEntry[];
      const users = (usersJson?.users ?? []) as string[];
      const policyMap = new Map(policyEntries.map((e) => [e.pubkey, e.status]));
      const merged: DisplayEntry[] = [];
      for (const e of policyEntries) {
        merged.push({ ...e, source: "whitelist" });
      }
      for (const pubkey of users) {
        if (!policyMap.has(pubkey)) {
          merged.push({ pubkey, status: "allowed", source: "users" });
        }
      }
      setEntries(merged);
    } catch (err) {
      setPolicyFailed(true);
      setError(err instanceof Error ? err.message : "Erro de rede");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search]);


  async function toggleAccess(entry: DisplayEntry) {
    if (!selectedId || actionPending) return;
    const newStatus = entry.status === "allowed" ? "blocked" : "allowed";
    const path = newStatus === "blocked" ? "block" : "allow";
    setActionPending(entry.pubkey);
    try {
      const res = await fetch(`/api/relay/${selectedId}/policy/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: entry.pubkey }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? json?.detail ?? `Erro ao ${path}`);
        return;
      }
      setEntries((prev) =>
        prev.some((e) => e.pubkey === entry.pubkey)
          ? prev.map((e) => (e.pubkey === entry.pubkey ? { ...e, status: newStatus } : e))
          : [...prev, { ...entry, status: newStatus, source: "whitelist" as const }]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede");
    } finally {
      setActionPending(null);
    }
  }

  function canToggle(entry: DisplayEntry) {
    return entry.source === "whitelist";
  }

  async function handleAdd() {
    const hex = toHex(addValue);
    if (!hex || !selectedId || actionPending) {
      if (addValue.trim() && !hex) setError("Pubkey inválida. Use hex (64 chars) ou npub1...");
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
        setError(json?.error ?? json?.detail ?? "Erro ao adicionar");
        return;
      }
      setEntries((prev) => {
        if (prev.some((e) => e.pubkey === hex)) {
          return prev.map((e) => (e.pubkey === hex ? { ...e, status: "allowed" as const, source: "whitelist" as const } : e));
        }
        return [...prev, { pubkey: hex, status: "allowed" as const, source: "whitelist" as const }];
      });
      setAddValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede");
    } finally {
      setActionPending(null);
    }
  }

  if (!selectedId) {
    return (
      <div className="py-4 text-center text-[12px] text-[#666]">
        Selecione um relay.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="mb-3 text-[13px] font-medium text-[#ccc]">
        Controlo de acesso
      </div>
      {error && (
        <div className="mb-3 rounded-md border border-[#5a2a0a] bg-[#2a1510] px-3 py-2 text-[12px] text-[#f87171]">
          {error}
        </div>
      )}
      {policyFailed && !loading ? (
        <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] py-8 text-center">
          <p className="mb-3 text-[13px] text-[#f87171]">Erro ao carregar policy</p>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-secondary"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
      <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="border-b border-[#222] bg-[#1f1f1f] px-3 py-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por pubkey..."
            className="w-full rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
          />
        </div>
        <div className="flex items-center gap-2.5 border-b border-[#222] bg-[#1f1f1f] px-3 py-2 text-[11px] font-medium text-[#555]">
          <span className="min-w-[120px]">Pubkey</span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" />
          <span className="min-w-[60px]">Origem</span>
          <span className="min-w-[80px]">Estado</span>
          <span className="min-w-[50px] text-center">Acesso</span>
        </div>
        {loading ? (
          <div className="px-3 py-6 text-center text-[12px] text-[#666]">
            A carregar…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-[12px] text-[#555]">
            {entries.length === 0
              ? "Nenhuma entrada. Whitelist vazio e sem utilizadores com eventos."
              : "Nenhum resultado para a pesquisa."}
          </div>
        ) : (
          paginated.map((e) => (
            <div
              key={`${e.pubkey}-${e.source}`}
              className="flex items-center gap-2.5 border-b border-[#222] px-3 py-2.5 text-[12px] last:border-b-0"
            >
              <span className="min-w-[120px] font-mono text-[11px] text-[#888]">
                {formatPubkey(e.pubkey)}
              </span>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-[#555]">
                {e.pubkey}
              </span>
              <span className="min-w-[60px] text-[10px] text-[#666]">
                {e.source === "whitelist" ? "whitelist" : "eventos"}
              </span>
              <span
                className={`min-w-[80px] rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  e.status === "allowed"
                    ? "bg-[#0a2a1a] text-[#4ade80]"
                    : "bg-[#2a0a0a] text-[#f87171]"
                }`}
              >
                {e.status === "allowed" ? "permitido" : "bloqueado"}
              </span>
              <div className="ml-auto">
                {canToggle(e) ? (
                <button
                  type="button"
                  onClick={() => toggleAccess(e)}
                  disabled={actionPending !== null}
                  className={`relative h-4 w-7 shrink-0 cursor-pointer rounded-full border transition-colors disabled:opacity-50 ${
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
                  <span className="text-[10px] text-[#555]">—</span>
                )}
              </div>
            </div>
          ))
        )}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#222] px-3 py-2.5">
            <span className="text-[11px] text-[#555]">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}{" "}
              pubkeys
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-[#333] px-2 py-1 text-[11px] text-[#888] hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-2 text-[11px] text-[#666]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border border-[#333] px-2 py-1 text-[11px] text-[#888] hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Seguinte
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2 border-t border-[#222] px-3 py-2.5">
          <input
            type="text"
            value={addValue}
            onChange={(ev) => {
              setAddValue(ev.target.value);
              setError(null);
            }}
            onKeyDown={(ev) => ev.key === "Enter" && handleAdd()}
            placeholder="npub1... ou hex pubkey (64 caracteres)"
            className="flex-1 rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={actionPending !== null || loading}
            className="shrink-0 rounded-md border border-[#5a3a0a] px-3 py-1.5 text-[12px] text-[#f7931a] transition-colors hover:bg-[#1e1a0e] disabled:opacity-50"
          >
            + Adicionar pubkey
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
