import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  variable: "--fuente-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cuerpo = Montserrat({
  variable: "--fuente-cuerpo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Míntara — tu voz, tus palabras, tu intención",
  description:
    "Grabas tu voz leyendo tus afirmaciones. La dejamos sonando a estudio y la ponemos sobre lluvia, río o mar. Después la escuchas cuando la necesites.",
  applicationName: "Míntara",
  appleWebApp: {
    capable: true,
    title: "Míntara",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/marca/mintara-icon.png",
    apple: "/marca/mintara-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A0E2E",
  // Se instala en la pantalla de inicio: debe llegar hasta los bordes de la
  // pantalla y no dejarse escalar como una página cualquiera.
  viewportFit: "cover",
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${cuerpo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
