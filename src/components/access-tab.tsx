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

export function AccessTab({ selectedId }: AccessTabProps) {
  const [entries, setEntries] = useState<PolicyEntry[]>([]);
  const [addValue, setAddValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const policyRes = await fetch(`/api/relay/${selectedId}/policy`, {
        cache: "no-store",
      });
      const policyJson = await policyRes.json();
      if (!policyRes.ok) {
        setError(policyJson?.error ?? policyJson?.detail ?? "Erro ao carregar policy");
        setEntries([]);
      } else {
        setEntries(policyJson?.entries ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  async function toggleAccess(entry: PolicyEntry) {
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
          : [...prev, { pubkey: entry.pubkey, status: newStatus }]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede");
    } finally {
      setActionPending(null);
    }
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
          return prev.map((e) => (e.pubkey === hex ? { ...e, status: "allowed" } : e));
        }
        return [...prev, { pubkey: hex, status: "allowed" }];
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
      <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="flex items-center gap-2.5 border-b border-[#222] bg-[#1f1f1f] px-3 py-2 text-[11px] font-medium text-[#555]">
          <span className="min-w-[120px]">Pubkey</span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" />
          <span className="min-w-[80px]">Estado</span>
          <span className="min-w-[50px] text-center">Acesso</span>
        </div>
        {loading ? (
          <div className="px-3 py-6 text-center text-[12px] text-[#666]">
            A carregar…
          </div>
        ) : entries.length === 0 ? (
          <div className="px-3 py-6 text-center text-[12px] text-[#555]">
            Nenhuma entrada no whitelist. Adicione uma pubkey.
          </div>
        ) : (
          entries.map((e) => (
            <div
              key={e.pubkey}
              className="flex items-center gap-2.5 border-b border-[#222] px-3 py-2.5 text-[12px] last:border-b-0"
            >
              <span className="min-w-[120px] font-mono text-[11px] text-[#888]">
                {formatPubkey(e.pubkey)}
              </span>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-[#555]">
                {e.pubkey}
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
              </div>
            </div>
          ))
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
    </div>
  );
}
