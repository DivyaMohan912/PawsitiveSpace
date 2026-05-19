import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";

// Force all pages to be dynamically rendered (no static prerendering)
// Required because all pages depend on Supabase env vars at runtime
export const dynamic = "force-dynamic";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "PawsitiveSpace — Hyderabad Animal Rescue",
  description: "Report, rescue, adopt, return. Every paw deserves a home.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${playfair.variable}`}>
      <body className="font-body bg-brand-cream text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
