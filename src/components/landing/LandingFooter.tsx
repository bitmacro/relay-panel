"use client";

import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { startTransition, useEffect, useState } from "react";
import { PANEL_PACKAGE_VERSION } from "@/lib/panel-version";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const tFooter = useTranslations("footer");
  const [agentVersion, setAgentVersion] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => setAgentLoading(true));
    (async () => {
      try {
        const r = await fetch("/api/public/agent-health", { cache: "no-store" });
        const json = (await r.json()) as { version?: string | null };
        if (!cancelled && typeof json.version === "string" && json.version) {
          setAgentVersion(json.version);
        } else if (!cancelled) {
          setAgentVersion(null);
        }
      } catch {
        if (!cancelled) setAgentVersion(null);
      } finally {
        if (!cancelled) startTransition(() => setAgentLoading(false));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const agentLabel = agentLoading ? "…" : agentVersion != null ? `v${agentVersion}` : "—";

  return (
    <footer className="border-t border-border bg-card px-6 py-8">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1.5">
          <a
            href="https://bitmacro.io"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/bitmacro-logo.png"
              alt="BitMacro"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
            <span className="text-[13px] font-medium">{t("brand")}</span>
          </a>
          <span className="text-border hidden sm:inline">·</span>
          <span
            className="text-[11px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded"
            title={tFooter("panelTitle")}
          >
            {tFooter("panelVersion", { version: PANEL_PACKAGE_VERSION })}
          </span>
          <span className="text-border">·</span>
          <span
            className="text-[11px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded"
            title={tFooter("agentTitleLanding")}
          >
            {tFooter("agent", { label: agentLabel })}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-muted-foreground">
          <Link
            href="https://bitmacro.io"
            className="hover:text-foreground transition-colors"
          >
            {t("bitmacro")}
          </Link>
          <a
            href="https://bitmacro.io/relay-manager"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            {t("ecosystem")}
          </a>
          <a
            href="https://bitmacro.io/relay-manager/docs"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            {t("techDocs")}
          </a>
          <Link
            href="https://github.com/bitmacro/relay-panel"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            relay-panel ↗
          </Link>
          <Link
            href="https://github.com/bitmacro/relay-agent"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            relay-agent ↗
          </Link>
          <Link
            href="https://github.com/bitmacro/relay-connect"
            target="_blank"
            rel="noreferrer"
            title="@bitmacro/relay-connect (BitMacro Connect SDK)"
            className="inline-flex items-center gap-1 font-mono hover:text-foreground transition-colors"
          >
            <Github className="size-3.5 shrink-0 opacity-80" aria-hidden />
            <span>@bitmacro/relay-connect</span>
          </Link>
          <span>{t("copyright")}</span>
        </div>
      </div>
    </footer>
  );
}
