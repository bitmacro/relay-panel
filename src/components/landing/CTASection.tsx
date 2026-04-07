"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

export function CTASection() {
  const { data: session } = useSession();
  const t = useTranslations("landing.cta");
  const ctaHref = session?.user ? "/relays" : "/auth/signin";

  return (
    <section className="bg-secondary/40 px-4 py-16 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-1 text-center sm:px-0">
        <ScrollReveal>
          <h2 className="text-[24px] md:text-[28px] font-bold text-foreground mb-3">
            {t("title")}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p className="text-[15px] text-muted-foreground mb-8">{t("subtitle")}</p>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <Link
            href={ctaHref}
            className="inline-flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#f7931a] px-8 text-[15px] font-semibold text-black glow-orange transition-all duration-300 hover:glow-orange-strong hover:scale-[1.02] touch-manipulation sm:inline-flex sm:w-auto sm:min-h-0 sm:py-3.5"
          >
            {t("button")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
