"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  MY_NOSTR_PUBKEY_KEY,
  MY_NOSTR_SOURCE_KEY,
  NOSTR_PREFS_CHANGED_EVENT,
  type NostrPubkeySource,
} from "@/lib/local-preferences";

/** Separator must not appear in hex or source values. */
const SNAP_SEP = "\u0000";

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

/** Primitive snapshot so React’s `Object.is` sees stability when localStorage is unchanged. */
function getSnapshotString(): string {
  const hex = window.localStorage.getItem(MY_NOSTR_PUBKEY_KEY) ?? "";
  const source = window.localStorage.getItem(MY_NOSTR_SOURCE_KEY) ?? "";
  return `${hex}${SNAP_SEP}${source}`;
}

function getServerSnapshotString(): string {
  return SNAP_SEP;
}

function parseSnapshotString(raw: string): {
  hex: string | null;
  source: NostrPubkeySource | null;
} {
  const i = raw.indexOf(SNAP_SEP);
  const hexPart = i >= 0 ? raw.slice(0, i) : raw;
  const sourcePart = i >= 0 ? raw.slice(i + SNAP_SEP.length) : "";
  return {
    hex: hexPart.length ? hexPart : null,
    source: parseSource(sourcePart.length ? sourcePart : null),
  };
}

export function useNostrPrefs() {
  const snap = useSyncExternalStore(subscribe, getSnapshotString, getServerSnapshotString);
  return useMemo(() => parseSnapshotString(snap), [snap]);
}
