import type { User } from "next-auth";
import Image from "next/image";
import { TopNavControls } from "./TopNavControls";

interface TopNavProps {
  user: User | null;
}

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-3 sticky top-0 z-50 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <Image
          src="/bitmacro-logo.png"
          alt="BitMacro"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
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
