"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

export function HowItWorks() {
  const t = useTranslations("landing.how");

  return (
    <section className="section-glow-divider relative px-4 py-16 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-14 text-center">
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="relative flex flex-col lg:flex-row lg:items-stretch lg:justify-center gap-6 lg:gap-5 max-w-4xl mx-auto">
          <div className="absolute inset-0 -inset-x-8 top-1/2 -translate-y-1/2 h-32 bg-gradient-to-r from-transparent via-[#f7931a]/5 to-transparent pointer-events-none rounded-full blur-2xl" />

          <ScrollReveal delay={0}>
            <div className="relative flex-1 glass-card flex min-w-0 flex-col rounded-2xl border border-border p-4 elevation-1 card-hover-lift gradient-border-card sm:p-6 hover:glow-orange transition-shadow duration-300">
              <div className="text-[13px] font-mono text-[#f7931a] mb-2">{t("agentTag")}</div>
              <div className="text-[11px] font-mono text-muted-foreground mb-4">{t("mit")}</div>
              <p className="text-[13px] text-muted-foreground mb-4">{t("agentStack")}</p>
              <p className="text-[12px] text-muted-foreground/80 mt-auto">{t("agentRuns")}</p>
              <code className="mt-4 text-[11px] font-mono bg-secondary/80 px-2 py-1 rounded block w-fit">
                npx @bitmacro/relay-agent
              </code>
            </div>
          </ScrollReveal>

          <div className="flex lg:flex-col items-center justify-center text-muted-foreground/50 group/arrow">
            <svg
              className="w-8 h-8 lg:w-6 lg:h-6 rotate-90 lg:rotate-0 transition-colors duration-300 group-hover/arrow:text-[#f7931a]/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          <ScrollReveal delay={100}>
            <div className="relative flex-1 glass-card flex min-w-0 flex-col rounded-2xl border border-border p-4 elevation-1 card-hover-lift gradient-border-card sm:p-6 hover:glow-orange transition-shadow duration-300">
              <div className="text-[13px] font-mono text-[#f7931a] mb-2">{t("apiTag")}</div>
              <div className="text-[11px] font-mono text-muted-foreground mb-4">{t("apiProtocol")}</div>
              <p className="text-[13px] text-muted-foreground mb-4">{t("apiStack")}</p>
              <p className="text-[12px] text-muted-foreground/80 mt-auto whitespace-pre-line">
                {t("apiRole")}
              </p>
            </div>
          </ScrollReveal>

          <div className="flex lg:flex-col items-center justify-center text-muted-foreground/50 group/arrow">
            <svg
              className="w-8 h-8 lg:w-6 lg:h-6 rotate-90 lg:rotate-0 transition-colors duration-300 group-hover/arrow:text-[#f7931a]/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          <ScrollReveal delay={200}>
            <div className="relative flex-1 glass-card flex min-w-0 flex-col rounded-2xl border border-border p-4 elevation-1 card-hover-lift gradient-border-card sm:p-6 hover:glow-orange transition-shadow duration-300">
              <div className="text-[13px] font-mono text-[#f7931a] mb-2">{t("panelTag")}</div>
              <div className="text-[11px] font-mono text-muted-foreground mb-4">{t("bsl")}</div>
              <p className="text-[13px] text-muted-foreground mb-4">{t("panelStack")}</p>
              <p className="text-[12px] text-muted-foreground/80 mt-auto">{t("panelRole")}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
