import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <p className="text-[12px] font-mono text-muted-foreground mb-4 uppercase tracking-wider">
              relay-agent v0.2.0 · MIT · Open Source
            </p>
            <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-bold tracking-tight text-foreground leading-tight mb-4">
              Manage your Nostr relay without touching the terminal
            </h1>
            <p className="text-[15px] md:text-[16px] text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Visual dashboard for relay operators — moderation, access control,
              Lightning payments and multi-relay management in one panel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f7931a] text-black text-[14px] font-semibold rounded-md hover:bg-[#e07b10] transition-colors"
              >
                Start managing →
              </Link>
              <Link
                href="https://github.com/bitmacro/relay-panel"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-[14px] font-medium rounded-md hover:bg-secondary transition-colors"
              >
                View on GitHub
              </Link>
            </div>
          </div>

          <div className="flex-1 mt-12 lg:mt-0">
            <div className="relative rounded-xl border border-border overflow-hidden bg-card shadow-2xl">
              {/* Placeholder for screenshot - replace with /screenshot-panel.png when available */}
              <div className="aspect-video flex items-center justify-center bg-secondary">
                <Image
                  src="/bitmacro-logo.png"
                  alt="Relay Manager Dashboard"
                  width={120}
                  height={120}
                  className="opacity-40 object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
