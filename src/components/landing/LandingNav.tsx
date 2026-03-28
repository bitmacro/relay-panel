import Image from "next/image";
import Link from "next/link";

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 glass-card-strong border-b border-border">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/bitmacro-logo.png"
            alt="BitMacro"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
          <span className="text-[15px] font-semibold tracking-tight">
            Relay Manager
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/#features"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/#quickstart"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Quick start
          </Link>
          <span className="text-border">·</span>
          <a
            href="https://bitmacro.io/relay-manager/docs"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Stack docs ↗
          </a>
          <span className="text-border">·</span>
          <Link
            href="https://github.com/bitmacro/relay-panel"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="/auth/signin"
            className="ml-4 px-4 py-2 bg-[#f7931a] text-black text-[13px] font-semibold rounded-md hover:bg-[#e07b10] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
