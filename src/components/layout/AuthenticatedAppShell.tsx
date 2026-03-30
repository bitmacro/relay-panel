import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import pkg from "../../../package.json";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
}

async function fetchRelays(apiKey: string, providerUserId: string): Promise<Relay[]> {
  try {
    const r = await fetch(apiUrl("relays"), {
      headers: {
        "X-API-Key": apiKey,
        "X-Provider-User-Id": providerUserId,
      },
      cache: "no-store",
    });
    if (!r.ok) return [];
    const body = await r.json();
    return body.relays ?? [];
  } catch {
    return [];
  }
}

export async function AuthenticatedAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const apiKey = process.env.RELAY_API_KEY;
  const providerUserId = (session.user as { id?: string })?.id;

  const relays: Relay[] =
    apiKey && providerUserId ? await fetchRelays(apiKey, providerUserId) : [];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav user={session.user ?? null} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar relays={relays} />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
          {children}
        </main>
      </div>
      <Footer
        panelVersion={pkg.version}
        defaultRelayId={relays[0]?.id ?? null}
      />
    </div>
  );
}
