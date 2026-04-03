"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RelayColorPicker, RELAY_COLOR_PRESETS } from "./relay-color-picker";

interface CreateRelayTabProps {
  onCancel: () => void;
}

export function CreateRelayTab({ onCancel }: CreateRelayTabProps) {
  const router = useRouter();
  const t = useTranslations("CreateRelayTab");
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
    const tokenTrim = form.token.trim();
    const aid = form.agent_relay_id.trim();

    if (!n || !e || !tokenTrim || !aid) {
      setError(t("errors.requiredFields"));
      return;
    }
    if (n.length > 100) {
      setError(t("errors.nameMaxLength"));
      return;
    }
    if (!/^https?:\/\//.test(e) && !e.includes(".")) {
      setError(t("errors.invalidAgentUrl"));
      return;
    }
    if (tokenTrim.length < 8) {
      setError(t("errors.tokenMinLength"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string | null> = {
        name: n,
        endpoint: e.replace(/\/$/, ""),
        token: tokenTrim,
        agent_relay_id: aid,
        color: form.color || null,
      };

      const r = await fetch("/api/relays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? json.detail ?? t("errors.create"));
      onCancel();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.create"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="mb-3 text-[13px] font-medium text-[#ddd]">
          {t("title")}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2.5">
            <div className="min-w-[200px] flex-1">
              <div className="mb-1 text-[11px] text-[#555]">{t("form.name")}</div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={t("form.namePlaceholder")}
                className="w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <div className="mb-1 text-[11px] text-[#555]">{t("form.agentUrl")}</div>
              <input
                type="text"
                value={form.endpoint}
                onChange={(e) => setForm((p) => ({ ...p, endpoint: e.target.value }))}
                placeholder={t("form.agentUrlPlaceholder")}
                className="w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
              />
            </div>
          </div>
          <div>
            <div className="mb-1 text-[11px] text-[#555]">{t("form.bearerToken")}</div>
            <input
              type="password"
              value={form.token}
              onChange={(e) => setForm((p) => ({ ...p, token: e.target.value }))}
              placeholder={t("form.tokenPlaceholder")}
              className="max-w-[300px] w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
            />
          </div>
          <div>
            <div className="mb-1 text-[11px] text-[#555]">{t("form.agentRelayId")}</div>
            <input
              type="text"
              value={form.agent_relay_id}
              onChange={(e) => setForm((p) => ({ ...p, agent_relay_id: e.target.value }))}
              placeholder={t("form.agentRelayIdPlaceholder")}
              className="max-w-[300px] w-full rounded border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
            />
          </div>
          <RelayColorPicker
            value={form.color}
            onChange={(hex) => setForm((p) => ({ ...p, color: hex }))}
          />
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-[#5a3a0a] px-4 py-1.5 text-[12px] text-[#f7931a] hover:bg-[#1e1a0e]"
            >
              {t("btnCancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded border border-[#5a3a0a] px-4 py-1.5 text-[12px] text-[#f7931a] hover:bg-[#1e1a0e] disabled:opacity-50"
            >
              {saving ? t("btnCreating") : t("btnCreate")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
