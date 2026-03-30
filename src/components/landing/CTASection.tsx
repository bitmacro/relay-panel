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
    <section className="py-20 md:py-28 px-6 bg-secondary/40">
      <div className="mx-auto max-w-2xl text-center">
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
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f7931a] text-black text-[15px] font-semibold rounded-xl glow-orange hover:glow-orange-strong transition-all duration-300 hover:scale-[1.02]"
          >
            {t("button")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
