"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { NewRelayModal } from "@/components/relays/NewRelayModal";

interface Relay {
  id: string;
  name: string | null;
  color?: string | null;
}

interface SidebarProps {
  relays: Relay[];
}

export function Sidebar({ relays }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const [showModal, setShowModal] = useState(false);

  const isRelaysActive = pathname === "/relays" || pathname === "/onboarding";

  return (
    <>
      <aside className="w-[220px] shrink-0 bg-card border-r border-border flex flex-col py-5 hidden md:flex">
        {/* Geral section */}
        <div className="px-3 mb-1">
          <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em] px-2 mb-1.5">
            {t("general")}
          </div>
          <Link
            href="/relays"
            className={`flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13px] transition-colors ${
              isRelaysActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <svg
              className="w-4 h-4 shrink-0 opacity-70"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z" />
            </svg>
            {t("relays")}
          </Link>
        </div>

        <div className="h-px bg-border mx-3 my-3" />

        {/* Relays ativos */}
        <div className="px-3 flex-1 min-h-0 overflow-y-auto">
          <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em] px-2 mb-2">
            {t("activeRelays")}
          </div>
          <div className="space-y-0.5">
            {relays.map((relay) => {
              const isActive = pathname === `/relays/${relay.id}`;
              const color = relay.color ?? "#8892a4";
              return (
                <Link
                  key={relay.id}
                  href={`/relays/${relay.id}`}
                  className={`flex items-center gap-2 px-2 py-[6px] rounded-md text-[12px] transition-colors ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {relay.name ?? relay.id}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_4px_#22c55e] shrink-0" />
                </Link>
              );
            })}
            {relays.length === 0 && (
              <div className="px-2 py-2 text-[12px] text-muted-foreground/40">
                {t("none")}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-border mx-3 my-3" />

        {/* Novo relay */}
        <div className="px-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13px] transition-colors w-full text-left text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <svg
              className="w-4 h-4 shrink-0 opacity-70"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M7 7V2h2v5h5v2H9v5H7V9H2V7h5z" />
            </svg>
            {t("newRelay")}
          </button>
        </div>
      </aside>

      {showModal && <NewRelayModal onClose={() => setShowModal(false)} />}
    </>
  );
}
