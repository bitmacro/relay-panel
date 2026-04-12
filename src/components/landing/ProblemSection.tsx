"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

const ACCENTS = [
  "from-orange-500/10",
  "from-blue-500/10",
  "from-red-500/10",
  "from-amber-500/10",
] as const;

/** Emoji + colored well (terminal · CLI · trash · paid relay) */
const ICONS = ["🖥", "🔍", "🗑", "💰"] as const;

const ICON_WELLS = [
  "bg-gradient-to-br from-sky-500/30 to-sky-600/10 text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-sky-400/35",
  "bg-gradient-to-br from-violet-500/30 to-violet-600/10 text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-violet-400/35",
  "bg-gradient-to-br from-rose-500/30 to-rose-700/10 text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-rose-400/35",
  "bg-gradient-to-br from-amber-500/30 to-amber-700/10 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-amber-400/35",
] as const;

export function ProblemSection() {
  const t = useTranslations("landing.problem");

  return (
    <section
      id="problem"
      className="scroll-mt-[5.5rem] section-glow-divider relative px-4 py-16 sm:px-6 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            {t("title")}
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="group relative glass-card flex items-start gap-4 overflow-hidden rounded-2xl p-5 elevation-1 card-hover-lift sm:p-6">
                <div
                  className={`absolute top-0 left-0 w-full h-20 bg-gradient-to-b ${ACCENTS[i]} to-transparent opacity-0 transition-opacity duration-400 card-hover-accent`}
                />
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl leading-none card-hover-scale transition-transform duration-300 ${ICON_WELLS[i]}`}
                  aria-hidden
                >
                  {ICONS[i]}
                </span>
                <p className="text-[14px] text-muted-foreground leading-relaxed relative">
                  {t(`p${i + 1}` as "p1")}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={200}>
          <p className="text-center text-[15px] text-muted-foreground mt-10 font-medium">
            {t("footerA")}{" "}
            <span className="text-foreground">{t("footerB")}</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
