"use client";

import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import type { User } from "next-auth";

interface UserMenuProps {
  user: User;
  lang: string;
  isDark: boolean;
  onThemeToggle: () => void;
  onLangToggle: () => void;
}

export function UserMenu({ user, lang, isDark, onThemeToggle, onLangToggle }: UserMenuProps) {
  const [open, setOpen] = useState(false);
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

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-secondary border border-border rounded-full pl-1 pr-2.5 py-1 hover:border-muted-foreground/30 transition-colors"
      >
        <div className="w-[26px] h-[26px] rounded-full bg-[#f7931a] text-black flex items-center justify-center text-[11px] font-bold font-mono">
          {initials}
        </div>
        <span className="text-[12px] font-medium text-muted-foreground">
          {user.name?.split(" ")[0] ?? "user"}
        </span>
        <span className="text-[9px] text-muted-foreground/60">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-3.5 py-3 border-b border-border">
            <div className="text-[13px] font-semibold text-foreground">{user.name}</div>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{user.email}</div>
          </div>

          {/* Nav links */}
          <div className="py-1.5 border-b border-border">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
            >
              <span className="w-4 text-center text-[14px]">👤</span> Perfil
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
            >
              <span className="w-4 text-center text-[14px]">🎯</span> Onboarding
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
            >
              <span className="w-4 text-center text-[14px]">❓</span> Ajuda & Docs
            </button>
          </div>

          {/* Settings toggles */}
          <div className="py-1.5 border-b border-border">
            <div className="flex items-center justify-between px-3.5 py-2">
              <span className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                <span className="w-4 text-center text-[14px]">🌙</span> Tema escuro
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
                <span className="w-4 text-center text-[14px]">🌐</span> Idioma
              </span>
              <button
                type="button"
                onClick={onLangToggle}
                className="text-[10px] font-bold font-mono border border-border rounded px-2 py-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {lang}
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="py-1.5">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#ef4444] hover:bg-[#ef444410] transition-colors text-left"
            >
              <span className="w-4 text-center text-[14px]">↩</span> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
