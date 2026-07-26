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
   * Arma la pista de la VOZ: las frases colocadas en el tiempo, con sus
   * silencios, y el tratamiento de estudio si toca.
   *
   * La voz y el ambiente se arman por separado a propósito. Si fueran una
   * sola pista, cambiar un volumen obligaría a rehacerla entera y el control
   * se sentiría muerto; separadas, cada volumen es el del reproductor y
   * responde al instante.
   *
   * El volumen que la persona elige NO se aplica aquí: solo la normalización
   * automática, que deja toda grabación al mismo nivel sin importar qué tan
   * cerca del micrófono se habló.
   */
  async renderizarVoz(plan: PlanDeMezcla, conEstudio = true): Promise<Blob> {
    if (!this.voz) throw new Error("Falta cargar la voz");

    const hz = this.voz.sampleRate;
    const offline = new OfflineAudioContext(
      1,
      Math.ceil(plan.duracionTotal * hz),
      hz,
    );

    // Con estudio, la voz pasa además por el filtrado y la compresión.
    const cadena = conEstudio
      ? crearCadenaEstudio(offline, this.gananciaVoz)
      : null;
    let entrada: AudioNode;

    if (cadena) {
      cadena.salida.connect(offline.destination);
      entrada = cadena.entrada;
    } else {
      const volumen = offline.createGain();
      volumen.gain.value = this.gananciaVoz;
      volumen.connect(offline.destination);
      entrada = volumen;
    }

    for (const bloque of plan.voz) {
      const fuente = offline.createBufferSource();
      fuente.buffer = this.voz;
      fuente.connect(entrada);
      fuente.start(bloque.entraEn, bloque.desde, bloque.hasta - bloque.desde);
    }

    return this.aBlob(await offline.startRendering());
  }

  /**
   * Arma la pista del AMBIENTE con la misma duración que la voz, repetido y
   * con sus desvanecidos de entrada y salida.
   *
   * Se renderiza en vez de reproducir el mp3 en bucle para que ambas pistas
   * duren exactamente lo mismo y no se vayan separando vuelta tras vuelta.
   */
  async renderizarFondo(plan: PlanDeMezcla): Promise<Blob> {
    if (!this.fondo) throw new Error("Falta cargar el fondo");

    const hz = this.fondo.sampleRate;
    const offline = new OfflineAudioContext(
      1,
      Math.ceil(plan.duracionTotal * hz),
      hz,
    );

    const volumen = offline.createGain();
    volumen.connect(offline.destination);
    volumen.gain.setValueAtTime(0, 0);
    volumen.gain.linearRampToValueAtTime(1, plan.fondo.entrada);
    volumen.gain.setValueAtTime(
      1,
      Math.max(plan.fondo.entrada, plan.duracionTotal - plan.fondo.salida),
    );
    volumen.gain.linearRampToValueAtTime(0, plan.duracionTotal);

    const fuente = offline.createBufferSource();
    fuente.buffer = this.fondo;
    fuente.loop = true; // el archivo es más corto que la pieza
    fuente.connect(volumen);
    fuente.start(0, 0, plan.duracionTotal);

    return this.aBlob(await offline.startRendering());
  }

  private aBlob(mezcla: AudioBuffer): Blob {
    return new Blob([codificarWav(mezcla)], { type: "audio/wav" });
  }
}

export { construirPlan };
