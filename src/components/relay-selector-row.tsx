"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RelayColorPicker, RELAY_COLOR_PRESETS } from "./relay-color-picker";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
}

function relayColor(relay: Relay): string {
  const c = relay.color?.trim();
  if (c && /^#[0-9a-fA-F]{6}$/.test(c)) return c;
  return RELAY_COLOR_PRESETS[0];
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
  const [addForm, setAddForm] = useState({ name: "", endpoint: "", token: "", color: RELAY_COLOR_PRESETS[0] as string });
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
        body: JSON.stringify({
          name: n,
          endpoint: e.replace(/\/$/, ""),
          token: t,
          color: addForm.color || null,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao criar");
      setAddForm({ name: "", endpoint: "", token: "", color: RELAY_COLOR_PRESETS[0] as string });
      setShowAddForm(false);
      router.refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setAddSaving(false);
    }
  };

  const relayLabel = (r: Relay) => r.name ?? r.endpoint ?? r.id.slice(0, 8);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const selectedRelay = relays.find((r) => r.id === selectedId);

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
              <RelayColorPicker
                value={addForm.color}
                onChange={(hex) => setAddForm((p) => ({ ...p, color: hex }))}
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

        {/* Right: Select relay with colored dot */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded border border-[#333] bg-[#141414] px-3 py-1.5 text-[12px] text-[#ccc] hover:border-[#444] focus:border-[#5a3a0a] focus:outline-none focus:ring-1 focus:ring-[#5a3a0a]"
              >
                {selectedRelay && (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: relayColor(selectedRelay) }}
                  />
                )}
                <span>{selectedRelay ? relayLabel(selectedRelay) : "Selecionar"}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-10 mt-0.5 min-w-[180px] rounded border border-[#333] bg-[#1a1a1a] py-1 shadow-lg">
                  {relays.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onSelect(r.id);
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#ccc] hover:bg-[#252525]"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: relayColor(r) }}
                      />
                      {relayLabel(r)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
