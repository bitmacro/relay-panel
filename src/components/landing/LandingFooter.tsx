import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card px-6 py-8">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Image
            src="/bitmacro-logo.png"
            alt="BitMacro"
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
          <span className="text-[13px] font-medium">Relay Manager</span>
          <span className="text-border">·</span>
          <span className="text-[11px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded">
            v0.2.2
          </span>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
          <Link
            href="https://github.com/bitmacro/relay-panel"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            relay-panel ↗
          </Link>
          <Link
            href="https://github.com/bitmacro/relay-agent"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            relay-agent ↗
          </Link>
          <span>© 2026 BitMacro</span>
        </div>
      </div>
    </footer>
  );
}
