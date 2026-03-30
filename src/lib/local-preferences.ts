export const LOCALE_COOKIE_NAME = "relay-panel:locale";
export const MY_NOSTR_PUBKEY_KEY = "relay-panel:my-nostr-pubkey";
export const MY_NOSTR_SOURCE_KEY = "relay-panel:my-nostr-source";
export const MY_LIGHTNING_ADDRESS_KEY = "relay-panel:my-lightning-address";

export type NostrPubkeySource = "manual" | "nip07" | "nip46";

export const NOSTR_PREFS_CHANGED_EVENT = "relay-panel:nostr-prefs";

export function notifyNostrPrefsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOSTR_PREFS_CHANGED_EVENT));
}

export type AppLocale = "pt" | "en";

export function parseLocaleCookie(value: string | undefined | null): AppLocale {
  return value === "en" ? "en" : "pt";
}

/** Legacy per-user key — read once to migrate into `MY_NOSTR_PUBKEY_KEY`. */
export function legacyStorageKeyForPubkey(userId: string) {
  return `relay-panel:events-my-pubkey-hex:${userId}`;
}
