import { obtenerPaquetes } from "@/lib/afirmaciones/servidor";
import { obtenerTextos } from "@/lib/textos/servidor";
import { Elegir } from "./Elegir";

export default async function Estudio() {
  const [paquetes, t] = await Promise.all([obtenerPaquetes(), obtenerTextos()]);
  return <Elegir paquetes={paquetes} t={t} />;
}
