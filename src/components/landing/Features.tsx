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
      className="py-20 md:py-28 px-6 bg-secondary/30 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
          Everything you need to run a relay
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border bg-card hover:border-[#f7931a]/40 transition-colors"
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="text-[15px] font-semibold text-foreground mb-1">
                {f.title}
              </h3>
              <p className="text-[13px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
