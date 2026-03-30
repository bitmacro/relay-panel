"use client";

import { Github } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { startTransition, useEffect, useState } from "react";

interface FooterProps {
  /** From package.json at build time */
  panelVersion: string;
  /** When not on /relays/:id, use this relay for agent /health (same agent for all relays). */
  defaultRelayId: string | null;
}

type AgentHealthOk = { status: string; version?: string };

export function Footer({ panelVersion, defaultRelayId }: FooterProps) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const [agentVersion, setAgentVersion] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  const relayIdFromPath =
    pathname && pathname.startsWith("/relays/")
      ? pathname.slice("/relays/".length).split("/")[0] || null
      : null;
  const relayId =
    relayIdFromPath && relayIdFromPath !== "relays"
      ? relayIdFromPath
      : defaultRelayId;

  useEffect(() => {
    if (!relayId) return;
    let cancelled = false;
    startTransition(() => {
      setAgentLoading(true);
      setAgentVersion(null);
    });
    fetch(`/api/relay/${relayId}/health`, { cache: "no-store" })
      .then(async (r) => {
        const json = (await r.json()) as AgentHealthOk & {
          error?: string;
          detail?: string;
        };
        if (cancelled) return;
        if (r.ok && json.status === "ok" && typeof json.version === "string") {
          setAgentVersion(json.version);
        } else {
          setAgentVersion(null);
        }
      })
      .catch(() => {
        if (!cancelled) setAgentVersion(null);
      })
      .finally(() => {
        if (!cancelled) setAgentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [relayId]);

  const agentLabel = !relayId
    ? "—"
    : agentLoading
      ? "…"
      : agentVersion != null
        ? `v${agentVersion}`
        : "—";

  return (
    <footer className="bg-card border-t border-border px-7 py-3.5 flex items-center justify-between gap-3 flex-wrap shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <a
            href="https://bitmacro.io"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Image
              src="/bitmacro-logo.png"
              alt="BitMacro"
              width={18}
              height={18}
              className="w-[18px] h-[18px] object-contain"
            />
            <span>{t("brand")}</span>
          </a>
        </div>
        <span className="text-border">·</span>
        <span
          className="font-mono text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded"
            title={t("panelTitle")}
        >
          {t("panelVersion", { version: panelVersion })}
        </span>
        <span className="text-border">·</span>
        <span
          className="font-mono text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded"
          title={t("agentTitle")}
        >
          {t("agent", { label: agentLabel })}
        </span>
        <span className="text-border">·</span>
        <span>{tNav("domain")}</span>
      </div>
      <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground">
        <a
          href="https://bitmacro.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          {t("ecosystem")}
        </a>
        <a
          href="https://github.com/bitmacro/relay-panel"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          {t("repoPanel")}
        </a>
        <a
          href="https://github.com/bitmacro/relay-agent"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          {t("repoAgent")}
        </a>
        <a
          href="https://github.com/bitmacro/relay-connect"
          target="_blank"
          rel="noreferrer"
          title="@bitmacro/relay-connect (BitMacro Connect SDK)"
          className="inline-flex items-center gap-1 font-mono hover:text-foreground transition-colors"
        >
          <Github className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span>{t("repoConnect")}</span>
        </a>
        <span className="text-border">·</span>
        <span>{t("copyright")}</span>
      </div>
    </footer>
  );
}
