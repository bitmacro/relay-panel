import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <ScrollReveal>
              <div className="mb-4 space-y-1.5">
                <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-wider">
                  relay-agent v0.2.0 · MIT · Open Source
                </p>
                <p className="text-[11px] font-mono text-muted-foreground/75 uppercase tracking-wider">
                  5-module ecosystem · relay-agent · relay-panel · relay-connect
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-bold tracking-tight text-foreground leading-tight mb-4">
                Manage your Nostr relay without touching the terminal
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <p className="text-[15px] md:text-[16px] text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Visual dashboard for relay operators — moderation, access control,
                Lightning payments and multi-relay management in one panel.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f7931a] text-black text-[14px] font-semibold rounded-lg glow-orange hover:glow-orange-strong transition-all duration-300 hover:scale-[1.02]"
                >
                  Start managing →
                </Link>
                <Link
                  href="https://github.com/bitmacro/relay-panel"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-[14px] font-medium rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  View on GitHub
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={120} direction="left" className="flex-1 mt-12 lg:mt-0">
            <div className="relative rounded-2xl border border-border overflow-hidden glass-card elevation-1 hover:elevation-2 transition-all duration-400 hover:border-[#f7931a]/30">
              <div className="aspect-[2/1] relative bg-secondary/50">
                <Image
                  src="/panel.png"
                  alt="BitMacro Relay Manager — Dashboard with relay table, sidebar and status badges"
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
