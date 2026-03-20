import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">Relay Panel</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as {session.user?.email ?? session.user?.name ?? "user"}
      </p>
    </div>
  );
}