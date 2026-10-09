import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yaojia Zeng — Film & Narrative",
  description: "Films, screenplays and interactive narratives by Yaojia Zeng. Exploring authorship, cultural encounters and AI-assisted moving images.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
