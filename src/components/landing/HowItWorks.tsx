import { ScrollReveal } from "./ScrollReveal";

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 px-6 section-glow-divider relative">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-14 text-center">
            Three components. One workflow.
          </h2>
        </ScrollReveal>

        <div className="relative flex flex-col lg:flex-row lg:items-stretch lg:justify-center gap-6 lg:gap-5 max-w-4xl mx-auto">
          {/* Backdrop glow */}
          <div className="absolute inset-0 -inset-x-8 top-1/2 -translate-y-1/2 h-32 bg-gradient-to-r from-transparent via-[#f7931a]/5 to-transparent pointer-events-none rounded-full blur-2xl" />

          <ScrollReveal delay={0}>
            <div className="relative flex-1 glass-card rounded-2xl border border-border p-6 flex flex-col elevation-1 card-hover-lift gradient-border-card min-w-0 hover:glow-orange transition-shadow duration-300">
              <div className="text-[13px] font-mono text-[#f7931a] mb-2">
                relay-agent
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mb-4">
                MIT License
              </div>
              <p className="text-[13px] text-muted-foreground mb-4">
                Node.js · strfry CLI
              </p>
              <p className="text-[12px] text-muted-foreground/80 mt-auto">
                Runs on your server
              </p>
              <code className="mt-4 text-[11px] font-mono bg-secondary/80 px-2 py-1 rounded block w-fit">
                npx @bitmacro/relay-agent
              </code>
            </div>
          </ScrollReveal>

          {/* Arrow */}
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
            <div className="relative flex-1 glass-card rounded-2xl border border-border p-6 flex flex-col elevation-1 card-hover-lift gradient-border-card min-w-0 hover:glow-orange transition-shadow duration-300">
              <div className="text-[13px] font-mono text-[#f7931a] mb-2">
                relay-api
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mb-4">
                Private
              </div>
              <p className="text-[13px] text-muted-foreground mb-4">
                Hono · Vercel · Supabase
              </p>
              <p className="text-[12px] text-muted-foreground/80 mt-auto">
                Central hub + proxy
              </p>
            </div>
          </ScrollReveal>

          {/* Arrow */}
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
            <div className="relative flex-1 glass-card rounded-2xl border border-border p-6 flex flex-col elevation-1 card-hover-lift gradient-border-card min-w-0 hover:glow-orange transition-shadow duration-300">
              <div className="text-[13px] font-mono text-[#f7931a] mb-2">
                relay-panel
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mb-4">
                BSL 1.1
              </div>
              <p className="text-[13px] text-muted-foreground mb-4">
                Next.js · Vercel
              </p>
              <p className="text-[12px] text-muted-foreground/80 mt-auto">
                UI in the browser
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
