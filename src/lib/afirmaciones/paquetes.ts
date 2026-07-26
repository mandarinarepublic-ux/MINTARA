export type Paquete = {
  id: string;
  nombre: string;
  descripcion: string;
  frases: string[];
};

/**
 * Los paquetes viven en código, no en base de datos: son cinco listas de
 * texto que cambian cada varios meses. Una tabla para esto sería trabajo de
 * mantenimiento sin beneficio.
 *
 * Las frases están en primera persona y en presente, que es como funciona
 * una afirmación: "merezco", no "voy a merecer".
 */
export const PAQUETES: Paquete[] = [
  {
    id: "autoestima",
    nombre: "Autoestima",
    descripcion: "Para los días en que te cuesta reconocerte.",
    frases: [
      "Merezco el mismo cariño que doy.",
      "Mi valor no depende de lo que logré hoy.",
      "Estoy aprendiendo, y eso ya es avanzar.",
      "Puedo equivocarme sin dejar de quererme.",
      "Confío en lo que soy capaz de sostener.",
      "Hablo conmigo con respeto.",
    ],
  },
  {
    id: "calma",
    nombre: "Calma",
    descripcion: "Para bajar las revoluciones.",
    frases: [
      "Respiro, y con eso basta por ahora.",
      "Lo que siento va a pasar, como pasa todo.",
      "No tengo que resolverlo todo hoy.",
      "Suelto lo que no está en mis manos.",
      "Mi cuerpo sabe descansar.",
      "Estoy a salvo en este momento.",
    ],
  },
  {
    id: "abundancia",
    nombre: "Abundancia",
    descripcion: "Para abrir la puerta a lo que quieres construir.",
    frases: [
      "Lo que construyo con cuidado da fruto.",
      "Recibo con las manos abiertas.",
      "Hay lugar para mí en lo que deseo.",
      "Mi trabajo tiene valor y lo sé cobrar.",
      "Confío en que lo que necesito llega.",
      "Comparto sin miedo a que me falte.",
    ],
  },
  {
    id: "dormir",
    nombre: "Dormir",
    descripcion: "Para soltar el día.",
    frases: [
      "El día ya terminó, y lo hice bien.",
      "Dejo los pendientes esperando hasta mañana.",
      "Mi cuerpo pesa y se hunde tranquilo.",
      "No tengo nada que resolver esta noche.",
      "Me entrego al sueño sin apuro.",
      "Mañana habrá tiempo.",
    ],
  },
  {
    id: "manana",
    nombre: "Empezar el día",
    descripcion: "Para arrancar con otro pie.",
    frases: [
      "Hoy empiezo de nuevo.",
      "Tengo la energía que este día me pide.",
      "Voy a mi ritmo y llego.",
      "Elijo cómo quiero estar hoy.",
      "Lo que hago hoy cuenta.",
      "Salgo con la cabeza en alto.",
    ],
  },
];

export function buscarPaquete(id: string): Paquete | undefined {
  return PAQUETES.find((p) => p.id === id);
}
