"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { User } from "next-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { authorFilterToHex } from "@/lib/events-display";
import {
  MY_LIGHTNING_ADDRESS_KEY,
  MY_NOSTR_PUBKEY_KEY,
} from "@/lib/local-preferences";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function ProfileSheet({ open, onOpenChange, user }: ProfileSheetProps) {
  const t = useTranslations("profile");
  const [nostrInput, setNostrInput] = useState("");
  const [lnInput, setLnInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  const githubLogin = (user as { githubLogin?: string }).githubLogin;
  const githubHref =
    typeof githubLogin === "string" && githubLogin
      ? `https://github.com/${githubLogin}`
      : t("githubFallback");

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    setNostrInput(window.localStorage.getItem(MY_NOSTR_PUBKEY_KEY) ?? "");
    setLnInput(window.localStorage.getItem(MY_LIGHTNING_ADDRESS_KEY) ?? "");
    setHint(null);
  }, [open]);

  function save() {
    const hex = authorFilterToHex(nostrInput);
    if (nostrInput.trim() && !hex) {
      setHint(t("invalidPubkey"));
      return;
    }
    if (typeof window !== "undefined") {
      if (hex) {
        window.localStorage.setItem(MY_NOSTR_PUBKEY_KEY, hex);
      } else {
        window.localStorage.removeItem(MY_NOSTR_PUBKEY_KEY);
      }
      const ln = lnInput.trim();
      if (ln) window.localStorage.setItem(MY_LIGHTNING_ADDRESS_KEY, ln);
      else window.localStorage.removeItem(MY_LIGHTNING_ADDRESS_KEY);
    }
    setHint(t("saved"));
    window.setTimeout(() => setHint(null), 2500);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <p className="text-[13px] text-muted-foreground font-normal">
            {t("description")}
          </p>
        </SheetHeader>
        <div className="px-6 pb-8 space-y-5">
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-[14px] font-bold">
                {(user.name ?? "?").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-[15px] font-semibold">{user.name ?? "—"}</div>
              <div className="text-[12px] text-muted-foreground font-mono">
                {user.email}
              </div>
            </div>
          </div>

          <a
            href={githubHref}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[13px] text-[#f7931a] hover:underline"
          >
            {t("githubProfile")}
          </a>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              {t("nostrLabel")}
            </label>
            <input
              type="text"
              value={nostrInput}
              onChange={(e) => setNostrInput(e.target.value)}
              placeholder={t("nostrPlaceholder")}
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono outline-none focus:border-[#f7931a]"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em] block mb-1">
              {t("lnLabel")}
            </label>
            <input
              type="text"
              value={lnInput}
              onChange={(e) => setLnInput(e.target.value)}
              placeholder={t("lnPlaceholder")}
              className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] outline-none focus:border-[#f7931a]"
            />
          </div>

          {hint && (
            <p
              className={`text-[12px] ${hint === t("saved") ? "text-[#22c55e]" : "text-[#ef4444]"}`}
            >
              {hint}
            </p>
          )}

          <button
            type="button"
            onClick={save}
            className="w-full py-2 rounded-md bg-[#f7931a] text-black text-[13px] font-semibold hover:bg-[#e07b10] transition-colors"
          >
            {t("savePrefs")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
