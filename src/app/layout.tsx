import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://rehobot-rose.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Rehobot Real Estate — Tu inmobiliaria en Madrid",
    template: "%s · Rehobot Real Estate",
  },
  description:
    "Compra y venta de pisos, chalets y locales en Madrid y el Corredor del Henares. Inmobiliaria con +15 años de experiencia, asesoramiento personalizado y trato cercano.",
  applicationName: "Rehobot Real Estate",
  authors: [{ name: "Rehobot Real Estate" }],
  keywords: [
    "inmobiliaria Madrid",
    "pisos en venta Madrid",
    "pisos en venta Alcalá de Henares",
    "pisos en venta Torrejón de Ardoz",
    "pisos en venta Coslada",
    "vender mi casa Madrid",
    "tasación gratis Madrid",
    "chalets Madrid",
    "inmobiliaria Corredor del Henares",
  ],
  openGraph: {
    title: "Rehobot Real Estate — Tu inmobiliaria en Madrid",
    description:
      "Compra y venta de viviendas en Madrid y el Corredor del Henares.",
    type: "website",
    locale: "es_ES",
    siteName: "Rehobot Real Estate",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Rehobot Real Estate",
    description:
      "Compra y venta de viviendas en Madrid y el Corredor del Henares.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
