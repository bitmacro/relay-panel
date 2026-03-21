"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ConfigTabProps {
  selectedId: string | null;
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
  selectedId,
  endpoint,
  statsVersion,
  statsUptime,
  healthOk,
  loading,
}: ConfigTabProps) {
  const router = useRouter();
  const [config, setConfig] = useState<{ id: string; name: string; endpoint: string; token: string } | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", endpoint: "", token: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setConfig(null);
      return;
    }
    setConfigLoading(true);
    setError(null);
    fetch(`/api/relay/${selectedId}/config`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao carregar");
        return json;
      })
      .then(setConfig)
      .catch((err) => {
        setConfig(null);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      })
      .finally(() => setConfigLoading(false));
  }, [selectedId]);


  const handleSave = async () => {
    if (!selectedId || !config) return;
    setSaving(true);
    setError(null);
    const body: Record<string, string> = {};
    if (config.name) body.name = config.name;
    if (config.endpoint) body.endpoint = config.endpoint;
    if (config.token.trim()) body.token = config.token.trim();
    if (Object.keys(body).length === 0) {
      setSaving(false);
      return;
    }
    try {
      const r = await fetch(`/api/relay/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao guardar");
      setConfig((prev) => (prev ? { ...prev, ...body, token: body.token || prev.token } : null));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !window.confirm("Apagar este relay? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    setError(null);
    try {
      const r = await fetch(`/api/relay/${selectedId}`, { method: "DELETE" });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao apagar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao apagar");
    } finally {
      setDeleting(false);
    }
  };

  const handleAdd = async () => {
    const { name, endpoint, token } = addForm;
    if (!name.trim() || !endpoint.trim() || !token.trim()) {
      setAddError("Preencha nome, endpoint e token");
      return;
    }
    setAddSaving(true);
    setAddError(null);
    try {
      const r = await fetch("/api/relays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), endpoint: endpoint.trim(), token: token.trim() }),
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

  return (
    <div className="space-y-3">
      {/* Add relay */}
      <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#ddd]">Adicionar relay</span>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded border border-[#5a3a0a] px-3 py-1 text-[12px] text-[#f7931a] hover:bg-[#1e1a0e]"
          >
            {showAddForm ? "Cancelar" : "+ Novo relay"}
          </button>
        </div>
        {showAddForm && (
          <div className="space-y-2">
            <div>
              <div className="mb-1 text-[11px] text-[#555]">Nome</div>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="relay.bitmacro.io"
                className="w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
              />
            </div>
            <div>
              <div className="mb-1 text-[11px] text-[#555]">URL do agente</div>
              <input
                type="text"
                value={addForm.endpoint}
                onChange={(e) => setAddForm((p) => ({ ...p, endpoint: e.target.value }))}
                placeholder="https://agent-private.bitmacro.io"
                className="w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
              />
            </div>
            <div>
              <div className="mb-1 text-[11px] text-[#555]">Bearer token</div>
              <input
                type="password"
                value={addForm.token}
                onChange={(e) => setAddForm((p) => ({ ...p, token: e.target.value }))}
                placeholder="Token do relay-agent"
                className="w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
              />
            </div>
            {addError && <p className="text-[12px] text-[#f87171]">{addError}</p>}
            <button
              type="button"
              onClick={handleAdd}
              disabled={addSaving}
              className="rounded border border-[#5a3a0a] px-4 py-1.5 text-[12px] text-[#f7931a] hover:bg-[#1e1a0e] disabled:opacity-50"
            >
              {addSaving ? "A criar…" : "Criar"}
            </button>
          </div>
        )}
      </div>

      {/* Edit relay */}
      {selectedId && (
        <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <div className="mb-3 text-[13px] font-medium text-[#ddd]">
            relay-agent endpoint
          </div>
          {configLoading ? (
            <p className="text-[12px] text-[#666]">A carregar…</p>
          ) : config ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2.5">
                <div className="min-w-[200px] flex-1">
                  <div className="mb-1 text-[11px] text-[#555]">URL do agente</div>
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) => setConfig((p) => (p ? { ...p, endpoint: e.target.value } : null))}
                    className="w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc]"
                  />
                </div>
                <div className="min-w-[150px] flex-1">
                  <div className="mb-1 text-[11px] text-[#555]">Bearer token</div>
                  <input
                    type="password"
                    value={config.token}
                    onChange={(e) => setConfig((p) => (p ? { ...p, token: e.target.value } : null))}
                    placeholder="Deixar em branco para manter"
                    className="w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 text-[11px] text-[#555]">Nome de display</div>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig((p) => (p ? { ...p, name: e.target.value } : null))}
                  className="max-w-[300px] rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc]"
                />
              </div>
              {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded border border-[#5a3a0a] px-4 py-1.5 text-[12px] text-[#f7931a] hover:bg-[#1e1a0e] disabled:opacity-50"
                >
                  {saving ? "A guardar…" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded border border-[#5a1a1a] px-4 py-1.5 text-[12px] text-[#f87171] hover:bg-[#2a0a0a] disabled:opacity-50"
                >
                  {deleting ? "A apagar…" : "Apagar relay"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-[#666]">{error ?? "Relay não encontrado."}</p>
          )}
        </div>
      )}

      {/* Connection status */}
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
