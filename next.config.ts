import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    /**
     * Versión visible en la app.
     *
     * Existe para poder responder a "no me funciona": sin esto no hay forma
     * de saber si el teléfono está corriendo el código recién desplegado o
     * uno viejo guardado en caché, y se pierde el tiempo arreglando cosas
     * que ya estaban arregladas.
     */
    NEXT_PUBLIC_VERSION:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  },
};

export default nextConfig;
