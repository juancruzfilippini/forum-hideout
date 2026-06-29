import type { Metadata } from "next";

import "./globals.css";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Forum Hideout",
    template: "%s | Forum Hideout",
  },
  description: "Foro comunitario del servidor Zombie Hideout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <div aria-hidden="true" className="site-bg fixed inset-0 -z-20" />
        <div aria-hidden="true" className="site-scanlines pointer-events-none fixed inset-0 -z-10 opacity-55" />
        <SiteHeader />
        <main className="mx-auto min-h-[calc(100vh-85px)] max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
