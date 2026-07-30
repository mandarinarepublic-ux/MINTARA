import { obtenerTextos } from "@/lib/textos/servidor";
import { formasDeEntrar } from "@/lib/ingreso";
import { Formulario } from "./Formulario";

export default async function Ingresar() {
  const t = await obtenerTextos();
  // Se decide en el servidor: el navegador ni se entera de que existe el
  // correo mientras no esté encendido.
  return <Formulario t={t} formas={formasDeEntrar()} />;
}
