"use client";
import type { Textos } from "@/lib/textos/catalogo";
import type { Paquete } from "@/lib/afirmaciones/paquetes";
import { PRECIOS } from "@/lib/planes";
import {
  Hero,
  ComoFunciona,
  Privacidad,
  Cierre,
  Pie,
} from "@/app/(publico)/Secciones";
import { Formulario } from "@/app/(auth)/ingresar/Formulario";
import { Contenido as Consentimiento } from "@/app/(app)/consentimiento/Contenido";
import {
  Contenido as Premium,
  beneficiosPremium,
} from "@/app/(app)/premium/Contenido";
import { Elegir } from "@/app/(app)/estudio/Elegir";

/**
 * La ventana de "así queda".
 *
 * Pinta LOS MISMOS componentes que ve el cliente, alimentados con lo que se
 * está escribiendo en ese momento. No es un dibujo aparte: si lo fuera, se
 * separaría de la realidad con el primer cambio de diseño y empezaría a
 * mentir, que es justo lo que esta pantalla existe para evitar.
 *
 * Va dentro de un contenedor que no deja tocar nada, así que los botones y
 * formularios se ven pero no hacen nada.
 */

/** Ancho real de cada pantalla, para que la escala no engañe. */
const ANCHOS: Record<string, number> = {
  "portada-arriba": 1180,
  "portada-como-funciona": 1180,
  "portada-privacidad": 1180,
  "portada-cierre": 1180,
  ingresar: 402,
  consentimiento: 520,
  estudio: 520,
  premium: 480,
};

export function anchoDe(grupo: string): number {
  return ANCHOS[grupo] ?? 1180;
}

/** Basta para ver cómo caen los textos; las de verdad las elige el cliente. */
const PAQUETES_DE_EJEMPLO: Paquete[] = [
  {
    id: "ejemplo",
    nombre: "Autoestima",
    descripcion: "Para los días en que te cuesta reconocerte.",
    frases: ["Merezco el mismo cariño que doy.", "Hablo conmigo con respeto."],
  },
];

export function VistaPrevia({ grupo, t }: { grupo: string; t: Textos }) {
  switch (grupo) {
    case "portada-arriba":
      return <Hero t={t} />;
    case "portada-como-funciona":
      return <ComoFunciona t={t} />;
    case "portada-privacidad":
      return <Privacidad t={t} />;
    case "portada-cierre":
      return (
        <>
          <Cierre t={t} />
          <Pie t={t} />
        </>
      );
    case "ingresar":
      return <Formulario t={t} />;
    case "consentimiento":
      return <Consentimiento t={t} />;
    case "estudio":
      return <Elegir paquetes={PAQUETES_DE_EJEMPLO} t={t} />;
    case "premium":
      return (
        <Premium
          t={t}
          beneficios={beneficiosPremium(t)}
          precioAnual={PRECIOS.anual.monto}
          precioMensual={PRECIOS.mensual.monto}
        />
      );
    default:
      return (
        <p className="p-8 text-sm text-lavanda-100/60">
          Esta parte no tiene previsualización todavía.
        </p>
      );
  }
}
