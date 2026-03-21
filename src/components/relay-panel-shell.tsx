"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { DashboardContent } from "./dashboard-content";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
}

interface RelayPanelShellProps {
  user: User | null;
  relays: Relay[];
  providerUserId?: string | null;
}

export function RelayPanelShell({
  user,
  relays,
  providerUserId,
}: RelayPanelShellProps) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e2e2e2]">
      <div className="mx-auto max-w-[900px] rounded-xl border border-[#2a2a2a] bg-[#141414] p-0 shadow-xl">
        {/* Topbar */}
        <div className="flex items-center gap-3 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5">
          <span className="text-[13px] font-semibold tracking-wide text-[#f0f0f0]">
            Bit<span className="text-[#f7931a]">Macro</span> Relay Manager
          </span>
          <span className="ml-2 text-[11px] text-[#444]">
            {typeof window !== "undefined"
              ? window.location.hostname
              : "relay-panel.bitmacro.io"}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="h-[7px] w-[7px] rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <span className="text-[11px] text-[#666]">online</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="rounded-md border border-[#333] px-3 py-1.5 text-xs text-[#888] transition-colors hover:bg-[#252525] hover:text-[#ccc]"
            >
              Sign out
            </button>
          </div>
        </div>
        <DashboardContent
          relays={relays}
          providerUserId={providerUserId}
          user={user}
        />
      </div>
    </div>
  );
}
