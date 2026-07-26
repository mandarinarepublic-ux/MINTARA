import { test } from "node:test";
import assert from "node:assert/strict";
import { elegirFormato, extensionDe } from "./grabacion.ts";

test("prefiere webm/opus cuando el navegador lo soporta", () => {
  const soporta = (m: string) => m.startsWith("audio/webm");
  assert.equal(elegirFormato(soporta), "audio/webm;codecs=opus");
});

test("cae a mp4 en Safari, que no soporta webm", () => {
  const soporta = (m: string) => m.startsWith("audio/mp4");
  assert.equal(elegirFormato(soporta), "audio/mp4");
});

test("devuelve null si el navegador no soporta ninguno", () => {
  assert.equal(elegirFormato(() => false), null);
});

test("la extensión sale del mime", () => {
  assert.equal(extensionDe("audio/webm;codecs=opus"), "webm");
  assert.equal(extensionDe("audio/mp4"), "m4a");
});
