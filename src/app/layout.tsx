import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MainNav } from "@/components/nav/main-nav";
import { UpdateBanner } from "@/components/update-banner";
import { AppVersion } from "@/components/app-version";
import { PizzaReminderDialog } from "@/components/pizza-reminder-dialog";

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
        <UpdateBanner />
        <MainNav />
        <main className="flex-1">{children}</main>
        <footer className="print:hidden border-t py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <span>Made with ❤️ in Oberstenfeld</span>
          <AppVersion />
          <span className="opacity-40">·</span>
          <a
            href="https://buymeacoffee.com/kai.osthoff"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            🍕 Buy me a Pizza
          </a>
        </footer>
        <Toaster />
        <PizzaReminderDialog />
      </body>
    </html>
  );
}
