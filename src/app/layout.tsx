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
  title: "Carrossel Maker — Criador Profissional de Carrosséis",
  description: "Crie carrosséis de alto impacto e autoridade para Instagram com facilidade.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;800;900&family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,700&family=Poppins:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Roboto:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
