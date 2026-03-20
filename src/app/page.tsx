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
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
    raw: true,
  });
  const relays = token
    ? await fetch(apiUrl("relays"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).then(async (r) => {
        const body = await r.text();
        console.log("[relay-panel] GET /relays response:", r.status, r.statusText, "body:", body);
        return r.ok ? JSON.parse(body) : { relays: [] };
      })
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
