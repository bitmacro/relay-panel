import { ScrollReveal } from "./ScrollReveal";

export function QuickStart() {
  return (
    <section id="quickstart" className="py-20 md:py-28 px-6 scroll-mt-20 section-glow-divider relative">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            Up and running in 3 steps
          </h2>
        </ScrollReveal>

        <div className="space-y-8">
          <ScrollReveal delay={0}>
            <div className="glass-card rounded-2xl p-6 border border-border elevation-1 card-hover-lift">
              <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Step 1 — Install the agent
              </div>
              <pre className="p-4 rounded-lg bg-secondary/80 border border-border overflow-x-auto text-[13px] font-mono text-foreground">
{`npx @bitmacro/relay-agent
# or
docker pull ghcr.io/bitmacro/relay-agent`}
              </pre>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="glass-card rounded-2xl p-6 border border-border elevation-1 card-hover-lift">
              <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Step 2 — Configure RELAY_INSTANCES
              </div>
              <pre className="p-4 rounded-lg bg-secondary/80 border border-border overflow-x-auto text-[13px] font-mono text-foreground">
{`[
  { "id": "public", "token": "your-token", "strfryConfig": "/etc/strfry.conf" }
]`}
              </pre>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <div className="glass-card rounded-2xl p-6 border border-border elevation-1 card-hover-lift">
              <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Step 3 — Sign in at{" "}
                <span className="text-foreground font-mono">
                  relay-panel.bitmacro.io
                </span>{" "}
                and add your relay endpoint
              </div>
              <p className="text-[13px] text-muted-foreground">
                Create a relay in the panel, paste your agent URL and token. Done.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
