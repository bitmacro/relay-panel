"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { User } from "next-auth";
import { useAppLocale } from "@/components/intl-client-provider";
import type { AppLocale } from "@/lib/local-preferences";
import { ProfileSheet } from "@/components/layout/ProfileSheet";
import { HelpSheet } from "@/components/layout/HelpSheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  hexToNpubDisplay,
  truncateNpub,
  truncateNpubNav,
} from "@/lib/events-display";
import { useNostrPrefs } from "@/lib/use-nostr-prefs";

interface UserMenuProps {
  user: User;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function UserMenu({ user, isDark, onThemeToggle }: UserMenuProps) {
  const t = useTranslations("userMenu");
  const router = useRouter();
  const { locale, setLocale } = useAppLocale();
  const { hex: nostrHex } = useNostrPrefs();
  const langLabel = locale.toUpperCase();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleLocale() {
    const next: AppLocale = locale === "pt" ? "en" : "pt";
    setLocale(next);
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const userId = "id" in user && typeof user.id === "string" ? user.id : "";
  const isNostrSession =
    /^[0-9a-f]{64}$/i.test(userId) ||
    (typeof user.name === "string" && user.name.toLowerCase().startsWith("npub1"));

  const nostrFullNpub =
    isNostrSession && typeof user.name === "string" && user.name.toLowerCase().startsWith("npub1")
      ? user.name
      : isNostrSession && /^[0-9a-f]{64}$/i.test(userId)
        ? hexToNpubDisplay(userId.toLowerCase())
        : null;

  const navLabel = nostrFullNpub
    ? truncateNpubNav(nostrFullNpub)
    : user.name?.split(" ")[0] ?? "user";

  const nostrNpub =
    nostrHex && /^[0-9a-f]{64}$/i.test(nostrHex)
      ? truncateNpub(hexToNpubDisplay(nostrHex.toLowerCase()))
      : null;

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 bg-secondary border border-border rounded-full pl-1 pr-2.5 py-1 hover:border-muted-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-1">
              {nostrNpub ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="text-[13px] leading-none select-none cursor-default"
                      aria-label={t("nostrBadgeAria")}
                    >
                      ⚡
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-mono text-[11px]">
                    {t("nostrTooltip", { npub: nostrNpub })}
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <div className="w-[26px] h-[26px] rounded-full bg-[#f7931a] text-black flex items-center justify-center text-[11px] font-bold font-mono overflow-hidden">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>
            <span
              className="text-[12px] font-medium text-muted-foreground font-mono max-w-[11rem] truncate"
              title={nostrFullNpub ?? undefined}
            >
              {navLabel}
            </span>
            <span className="text-[9px] text-muted-foreground/60">▾</span>
          </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50">
            <div className="px-3.5 py-3 border-b border-border">
              <div
                className={`text-[13px] font-semibold text-foreground ${nostrFullNpub ? "font-mono" : ""}`}
                title={nostrFullNpub ?? undefined}
              >
                {nostrFullNpub ? navLabel : user.name ?? "user"}
              </div>
              {user.email &&
              !(
                nostrFullNpub &&
                user.email.trim().toLowerCase() === nostrFullNpub.toLowerCase()
              ) ? (
                <div
                  className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate"
                  title={user.email}
                >
                  {user.email}
                </div>
              ) : null}
            </div>

            <div className="py-1.5 border-b border-border">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setProfileOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <span className="w-4 text-center text-[14px]">👤</span> {t("profile")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/onboarding");
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <span className="w-4 text-center text-[14px]">🎯</span> {t("onboarding")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setHelpOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <span className="w-4 text-center text-[14px]">❓</span> {t("help")}
              </button>
            </div>

            <div className="py-1.5 border-b border-border">
              <div className="flex items-center justify-between px-3.5 py-2">
                <span className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                  <span className="w-4 text-center text-[14px]">🌙</span> {t("darkTheme")}
                </span>
                <button
                  type="button"
                  onClick={onThemeToggle}
                  className={`w-8 h-[18px] rounded-full border relative transition-colors ${
                    isDark ? "bg-[#f7931a] border-[#f7931a]" : "bg-muted border-border"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-[left] shadow-sm ${
                      isDark ? "left-[14px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2">
                <span className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                  <span className="w-4 text-center text-[14px]">🌐</span> {t("language")}
                </span>
                <button
                  type="button"
                  onClick={toggleLocale}
                  className="text-[10px] font-bold font-mono border border-border rounded px-2 py-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {langLabel}
                </button>
              </div>
            </div>

            <div className="py-1.5">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#ef4444] hover:bg-[#ef444410] transition-colors text-left"
              >
                <span className="w-4 text-center text-[14px]">↩</span> {t("signOut")}
              </button>
            </div>
          </div>
        )}
        </div>
      </TooltipProvider>

      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} user={user} />
      <HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
