import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { RelayTable } from "@/components/relays/RelayTable";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
  agent_relay_id?: string | null;
}

export default async function RelaysPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const apiKey = process.env.RELAY_API_KEY;
  const providerUserId = (session.user as { id?: string })?.id;

  let relays: Relay[] = [];
  if (apiKey && providerUserId) {
    try {
      const r = await fetch(apiUrl("relays"), {
        headers: {
          "X-API-Key": apiKey,
          "X-Provider-User-Id": providerUserId,
        },
        cache: "no-store",
      });
      if (r.ok) {
        const body = await r.json();
        relays = body.relays ?? [];
      }
    } catch {
      /* ignore */
    }
  }

  if (relays.length === 0) {
    redirect("/onboarding");
  }

  return <RelayTable key={relays.map((r) => r.id).sort().join(",")} relays={relays} />;
}
