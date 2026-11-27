import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./themes.css";
import { AppProviders } from "@/components/providers";
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});
export const metadata: Metadata = {
  title: "StoreDesk — Retail, in good order",
  description: "Billing and stock for your shop.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
};
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#F2E8DA",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrument.variable} ${newsreader.variable} ${jetbrains.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
