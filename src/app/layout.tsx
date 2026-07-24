import type { Metadata } from "next";
import { Playfair_Display, Roboto_Mono, JetBrains_Mono, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif-google",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono-google",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-google",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono-google",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans-google",
});

export const metadata: Metadata = {
  title: "Sheet2Vow - Digital Wedding Planner",
  description: "A sleek, mobile-first dashboard mapping your Google Sheet to a high-end Calm UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${robotoMono.variable} ${jetbrainsMono.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
