export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">Relay Panel</h1>
      <p className="mt-2 text-muted-foreground">
        Manages Nostr relays via relay-api. Add auth providers in lib/auth.ts.
      </p>
    </div>
  );
}
