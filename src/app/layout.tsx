import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MainNav } from "@/components/nav/main-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sporttag-Anmeldeplattform",
  description: "Verwaltung von Sportveranstaltungen und Schueleranmeldungen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <MainNav />
        <main className="flex-1">{children}</main>
        <footer className="print:hidden border-t py-4 text-center text-sm text-muted-foreground">
          Made with ❤️ in Oberstenfeld
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
