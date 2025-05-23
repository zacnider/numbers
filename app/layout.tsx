// app/layout.tsx
// CSS içe aktarma düzeltildi

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FrameProvider } from "@/components/farcaster-provider";
import "./globals.css"; // Doğru import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monad Sliding Puzzle",
  description: "A number shift puzzle running on the Monad blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Zorla stil sayfası ekle */}
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className={inter.className}>
        <FrameProvider>{children}</FrameProvider>
      </body>
    </html>
  );
}
