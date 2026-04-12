"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAppLocale } from "@/components/intl-client-provider";
import { localeShortLabel, nextLocale } from "@/lib/locale-ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LandingUserMenu } from "./LandingUserMenu";

const desktopLink =
  "inline-flex min-h-10 items-center rounded-md px-3 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors";

const sheetLink =
  "flex min-h-11 items-center rounded-md px-3 text-[14px] text-foreground hover:bg-secondary transition-colors";

export function LandingNav() {
  const { data: session } = useSession();
  const t = useTranslations("landing.nav");
  const { locale, setLocale } = useAppLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card/95 text-card-foreground shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 shrink-0 touch-manipulation">
          <Image
            src="/bitmacro-logo.png"
            alt="BitMacro"
            width={28}
            height={28}
            className="w-7 h-7 shrink-0 object-contain"
          />
          <span className="text-[14px] font-semibold tracking-tight truncate sm:text-[15px]">
            {t("brand")}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          <Link href="/#features" className={desktopLink}>
            {t("features")}
          </Link>
          <span className="text-border px-0.5 select-none" aria-hidden>
            ·
          </span>
          <Link href="/#quickstart" className={desktopLink}>
            {t("quickstart")}
          </Link>
          <span className="text-border px-0.5 select-none" aria-hidden>
            ·
          </span>
          <a
            href="https://bitmacro.io/relay-manager/docs"
            target="_blank"
            rel="noreferrer"
            className={desktopLink}
          >
            {t("docs")}
          </a>
          <span className="text-border px-0.5 select-none" aria-hidden>
            ·
          </span>
          <a
            href="https://github.com/bitmacro/relay-panel"
            target="_blank"
            rel="noreferrer"
            className={desktopLink}
          >
            {t("github")}
          </a>
          <button
            type="button"
            onClick={() => setLocale(nextLocale(locale))}
            title={t("locale")}
            className="ml-1 inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-border text-[11px] font-bold font-mono text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors touch-manipulation"
          >
            {localeShortLabel(locale)}
          </button>
          {session?.user ? (
            <LandingUserMenu user={session.user} />
          ) : (
            <Link
              href="/auth/signin?callbackUrl=%2Frelays"
              className="ml-3 inline-flex min-h-10 items-center justify-center rounded-md bg-[#f7931a] px-4 text-[13px] font-semibold text-black transition-colors hover:bg-[#e07b10] touch-manipulation"
            >
              {t("signIn")}
            </Link>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {session?.user ? (
            <LandingUserMenu user={session.user} />
          ) : (
            <Link
              href="/auth/signin?callbackUrl=%2Frelays"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f7931a] px-3 text-[13px] font-semibold text-black hover:bg-[#e07b10] transition-colors touch-manipulation"
            >
              {t("signIn")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors touch-manipulation"
            aria-label={t("openMenu")}
            aria-expanded={menuOpen}
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
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className="flex w-[min(100vw,20rem)] flex-col gap-0 border-l border-border p-0 sm:max-w-xs"
        >
          <SheetHeader className="space-y-0 border-b border-border px-4 py-3 text-left shrink-0">
            <SheetTitle className="text-left text-base">{t("menuTitle")}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-1 flex-col overflow-y-auto py-2" aria-label={t("menuTitle")}>
            <Link href="/#features" className={sheetLink} onClick={closeMenu}>
              {t("features")}
            </Link>
            <Link href="/#quickstart" className={sheetLink} onClick={closeMenu}>
              {t("quickstart")}
            </Link>
            <a
              href="https://bitmacro.io/relay-manager/docs"
              target="_blank"
              rel="noreferrer"
              className={sheetLink}
              onClick={closeMenu}
            >
              {t("docs")}
            </a>
            <a
              href="https://github.com/bitmacro/relay-panel"
              target="_blank"
              rel="noreferrer"
              className={sheetLink}
              onClick={closeMenu}
            >
              {t("github")}
            </a>
          </nav>
          <div className="border-t border-border p-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setLocale(nextLocale(locale));
              }}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-border px-3 text-[13px] hover:bg-secondary transition-colors touch-manipulation"
            >
              <span className="text-muted-foreground">{t("locale")}</span>
              <span className="text-[11px] font-bold font-mono tabular-nums">
                {localeShortLabel(locale)}
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
