"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-muted-foreground">
        Sign in with GitHub to access the Relay Panel.
      </p>
      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl: "/" })}
        className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}