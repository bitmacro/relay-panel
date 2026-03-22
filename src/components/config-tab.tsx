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
  const [config, setConfig] = useState<{
    id: string;
    name: string;
    endpoint: string;
    token: string;
    agent_relay_id?: string;
  } | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    ok?: boolean;
    error?: string;
    status?: number;
    elapsed?: number;
    detail?: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setConfig(null);
      setProbeResult(null);
      return;
    }
    setProbeResult(null);
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

  const handleProbe = async () => {
    if (!selectedId) return;
    setProbing(true);
    setProbeResult(null);
    try {
      const r = await fetch(`/api/relay/${selectedId}/probe`);
      const json = await r.json();
      setProbeResult({
        ok: json.ok,
        error: json.error,
        status: json.status,
        elapsed: json.elapsed,
        detail: json.detail,
      });
    } catch (err) {
      setProbeResult({
        ok: false,
        error: "network_error",
        detail: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setProbing(false);
    }
  };

  function getProbeMessage(res: NonNullable<typeof probeResult>): string {
    if (res.ok) {
      return `Conexão OK${res.elapsed != null ? ` (${res.elapsed}ms)` : ""}`;
    }
    const elapsed = res.elapsed != null ? ` (${res.elapsed}ms)` : "";
    switch (res.error) {
      case "handler_timeout":
        return `O proxy da API demorou demasiado a responder${elapsed}. Verifica a latência até ao relay-api.`;
      case "relay_not_found":
        return `Relay não encontrado na base de dados${elapsed}. Confirma que o relay está configurado em relay_configs.`;
      case "network_error":
        return `Erro de rede${elapsed}: ${res.detail ?? "sem detalhes"}.`;
      default:
        break;
    }
    switch (res.status) {
      case 502:
        return `Proxy retornou 502 Bad Gateway${elapsed}. O relay-agent pode estar offline ou o proxy reverso (nginx/openresty) não está a encaminhar corretamente para o agente. Verifica: 1) docker ps | grep relay-agent 2) curl http://localhost:7810/health 3) configuração do upstream no proxy.`;
      case 503:
        return `Serviço indisponível (503)${elapsed}. O relay-agent pode estar a arrancar, em unhealthy ou o proxy não consegue ligar ao upstream.`;
      case 401:
        return `Token inválido (401)${elapsed}. O Bearer token nas Config não corresponde ao configurado no RELAY_INSTANCES do agente.`;
      case 404:
        return `Agent Relay ID inválido (404)${elapsed}. O valor "${res.detail ?? "?"}" não existe em RELAY_INSTANCES. Confirma o id no agente.`;
      default:
        return res.error ?? res.detail ?? `Erro${elapsed}`;
    }
  }

  const handleSave = async () => {
    if (!selectedId || !config) return;
    setSaving(true);
    setError(null);
    const body: Record<string, string | null> = {};
    if (config.name) body.name = config.name;
    if (config.endpoint) body.endpoint = config.endpoint;
    if (config.token.trim()) body.token = config.token.trim();
    body.agent_relay_id = config.agent_relay_id?.trim() || null;
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
      const text = await r.text();
      let json: { error?: string; detail?: string };
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(r.status === 504 ? "Tempo limite excedido. A API pode estar em cold start. Tenta novamente." : "Resposta inválida do servidor.");
      }
      if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao guardar");
      setConfig((prev) =>
        prev
          ? {
              ...prev,
              ...body,
              token: (body.token as string) || prev.token,
              agent_relay_id: body.agent_relay_id ?? prev.agent_relay_id ?? "",
            }
          : null
      );
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
      const text = await r.text();
      let json: { error?: string; detail?: string };
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(r.status === 504 ? "Tempo limite excedido. Tenta novamente." : "Resposta inválida do servidor.");
      }
      if (!r.ok) throw new Error(json.error ?? json.detail ?? "Erro ao apagar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao apagar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
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
              <div>
                <div className="mb-1 text-[11px] text-[#555]">Agent Relay ID</div>
                <input
                  type="text"
                  value={config.agent_relay_id ?? ""}
                  onChange={(e) => setConfig((p) => (p ? { ...p, agent_relay_id: e.target.value } : null))}
                  placeholder="ex: public (deixar vazio para agente dedicado)"
                  className="max-w-[300px] w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
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
            <button
              type="button"
              onClick={handleProbe}
              disabled={probing || !selectedId}
              className="ml-2 rounded border border-[#444] px-2 py-0.5 text-[11px] text-[#888] hover:bg-[#252525] hover:text-[#ccc] disabled:opacity-50"
            >
              {probing ? "A verificar…" : "Verificar conexão"}
            </button>
          </div>
          <div>
            <span className="text-[#555]">Endpoint: </span>
            <strong className="font-mono text-[11px] text-[#666]">
              {endpoint ?? "—"}
            </strong>
          </div>
        </div>
        {probeResult && (
          <div className="mt-3 rounded border border-[#2a2a2a] bg-[#141414] px-2.5 py-1.5 text-[11px]">
            {probeResult.ok ? (
              <span className="text-[#22c55e]">{getProbeMessage(probeResult)}</span>
            ) : (
              <span className="text-[#f87171]">{getProbeMessage(probeResult)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
