"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";

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
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Relay Panel</h1>
          <p className="mt-1 text-muted-foreground">
            Signed in as {user?.email ?? user?.name ?? "user"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Sign out
        </button>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Your relays</h2>
        {relays.length === 0 ? (
          <div className="mt-2 space-y-2 text-muted-foreground">
            <p>No relays configured yet. Add a row in Supabase <code className="rounded bg-muted px-1.5 py-0.5 text-sm">relay.relay_configs</code> with your GitHub user id.</p>
            {providerUserId && (
              <p className="font-mono text-sm">
                Your GitHub user id: <code className="rounded bg-muted px-1.5 py-0.5">{providerUserId}</code>
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
