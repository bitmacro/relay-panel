"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import type { User } from "next-auth";
import { NewRelayModal } from "@/components/relays/NewRelayModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { useTheme } from "@/components/theme-provider";
import { useAppLocale } from "@/components/intl-client-provider";
import { localeShortLabel, nextLocale } from "@/lib/locale-ui";
import { cn } from "@/lib/utils";

export interface SidebarRelay {
  id: string;
  name: string | null;
  color?: string | null;
}

interface SidebarNavContentProps {
  relays: SidebarRelay[];
  onNavLinkClick?: () => void;
  onOpenNewRelay: () => void;
}

function SidebarNavContent({
  relays,
  onNavLinkClick,
  onOpenNewRelay,
}: SidebarNavContentProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const isRelaysActive = pathname === "/relays" || pathname === "/onboarding";

  return (
    <>
      <div className="px-3 mb-1">
        <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em] px-2 mb-1.5">
          {t("general")}
        </div>
        <Link
          href="/relays"
          onClick={() => onNavLinkClick?.()}
          className={cn(
            "flex items-center gap-2.5 px-2 py-2.5 min-h-11 rounded-md text-[13px] transition-colors",
            isRelaysActive
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <svg
            className="w-4 h-4 shrink-0 opacity-70"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
          >
            <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z" />
          </svg>
          {t("relays")}
        </Link>
      </div>

      <div className="h-px bg-border mx-3 my-3 shrink-0" />

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
                onClick={() => onNavLinkClick?.()}
                className={cn(
                  "flex items-center gap-2 px-2 py-2.5 min-h-11 rounded-md text-[12px] transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
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

      <div className="h-px bg-border mx-3 my-3 shrink-0" />

      <div className="px-3 shrink-0">
        <button
          type="button"
          onClick={() => onOpenNewRelay()}
          className="flex items-center gap-2.5 px-2 py-2.5 min-h-11 rounded-md text-[13px] transition-colors w-full text-left text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <svg
            className="w-4 h-4 shrink-0 opacity-70"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7 7V2h2v5h5v2H9v5H7V9H2V7h5z" />
          </svg>
          {t("newRelay")}
        </button>
      </div>
    </>
  );
}

function MobileDrawerPreferences() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useAppLocale();
  const t = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const isDark = theme === "dark";

  return (
    <div className="border-t border-border p-3 shrink-0 space-y-2 bg-card">
      <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em] px-2">
        {tSidebar("appearance")}
      </div>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex w-full min-h-11 items-center justify-between gap-3 rounded-md border border-border px-3 text-[13px] text-foreground hover:bg-secondary transition-colors"
      >
        <span className="text-muted-foreground">{t("toggleTheme")}</span>
        <span className="text-[15px] shrink-0" aria-hidden>
          {isDark ? "🌙" : "☀️"}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setLocale(nextLocale(locale))}
        className="flex w-full min-h-11 items-center justify-between gap-3 rounded-md border border-border px-3 text-[13px] text-foreground hover:bg-secondary transition-colors"
      >
        <span className="text-muted-foreground">{t("toggleLang")}</span>
        <span className="text-[11px] font-bold font-mono tabular-nums">
          {localeShortLabel(locale)}
        </span>
      </button>
    </div>
  );
}

function MobileRelayQuickNav({ relays }: { relays: SidebarRelay[] }) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  if (relays.length === 0) return null;

  const show =
    pathname === "/relays" ||
    pathname.startsWith("/relays/") ||
    pathname === "/onboarding";
  if (!show) return null;

  return (
    <div className="md:hidden border-b border-border bg-card/95 shrink-0 backdrop-blur-sm">
      <div
        className={cn(
          "flex gap-2 overflow-x-auto px-3 py-2",
          "[scrollbar-width:thin]",
          "touch-pan-x"
        )}
      >
        <Link
          href="/relays"
          className={cn(
            "shrink-0 inline-flex items-center gap-2 rounded-full border px-3 min-h-11 text-[12px] transition-colors",
            pathname === "/relays" || pathname === "/onboarding"
              ? "border-[#f7931a] bg-muted text-foreground font-medium"
              : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {t("relays")}
        </Link>
        {relays.map((relay) => {
          const href = `/relays/${relay.id}`;
          const active = pathname === href;
          const color = relay.color ?? "#8892a4";
          return (
            <Link
              key={relay.id}
              href={href}
              className={cn(
                "shrink-0 inline-flex items-center gap-2 rounded-full border px-3 min-h-11 max-w-[200px] text-[12px] transition-colors",
                active
                  ? "border-[#f7931a] bg-muted text-foreground font-medium"
                  : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{relay.name ?? relay.id}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface SidebarProps {
  relays: SidebarRelay[];
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ relays, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const tNav = useTranslations("nav");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    function onChange() {
      if (mq.matches) onMobileOpenChange(false);
    }
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [onMobileOpenChange]);

  function openNewRelay() {
    setShowModal(true);
    onMobileOpenChange(false);
  }

  return (
    <>
      <aside className="hidden md:flex w-[220px] shrink-0 bg-card border-r border-border flex-col py-5">
        <SidebarNavContent
          relays={relays}
          onOpenNewRelay={() => setShowModal(true)}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="flex h-full w-[min(100vw,20rem)] max-w-[min(100vw,20rem)] flex-col gap-0 border-r border-border p-0 sm:max-w-xs"
        >
          <SheetHeader className="border-b border-border px-4 py-3 text-left space-y-0 shrink-0">
            <SheetTitle className="text-left">{tNav("menuTitle")}</SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col py-3">
            <SidebarNavContent
              relays={relays}
              onNavLinkClick={() => onMobileOpenChange(false)}
              onOpenNewRelay={openNewRelay}
            />
          </div>
          <MobileDrawerPreferences />
        </SheetContent>
      </Sheet>

      {showModal && <NewRelayModal onClose={() => setShowModal(false)} />}
    </>
  );
}

interface AppShellRelay extends SidebarRelay {
  endpoint?: string | null;
}

interface AppShellClientProps {
  children: React.ReactNode;
  relays: AppShellRelay[];
  user: User | null;
  panelVersion: string;
  relayIdsForHealth: string[];
}

/** Client shell: top nav, mobile drawer nav, sidebar (desktop), main, footer. */
export function AppShellClient({
  children,
  relays,
  user,
  panelVersion,
  relayIdsForHealth,
}: AppShellClientProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav user={user} onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileRelayQuickNav relays={relays} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          relays={relays}
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
          {children}
        </main>
      </div>
      <Footer
        panelVersion={panelVersion}
        relayIdsForHealth={relayIdsForHealth}
      />
    </div>
  );
}
