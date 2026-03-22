import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { RelayPanelShell } from "@/components/relay-panel-shell";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const apiKey = process.env.RELAY_API_KEY;
  const providerUserId = (session.user as { id?: string })?.id;

  let relays = { relays: [] as { id: string; name: string | null; endpoint: string | null; color?: string | null }[] };

  if (apiKey && providerUserId) {
    const r = await fetch(apiUrl("relays"), {
      headers: {
        "X-API-Key": apiKey,
        "X-Provider-User-Id": providerUserId,
      },
      cache: "no-store",
    });
    const body = await r.text();
    console.log("[relay-panel] GET /relays:", r.status, body.slice(0, 200));
    relays = r.ok ? JSON.parse(body) : relays;
  }

  return (
    <div className="p-6 pb-10">
      <RelayPanelShell
        user={session.user ?? null}
        relays={relays.relays ?? []}
        providerUserId={providerUserId ?? null}
      />
    </div>
  );
}
