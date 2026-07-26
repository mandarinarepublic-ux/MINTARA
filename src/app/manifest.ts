import type { MetadataRoute } from "next";

/**
 * Manifiesto para que se pueda instalar en el celular y funcione sin
 * internet.
 *
 * PENDIENTE: falta el icono. Va aparte porque es una decisión de marca
 * (y hace falta el nombre comercial definitivo), no algo que se resuelva
 * con un cuadrado de color.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MINTARA",
    short_name: "MINTARA",
    description: "Tus afirmaciones, con tu propia voz.",
    start_url: "/estudio",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [],
  };
}
