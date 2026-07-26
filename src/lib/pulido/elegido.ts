import "server-only";
import { exigirEntorno } from "@/lib/entorno";
import { interpretarRespuesta, type ProveedorDePulido } from "./proveedor";

/**
 * ElevenLabs Voice Isolator.
 *
 * Se eligió por integración, no por precio: es un solo POST que devuelve el
 * audio limpio, mientras Auphonic y Dolby obligan a crear un trabajo y
 * esperarlo. Cuesta 1.000 créditos por minuto de audio (~$0,45 por una
 * grabación de 3 minutos, contra ~$0,07 de Auphonic).
 *
 * Si el gasto empieza a pesar, migrar a Auphonic es cambiar este archivo:
 * el resto de la app solo conoce la interfaz ProveedorDePulido.
 */
const elevenlabs: ProveedorDePulido = {
  nombre: "elevenlabs",
  async pulir(audio, tipo) {
    const cuerpo = new FormData();
    cuerpo.append("audio", audio, `voz.${tipo.includes("mp4") ? "m4a" : "webm"}`);

    const resp = await fetch("https://api.elevenlabs.io/v1/audio-isolation", {
      method: "POST",
      headers: { "xi-api-key": exigirEntorno("PULIDO_API_KEY") },
      body: cuerpo,
    });

    return interpretarRespuesta(resp);
  },
};

export function proveedorElegido(): ProveedorDePulido {
  return elevenlabs;
}
