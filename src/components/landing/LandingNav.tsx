"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/intl-client-provider";
import { LandingUserMenu } from "./LandingUserMenu";

export function LandingNav() {
  const { data: session } = useSession();
  const t = useTranslations("landing.nav");
  const { locale, setLocale } = useAppLocale();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card/95 text-card-foreground shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
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
            {t("brand")}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/#features"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("features")}
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/#quickstart"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("quickstart")}
          </Link>
          <span className="text-border">·</span>
          <a
            href="https://bitmacro.io/relay-manager/docs"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("docs")}
          </a>
          <span className="text-border">·</span>
          <a
            href="https://github.com/bitmacro/relay-panel"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("github")}
          </a>
          <button
            type="button"
            onClick={() => setLocale(locale === "pt" ? "en" : "pt")}
            title={t("locale")}
            className="ml-1 h-8 px-2 rounded-md border border-border text-[11px] font-bold font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            {locale.toUpperCase()}
          </button>
          {session?.user ? (
            <LandingUserMenu user={session.user} />
          ) : (
            <Link
              href="/auth/signin?callbackUrl=%2Frelays"
              className="ml-4 px-4 py-2 bg-[#f7931a] text-black text-[13px] font-semibold rounded-md hover:bg-[#e07b10] transition-colors"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
