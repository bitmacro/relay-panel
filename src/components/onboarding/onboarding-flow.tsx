"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { RELAY_COLOR_PRESETS } from "@/components/relay-color-picker";

type Tab = "npx" | "docker";

export function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const suggestedToken = useMemo(
    () => crypto.randomUUID().replace(/-/g, "").slice(0, 32),
    []
  );

  const [step, setStep] = useState(1);
  const [tab, setTab] = useState<Tab>("npx");
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [token, setToken] = useState("");
  const [agentRelayId, setAgentRelayId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const npxCmd = "npx @bitmacro/relay-agent";
  const dockerCmd = `docker run -d -p 7810:7800 -e RELAY_AGENT_TOKEN=${suggestedToken} ghcr.io/bitmacro/relay-agent:latest`;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  async function testAndRegister() {
    const n = name.trim();
    const e = endpoint.trim();
    const tok = token.trim();
    const arid = agentRelayId.trim();
    if (!n || !e || !tok || !arid) {
      setErr(t("probeFail"));
      return;
    }
    if (tok.length < 8) {
      setErr(t("probeFail"));
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const probe = await fetch("/api/relay/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: e.replace(/\/$/, ""),
          token: tok,
          agent_relay_id: arid,
        }),
      });
      const probeJson = (await probe.json()) as { ok?: boolean };
      if (!probe.ok || !probeJson.ok) {
        setErr(t("probeFail"));
        setBusy(false);
        return;
      }

      const body: Record<string, string | null> = {
        name: n,
        endpoint: e.replace(/\/$/, ""),
        token: tok,
        agent_relay_id: arid,
        color: RELAY_COLOR_PRESETS[0] as string,
      };

      const create = await fetch("/api/relays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const createJson = (await create.json()) as {
        relay?: { id?: string };
        error?: string;
        detail?: string;
      };
      if (!create.ok || !createJson.relay?.id) {
        setErr(createJson.detail ?? createJson.error ?? t("createFail"));
        setBusy(false);
        return;
      }

      setCreatedId(createJson.relay.id);
      setStep(3);
    } catch {
      setErr(t("probeFail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-7 pb-10">
      <h1 className="text-[20px] font-semibold tracking-tight mb-1">{t("title")}</h1>
      <p className="text-[13px] text-muted-foreground mb-8">{t("subtitle")}</p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10 text-[12px]">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                step >= s
                  ? "bg-[#f7931a] text-black"
                  : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {s}
            </span>
            <span
              className={
                step === s ? "text-foreground font-medium" : "text-muted-foreground"
              }
            >
              {s === 1 ? t("step1") : s === 2 ? t("step2") : t("step3")}
            </span>
            {s < 3 && <span className="text-border mx-1">|</span>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div className="flex rounded-lg border border-border overflow-hidden w-fit">
            <button
              type="button"
              onClick={() => setTab("npx")}
              className={`px-4 py-2 text-[13px] font-medium ${
                tab === "npx" ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              {t("tabNpx")}
            </button>
            <button
              type="button"
              onClick={() => setTab("docker")}
              className={`px-4 py-2 text-[13px] font-medium border-l border-border ${
                tab === "docker" ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              {t("tabDocker")}
            </button>
          </div>

          {tab === "npx" ? (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {t("npxCmd")}
              </div>
              <pre className="text-[12px] font-mono bg-secondary border border-border rounded-lg p-4 overflow-x-auto">
                {npxCmd}
              </pre>
              <button
                type="button"
                onClick={() => copy(npxCmd)}
                className="mt-2 text-[12px] text-[#f7931a] hover:underline"
              >
                {tCommon("copy")}
              </button>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {t("dockerCmd")}
              </div>
              <pre className="text-[11px] font-mono bg-secondary border border-border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {dockerCmd}
              </pre>
              <button
                type="button"
                onClick={() => copy(dockerCmd)}
                className="mt-2 text-[12px] text-[#f7931a] hover:underline"
              >
                {tCommon("copy")}
              </button>
            </div>
          )}

          <div className="rounded-lg border border-border/80 bg-secondary/40 p-4 space-y-2">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {t("suggestedToken")}
            </div>
            <code className="text-[12px] font-mono block break-all">{suggestedToken}</code>
            <button
              type="button"
              onClick={() => copy(suggestedToken)}
              className="text-[12px] text-[#f7931a] hover:underline"
            >
              {tCommon("copy")}
            </button>
            <p className="text-[12px] text-muted-foreground pt-1">{t("tokenHint")}</p>
          </div>

          <p className="text-[12px] text-muted-foreground">
            <a
              href="https://bitmacro.io/relay-manager/docs"
              target="_blank"
              rel="noreferrer"
              className="text-[#f7931a] hover:underline"
            >
              {t("fullDocs")}
            </a>
          </p>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-2.5 rounded-md bg-[#f7931a] text-black text-[13px] font-semibold hover:bg-[#e07b10]"
          >
            {t("step2")} →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="text-[14px] font-medium">{t("step2Title")}</div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase block mb-1">
              {t("name")}
            </label>
            <input
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] outline-none focus:border-[#f7931a]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase block mb-1">
              {t("endpoint")}
            </label>
            <input
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-[#f7931a]"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase block mb-1">
              {t("token")}
            </label>
            <input
              type="password"
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-[#f7931a]"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase block mb-1">
              {t("agentRelayId")}{" "}
              <span className="normal-case font-normal text-muted-foreground/70">
                ({t("agentRelayIdSubtext")})
              </span>
            </label>
            <input
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-[#f7931a]"
              value={agentRelayId}
              onChange={(e) => setAgentRelayId(e.target.value)}
              placeholder="public"
            />
          </div>

          {err && <p className="text-[12px] text-[#ef4444]">{err}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErr(null);
              }}
              className="px-4 py-2 rounded-md border border-border text-[13px] text-muted-foreground hover:text-foreground"
            >
              {t("back")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={testAndRegister}
              className="flex-1 py-2.5 rounded-md bg-[#f7931a] text-black text-[13px] font-semibold hover:bg-[#e07b10] disabled:opacity-50"
            >
              {busy ? t("registering") : t("testConnection")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && createdId && (
        <div className="space-y-5 text-center">
          <div className="text-[40px]">✓</div>
          <h2 className="text-[18px] font-semibold">{t("successTitle")}</h2>
          <p className="text-[13px] text-muted-foreground">{t("successBody")}</p>
          <Link
            href={`/relays/${createdId}`}
            onClick={() => router.refresh()}
            className="inline-flex items-center justify-center w-full py-2.5 rounded-md bg-[#f7931a] text-black text-[13px] font-semibold hover:bg-[#e07b10]"
          >
            {t("viewRelay")}
          </Link>
        </div>
      )}
    </div>
  );
}
