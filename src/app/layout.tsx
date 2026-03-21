import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({ weight: "700", subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Relay Panel | BitMacro",
  description: "Manage Nostr relays via relay-api",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`dark ${dmSans.variable}`}>
      <body className="dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
