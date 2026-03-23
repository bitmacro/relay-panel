import { ScrollReveal } from "./ScrollReveal";

const FEATURES = [
  {
    icon: "📊",
    title: "Visual Dashboard",
    desc: "Events, DB size, uptime, activity by kind",
  },
  {
    icon: "🛡",
    title: "Access Control",
    desc: "Whitelist/blocklist with toggle, no SSH needed",
  },
  {
    icon: "⚡",
    title: "Lightning Payments",
    desc: "Automatic access after payment, LNbits webhook",
  },
  {
    icon: "🔄",
    title: "Multi-relay",
    desc: "Manage N relays from one agent instance",
  },
  {
    icon: "🔌",
    title: "Relay-agnostic",
    desc: "Works with strfry (nostr-rs-relay coming soon)",
  },
  {
    icon: "🔑",
    title: "GitHub Auth",
    desc: "NextAuth.js v5, no passwords",
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      className="py-20 md:py-28 px-6 scroll-mt-20 section-glow-divider relative"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            Everything you need to run a relay
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="group glass-card rounded-2xl p-6 elevation-1 card-hover-lift relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#f7931a]/10 to-transparent opacity-0 transition-opacity duration-400 card-hover-accent" />
                <span className="text-2xl mb-3 block card-hover-scale transition-transform duration-300">
                  {f.icon}
                </span>
                <h3 className="text-[15px] font-semibold text-foreground mb-1 card-hover-text transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-[13px] text-muted-foreground relative">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
