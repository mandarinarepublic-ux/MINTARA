import { test } from "node:test";
import assert from "node:assert/strict";
import {
  agruparPorFamilia,
  ambientesPermitidos,
  urlDeAmbiente,
  type Ambiente,
  type Familia,
} from "./ambientes.ts";

const FAMILIAS: Familia[] = [
  { slug: "mar", nombre: "Mar", descripcion: "Para la mañana", orden: 3, activa: true },
  { slug: "lluvia", nombre: "Lluvia", descripcion: "Para dormir", orden: 1, activa: true },
  { slug: "rio", nombre: "Río", descripcion: "Para avanzar", orden: 2, activa: true },
  { slug: "viento", nombre: "Viento", descripcion: "Guardada", orden: 4, activa: false },
];

const AMBIENTES: Ambiente[] = [
  { id: "1", familia: "lluvia", nombre: "Lluvia suave", ruta: "a.mp3", gratis: true, activo: true, orden: 1 },
  { id: "2", familia: "lluvia", nombre: "Con truenos", ruta: "b.mp3", gratis: false, activo: true, orden: 2 },
  { id: "3", familia: "rio", nombre: "Río de piedras", ruta: "c.mp3", gratis: false, activo: true, orden: 1 },
  { id: "4", familia: "mar", nombre: "Olas lentas", ruta: "d.mp3", gratis: false, activo: false, orden: 1 },
  { id: "5", familia: "viento", nombre: "Viento suave", ruta: "e.mp3", gratis: false, activo: true, orden: 1 },
];

test("agrupa cada variante bajo su familia, en el orden del panel", () => {
  const grupos = agruparPorFamilia(FAMILIAS, AMBIENTES);
  assert.deepEqual(
    grupos.map((g) => g.slug),
    ["lluvia", "rio"],
  );
  assert.deepEqual(
    grupos[0].ambientes.map((a) => a.nombre),
    ["Lluvia suave", "Con truenos"],
  );
});

test("una familia desactivada no aparece aunque tenga variantes", () => {
  const grupos = agruparPorFamilia(FAMILIAS, AMBIENTES);
  assert.equal(grupos.find((g) => g.slug === "viento"), undefined);
});

test("una familia sin variantes activas tampoco aparece", () => {
  // Mar solo tiene un ambiente y está desactivado: mostrar la ficha sería
  // ofrecer algo que al tocarlo no suena.
  const grupos = agruparPorFamilia(FAMILIAS, AMBIENTES);
  assert.equal(grupos.find((g) => g.slug === "mar"), undefined);
});

test("las variantes desactivadas no se ofrecen", () => {
  const grupos = agruparPorFamilia(FAMILIAS, AMBIENTES);
  const todas = grupos.flatMap((g) => g.ambientes);
  assert.ok(!todas.some((a) => a.id === "4"));
});

test("el plan gratis solo recibe los marcados como gratis", () => {
  const permitidos = ambientesPermitidos(AMBIENTES, "gratis");
  assert.deepEqual(permitidos.map((a) => a.id), ["1"]);
});

test("premium recibe todos los activos", () => {
  const permitidos = ambientesPermitidos(AMBIENTES, "premium");
  assert.deepEqual(permitidos.map((a) => a.id), ["1", "2", "3", "5"]);
});

test("la dirección del audio apunta al almacén público", () => {
  const url = urlDeAmbiente("lluvia/suave.mp3", "https://proyecto.supabase.co");
  assert.equal(
    url,
    "https://proyecto.supabase.co/storage/v1/object/public/fondos/lluvia/suave.mp3",
  );
});

test("sin ambientes no revienta: devuelve lista vacía", () => {
  assert.deepEqual(agruparPorFamilia(FAMILIAS, []), []);
  assert.deepEqual(ambientesPermitidos([], "premium"), []);
});
