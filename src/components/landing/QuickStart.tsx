"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

export function QuickStart() {
  const t = useTranslations("landing.quickstart");

  return (
    <section
      id="quickstart"
      className="scroll-mt-[5.5rem] section-glow-divider relative px-4 py-16 sm:px-6 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="space-y-8">
          <ScrollReveal delay={0}>
            <div className="glass-card rounded-2xl border border-border p-4 elevation-1 card-hover-lift sm:p-6">
              <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t("s1")}
              </div>
              <pre className="rounded-lg border border-border bg-secondary/80 p-3 text-[12px] font-mono text-foreground overflow-x-auto sm:p-4 sm:text-[13px] [-webkit-overflow-scrolling:touch]">
{`npx @bitmacro/relay-agent
# or
docker pull ghcr.io/bitmacro/relay-agent`}
              </pre>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="glass-card rounded-2xl border border-border p-4 elevation-1 card-hover-lift sm:p-6">
              <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t("s2")}
              </div>
              <pre className="rounded-lg border border-border bg-secondary/80 p-3 text-[11px] font-mono text-foreground overflow-x-auto sm:p-4 sm:text-[13px] [-webkit-overflow-scrolling:touch]">
{`# RELAY_INSTANCES — JSON array, one entry per logical relay (e.g. public / private / paid).
# Each: id, token, strfryConfig, strfryDb, whitelistPath (see relay-agent README + compose).
# In strfry.conf use db = "./data/" and mount host nostr/<id>/data to match strfryDb.

[
  {"id":"public","token":"…","strfryConfig":"/app/nostr/public/strfry.conf","strfryDb":"/app/nostr/public/data","whitelistPath":"/app/nostr/public/whitelist.txt"},
  {"id":"private","token":"…","strfryConfig":"/app/nostr/private/strfry.conf","strfryDb":"/app/nostr/private/data","whitelistPath":"/app/nostr/private/whitelist.txt"},
  {"id":"paid","token":"…","strfryConfig":"/app/nostr/paid/strfry.conf","strfryDb":"/app/nostr/paid/data","whitelistPath":"/app/nostr/paid/whitelist.txt"}
]`}
              </pre>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <div className="glass-card rounded-2xl border border-border p-4 elevation-1 card-hover-lift sm:p-6">
              <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t("s3a")}{" "}
                <span className="text-foreground font-mono">relay-panel.bitmacro.io</span>{" "}
                {t("s3b")}
              </div>
              <p className="text-[13px] text-muted-foreground">{t("s3body")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 sm:p-6">
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("deeper")}
              </p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {t("deeperBodyA")}{" "}
                <strong className="text-foreground font-medium">{t("deeperBold")}</strong>{" "}
                {t("deeperBodyB")}{" "}
                <Link
                  href="https://github.com/bitmacro/relay-panel#architecture"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f7931a] hover:underline underline-offset-2"
                >
                  {t("deeperLinkReadme")}
                </Link>
                {t("deeperBodyC")}{" "}
                <Link
                  href="https://bitmacro.io/relay-manager/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f7931a] hover:underline underline-offset-2"
                >
                  {t("deeperLinkDocs")}
                </Link>
                {t("deeperEnd")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
