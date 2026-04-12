export const BITMACRO_LOCALE_COOKIE = "bitmacro-locale";
/** @deprecated Read for one-time migration only */
export const LEGACY_LOCALE_COOKIE_NAME = "relay-panel:locale";

export const MY_NOSTR_PUBKEY_KEY = "relay-panel:my-nostr-pubkey";
export const MY_NOSTR_SOURCE_KEY = "relay-panel:my-nostr-source";
export const MY_LIGHTNING_ADDRESS_KEY = "relay-panel:my-lightning-address";

export type NostrPubkeySource = "manual" | "nip07" | "nip46";

export const NOSTR_PREFS_CHANGED_EVENT = "relay-panel:nostr-prefs";

export function notifyNostrPrefsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOSTR_PREFS_CHANGED_EVENT));
}

/** Aligned with bitmacro.io / bio (BCP 47) */
export type AppLocale = "pt-BR" | "en" | "es";

export function parseLocaleCookie(value: string | undefined | null): AppLocale {
  if (value === "en") return "en";
  if (value === "es") return "es";
  if (value === "pt-BR" || value === "pt") return "pt-BR";
  return "pt-BR";
}

/** Prefer middleware header, then unified cookie, then legacy relay-panel cookie */
export function resolveInitialLocale(
  headerLocale: string | null | undefined,
  unifiedCookie: string | undefined | null,
  legacyCookie: string | undefined | null,
): AppLocale {
  if (headerLocale === "pt-BR" || headerLocale === "en" || headerLocale === "es") {
    return headerLocale;
  }
  if (unifiedCookie === "en" || unifiedCookie === "es" || unifiedCookie === "pt-BR") {
    return unifiedCookie;
  }
  if (unifiedCookie === "pt") return "pt-BR";
  if (legacyCookie === "en") return "en";
  if (legacyCookie === "pt") return "pt-BR";
  return "pt-BR";
}

/** Legacy per-user key — read once to migrate into `MY_NOSTR_PUBKEY_KEY`. */
export function legacyStorageKeyForPubkey(userId: string) {
  return `relay-panel:events-my-pubkey-hex:${userId}`;
}
