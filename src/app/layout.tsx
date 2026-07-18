import type { Metadata } from "next";
import { Playfair_Display, Roboto_Mono, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif-google",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono-google",
});

const inter = Inter({
  subsets: ["latin"],
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
      className={`${inter.variable} ${playfair.variable} ${robotoMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
