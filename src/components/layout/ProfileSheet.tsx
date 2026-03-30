"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import type { User } from "next-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { authorFilterToHex, hexToNpubDisplay } from "@/lib/events-display";
import {
  MY_LIGHTNING_ADDRESS_KEY,
  MY_NOSTR_PUBKEY_KEY,
  MY_NOSTR_SOURCE_KEY,
  notifyNostrPrefsChanged,
  type NostrPubkeySource,
} from "@/lib/local-preferences";
import { NostrConnectDialog } from "@/components/layout/NostrConnectDialog";

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
  const [nip07Available, setNip07Available] = useState(false);
  const [nip46Open, setNip46Open] = useState(false);
  const [savedHex, setSavedHex] = useState<string | null>(null);
  const [savedSource, setSavedSource] = useState<NostrPubkeySource | null>(null);

  const refreshSavedNostr = useCallback(() => {
    if (typeof window === "undefined") return;
    const hex = window.localStorage.getItem(MY_NOSTR_PUBKEY_KEY);
    const src = window.localStorage.getItem(MY_NOSTR_SOURCE_KEY);
    setSavedHex(hex && /^[0-9a-f]{64}$/i.test(hex) ? hex.toLowerCase() : null);
    setSavedSource(
      src === "manual" || src === "nip07" || src === "nip46" ? src : null
    );
  }, []);

  const githubLogin = (user as { githubLogin?: string }).githubLogin;
  const githubHref =
    typeof githubLogin === "string" && githubLogin
      ? `https://github.com/${githubLogin}`
      : t("githubFallback");

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const storedHex = window.localStorage.getItem(MY_NOSTR_PUBKEY_KEY);
    startTransition(() => {
      setNostrInput(
        storedHex && /^[0-9a-f]{64}$/i.test(storedHex)
          ? hexToNpubDisplay(storedHex.toLowerCase())
          : (storedHex ?? "")
      );
      setLnInput(window.localStorage.getItem(MY_LIGHTNING_ADDRESS_KEY) ?? "");
      setHint(null);
      refreshSavedNostr();
    });
  }, [open, refreshSavedNostr]);

  useEffect(() => {
    if (!open) return;
    startTransition(() => {
      if (typeof window === "undefined") return;
      const nip = window.nostr;
      setNip07Available(!!nip && typeof nip.getPublicKey === "function");
    });
  }, [open]);

  const nip46Labels = useMemo(
    () => ({
      title: t("nip46Title"),
      waitHint: t("nip46WaitHint"),
      waiting: t("nip46Waiting"),
      copyUri: t("nip46CopyUri"),
      manualFinish: t("nip46ManualFinish"),
      finishing: t("nip46Finishing"),
      retry: t("nip46Retry"),
      configError: t("nip46ConfigError"),
      noRelays: t("nip46NoRelays"),
      bridgeError: t("nip46BridgeError"),
      connectFailed: t("nip46ConnectFailed"),
      remotePubkeyMissing: t("nip46RemotePubkeyMissing"),
      genericError: t("nip46GenericError"),
      timeout: t("nip46Timeout"),
      revoked: t("nip46Revoked"),
    }),
    [t]
  );

  function persistNostrFromHex(hex: string | null, source: NostrPubkeySource | null) {
    if (typeof window === "undefined") return;
    if (hex) {
      window.localStorage.setItem(MY_NOSTR_PUBKEY_KEY, hex);
      if (source) window.localStorage.setItem(MY_NOSTR_SOURCE_KEY, source);
    } else {
      window.localStorage.removeItem(MY_NOSTR_PUBKEY_KEY);
      window.localStorage.removeItem(MY_NOSTR_SOURCE_KEY);
    }
    notifyNostrPrefsChanged();
    refreshSavedNostr();
  }

  function save() {
    const hex = authorFilterToHex(nostrInput);
    if (nostrInput.trim() && !hex) {
      setHint(t("invalidPubkey"));
      return;
    }
    if (typeof window !== "undefined") {
      if (hex) {
        window.localStorage.setItem(MY_NOSTR_PUBKEY_KEY, hex);
        window.localStorage.setItem(MY_NOSTR_SOURCE_KEY, "manual");
      } else {
        window.localStorage.removeItem(MY_NOSTR_PUBKEY_KEY);
        window.localStorage.removeItem(MY_NOSTR_SOURCE_KEY);
      }
      const ln = lnInput.trim();
      if (ln) window.localStorage.setItem(MY_LIGHTNING_ADDRESS_KEY, ln);
      else window.localStorage.removeItem(MY_LIGHTNING_ADDRESS_KEY);
    }
    notifyNostrPrefsChanged();
    refreshSavedNostr();
    setHint(t("saved"));
    window.setTimeout(() => setHint(null), 2500);
  }

  async function connectNip07() {
    if (typeof window === "undefined") return;
    const nip = window.nostr;
    if (!nip || typeof nip.getPublicKey !== "function") return;
    setHint(null);
    try {
      const pk = await nip.getPublicKey();
      const hexRaw = typeof pk === "string" ? pk.trim() : "";
      if (!/^[0-9a-fA-F]{64}$/.test(hexRaw)) {
        setHint(t("nip07InvalidResponse"));
        return;
      }
      const hex = hexRaw.toLowerCase();
      persistNostrFromHex(hex, "nip07");
      setNostrInput(hexToNpubDisplay(hex));
      setHint(t("nip07Connected"));
      window.setTimeout(() => setHint(null), 2500);
    } catch {
      setHint(t("nip07Failed"));
    }
  }

  function onNip46Linked(hex: string) {
    persistNostrFromHex(hex, "nip46");
    setNostrInput(hexToNpubDisplay(hex));
    setHint(t("nip46Saved"));
    window.setTimeout(() => setHint(null), 2500);
  }

  function sourceBadge() {
    if (!savedHex) return null;
    if (savedSource === "nip07") {
      return (
        <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
          {t("badgeNip07")}
        </span>
      );
    }
    if (savedSource === "nip46") {
      return (
        <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
          {t("badgeNip46")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {t("badgeManual")}
      </span>
    );
  }

  return (
    <>
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
              <div className="flex items-center gap-2 mb-1">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em]">
                  {t("nostrLabel")}
                </label>
                {sourceBadge()}
              </div>
              <input
                type="text"
                value={nostrInput}
                onChange={(e) => setNostrInput(e.target.value)}
                placeholder={t("nostrPlaceholder")}
                className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 text-[13px] font-mono outline-none focus:border-[#f7931a]"
              />
              <div className="mt-2 flex flex-col gap-2">
                {nip07Available ? (
                  <button
                    type="button"
                    onClick={() => void connectNip07()}
                    className="w-full py-1.5 rounded-md border border-border bg-card text-[12px] font-medium text-foreground hover:bg-secondary transition-colors text-left px-3"
                  >
                    {t("connectNip07")}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setNip46Open(true)}
                  className="w-full py-1.5 rounded-md border border-border bg-card text-[12px] font-medium text-foreground hover:bg-secondary transition-colors text-left px-3"
                >
                  {t("connectNip46")}
                </button>
              </div>
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
                className={`text-[12px] ${
                  [
                    t("saved"),
                    t("nip07Connected"),
                    t("nip46Saved"),
                  ].includes(hint)
                    ? "text-[#22c55e]"
                    : "text-[#ef4444]"
                }`}
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

      <NostrConnectDialog
        open={nip46Open}
        onOpenChange={setNip46Open}
        onLinked={onNip46Linked}
        labels={nip46Labels}
      />
    </>
  );
}
