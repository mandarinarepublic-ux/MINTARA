"use client";
import { construirPlan, type PlanDeMezcla, type Frase } from "./plan";
import { calcularEnergia, detectarFrases } from "./frases";
import { calcularGananciaNormalizacion, crearCadenaEstudio } from "./vozEstudio";
import { codificarWav } from "./wav";
import {
  puntosDeAgachado,
  generarImpulso,
  NOTA_GRAVE_HZ,
  NOTA_QUINTA_HZ,
  VOLUMEN_NOTA,
} from "./armonia";

/**
 * El desvanecido de entrada y salida, aplicado a TODA la pieza.
 *
 * Va en las dos pistas —voz y ambiente— porque lo que aparece y desaparece
 * es la grabación entera, no una capa. Si solo lo llevara el ambiente, una
 * salida larga dejaría la voz cortada en seco por debajo.
 */
function aplicarDesvanecido(
  nodo: GainNode,
  plan: PlanDeMezcla,
  volumen: number,
): void {
  const { entrada, salida } = plan.fondo;
  nodo.gain.setValueAtTime(entrada > 0 ? 0 : volumen, 0);
  if (entrada > 0) nodo.gain.linearRampToValueAtTime(volumen, entrada);
  nodo.gain.setValueAtTime(
    volumen,
    Math.max(entrada, plan.duracionTotal - salida),
  );
  if (salida > 0) nodo.gain.linearRampToValueAtTime(0, plan.duracionTotal);
}

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
  async renderizarVoz(
    plan: PlanDeMezcla,
    conEstudio = true,
    volumen = 1,
    /** Cuánta "habitación" se oye alrededor de la voz. 0 la deja seca. */
    espacio = 0,
  ): Promise<Blob> {
    if (!this.voz) throw new Error("Falta cargar la voz");

    const hz = this.voz.sampleRate;
    const offline = new OfflineAudioContext(
      1,
      Math.ceil(plan.duracionTotal * hz),
      hz,
    );

    // El desvanecido de la pieza entera vive al final de la cadena.
    const maestro = offline.createGain();
    maestro.connect(offline.destination);
    aplicarDesvanecido(maestro, plan, 1);

    // El espacio: una copia de la voz pasada por una habitación corta, mezclada
    // por debajo. La voz seca sigue mandando.
    let destinoDeLaVoz: AudioNode = maestro;
    if (espacio > 0) {
      const habitacion = offline.createConvolver();
      const largo = Math.floor(offline.sampleRate * 1.2);
      const impulso = offline.createBuffer(1, largo, offline.sampleRate);
      // set() en vez de copyToChannel: este último exige un tipo de búfer
      // más estrecho del que devuelve el generador.
      impulso.getChannelData(0).set(generarImpulso(offline.sampleRate, 1.2));
      habitacion.buffer = impulso;

      const humedo = offline.createGain();
      humedo.gain.value = espacio;
      habitacion.connect(humedo);
      humedo.connect(maestro);

      const reparto = offline.createGain();
      reparto.connect(maestro); // la voz tal cual
      reparto.connect(habitacion); // y su reflejo
      destinoDeLaVoz = reparto;
    }

    const total = this.gananciaVoz * volumen;

    // Con estudio, la voz pasa además por el filtrado y la compresión.
    const cadena = conEstudio ? crearCadenaEstudio(offline, total) : null;
    let entrada: AudioNode;

    if (cadena) {
      cadena.salida.connect(destinoDeLaVoz);
      entrada = cadena.entrada;
    } else {
      const nodo = offline.createGain();
      nodo.gain.value = total;
      nodo.connect(destinoDeLaVoz);
      entrada = nodo;
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
  async renderizarFondo(
    plan: PlanDeMezcla,
    volumen = 1,
    /** La nota grave sostenida que ata voz y ambiente. */
    conNota = false,
  ): Promise<Blob> {
    if (!this.fondo) throw new Error("Falta cargar el fondo");

    const hz = this.fondo.sampleRate;
    const offline = new OfflineAudioContext(
      1,
      Math.ceil(plan.duracionTotal * hz),
      hz,
    );

    // El desvanecido de la pieza entera, igual que en la voz.
    const maestro = offline.createGain();
    maestro.connect(offline.destination);
    aplicarDesvanecido(maestro, plan, volumen);

    /*
     * El agachado: el ambiente cede sitio mientras hay voz y vuelve en los
     * silencios. Va en su propio nodo, antes del desvanecido, para que las
     * dos automatizaciones no se peleen por el mismo control.
     */
    const agachado = offline.createGain();
    agachado.connect(maestro);
    const puntos = puntosDeAgachado(plan);
    agachado.gain.setValueAtTime(1, 0);
    for (const punto of puntos) {
      agachado.gain.linearRampToValueAtTime(punto.valor, punto.tiempoSeg);
    }

    const fuente = offline.createBufferSource();
    fuente.buffer = this.fondo;
    fuente.loop = true; // el archivo es más corto que la pieza
    fuente.connect(agachado);
    fuente.start(0, 0, plan.duracionTotal);

    // La nota grave no se agacha: es el suelo sobre el que se apoya todo.
    if (conNota) {
      const volumenNota = offline.createGain();
      volumenNota.gain.value = VOLUMEN_NOTA;
      volumenNota.connect(maestro);

      for (const hz of [NOTA_GRAVE_HZ, NOTA_QUINTA_HZ]) {
        const nota = offline.createOscillator();
        nota.type = "sine";
        nota.frequency.value = hz;
        // La quinta, más floja: acompaña, no compite.
        const suya = offline.createGain();
        suya.gain.value = hz === NOTA_GRAVE_HZ ? 1 : 0.45;
        nota.connect(suya);
        suya.connect(volumenNota);
        nota.start(0);
        nota.stop(plan.duracionTotal);
      }
    }

    return this.aBlob(await offline.startRendering());
  }

  private aBlob(mezcla: AudioBuffer): Blob {
    return new Blob([codificarWav(mezcla)], { type: "audio/wav" });
  }
}

export { construirPlan };
