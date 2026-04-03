"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { hexToNpubDisplay, truncateNpubNav } from "@/lib/events-display";

interface LandingUserMenuProps {
  user: User;
}

export function LandingUserMenu({ user }: LandingUserMenuProps) {
  const tNav = useTranslations("landing.nav");
  const tUser = useTranslations("userMenu");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

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

  return (
    <div className="relative ml-4" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-secondary/80 border border-border rounded-full pl-1 pr-2.5 py-1 hover:border-muted-foreground/30 transition-colors"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="w-[28px] h-[28px] rounded-full object-cover"
          />
        ) : (
          <div className="w-[28px] h-[28px] rounded-full bg-[#f7931a] text-black flex items-center justify-center text-[10px] font-bold font-mono">
            {initials}
          </div>
        )}
        <span
          className="text-[12px] font-medium text-muted-foreground font-mono max-w-[120px] truncate hidden sm:inline"
          title={nostrFullNpub ?? undefined}
        >
          {navLabel}
        </span>
        <span className="text-[9px] text-muted-foreground/60 pr-0.5">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50 py-1">
          <div className="px-3 py-2 border-b border-border">
            <div
              className={`text-[13px] font-semibold ${nostrFullNpub ? "font-mono" : ""}`}
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
          <Link
            href="/relays"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {tNav("goToPanel")}
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 text-[13px] text-[#ef4444] hover:bg-[#ef444410] transition-colors"
          >
            {tUser("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
