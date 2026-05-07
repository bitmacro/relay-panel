"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BearerSecretInput } from "@/components/BearerSecretInput";
import { RelayColorPicker } from "./relay-color-picker";

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
  const t = useTranslations("ConfigTab");
  const [config, setConfig] = useState<{
    id: string;
    name: string;
    endpoint: string;
    token: string;
    agent_relay_id?: string;
    color?: string;
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
        if (!r.ok) throw new Error(json.error ?? json.detail ?? t("errors.loadConfig"));
        return json;
      })
      .then(setConfig)
      .catch((err) => {
        setConfig(null);
        setError(err instanceof Error ? err.message : t("errors.unknown"));
      })
      .finally(() => setConfigLoading(false));
  }, [selectedId, t]);

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
      return t("probe.ok", { elapsed: res.elapsed != null ? ` (${res.elapsed}ms)` : "" });
    }
    const elapsed = res.elapsed != null ? ` (${res.elapsed}ms)` : "";
    switch (res.error) {
      case "handler_timeout":
        return t("probe.handlerTimeout", { elapsed });
      case "relay_not_found":
        return t("probe.relayNotFound", { elapsed });
      case "no_agent":
        return t("probe.noAgent", { elapsed });
      case "network_error":
        return t("probe.networkError", { elapsed, detail: res.detail ?? t("probe.noDetails") });
      default:
        break;
    }
    switch (res.status) {
      case 502:
        return t("probe.status502", { elapsed });
      case 503:
        return t("probe.status503", { elapsed });
      case 401:
        return t("probe.status401", { elapsed });
      case 404:
        return t("probe.status404", { elapsed, detail: res.detail ?? "?" });
      default:
        return res.error ?? res.detail ?? t("probe.genericError", { elapsed });
    }
  }

  const handleSave = async () => {
    if (!selectedId || !config) return;
    const ep = (config.endpoint ?? "").trim();
    const tok = (config.token ?? "").trim();
    const aid = (config.agent_relay_id ?? "").trim();
    const agentMode = Boolean(ep && tok);
    if (agentMode) {
      if (tok.length < 8) {
        setError(t("errors.tokenMinLength"));
        return;
      }
      if (!aid) {
        setError(t("errors.agentRelayIdRequired"));
        return;
      }
    } else if (aid) {
      setError(t("errors.agentRelayWithoutAgent"));
      return;
    }
    setSaving(true);
    setError(null);
    const body: Record<string, string | null> = {};
    if (config.name.trim()) body.name = config.name.trim();
    if (agentMode) {
      body.endpoint = ep.replace(/\/$/, "");
      body.token = tok;
      body.agent_relay_id = aid || null;
    } else {
      body.endpoint = "";
      body.token = "";
      body.agent_relay_id = null;
    }
    if (config.color !== undefined) {
      body.color = config.color.trim() ? config.color.trim() : null;
    }
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
        throw new Error(
          r.status === 504
            ? t("errors.timeoutColdStart")
            : t("errors.invalidServerResponse")
        );
      }
      if (!r.ok) throw new Error(json.error ?? json.detail ?? t("errors.save"));
      setConfig((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...(typeof body.name === "string" ? { name: body.name } : {}),
          ...(body.endpoint !== undefined
            ? { endpoint: body.endpoint ?? "" }
            : {}),
          ...(body.token !== undefined ? { token: body.token ?? "" } : {}),
          ...(body.agent_relay_id !== undefined
            ? { agent_relay_id: body.agent_relay_id ?? "" }
            : {}),
          ...(body.color !== undefined ? { color: body.color ?? "" } : {}),
        };
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !window.confirm(t("confirmDelete"))) return;
    setDeleting(true);
    setError(null);
    try {
      const r = await fetch(`/api/relay/${selectedId}`, { method: "DELETE" });
      const text = await r.text();
      let json: { error?: string; detail?: string };
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          r.status === 504
            ? t("errors.timeoutTryAgain")
            : t("errors.invalidServerResponse")
        );
      }
      if (!r.ok) throw new Error(json.error ?? json.detail ?? t("errors.delete"));
      router.replace("/relays");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.delete"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Edit relay */}
      {selectedId && (
        <div className="rounded-[10px] border border-border bg-card p-4">
          <div className="mb-3 text-[13px] font-medium text-foreground">
            {t("title")}
          </div>
          {configLoading ? (
            <p className="text-[12px] text-muted-foreground">{t("loading")}</p>
          ) : config ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2.5">
                <div className="min-w-[200px] flex-1">
                  <div className="mb-1 text-[11px] text-muted-foreground">{t("form.agentUrl")}</div>
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) => setConfig((p) => (p ? { ...p, endpoint: e.target.value } : null))}
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] text-foreground shadow-sm"
                  />
                </div>
                <div className="min-w-[150px] flex-1">
                  <div className="mb-1 text-[11px] text-muted-foreground">{t("form.bearerToken")}</div>
                  <BearerSecretInput
                    value={config.token}
                    onChange={(e) => setConfig((p) => (p ? { ...p, token: e.target.value } : null))}
                    placeholder={t("form.tokenPlaceholder")}
                    inputClassName="w-full rounded-md border border-input bg-background py-1.5 pl-2.5 pr-[4.75rem] text-[12px] text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">{t("form.displayName")}</div>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig((p) => (p ? { ...p, name: e.target.value } : null))}
                  className="max-w-[300px] rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] text-foreground shadow-sm"
                />
              </div>
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">{t("form.agentRelayId")}</div>
                <input
                  type="text"
                  value={config.agent_relay_id ?? ""}
                  onChange={(e) => setConfig((p) => (p ? { ...p, agent_relay_id: e.target.value } : null))}
                  placeholder={t("form.agentRelayIdPlaceholder")}
                  className="max-w-[300px] w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground shadow-sm"
                />
              </div>
              <RelayColorPicker
                value={config.color ?? ""}
                onChange={(hex) => setConfig((p) => (p ? { ...p, color: hex } : null))}
              />
              {error && <p className="text-[12px] text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md border border-primary/40 bg-primary/10 px-4 py-1.5 text-[12px] text-primary hover:bg-primary/15 disabled:opacity-50"
                >
                  {saving ? t("btnSaving") : t("btnSave")}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  {deleting ? t("btnDeleting") : t("btnDeleteRelay")}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">{error ?? t("errors.relayNotFound")}</p>
          )}
        </div>
      )}

      {/* Connection status */}
      <div className="rounded-[10px] border border-border bg-card p-4">
        <div className="mb-3 text-[13px] font-medium text-foreground">
          {t("connection.title")}
        </div>
        <div className="flex flex-wrap gap-5 text-[12px]">
          <div>
            <span className="text-muted-foreground">{t("connection.strfryVersion")} </span>
            <strong className="text-foreground">
              {loading ? "…" : statsVersion ?? t("dash")}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">{t("connection.uptime")} </span>
            <strong className="text-foreground">
              {loading ? "…" : formatUptime(statsUptime)}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">{t("connection.relayAgent")} </span>
            <strong
              className={
                loading
                  ? "text-muted-foreground"
                  : healthOk
                  ? "text-green-600 dark:text-green-400"
                  : "text-destructive"
              }
            >
              {loading ? "…" : healthOk ? t("connection.online") : t("connection.offline")}
            </strong>
            <button
              type="button"
              onClick={handleProbe}
              disabled={probing || !selectedId}
              className="ml-2 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {probing ? t("btnProbing") : t("btnProbeConnection")}
            </button>
          </div>
          <div>
            <span className="text-muted-foreground">{t("connection.endpoint")} </span>
            <strong className="font-mono text-[11px] text-muted-foreground">
              {endpoint ?? t("dash")}
            </strong>
          </div>
        </div>
        {probeResult && (
          <div className="mt-3 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-[11px]">
            {probeResult.ok ? (
              <span className="text-green-600 dark:text-green-400">{getProbeMessage(probeResult)}</span>
            ) : probeResult.error === "no_agent" ? (
              <span className="text-muted-foreground">{getProbeMessage(probeResult)}</span>
            ) : (
              <span className="text-destructive">{getProbeMessage(probeResult)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
