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
}: {
  user: User | null;
  relays: Relay[];
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
          <p className="mt-2 text-muted-foreground">
            No relays configured yet. Add relay configs in Supabase (relay.relay_configs) with provider_user_id = your GitHub user id.
          </p>
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
