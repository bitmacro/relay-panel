"use client";

import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppLocale } from "@/lib/local-preferences";
import { BITMACRO_LOCALE_COOKIE } from "@/lib/local-preferences";
import { deepMerge } from "@/lib/deep-merge";

import messagesPtBR from "@/messages/pt-BR.json";
import messagesEn from "@/messages/en.json";
import messagesEsOverrides from "@/messages/es.overrides.json";

const messagesEs = deepMerge(
  messagesEn as Record<string, unknown>,
  messagesEsOverrides as Record<string, unknown>,
) as typeof messagesEn;

const MESSAGES: Record<AppLocale, typeof messagesEn> = {
  "pt-BR": messagesPtBR as typeof messagesEn,
  en: messagesEn,
  es: messagesEs,
};

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useAppLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useAppLocale must be used within IntlClientProvider");
  }
  return ctx;
}

function writeLocaleCookie(locale: AppLocale) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${BITMACRO_LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function IntlClientProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: AppLocale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    const map: Record<AppLocale, string> = {
      "pt-BR": "pt-BR",
      en: "en",
      es: "es",
    };
    document.documentElement.lang = map[locale] ?? "pt-BR";
  }, [locale]);

  const setLocale = useCallback(
    (next: AppLocale) => {
      setLocaleState(next);
      writeLocaleCookie(next);
      try {
        localStorage.setItem("bitmacro-locale", next);
      } catch {
        /* ignore */
      }
      router.refresh();
    },
    [router],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  const messages = MESSAGES[locale];

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Europe/Lisbon"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
