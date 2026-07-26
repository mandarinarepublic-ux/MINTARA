import { test } from "node:test";
import assert from "node:assert/strict";
import { limpiarValor } from "./entorno.ts";

// El BOM (U+FEFF) es invisible: aislado en su propia constante al menos se
// entiende qué está probando el caso de abajo. Si esta línea parece decir
// `const BOM = ""`, es correcto: el carácter está ahí, no se ve.
const BOM = "﻿";

test("quita el BOM que mete PowerShell al cargar variables a Vercel", () => {
  assert.equal(
    limpiarValor(BOM + "https://ejemplo.supabase.co"),
    "https://ejemplo.supabase.co",
  );
});

test("quita espacios y comillas sobrantes", () => {
  assert.equal(limpiarValor('  "abc123"  '), "abc123");
  assert.equal(limpiarValor("'abc123'"), "abc123");
});

test("deja intacto un valor limpio", () => {
  assert.equal(limpiarValor("abc123"), "abc123");
});

test("un valor vacío se trata como ausente", () => {
  assert.equal(limpiarValor("   "), "");
});
