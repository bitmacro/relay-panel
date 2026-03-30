"use client";

import { useSyncExternalStore } from "react";
import {
  MY_NOSTR_PUBKEY_KEY,
  MY_NOSTR_SOURCE_KEY,
  NOSTR_PREFS_CHANGED_EVENT,
  type NostrPubkeySource,
} from "@/lib/local-preferences";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(NOSTR_PREFS_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(NOSTR_PREFS_CHANGED_EVENT, callback);
  };
}

function parseSource(raw: string | null): NostrPubkeySource | null {
  if (raw === "manual" || raw === "nip07" || raw === "nip46") return raw;
  return null;
}

function snapshot(): { hex: string | null; source: NostrPubkeySource | null } {
  return {
    hex: window.localStorage.getItem(MY_NOSTR_PUBKEY_KEY),
    source: parseSource(window.localStorage.getItem(MY_NOSTR_SOURCE_KEY)),
  };
}

function serverSnapshot(): { hex: string | null; source: NostrPubkeySource | null } {
  return { hex: null, source: null };
}

export function useNostrPrefs() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
