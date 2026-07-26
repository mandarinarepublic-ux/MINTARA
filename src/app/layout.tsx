import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MINTARA — tus afirmaciones con tu propia voz",
  description:
    "Graba tu voz leyendo afirmaciones y escúchalas sobre lluvia, río o mar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
