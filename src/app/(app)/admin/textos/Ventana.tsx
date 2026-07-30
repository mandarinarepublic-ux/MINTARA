"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Encoge la pantalla de verdad para que quepa en la columna de al lado.
 *
 * Se usa `zoom` y no `transform: scale`: `scale` dibuja más pequeño pero el
 * elemento sigue ocupando su tamaño original, así que debajo quedaba un
 * hueco enorme. `zoom` sí achica el espacio que ocupa.
 *
 * El factor se mide, no se adivina: una portada de 1180 px de ancho en una
 * columna de 590 va a la mitad, y en el celular, mucho más pequeña. Si la
 * pantalla ya cabe, no se toca.
 */
export function Ventana({
  anchoReal,
  children,
}: {
  anchoReal: number;
  children: React.ReactNode;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const nodo = caja.current;
    if (!nodo) return;

    const medir = () => {
      const disponible = nodo.clientWidth;
      if (disponible > 0) setZoom(Math.min(1, disponible / anchoReal));
    };

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [anchoReal]);

  return (
    <div
      ref={caja}
      className="overflow-hidden rounded-[18px] border border-lavanda-100/15 bg-violeta-900"
    >
      {/* Sin eventos: la ventana se mira, no se usa. Así ningún botón de la
          previsualización dispara nada de verdad. */}
      <div className="pointer-events-none" style={{ zoom, width: anchoReal }}>
        {children}
      </div>
    </div>
  );
}
