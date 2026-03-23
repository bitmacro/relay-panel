import { ScrollReveal } from "./ScrollReveal";

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

const ACCENTS = [
  "from-orange-500/10",
  "from-blue-500/10",
  "from-red-500/10",
  "from-amber-500/10",
] as const;

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="py-20 md:py-28 px-6 scroll-mt-20 section-glow-divider relative"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
            Running a Nostr relay today means...
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-5">
          {PAIN_POINTS.map((item, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="group relative glass-card rounded-2xl p-6 elevation-1 card-hover-lift flex items-start gap-4 overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-full h-20 bg-gradient-to-b ${ACCENTS[i]} to-transparent opacity-0 transition-opacity duration-400 card-hover-accent`}
                />
                <span className="text-2xl shrink-0 card-hover-scale transition-transform duration-300 block">
                  {item.icon}
                </span>
                <p className="text-[14px] text-muted-foreground leading-relaxed relative">
                  {item.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={200}>
          <p className="text-center text-[15px] text-muted-foreground mt-10 font-medium">
            No visual tool exists for this.{" "}
            <span className="text-foreground">Until now.</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
