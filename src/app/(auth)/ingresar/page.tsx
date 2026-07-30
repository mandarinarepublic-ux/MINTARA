import { obtenerTextos } from "@/lib/textos/servidor";
import { Formulario } from "./Formulario";

export default async function Ingresar() {
  const t = await obtenerTextos();
  return <Formulario t={t} />;
}
