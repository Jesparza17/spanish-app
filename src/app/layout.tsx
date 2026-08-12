import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import TabBar from "@/components/TabBar";
import { LanguageProvider } from "@/lib/language";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cuaderno",
  description: "Mexican Spanish, learned properly.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cuaderno",
  },
};

export const viewport = {
  themeColor: "#1B2032",
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen bg-paper pb-20">
        <LanguageProvider>
          {children}
          <TabBar />
        </LanguageProvider>
      </body>
    </html>
  );
}
