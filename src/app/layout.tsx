import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BoardCraft — Create Custom Board Games with AI",
  description:
    "Design personalized board games with your photos, custom rules, and unique themes. AI-powered board game creator that prints and ships to your door.",
  keywords: [
    "custom board game",
    "personalized board game",
    "board game creator",
    "AI board game",
    "custom monopoly",
    "personalized gift",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
