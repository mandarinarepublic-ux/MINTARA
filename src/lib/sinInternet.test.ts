import { test } from "node:test";
import assert from "node:assert/strict";
import { nombreDeCache, urlsAGuardar } from "./sinInternet.ts";

test("cada grabación tiene su propio cajón", () => {
  assert.equal(nombreDeCache("abc-123"), "mi-voz-abc-123");
  assert.notEqual(nombreDeCache("abc-123"), nombreDeCache("abc-124"));
});

test("guarda la voz y todos los fondos permitidos", () => {
  const urls = urlsAGuardar("https://x/voz.mp3", ["lluvia", "rio"]);
  assert.deepEqual(urls, [
    "https://x/voz.mp3",
    "/fondos/lluvia.mp3",
    "/fondos/rio.mp3",
  ]);
});

test("sin fondos, guarda al menos la voz", () => {
  assert.deepEqual(urlsAGuardar("https://x/voz.mp3", []), ["https://x/voz.mp3"]);
});
