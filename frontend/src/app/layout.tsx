import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#102542",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Filatelia Bolivia — Bóveda Oficial & Catálogo Postal Soberano",
  description: "Exclusiva galería filatélica y catálogo oficial de piezas postales de colección, emisiones conmemorativas y custodia institucional de Bolivia.",
  icons: {
    icon: "/images/FILATELIA-1.png",
    shortcut: "/images/FILATELIA-1.png",
    apple: "/images/FILATELIA-1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F0] text-[#102542]">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

