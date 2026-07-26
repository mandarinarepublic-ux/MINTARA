import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretarRespuesta } from "./proveedor.ts";

test("una respuesta buena entrega el audio", async () => {
  const cuerpo = new Uint8Array([1, 2, 3]);
  const resp = new Response(cuerpo, {
    status: 200,
    headers: { "content-type": "audio/mpeg" },
  });
  const r = await interpretarRespuesta(resp);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.tipo, "audio/mpeg");
    assert.equal(r.audio.byteLength, 3);
  }
});

test("un error del servicio no revienta: devuelve el motivo", async () => {
  const resp = new Response("cuota agotada", { status: 402 });
  const r = await interpretarRespuesta(resp);
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.motivo, /402/);
});

test("una respuesta vacía se trata como fallo", async () => {
  const resp = new Response(new Uint8Array([]), {
    status: 200,
    headers: { "content-type": "audio/mpeg" },
  });
  const r = await interpretarRespuesta(resp);
  assert.equal(r.ok, false);
});
