import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { RelayDetailShell } from "@/components/relays/RelayDetailShell";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
  agent_relay_id?: string | null;
}

export default async function RelayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { id } = await params;
  const apiKey = process.env.RELAY_API_KEY;
  const providerUserId = (session.user as { id?: string })?.id;

  if (!apiKey || !providerUserId) notFound();

  const headers = {
    "X-API-Key": apiKey,
    "X-Provider-User-Id": providerUserId,
  };

  // Try config endpoint first, fall back to relay list
  let relay: Relay | null = null;

  try {
    const r = await fetch(apiUrl(`relay/${id}/config`), {
      headers,
      cache: "no-store",
    });
    if (r.ok) {
      const data = await r.json();
      relay = { id, ...data };
    }
  } catch {
    /* ignore */
  }

  if (!relay) {
    try {
      const r = await fetch(apiUrl("relays"), { headers, cache: "no-store" });
      if (r.ok) {
        const body = await r.json();
        const found = (body.relays ?? []).find(
          (rel: { id: string }) => rel.id === id
        );
        if (found) relay = found as Relay;
      }
    } catch {
      /* ignore */
    }
  }

  if (!relay) notFound();

  return <RelayDetailShell relay={relay} />;
}
