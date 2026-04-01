"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { useTranslations } from "next-intl";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
}

export function Dashboard({
  user,
  relays,
  providerUserId,
}: {
  user: User | null;
  relays: Relay[];
  providerUserId?: string | null;
}) {
  const t = useTranslations("Dashboard");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("signedInAs", { user: user?.email ?? user?.name ?? t("fallbackUser") })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          {t("btnSignOut")}
        </button>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">{t("yourRelays")}</h2>
        {relays.length === 0 ? (
          <div className="mt-2 space-y-2 text-muted-foreground">
            <p>
              {t("emptyDescriptionStart")}{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">relay.relay_configs</code>{" "}
              {t("emptyDescriptionEnd")}
            </p>
            {providerUserId && (
              <p className="font-mono text-sm">
                {t("githubUserIdLabel")}{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">{providerUserId}</code>
              </p>
            )}
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {relays.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-border p-3"
              >
                <span className="font-medium">{r.name ?? r.id}</span>
                {r.endpoint && (
                  <span className="ml-2 text-muted-foreground text-sm">
                    {r.endpoint}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
