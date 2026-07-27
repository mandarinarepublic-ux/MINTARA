import { test } from "node:test";
import assert from "node:assert/strict";
import {
  puntosDeAgachado,
  generarImpulso,
  AGACHADO,
  ANTICIPO_SEG,
  RECUPERACION_SEG,
} from "./armonia.ts";
import { construirPlan, type AjustesAudio, type Frase } from "./plan.ts";

const AJUSTES: AjustesAudio = {
  fondo: "lluvia",
  gananciaVoz: 1,
  gananciaFondo: 0.5,
  entradaSeg: 2,
  salidaSeg: 3,
  orden: "original",
};

const DOS_FRASES: Frase[] = [
  { inicio: 0, fin: 3 },
  { inicio: 8, fin: 11 }, // 5 s de silencio entre ellas
];

// ---------------------------------------------------------------------
// El ambiente que se agacha cuando entra la voz
// ---------------------------------------------------------------------

test("el ambiente baja durante la voz y vuelve en los silencios", () => {
  const plan = construirPlan(DOS_FRASES, AJUSTES);
  const puntos = puntosDeAgachado(plan);

  const alto = puntos.filter((p) => p.valor === 1);
  const bajo = puntos.filter((p) => p.valor === AGACHADO);

  assert.ok(bajo.length >= 2, "debería agacharse en cada frase");
  assert.ok(alto.length >= 2, "debería recuperarse entre frases");
});

test("termina de agacharse justo cuando entra la primera palabra", () => {
  const plan = construirPlan(DOS_FRASES, AJUSTES);
  const puntos = puntosDeAgachado(plan);
  const primeraVoz = plan.voz[0].entraEn;

  // La bajada es una rampa: arranca antes (todavía arriba) y llega abajo
  // justo al entrar la voz. Si llegara después, se oiría el tirón.
  const arranque = puntos[0];
  const abajo = puntos.find((p) => p.valor === AGACHADO)!;

  assert.equal(arranque.valor, 1);
  assert.equal(abajo.tiempoSeg, primeraVoz);
  assert.equal(
    Number((abajo.tiempoSeg - arranque.tiempoSeg).toFixed(3)),
    ANTICIPO_SEG,
  );
});

test("entre frases pegadas no sube y baja: eso bombearía", () => {
  const pegadas: Frase[] = [
    { inicio: 0, fin: 3 },
    { inicio: 3.4, fin: 6 }, // 400 ms de hueco
  ];
  const plan = construirPlan(pegadas, AJUSTES);
  const puntos = puntosDeAgachado(plan);

  // Solo una bajada al principio y una subida al final: en medio se queda
  // agachado.
  assert.equal(puntos.filter((p) => p.valor === AGACHADO).length, 2);
  assert.equal(puntos.filter((p) => p.valor === 1).length, 2);
});

test("los puntos van en orden y no se repiten en el mismo instante", () => {
  const plan = construirPlan(DOS_FRASES, AJUSTES);
  const puntos = puntosDeAgachado(plan);
  for (let i = 1; i < puntos.length; i++) {
    assert.ok(
      puntos[i].tiempoSeg > puntos[i - 1].tiempoSeg,
      `el punto ${i} no avanza en el tiempo`,
    );
  }
});

test("sin voz, el ambiente se queda quieto", () => {
  const plan = construirPlan([], AJUSTES);
  assert.deepEqual(puntosDeAgachado(plan), []);
});

test("se recupera después de la última palabra", () => {
  const plan = construirPlan(DOS_FRASES, AJUSTES);
  const puntos = puntosDeAgachado(plan);
  const ultimo = puntos[puntos.length - 1];
  const finDeLaVoz =
    plan.voz[1].entraEn + (plan.voz[1].hasta - plan.voz[1].desde);

  assert.equal(ultimo.valor, 1);
  assert.equal(
    Number((ultimo.tiempoSeg - finDeLaVoz).toFixed(3)),
    RECUPERACION_SEG,
  );
});

// ---------------------------------------------------------------------
// El espacio alrededor de la voz
// ---------------------------------------------------------------------

test("el impulso dura lo que se le pide", () => {
  const impulso = generarImpulso(48000, 1.5);
  assert.equal(impulso.length, 72000);
});

test("el impulso se apaga: el final es mucho más débil que el principio", () => {
  const impulso = generarImpulso(44100, 1.2);
  const energia = (desde: number, hasta: number) => {
    let suma = 0;
    for (let i = desde; i < hasta; i++) suma += Math.abs(impulso[i]);
    return suma / (hasta - desde);
  };
  const principio = energia(0, 4410);
  const final = energia(impulso.length - 4410, impulso.length);
  assert.ok(final < principio / 10, "la cola debería casi desaparecer");
});

test("el impulso nunca se pasa de rango", () => {
  const impulso = generarImpulso(44100, 1.2);
  for (const v of impulso) {
    assert.ok(v >= -1 && v <= 1, `valor fuera de rango: ${v}`);
  }
});
