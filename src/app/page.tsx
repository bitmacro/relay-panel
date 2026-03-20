import { auth } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { apiUrl } from "@/lib/api";
import { Dashboard } from "@/components/dashboard";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const headersList = await headers();
  const req = new Request("https://relay-panel.bitmacro.io", {
    headers: headersList,
  });
  const token = await getToken({ req, raw: true });
  const relays = token
    ? await fetch(apiUrl("relays"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { relays: [] }))
    : { relays: [] };

  return (
    <div className="flex min-h-screen flex-col p-8">
      <Dashboard
        user={session.user ?? null}
        relays={relays.relays ?? []}
      />
    </div>
  );
}
