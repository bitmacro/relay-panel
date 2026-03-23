"use client";

import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import type { User } from "next-auth";
import { UserMenu } from "./UserMenu";

interface TopNavControlsProps {
  user: User | null;
}

export function TopNavControls({ user }: TopNavControlsProps) {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("PT");

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      {/* Theme toggle */}
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title="Alternar tema"
        className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-muted-foreground/30 transition-colors text-[15px]"
      >
        {isDark ? "🌙" : "☀️"}
      </button>

      {/* Language toggle */}
      <button
        type="button"
        onClick={() => setLang((l) => (l === "PT" ? "EN" : "PT"))}
        title="Idioma"
        className="h-8 px-2 flex items-center justify-center rounded-md border border-border text-[11px] font-bold font-mono text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-muted-foreground/30 transition-colors"
      >
        {lang}
      </button>

      {user && <UserMenu user={user} lang={lang} isDark={isDark} onThemeToggle={() => setTheme(isDark ? "light" : "dark")} onLangToggle={() => setLang((l) => (l === "PT" ? "EN" : "PT"))} />}
    </div>
  );
}
