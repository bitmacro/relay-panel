"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import type { User } from "next-auth";
import { UserMenu } from "./UserMenu";
import { useAppLocale } from "@/components/intl-client-provider";

interface TopNavControlsProps {
  user: User | null;
}

export function TopNavControls({ user }: TopNavControlsProps) {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useAppLocale();
  const t = useTranslations("nav");

  const isDark = theme === "dark";

  function toggleLocale() {
    setLocale(locale === "pt" ? "en" : "pt");
  }

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={t("toggleTheme")}
        className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-muted-foreground/30 transition-colors text-[15px]"
      >
        {isDark ? "🌙" : "☀️"}
      </button>

      <button
        type="button"
        onClick={toggleLocale}
        title={t("toggleLang")}
        className="hidden md:inline-flex h-9 px-2.5 items-center justify-center rounded-md border border-border text-[11px] font-bold font-mono text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-muted-foreground/30 transition-colors"
      >
        {locale.toUpperCase()}
      </button>

      {user && (
        <UserMenu user={user} isDark={isDark} onThemeToggle={() => setTheme(isDark ? "light" : "dark")} />
      )}
    </div>
  );
}
