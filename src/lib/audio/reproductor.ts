"use client";
import { construirPlan, type PlanDeMezcla, type Frase } from "./plan";
import { calcularEnergia, detectarFrases } from "./frases";
import { calcularGananciaNormalizacion, crearCadenaEstudio } from "./vozEstudio";
import { codificarWav } from "./wav";

/**
 * Arma la pieza completa a partir del plan de mezcla.
 *
 * **Por qué no suena en vivo:** el producto es para escuchar antes de dormir,
 * y el audio generado en vivo por el navegador se corta apenas se bloquea el
 * teléfono. Al entregar una pista terminada, el sistema operativo la trata
 * como cualquier canción: sigue sonando con la pantalla apagada y aparece en
 * los controles de la pantalla de bloqueo.
 *
 * La pista se arma en memoria y se entrega como un blob temporal. Sigue sin
 * existir ningún archivo que se pueda sacar de la app.
 */
export class Reproductor {
  private contexto: AudioContext | null = null;
  private voz: AudioBuffer | null = null;
  private fondo: AudioBuffer | null = null;
  /** Cuánto hay que subir o bajar esta voz para que quede al nivel de todas. */
  private gananciaVoz = 1;

  async cargar(vozUrl: string, fondoUrl: string): Promise<void> {
    this.contexto ??= new AudioContext();
    const [voz, fondo] = await Promise.all([
      this.bajar(vozUrl),
      this.bajar(fondoUrl),
    ]);
    this.voz = voz;
    this.fondo = fondo;
    // Se calcula una sola vez, sobre la grabación entera: si se recalculara
    // por frase, las frases suaves quedarían tan fuertes como las firmes y
    // la lectura perdería su relieve natural.
    this.gananciaVoz = calcularGananciaNormalizacion(voz.getChannelData(0));
  }

  /** Cambia solo el fondo, sin volver a bajar la voz (que es la pesada). */
  async cambiarFondo(fondoUrl: string): Promise<void> {
    this.contexto ??= new AudioContext();
    this.fondo = await this.bajar(fondoUrl);
  }

  private async bajar(url: string): Promise<AudioBuffer> {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`No se pudo bajar el audio (${respuesta.status}): ${url}`);
    }
    const datos = await respuesta.arrayBuffer();
    return this.contexto!.decodeAudioData(datos);
  }

  get duracionVoz(): number {
    return this.voz?.duration ?? 0;
  }

  get listo(): boolean {
    return this.voz !== null && this.fondo !== null;
  }

  /** Corta la voz en frases mirando su energía. */
  analizarFrases(): Frase[] {
    if (!this.voz) return [];
    const canal = this.voz.getChannelData(0);
    const muestrasPorVentana = Math.round(this.voz.sampleRate * 0.02);
    const energia = calcularEnergia(canal, muestrasPorVentana);
    return detectarFrases(energia, 0.02);
  }

  /**
   * Renderiza la pieza y la devuelve lista para reproducir.
   *
   * Tarda un momento (bastante menos que la duración de la pieza), y por eso
   * la pantalla debe avisar que está preparando.
   */
  async renderizar(plan: PlanDeMezcla, conEstudio = true): Promise<Blob> {
    if (!this.voz || !this.fondo) {
      throw new Error("Falta cargar la voz o el fondo antes de renderizar");
    }

    const hz = this.voz.sampleRate;
    const offline = new OfflineAudioContext(
      1,
      Math.ceil(plan.duracionTotal * hz),
      hz,
    );

    const gananciaFondo = offline.createGain();
    gananciaFondo.connect(offline.destination);
    gananciaFondo.gain.setValueAtTime(0, 0);
    gananciaFondo.gain.linearRampToValueAtTime(plan.fondo.ganancia, plan.fondo.entrada);
    gananciaFondo.gain.setValueAtTime(
      plan.fondo.ganancia,
      Math.max(plan.fondo.entrada, plan.duracionTotal - plan.fondo.salida),
    );
    gananciaFondo.gain.linearRampToValueAtTime(0, plan.duracionTotal);

    const fuenteFondo = offline.createBufferSource();
    fuenteFondo.buffer = this.fondo;
    fuenteFondo.loop = true; // el fondo es más corto que la pieza
    fuenteFondo.connect(gananciaFondo);
    fuenteFondo.start(0, 0, plan.duracionTotal);

    /*
     * El volumen final de la voz son dos cosas multiplicadas:
     *   - la normalización automática, que deja toda grabación al mismo
     *     nivel sin importar qué tan cerca del micrófono habló la persona;
     *   - lo que la persona eligió con su control.
     * Así el control se siente igual de predecible en una voz susurrada que
     * en una grabada a gritos.
     */
    const volumenVoz = this.gananciaVoz * plan.gananciaVoz;

    // Con estudio, la voz pasa además por el filtrado y la compresión.
    const cadena = conEstudio ? crearCadenaEstudio(offline, volumenVoz) : null;
    let entradaVoz: AudioNode;

    if (cadena) {
      cadena.salida.connect(offline.destination);
      entradaVoz = cadena.entrada;
    } else {
      const volumen = offline.createGain();
      volumen.gain.value = volumenVoz;
      volumen.connect(offline.destination);
      entradaVoz = volumen;
    }

    for (const bloque of plan.voz) {
      const fuente = offline.createBufferSource();
      fuente.buffer = this.voz;
      fuente.connect(entradaVoz);
      fuente.start(bloque.entraEn, bloque.desde, bloque.hasta - bloque.desde);
    }

    const mezcla = await offline.startRendering();
    return new Blob([codificarWav(mezcla)], { type: "audio/wav" });
  }
}

export { construirPlan };
