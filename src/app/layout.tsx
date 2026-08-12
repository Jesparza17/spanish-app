import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cuaderno",
  description: "Mexican Spanish, learned properly.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#F5F2E6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
