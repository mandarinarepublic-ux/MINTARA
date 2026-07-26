"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FRASES_DE_ESPERA = [
  "Escuchando tu voz…",
  "Quitando el ruido del cuarto…",
  "Emparejando el volumen…",
  "Casi lista…",
];

export function Espera({ grabacionId }: { grabacionId: string }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState(FRASES_DE_ESPERA[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;

    // El pulido puede tardar; sin este mensaje que cambia, la pantalla
    // parece colgada y la gente recarga a mitad del proceso.
    const rotador = setInterval(() => {
      setMensaje((actual) => {
        const i = FRASES_DE_ESPERA.indexOf(actual);
        return FRASES_DE_ESPERA[(i + 1) % FRASES_DE_ESPERA.length];
      });
    }, 4000);

    async function arrancar() {
      await fetch("/api/pulir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ grabacionId }),
      });
    }

    async function vigilar() {
      while (vivo) {
        const resp = await fetch(`/api/pulir/estado?grabacionId=${grabacionId}`);
        const datos = (await resp.json()) as { estado?: string };

        if (datos.estado === "lista") {
          router.push(`/mezclar/${grabacionId}`);
          return;
        }
        if (datos.estado === "fallida") {
          setError("No pudimos limpiar tu grabación. Puedes volver a grabarla.");
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    arrancar().then(vigilar);

    return () => {
      vivo = false;
      clearInterval(rotador);
    };
  }, [grabacionId, router]);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-red-600">{error}</p>
        <a href="/estudio" className="underline">
          Volver a empezar
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-neutral-900" />
      </div>
      <p className="text-neutral-500">{mensaje}</p>
    </div>
  );
}
