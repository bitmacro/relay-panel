import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { QuickStart } from "@/components/landing/QuickStart";
import { OpenSource } from "@/components/landing/OpenSource";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://relay-panel.bitmacro.io";

export const metadata: Metadata = {
  title: "BitMacro Relay Manager — Manage your Nostr relay without touching the terminal",
  description:
    "Visual dashboard for Nostr relay operators. Moderation, access control, Lightning payments and multi-relay management.",
  openGraph: {
    images: ["/og-relay-manager.png"],
  },
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: `${BASE_URL}/`,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BitMacro Relay Manager",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://relay-panel.bitmacro.io",
  description:
    "Visual dashboard for Nostr relay operators — moderation, access control, Lightning payments and multi-relay management.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Organization", name: "BitMacro", url: "https://bitmacro.io" },
  sameAs: [
    "https://github.com/bitmacro/relay-panel",
    "https://github.com/bitmacro/relay-agent",
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
    <div className="min-h-screen flex flex-col bg-landing-premium">
      <LandingNav />
      <main className="flex-1 relative z-10">
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
    </>
  );
}
