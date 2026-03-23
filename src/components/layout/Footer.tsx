export function Footer() {
  return (
    <footer className="bg-card border-t border-border px-7 py-3.5 flex items-center justify-between gap-3 flex-wrap shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-[18px] h-[18px] bg-[#f7931a] rounded flex items-center justify-center text-[9px] font-bold text-black font-mono">
            B
          </div>
          <span>BitMacro Relay Manager</span>
        </div>
        <span className="text-border">·</span>
        <span className="font-mono text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded">
          v0.2.1
        </span>
        <span className="text-border">·</span>
        <span>relay-panel.bitmacro.io</span>
      </div>
      <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground">
        <a
          href="https://github.com/bitmacro/relay-panel"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          relay-panel ↗
        </a>
        <a
          href="https://github.com/bitmacro/relay-agent"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          relay-agent ↗
        </a>
        <span className="text-border">·</span>
        <span>© 2026 BitMacro</span>
      </div>
    </footer>
  );
}
