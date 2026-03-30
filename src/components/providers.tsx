"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { IntlClientProvider } from "@/components/intl-client-provider";
import type { AppLocale } from "@/lib/local-preferences";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: AppLocale;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <IntlClientProvider initialLocale={initialLocale}>
          {children}
        </IntlClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
