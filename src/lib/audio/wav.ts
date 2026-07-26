/**
 * Convierte la mezcla ya armada en un WAV que el reproductor del sistema
 * pueda tocar.
 *
 * ¿Por qué WAV y no MP3? Porque comprimir requeriría traer un codificador
 * de varios cientos de kilobytes al navegador, y este audio **nunca se
 * descarga ni viaja**: vive unos minutos en la memoria del teléfono
 * mientras suena. El peso da igual; el tiempo de espera de la persona, no.
 *
 * Mono y 16 bits: es voz sobre ambiente, no una masterización.
 */
export function codificarWav(buffer: AudioBuffer): ArrayBuffer {
  const muestras = buffer.getChannelData(0);
  const bytesDeDatos = muestras.length * 2;
  const salida = new ArrayBuffer(44 + bytesDeDatos);
  const vista = new DataView(salida);

  escribirTexto(vista, 0, "RIFF");
  vista.setUint32(4, 36 + bytesDeDatos, true);
  escribirTexto(vista, 8, "WAVE");

  escribirTexto(vista, 12, "fmt ");
  vista.setUint32(16, 16, true); // tamaño del bloque fmt
  vista.setUint16(20, 1, true); // PCM sin comprimir
  vista.setUint16(22, 1, true); // mono
  vista.setUint32(24, buffer.sampleRate, true);
  vista.setUint32(28, buffer.sampleRate * 2, true); // bytes por segundo
  vista.setUint16(32, 2, true); // bytes por bloque
  vista.setUint16(34, 16, true); // bits por muestra

  escribirTexto(vista, 36, "data");
  vista.setUint32(40, bytesDeDatos, true);

  for (let i = 0; i < muestras.length; i++) {
    // Recortar antes de convertir: sin esto, un valor fuera de rango da la
    // vuelta y suena como un chasquido violento en medio de la pieza.
    const v = Math.max(-1, Math.min(1, muestras[i]));
    vista.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }

  return salida;
}

function escribirTexto(vista: DataView, posicion: number, texto: string): void {
  for (let i = 0; i < texto.length; i++) {
    vista.setUint8(posicion + i, texto.charCodeAt(i));
  }
}

// Estas dos existen para que las pruebas puedan leer la cabecera sin
// duplicar la lógica de offsets.
export function leerTexto(datos: ArrayBuffer, posicion: number, largo: number): string {
  const vista = new DataView(datos);
  let salida = "";
  for (let i = 0; i < largo; i++) salida += String.fromCharCode(vista.getUint8(posicion + i));
  return salida;
}

export function leerEntero32(datos: ArrayBuffer, posicion: number): number {
  return new DataView(datos).getUint32(posicion, true);
}
