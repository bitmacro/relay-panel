"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

export function Hero() {
  const { data: session } = useSession();
  const t = useTranslations("landing.hero");
  const primaryHref = session?.user ? "/relays" : "/auth/signin";

  return (
    <section className="relative px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-24 md:pb-24 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <ScrollReveal>
              <div className="mb-4 space-y-1.5">
                <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-wider">
                  {t("kickerA")}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/75 uppercase tracking-wider sm:text-[11px]">
                  {t("kickerB")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-bold tracking-tight text-foreground leading-tight mb-4">
                {t("title")}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <p className="text-[15px] md:text-[16px] text-muted-foreground mb-8 max-w-xl leading-relaxed">
                {t("subtitle")}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={primaryHref}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#f7931a] px-5 text-[14px] font-semibold text-black glow-orange transition-all duration-300 hover:glow-orange-strong hover:scale-[1.02] touch-manipulation sm:min-h-0 sm:py-2.5"
                >
                  {t("ctaPrimary")}
                </Link>
                <Link
                  href="https://github.com/bitmacro/relay-panel"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 text-[14px] font-medium transition-colors hover:bg-secondary/50 touch-manipulation sm:min-h-0 sm:py-2.5"
                >
                  {t("ctaGithub")}
                </Link>
              </div>
              <p className="mt-4 text-[12px] text-muted-foreground max-w-xl leading-relaxed">
                <Link
                  href="https://bitmacro.io/relay-manager/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f7931a] hover:underline underline-offset-2"
                >
                  {t("docsLead")}
                </Link>
                {t("docsTrail")}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={120} direction="left" className="flex-1 mt-12 lg:mt-0">
            <div className="relative rounded-2xl border border-border overflow-hidden glass-card elevation-1 hover:elevation-2 transition-all duration-400 hover:border-[#f7931a]/30">
              <div className="aspect-[2/1] relative bg-secondary/50">
                <Image
                  src="/panel.png"
                  alt={t("imageAlt")}
                  fill
                  className="object-contain object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/40" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
