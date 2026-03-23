import Link from "next/link";

export function OpenSource() {
  return (
    <section className="py-20 md:py-28 px-6 bg-secondary/30">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-12 text-center">
          Open Source at the core
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">
              relay-agent
            </h3>
            <div className="text-[12px] font-mono text-muted-foreground mb-2">
              MIT License
            </div>
            <code className="text-[12px] font-mono text-foreground block mb-4">
              npx @bitmacro/relay-agent
            </code>
            <p className="text-[12px] text-muted-foreground mb-4">
              CI · npm · Docker
            </p>
            <Link
              href="https://github.com/bitmacro/relay-agent"
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[#f7931a] hover:underline"
            >
              GitHub →
            </Link>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">
              relay-panel
            </h3>
            <div className="text-[12px] font-mono text-muted-foreground mb-2">
              BSL 1.1
            </div>
            <code className="text-[12px] font-mono text-foreground block mb-4">
              relay-panel.bitmacro.io
            </code>
            <p className="text-[12px] text-muted-foreground mb-4">
              CI · Next.js · v0.2.1
            </p>
            <Link
              href="https://github.com/bitmacro/relay-panel"
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[#f7931a] hover:underline"
            >
              GitHub →
            </Link>
          </div>
        </div>
        <p className="text-center text-[13px] text-muted-foreground max-w-2xl mx-auto">
          relay-agent is MIT — install it, fork it, contribute. relay-panel
          source is visible under BSL 1.1.
        </p>
      </div>
    </section>
  );
}
