import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALOC CBT Practice Starter — JAMB, WAEC, NECO & Post-UTME",
  description:
    "Open-source CBT exam practice application built with Next.js and the ALOC Assessment Content Infrastructure API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
