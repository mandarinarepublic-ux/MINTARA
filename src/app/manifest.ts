import type { MetadataRoute } from "next";

/**
 * Manifiesto de la app instalable.
 *
 * Esto es lo que convierte a Míntara en una app de pantalla de inicio, y es
 * también lo que Google Play va a necesitar el día que se publique: una PWA
 * que cumple se sube a la tienda tal cual, sin envolverla en nada.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Míntara — tu voz, tus palabras, tu intención",
    short_name: "Míntara",
    description: "Tus afirmaciones, con tu propia voz, sobre lluvia, río o mar.",
    // Abre en la biblioteca: quien ya tiene audios entra a escucharlos, y
    // quien no, encuentra ahí el botón para grabar el primero.
    start_url: "/audios",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1A0E2E",
    theme_color: "#1A0E2E",
    lang: "es-EC",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/marca/mintara-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/marca/mintara-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
