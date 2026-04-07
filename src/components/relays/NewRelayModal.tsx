"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BearerSecretInput } from "@/components/BearerSecretInput";
import { RELAY_COLOR_PRESETS } from "@/components/relay-color-picker";

interface NewRelayModalProps {
  onClose: () => void;
}

export function NewRelayModal({ onClose }: NewRelayModalProps) {
  const tr = useTranslations("newRelay");
  const tc = useTranslations("common");
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
    const tok = form.token.trim();
    const aid = form.agent_relay_id.trim();

    if (!n || !e || !tok || !aid) {
      setError(tr("errRequired"));
      return;
    }
    if (tok.length < 8) {
      setError(tr("errTokenLen"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string | null> = {
        name: n,
        endpoint: e.replace(/\/$/, ""),
        token: tok,
        agent_relay_id: aid,
        color: form.color || null,
      };

      const r = await fetch("/api/relays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? json.detail ?? tr("errCreate"));
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("errCreate"));
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
        <div className="text-[16px] font-semibold mb-4">{tr("title")}</div>

        <div className="space-y-3.5">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              {tr("displayName")}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={tr("displayPlaceholder")}
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] outline-none focus:border-[#f7931a] placeholder:text-muted-foreground/40"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              {tr("agentUrl")}
            </label>
            <input
              type="text"
              value={form.endpoint}
              onChange={(e) => setForm((p) => ({ ...p, endpoint: e.target.value }))}
              placeholder={tr("agentPlaceholder")}
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono outline-none focus:border-[#f7931a] placeholder:text-muted-foreground/40"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              {tr("token")}
            </label>
            <BearerSecretInput
              value={form.token}
              onChange={(e) => setForm((p) => ({ ...p, token: e.target.value }))}
              placeholder={tr("tokenPlaceholder")}
              inputClassName="w-full rounded-md border border-border bg-secondary py-1.5 pl-3 pr-[4.75rem] text-[13px] font-mono outline-none focus:border-[#f7931a] placeholder:text-muted-foreground/40"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              {tr("agentRelayId")}{" "}
              <span className="text-muted-foreground/40 normal-case text-[10px] tracking-normal font-normal">
                {tr("agentRelayIdHint")}
              </span>
            </label>
            <input
              type="text"
              value={form.agent_relay_id}
              onChange={(e) => setForm((p) => ({ ...p, agent_relay_id: e.target.value }))}
              placeholder={tr("agentRelayPlaceholder")}
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
            {tc("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-1.5 text-[13px] bg-[#f7931a] text-black font-semibold rounded-md hover:bg-[#e07b10] disabled:opacity-50 transition-colors"
          >
            {saving ? tr("submitting") : tr("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
