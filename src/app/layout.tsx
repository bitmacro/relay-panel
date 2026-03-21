import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relay Panel | BitMacro",
  description: "Manage Nostr relays via relay-api",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="dark">
      <body className="dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
