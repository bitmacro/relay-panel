"use client";

import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { startTransition, useEffect, useState } from "react";
import { PANEL_PACKAGE_VERSION } from "@/lib/panel-version";

const footerNavLink =
  "footer-link inline-flex min-h-11 items-center justify-center rounded-md px-2 touch-manipulation sm:min-h-0 sm:inline sm:px-0";

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
    <footer className="border-t border-border bg-card px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <a
            href="https://bitmacro.io"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80 touch-manipulation sm:min-h-0"
          >
            <Image
              src="/bitmacro-logo.png"
              alt="BitMacro"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            <span className="text-[13px] font-medium">{t("brand")}</span>
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:justify-end">
            <span
              className="text-[11px] font-mono rounded border border-border bg-secondary px-1.5 py-0.5"
              title={tFooter("panelTitle")}
            >
              {tFooter("panelVersion", { version: PANEL_PACKAGE_VERSION })}
            </span>
            <span className="text-border select-none" aria-hidden>
              ·
            </span>
            <span
              className="text-[11px] font-mono rounded border border-border bg-secondary px-1.5 py-0.5"
              title={tFooter("agentTitleLanding")}
            >
              {tFooter("agent", { label: agentLabel })}
            </span>
          </div>
        </div>

        <nav
          className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-2"
          aria-label={t("brand")}
        >
          <a href="https://bitmacro.io" className={footerNavLink}>
            {t("bitmacro")}
          </a>
          <a
            href="https://bitmacro.io/relay-manager"
            target="_blank"
            rel="noreferrer"
            className={footerNavLink}
          >
            {t("ecosystem")}
          </a>
          <a
            href="https://bitmacro.io/relay-manager/docs"
            target="_blank"
            rel="noreferrer"
            className={footerNavLink}
          >
            {t("techDocs")}
          </a>
          <Link
            href="https://github.com/bitmacro/relay-panel"
            target="_blank"
            rel="noreferrer"
            className={footerNavLink}
          >
            relay-panel ↗
          </Link>
          <Link
            href="https://github.com/bitmacro/relay-agent"
            target="_blank"
            rel="noreferrer"
            className={footerNavLink}
          >
            relay-agent ↗
          </Link>
          <Link
            href="https://github.com/bitmacro/relay-connect"
            target="_blank"
            rel="noreferrer"
            title="@bitmacro/relay-connect (BitMacro Connect SDK)"
            className={`${footerNavLink} gap-1 font-mono`}
          >
            <Github className="size-3.5 shrink-0 opacity-80" aria-hidden />
            <span className="break-all text-left sm:break-normal">@bitmacro/relay-connect</span>
          </Link>
        </nav>
        <p className="text-center text-[12px] text-muted-foreground">{t("copyright")}</p>
      </div>
    </footer>
  );
}
