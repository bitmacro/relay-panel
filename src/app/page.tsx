import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { QuickStart } from "@/components/landing/QuickStart";
import { OpenSource } from "@/components/landing/OpenSource";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "BitMacro Relay Manager — Manage your Nostr relay without touching the terminal",
  description:
    "Visual dashboard for Nostr relay operators. Moderation, access control, Lightning payments and multi-relay management.",
  openGraph: {
    images: ["/og-relay-manager.png"],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://relay-panel.bitmacro.io"
  ),
};

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/relays");

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <QuickStart />
        <OpenSource />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
