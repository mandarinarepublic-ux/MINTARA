import { test } from "node:test";
import assert from "node:assert/strict";
import { PAQUETES, buscarPaquete } from "./paquetes.ts";

test("hay cinco paquetes con identificadores únicos", () => {
  assert.equal(PAQUETES.length, 5);
  const ids = new Set(PAQUETES.map((p) => p.id));
  assert.equal(ids.size, 5);
});

test("cada paquete tiene entre 5 y 12 frases", () => {
  for (const p of PAQUETES) {
    assert.ok(p.frases.length >= 5, `${p.id} tiene muy pocas frases`);
    assert.ok(p.frases.length <= 12, `${p.id} tiene demasiadas frases`);
  }
});

test("las frases no quedan vacías ni se pasan de largo", () => {
  for (const p of PAQUETES) {
    for (const f of p.frases) {
      assert.ok(f.trim().length > 0, `${p.id} tiene una frase vacía`);
      assert.ok(f.length <= 120, `frase muy larga en ${p.id}: ${f}`);
    }
  }
});

test("buscarPaquete encuentra por id y devuelve undefined si no existe", () => {
  assert.equal(buscarPaquete("calma")?.id, "calma");
  assert.equal(buscarPaquete("no-existe"), undefined);
});
