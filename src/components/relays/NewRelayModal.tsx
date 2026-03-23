"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RELAY_COLOR_PRESETS } from "@/components/relay-color-picker";

interface NewRelayModalProps {
  onClose: () => void;
}

export function NewRelayModal({ onClose }: NewRelayModalProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    endpoint: "",
    token: "",
    agent_relay_id: "",
    color: RELAY_COLOR_PRESETS[0] as string,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const n = form.name.trim();
    const e = form.endpoint.trim();
    const t = form.token.trim();

    if (!n || !e || !t) {
      setError("Preencha nome, URL do agente e token");
      return;
    }
    if (t.length < 8) {
      setError("Token deve ter pelo menos 8 caracteres");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string | null> = {
        name: n,
        endpoint: e.replace(/\/$/, ""),
        token: t,
        color: form.color || null,
      };
      if (form.agent_relay_id.trim()) body.agent_relay_id = form.agent_relay_id.trim();

      const r = await fetch("/api/relays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao criar");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border/80 rounded-xl w-full max-w-[460px] p-6 shadow-2xl">
        <div className="text-[16px] font-semibold mb-4">Novo relay</div>

        <div className="space-y-3.5">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              Nome de display
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="ex: relay.meudominio.com"
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] outline-none focus:border-[#f7931a] placeholder:text-muted-foreground/40"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              URL do agente
            </label>
            <input
              type="text"
              value={form.endpoint}
              onChange={(e) => setForm((p) => ({ ...p, endpoint: e.target.value }))}
              placeholder="https://agent.meudominio.com"
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono outline-none focus:border-[#f7931a] placeholder:text-muted-foreground/40"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              Bearer token
            </label>
            <input
              type="password"
              value={form.token}
              onChange={(e) => setForm((p) => ({ ...p, token: e.target.value }))}
              placeholder="RELAY_AGENT_TOKEN"
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono outline-none focus:border-[#f7931a] placeholder:text-muted-foreground/40"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              Agent Relay ID{" "}
              <span className="text-muted-foreground/40 normal-case text-[10px] tracking-normal font-normal">
                (opcional — deixar vazio para agente dedicado)
              </span>
            </label>
            <input
              type="text"
              value={form.agent_relay_id}
              onChange={(e) => setForm((p) => ({ ...p, agent_relay_id: e.target.value }))}
              placeholder="ex: public"
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono outline-none focus:border-[#f7931a] placeholder:text-muted-foreground/40"
            />
          </div>

          {error && <p className="text-[12px] text-[#ef4444]">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-[13px] border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-1.5 text-[13px] bg-[#f7931a] text-black font-semibold rounded-md hover:bg-[#e07b10] disabled:opacity-50 transition-colors"
          >
            {saving ? "A criar…" : "Adicionar relay"}
          </button>
        </div>
      </div>
    </div>
  );
}
