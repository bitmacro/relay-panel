const PAIN_POINTS = [
  {
    icon: "🖥",
    text: "Managing whitelists via bash scripts in the terminal",
  },
  {
    icon: "🔍",
    text: "Inspecting events with CLI (strfry scan, nak req)",
  },
  {
    icon: "🗑",
    text: "Deleting spam manually by event ID",
  },
  {
    icon: "💰",
    text: "Implementing paid relay with custom code per installation",
  },
] as const;

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="py-20 md:py-28 px-6 bg-secondary/30 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
          Running a Nostr relay today means...
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PAIN_POINTS.map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border bg-card flex items-start gap-4"
            >
              <span className="text-2xl shrink-0">{item.icon}</span>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-[15px] text-muted-foreground mt-10 font-medium">
          No visual tool exists for this. <span className="text-foreground">Until now.</span>
        </p>
      </div>
    </section>
  );
}
