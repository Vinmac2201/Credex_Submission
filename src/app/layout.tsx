import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "SpendCheck AI | Free AI Spend Audit",
  description: "Find wasted rupee spend across Cursor, Claude, ChatGPT, Copilot, Gemini, APIs, and Windsurf before you renew.",
  openGraph: {
    title: "SpendCheck AI",
    description: "A free rupee-based audit for startup AI tool spend.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendCheck AI",
    description: "Find wasted AI tool spend in rupees in under 90 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
