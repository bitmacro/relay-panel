"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { normalizeNip07PubkeyHex } from "@/lib/nip07-pubkey";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl")?.trim() || "/relays";

  const [nip07Ready, setNip07Ready] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const n = typeof window !== "undefined" ? window.nostr : undefined;
    setNip07Ready(!!n?.getPublicKey && !!n?.signEvent);
  }, []);

  const signInWithNostr = useCallback(async () => {
    setError(null);
    if (typeof window === "undefined") return;
    const nip = window.nostr;
    if (!nip?.getPublicKey || !nip?.signEvent) {
      setError("Install a NIP-07 extension (e.g. Alby, nos2x) to continue.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/nostr-challenge", { method: "POST" });
      const data = (await res.json()) as {
        challenge?: string;
        challengeToken?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        setError(
          typeof data.detail === "string"
            ? data.detail
            : typeof data.error === "string"
              ? data.error
              : "Could not obtain the challenge."
        );
        return;
      }
      const { challenge, challengeToken } = data;
      if (!challenge || !challengeToken) {
        setError("Invalid response from server.");
        return;
      }

      const created = Math.floor(Date.now() / 1000);
      const unsigned = {
        kind: 1 as const,
        created_at: created,
        tags: [["client", "relay-panel"]],
        content: challenge,
      };

      const signed = (await nip.signEvent(unsigned)) as {
        pubkey: string;
        id: string;
        sig: string;
        kind: number;
        content: string;
        created_at: number;
        tags: unknown[];
      };

      const pubkeyHex = normalizeNip07PubkeyHex(signed.pubkey);
      if (!pubkeyHex) {
        setError("Invalid pubkey returned by the extension.");
        return;
      }

      const result = await signIn("nostr", {
        challengeToken,
        eventJson: JSON.stringify(signed),
        pubkey: pubkeyHex,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Nostr sign-in failed. Try again.");
        return;
      }

      window.location.assign(result?.url ?? callbackUrl);
    } catch {
      setError("Unexpected error. Check the console or try again.");
    } finally {
      setBusy(false);
    }
  }, [callbackUrl]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image
            src="/bitmacro-logo.png"
            alt="BitMacro"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <div>
            <div className="text-[17px] font-semibold tracking-tight">BitMacro Relay Manager</div>
            <div className="text-[11px] text-muted-foreground font-mono">relay-panel.bitmacro.io</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-[18px] font-semibold mb-1">Sign in</h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            GitHub (team) or Nostr (NIP-07): the hex pubkey is used as the identifier with relay-api
            (<code className="text-[11px]">X-Provider-User-Id</code>).
          </p>

          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl })}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background px-4 py-2.5 rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Sign in with GitHub
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void signInWithNostr()}
            disabled={busy || !nip07Ready}
            className="w-full flex items-center justify-center gap-2 border border-border bg-background px-4 py-2.5 rounded-md text-[14px] font-medium hover:bg-muted/40 transition-colors disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Sign in with Nostr (NIP-07)
          </button>

          {!nip07Ready && (
            <p className="text-[11px] text-muted-foreground mt-2">
              NIP-07 extension not detected in this browser. Use GitHub or install Alby / nos2x.
            </p>
          )}

          {error ? (
            <p className="text-[12px] text-destructive mt-3" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          © 2026 BitMacro · relay-panel
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
          …
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
