import { test } from "node:test";
import assert from "node:assert/strict";
import { nombreDeCache, urlsAGuardar } from "./sinInternet.ts";

test("cada grabación tiene su propio cajón", () => {
  assert.equal(nombreDeCache("abc-123"), "MINTARA-abc-123");
  assert.notEqual(nombreDeCache("abc-123"), nombreDeCache("abc-124"));
});

test("guarda la voz y todos los ambientes que la persona puede usar", () => {
  const urls = urlsAGuardar("https://x/voz.mp3", [
    "https://s/fondos/lluvia.mp3",
    "https://s/fondos/rio.mp3",
  ]);
  assert.deepEqual(urls, [
    "https://x/voz.mp3",
    "https://s/fondos/lluvia.mp3",
    "https://s/fondos/rio.mp3",
  ]);
});

test("sin ambientes, guarda al menos la voz", () => {
  assert.deepEqual(urlsAGuardar("https://x/voz.mp3", []), ["https://x/voz.mp3"]);
});
