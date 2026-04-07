"use client";

import type { User } from "next-auth";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TopNavControls } from "./TopNavControls";

interface TopNavProps {
  user: User | null;
  /** Opens the mobile navigation drawer (sidebar). */
  onOpenMobileNav?: () => void;
}

export function TopNav({ user, onOpenMobileNav }: TopNavProps) {
  const t = useTranslations("nav");

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 sm:px-6 gap-2 sm:gap-3 sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {onOpenMobileNav ? (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label={t("openMenu")}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        ) : null}
        <Image
          src="/bitmacro-logo.png"
          alt="BitMacro"
          width={32}
          height={32}
          className="w-8 h-8 object-contain shrink-0"
        />
        <span className="text-[15px] font-semibold tracking-tight truncate hidden sm:inline">
          {t("title")}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground font-mono ml-1 hidden md:inline shrink-0">
        {t("domain")}
      </span>

      <div className="ml-auto shrink-0">
        <TopNavControls user={user} />
      </div>
    </header>
  );
}
