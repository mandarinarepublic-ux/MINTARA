"use client";
import { construirPlan, type PlanDeMezcla, type Frase } from "./plan";
import { calcularEnergia, detectarFrases } from "./frases";

/**
 * Ejecuta un plan de mezcla con Web Audio.
 *
 * No genera archivos: programa la voz y el fondo en el reloj del navegador
 * y los suena. Por eso cambiar de fondo o mover el volumen es instantáneo,
 * y por eso no existe ningún audio que se pueda extraer de la app.
 */
export class Reproductor {
  private contexto: AudioContext | null = null;
  private voz: AudioBuffer | null = null;
  private fondo: AudioBuffer | null = null;
  private fuentes: AudioBufferSourceNode[] = [];
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  async cargar(vozUrl: string, fondoUrl: string): Promise<void> {
    this.contexto ??= new AudioContext();
    const [voz, fondo] = await Promise.all([
      this.bajar(vozUrl),
      this.bajar(fondoUrl),
    ]);
    this.voz = voz;
    this.fondo = fondo;
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

  /** Corta la voz master en frases mirando su energía. */
  analizarFrases(): Frase[] {
    if (!this.voz) return [];
    const canal = this.voz.getChannelData(0);
    const muestrasPorVentana = Math.round(this.voz.sampleRate * 0.02);
    const energia = calcularEnergia(canal, muestrasPorVentana);
    return detectarFrases(energia, 0.02);
  }

  reproducir(plan: PlanDeMezcla, enBucle: boolean): void {
    if (!this.contexto || !this.voz || !this.fondo) return;
    this.detener();
    // iOS arranca el contexto suspendido: sin esto, el primer toque no suena.
    void this.contexto.resume();

    const ahora = this.contexto.currentTime + 0.1;

    const gananciaFondo = this.contexto.createGain();
    gananciaFondo.connect(this.contexto.destination);
    gananciaFondo.gain.setValueAtTime(0, ahora);
    gananciaFondo.gain.linearRampToValueAtTime(
      plan.fondo.ganancia,
      ahora + plan.fondo.entrada,
    );
    gananciaFondo.gain.setValueAtTime(
      plan.fondo.ganancia,
      ahora + plan.duracionTotal - plan.fondo.salida,
    );
    gananciaFondo.gain.linearRampToValueAtTime(0, ahora + plan.duracionTotal);

    const fuenteFondo = this.contexto.createBufferSource();
    fuenteFondo.buffer = this.fondo;
    fuenteFondo.loop = true; // el fondo puede ser más corto que la pieza
    fuenteFondo.connect(gananciaFondo);
    fuenteFondo.start(ahora, 0, plan.duracionTotal);
    this.fuentes.push(fuenteFondo);

    for (const bloque of plan.voz) {
      const fuente = this.contexto.createBufferSource();
      fuente.buffer = this.voz;
      fuente.connect(this.contexto.destination);
      fuente.start(
        ahora + bloque.entraEn,
        bloque.desde,
        bloque.hasta - bloque.desde,
      );
      this.fuentes.push(fuente);
    }

    if (enBucle) {
      this.temporizador = setTimeout(
        () => this.reproducir(plan, true),
        plan.duracionTotal * 1000,
      );
    }
  }

  detener(): void {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = null;
    this.fuentes.forEach((f) => {
      try {
        f.stop();
      } catch {
        // Ya había terminado sola; no es un error.
      }
    });
    this.fuentes = [];
  }
}

export { construirPlan };
