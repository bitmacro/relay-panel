"use client";

import type { User } from "next-auth";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TopNavControls } from "./TopNavControls";

interface TopNavProps {
  user: User | null;
}

export function TopNav({ user }: TopNavProps) {
  const t = useTranslations("nav");

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-3 sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <Image
          src="/bitmacro-logo.png"
          alt="BitMacro"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
        <span className="text-[15px] font-semibold tracking-tight">{t("title")}</span>
      </div>
      <span className="text-[11px] text-muted-foreground font-mono ml-1">{t("domain")}</span>

      <div className="ml-auto">
        <TopNavControls user={user} />
      </div>
    </header>
  );
}
