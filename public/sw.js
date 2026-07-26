/**
 * Sirve desde el cajón lo que ya se guardó.
 *
 * Solo responde con lo cacheado; nunca guarda nada por su cuenta. Guardar
 * es una decisión explícita de la persona (el botón "Guardar en mi
 * celular"), no algo que pase a sus espaldas con su voz.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (evento) => {
  const url = new URL(evento.request.url);
  const esAudio =
    url.pathname.endsWith(".mp3") || url.pathname.includes("/object/sign/");
  if (!esAudio) return;

  evento.respondWith(
    // ignoreSearch: la URL firmada de la voz trae un token que cambia cada
    // hora. Sin esto, la copia guardada dejaría de encontrarse mañana.
    caches
      .match(evento.request, { ignoreSearch: true })
      .then((guardada) => guardada || fetch(evento.request)),
  );
});
