"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
}

interface RelaySelectorRowProps {
  relays: Relay[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  providerUserId?: string | null;
}

export function RelaySelectorRow({
  relays,
  selectedId,
  onSelect,
  providerUserId,
}: RelaySelectorRowProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", endpoint: "", token: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = async () => {
    const { name, endpoint, token } = addForm;
    const n = name.trim();
    const e = endpoint.trim();
    const t = token.trim();
    if (!n || !e || !t) {
      setAddError("Preencha nome, URL do agente e token");
      return;
    }
    if (n.length > 100) {
      setAddError("Nome deve ter no máximo 100 caracteres");
      return;
    }
    if (!/^https?:\/\//.test(e) && !e.includes(".")) {
      setAddError("URL do agente inválida (ex.: https://agent.example.com)");
      return;
    }
    if (t.length < 8) {
      setAddError("Token deve ter pelo menos 8 caracteres");
      return;
    }
    setAddSaving(true);
    setAddError(null);
    try {
      const r = await fetch("/api/relays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, endpoint: e.replace(/\/$/, ""), token: t }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao criar");
      setAddForm({ name: "", endpoint: "", token: "" });
      setShowAddForm(false);
      router.refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setAddSaving(false);
    }
  };

  const relayLabel = (r: Relay) => r.name ?? r.endpoint ?? r.id.slice(0, 8);

  return (
    <div className="border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Add relay */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded border border-[#5a3a0a] px-3 py-1.5 text-[12px] text-[#f7931a] hover:bg-[#1e1a0e]"
          >
            {showAddForm ? "Cancelar" : "+ Novo relay"}
          </button>
          {showAddForm && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nome"
                className="w-32 rounded border border-[#333] bg-[#141414] px-2 py-1 text-[11px] text-[#ccc] placeholder:text-[#555]"
              />
              <input
                type="text"
                value={addForm.endpoint}
                onChange={(e) => setAddForm((p) => ({ ...p, endpoint: e.target.value }))}
                placeholder="https://agent.example.com"
                className="min-w-[180px] rounded border border-[#333] bg-[#141414] px-2 py-1 text-[11px] text-[#ccc] placeholder:text-[#555]"
              />
              <input
                type="password"
                value={addForm.token}
                onChange={(e) => setAddForm((p) => ({ ...p, token: e.target.value }))}
                placeholder="Bearer token"
                className="w-28 rounded border border-[#333] bg-[#141414] px-2 py-1 text-[11px] text-[#ccc] placeholder:text-[#555]"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={addSaving}
                className="rounded border border-[#5a3a0a] px-3 py-1 text-[11px] text-[#f7931a] hover:bg-[#1e1a0e] disabled:opacity-50"
              >
                {addSaving ? "A criar…" : "Criar"}
              </button>
              {addError && (
                <span className="text-[11px] text-[#f87171]">{addError}</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Select relay */}
        <div className="flex items-center gap-2">
          {relays.length === 0 ? (
            <p className="text-[11px] text-[#666]">
              Sem relays.
              {providerUserId && (
                <span className="ml-1">
                  Adicione em Supabase (provider_user_id=
                  {providerUserId?.slice(0, 8)}…)
                </span>
              )}
            </p>
          ) : (
            <select
              value={selectedId ?? ""}
              onChange={(e) => onSelect(e.target.value || null)}
              className="rounded border border-[#333] bg-[#141414] px-3 py-1.5 text-[12px] text-[#ccc] focus:border-[#5a3a0a] focus:outline-none focus:ring-1 focus:ring-[#5a3a0a]"
            >
              {relays.map((r) => (
                <option key={r.id} value={r.id}>
                  {relayLabel(r)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
