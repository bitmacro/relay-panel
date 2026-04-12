"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

const ICONS = ["📊", "🛡", "⚡", "🔄", "🔌", "🔑"] as const;

/** Colored wells aligned with feature tone (dashboard · access · LN · multi · agnostic · auth) */
const ICON_WELLS = [
  "bg-gradient-to-br from-emerald-500/30 to-emerald-800/10 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-emerald-400/35",
  "bg-gradient-to-br from-blue-500/35 to-indigo-800/15 text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-blue-400/40",
  "bg-gradient-to-br from-amber-500/30 to-orange-800/10 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-amber-400/35",
  "bg-gradient-to-br from-cyan-500/25 to-teal-800/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-cyan-400/30",
  "bg-gradient-to-br from-zinc-500/35 to-zinc-800/15 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-zinc-500/40",
  "bg-gradient-to-br from-orange-500/30 to-[#f7931a]/20 text-orange-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-orange-400/35",
] as const;

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section
      id="features"
      className="scroll-mt-[5.5rem] section-glow-divider relative px-4 py-16 sm:px-6 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            {t("title")}
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n, i) => (
            <ScrollReveal key={n} delay={i * 60}>
              <div className="group glass-card relative overflow-hidden rounded-2xl p-5 elevation-1 card-hover-lift sm:p-6">
                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#f7931a]/10 to-transparent opacity-0 transition-opacity duration-400 card-hover-accent" />
                <span
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl leading-none card-hover-scale transition-transform duration-300 ${ICON_WELLS[i]}`}
                  aria-hidden
                >
                  {ICONS[i]}
                </span>
                <h3 className="text-[15px] font-semibold text-foreground mb-1 card-hover-text transition-colors duration-300">
                  {t(`f${n}t` as "f1t")}
                </h3>
                <p className="text-[13px] text-muted-foreground relative">{t(`f${n}d` as "f1d")}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
