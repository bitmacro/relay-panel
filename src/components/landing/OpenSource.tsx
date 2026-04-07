"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

export function OpenSource() {
  const t = useTranslations("landing.opensource");

  return (
    <section className="section-glow-divider relative px-4 py-16 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            {t("title")}
          </h2>
        </ScrollReveal>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <ScrollReveal delay={0}>
            <div className="glass-card rounded-2xl border border-border p-4 elevation-1 card-hover-lift sm:p-6">
              <h3 className="text-[16px] font-semibold text-foreground mb-4">relay-agent</h3>
              <div className="text-[12px] font-mono text-muted-foreground mb-2">MIT License</div>
              <code className="text-[12px] font-mono text-foreground block mb-4">
                npx @bitmacro/relay-agent
              </code>
              <p className="text-[12px] text-muted-foreground mb-4">{t("agentMeta")}</p>
              <Link
                href="https://github.com/bitmacro/relay-agent"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center text-[13px] text-[#f7931a] hover:underline touch-manipulation sm:min-h-0"
              >
                {t("gh")}
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="glass-card rounded-2xl border border-border p-4 elevation-1 card-hover-lift sm:p-6">
              <h3 className="text-[16px] font-semibold text-foreground mb-4">relay-panel</h3>
              <div className="text-[12px] font-mono text-muted-foreground mb-2">BSL 1.1</div>
              <code className="text-[12px] font-mono text-foreground block mb-4">
                relay-panel.bitmacro.io
              </code>
              <p className="text-[12px] text-muted-foreground mb-4">{t("panelMeta")}</p>
              <Link
                href="https://github.com/bitmacro/relay-panel"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center text-[13px] text-[#f7931a] hover:underline touch-manipulation sm:min-h-0"
              >
                {t("gh")}
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="glass-card rounded-2xl border border-border p-4 elevation-1 card-hover-lift sm:col-span-2 sm:p-6 lg:col-span-1">
              <h3 className="text-[16px] font-semibold text-foreground mb-4">@bitmacro/relay-connect</h3>
              <div className="text-[12px] font-mono text-muted-foreground mb-2">MIT License</div>
              <code className="text-[12px] font-mono text-foreground block mb-4 break-all">
                npm install @bitmacro/relay-connect
              </code>
              <p className="text-[12px] text-muted-foreground mb-4">{t("connectMeta")}</p>
              <Link
                href="https://github.com/bitmacro/relay-connect"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center text-[13px] text-[#f7931a] hover:underline touch-manipulation sm:min-h-0"
              >
                {t("gh")}
              </Link>
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={120}>
          <div className="glass-card mx-auto mb-8 max-w-3xl rounded-2xl border border-border elevation-1 p-4 sm:p-6">
            <h3 className="text-[15px] font-semibold text-foreground mb-3 text-center">
              {t("docsTitle")}
            </h3>
            <ul className="text-[13px] text-muted-foreground space-y-3 leading-relaxed">
              <li>
                <span className="text-foreground font-medium">{t("docsLi1a")} </span>
                {t("docsLi1b")}{" "}
                <Link
                  href="https://github.com/bitmacro/relay-panel#architecture"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f7931a] hover:underline underline-offset-2"
                >
                  {t("docsLinkPanel")}
                </Link>
                .
              </li>
              <li>
                <span className="text-foreground font-medium">{t("docsLi2a")} </span>
                {t("docsLi2b")}{" "}
                <Link
                  href="https://bitmacro.io/relay-manager/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f7931a] hover:underline underline-offset-2"
                >
                  bitmacro.io/relay-manager/docs
                </Link>
                {t("docsLi2c")}{" "}
                <span className="text-foreground">{t("nip")}</span>.
              </li>
            </ul>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <p className="text-center text-[13px] text-muted-foreground max-w-2xl mx-auto">
            {t("footer")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
