import { NextResponse } from "next/server";
import { mintNostrChallengeToken } from "@/lib/nostr-challenge-token";

/** Mints a short-lived challenge + signed token for NIP-07 login (NextAuth Credentials). */
export async function POST() {
  const minted = mintNostrChallengeToken();
  if (!minted) {
    return NextResponse.json(
      { error: "auth_secret_missing", detail: "Configure AUTH_SECRET or NEXTAUTH_SECRET" },
      { status: 503 }
    );
  }
  return NextResponse.json({
    challenge: minted.challenge,
    challengeToken: minted.challengeToken,
  });
}
