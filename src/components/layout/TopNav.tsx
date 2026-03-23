import type { User } from "next-auth";
import { TopNavControls } from "./TopNavControls";

interface TopNavProps {
  user: User | null;
}

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-3 sticky top-0 z-50 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-[#f7931a] rounded-lg flex items-center justify-center font-bold text-[15px] text-black font-mono">
          B
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          BitMacro Relay Manager
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground font-mono ml-1">
        relay-panel.bitmacro.io
      </span>

      <div className="ml-auto">
        <TopNavControls user={user} />
      </div>
    </header>
  );
}
