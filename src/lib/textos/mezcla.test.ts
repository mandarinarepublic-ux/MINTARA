import { test } from "node:test";
import assert from "node:assert/strict";
import { mezclarTextos, clavesValidas } from "./mezcla.ts";
import { CATALOGO, GRUPOS } from "./catalogo.ts";

test("sin nada guardado, salen los textos originales", () => {
  const t = mezclarTextos({});
  assert.equal(t["portada.hero.titulo"], "Escúchate decirte cosas buenas.");
  assert.equal(t["premium.boton"], "Empezar ahora");
});

test("lo que se guardó desde el panel le gana al original", () => {
  const t = mezclarTextos({ "portada.hero.titulo": "Habla bonito contigo." });
  assert.equal(t["portada.hero.titulo"], "Habla bonito contigo.");
});

test("lo que no se cambió sigue saliendo del original", () => {
  const t = mezclarTextos({ "portada.hero.titulo": "Otra cosa" });
  assert.equal(t["portada.hero.boton"], "Grabar mi voz");
});

test("una base caída no deja ni un solo hueco", () => {
  // Es el caso que importa: si esto falla, el cliente ve la app en blanco.
  const t = mezclarTextos({});
  for (const clave of Object.keys(CATALOGO)) {
    const valor = t[clave as keyof typeof CATALOGO];
    assert.ok(
      typeof valor === "string" && valor.trim().length > 0,
      `«${clave}» quedó vacío`,
    );
  }
});

test("una clave vieja que quedó en la base no estorba", () => {
  const t = mezclarTextos({ "pantalla.que.ya.no.existe": "sobra" });
  assert.equal(t["portada.hero.titulo"], "Escúchate decirte cosas buenas.");
  assert.ok(!("pantalla.que.ya.no.existe" in t));
});

test("un texto vacío no borra el original", () => {
  // Guardar vacío se bloquea en el panel, pero si una fila queda así por
  // cualquier motivo, la pantalla no puede quedar muda.
  const t = mezclarTextos({ "portada.hero.titulo": "   " });
  assert.equal(t["portada.hero.titulo"], "Escúchate decirte cosas buenas.");
});

test("todas las claves del catálogo están en algún grupo del panel", () => {
  // Si esto falla, hay un texto que nadie puede editar porque no aparece en
  // ninguna pantalla del panel.
  const enGrupos = new Set(GRUPOS.flatMap((g) => g.claves));
  for (const clave of Object.keys(CATALOGO)) {
    assert.ok(enGrupos.has(clave as never), `«${clave}» no sale en el panel`);
  }
});

test("ningún grupo apunta a una clave que no existe", () => {
  for (const grupo of GRUPOS) {
    for (const clave of grupo.claves) {
      assert.ok(clave in CATALOGO, `«${clave}» de ${grupo.id} no existe`);
    }
  }
});

test("cada texto del catálogo tiene etiqueta y sitio, para quien no programa", () => {
  for (const [clave, entrada] of Object.entries(CATALOGO)) {
    assert.ok(entrada.etiqueta.trim().length > 0, `«${clave}» sin etiqueta`);
    assert.ok(entrada.donde.trim().length > 0, `«${clave}» sin dónde sale`);
    assert.ok(
      !entrada.etiqueta.includes("."),
      `«${clave}» muestra la clave interna como etiqueta`,
    );
  }
});

test("clavesValidas reconoce lo del catálogo y rechaza lo demás", () => {
  assert.ok(clavesValidas("portada.hero.titulo"));
  assert.ok(!clavesValidas("cualquier.cosa"));
});
