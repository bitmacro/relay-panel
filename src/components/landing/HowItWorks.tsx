export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mb-14 text-center">
          Three components. One workflow.
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-4">
          {/* relay-agent */}
          <div className="flex-1 rounded-xl border border-border bg-card p-6 flex flex-col">
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
            <code className="mt-4 text-[11px] font-mono bg-secondary px-2 py-1 rounded block w-fit">
              npx @bitmacro/relay-agent
            </code>
          </div>

          {/* Arrow */}
          <div className="flex lg:flex-col items-center justify-center text-muted-foreground/50">
            <svg
              className="w-8 h-8 lg:w-6 lg:h-6 rotate-90 lg:rotate-0"
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

          {/* relay-api */}
          <div className="flex-1 rounded-xl border border-border bg-card p-6 flex flex-col">
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

          {/* Arrow */}
          <div className="flex lg:flex-col items-center justify-center text-muted-foreground/50">
            <svg
              className="w-8 h-8 lg:w-6 lg:h-6 rotate-90 lg:rotate-0"
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

          {/* relay-panel */}
          <div className="flex-1 rounded-xl border border-border bg-card p-6 flex flex-col">
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
        </div>
      </div>
    </section>
  );
}
