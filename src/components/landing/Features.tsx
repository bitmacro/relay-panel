"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

const ICONS = ["📊", "🛡", "⚡", "🔄", "🔌", "🔑"] as const;

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section
      id="features"
      className="py-20 md:py-28 px-6 scroll-mt-20 section-glow-divider relative"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            {t("title")}
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n, i) => (
            <ScrollReveal key={n} delay={i * 60}>
              <div className="group glass-card rounded-2xl p-6 elevation-1 card-hover-lift relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#f7931a]/10 to-transparent opacity-0 transition-opacity duration-400 card-hover-accent" />
                <span className="text-2xl mb-3 block card-hover-scale transition-transform duration-300">
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
