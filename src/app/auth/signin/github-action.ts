"use server";

import { signIn } from "@/lib/auth";

export async function signInWithGitHub(formData: FormData) {
  const raw = String(formData.get("callbackUrl") ?? "/relays").trim();
  const redirectTo =
    raw.startsWith("/") && !raw.startsWith("//") ? raw : "/relays";
  await signIn("github", { redirectTo });
}
