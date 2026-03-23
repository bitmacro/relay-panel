import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 px-6 bg-secondary/40">
      <div className="mx-auto max-w-2xl text-center">
        <ScrollReveal>
          <h2 className="text-[24px] md:text-[28px] font-bold text-foreground mb-3">
            Start managing your relay today
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p className="text-[15px] text-muted-foreground mb-8">
            Free for 1 relay. No credit card. Sign in with GitHub.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f7931a] text-black text-[15px] font-semibold rounded-xl glow-orange hover:glow-orange-strong transition-all duration-300 hover:scale-[1.02]"
          >
            Sign in with GitHub →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
