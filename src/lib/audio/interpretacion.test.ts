import { test } from "node:test";
import assert from "node:assert/strict";
import {
  marcarFrase,
  construirGuion,
  avanceDelGuion,
  RESPIRACION_SEG,
  type Intencion,
} from "./interpretacion.ts";

/** Devuelve la intención de cada palabra, para leer los casos de un vistazo. */
function intenciones(texto: string): Intencion[] {
  return marcarFrase(texto).map((p) => p.intencion);
}

function conIntencion(texto: string, cual: Intencion): string[] {
  return marcarFrase(texto)
    .filter((p) => p.intencion === cual)
    .map((p) => p.texto);
}

test("las palabras de relleno se dicen suaves", () => {
  const suaves = conIntencion("Merezco el mismo cariño que doy", "suave");
  assert.ok(suaves.includes("el"));
  assert.ok(suaves.includes("que"));
});

test("la frase termina bajando: la última palabra va suave", () => {
  const palabras = marcarFrase("Merezco el mismo cariño que doy");
  assert.equal(palabras[palabras.length - 1].intencion, "suave");
});

test("hay una sola palabra con fuerza en una frase corta", () => {
  const fuertes = conIntencion("Merezco el mismo cariño que doy", "fuerza");
  assert.equal(fuertes.length, 1);
  assert.equal(fuertes[0], "Merezco");
});

test("nunca se pinta media frase de dorado", () => {
  const frases = [
    "Mi valor no depende de lo que logré hoy",
    "Estoy aprendiendo, y eso ya es avanzar",
    "Puedo equivocarme sin dejar de quererme",
    "Confío en lo que soy capaz de sostener",
  ];
  for (const f of frases) {
    const fuertes = conIntencion(f, "fuerza").length;
    const total = marcarFrase(f).length;
    assert.ok(fuertes <= 2, `${f}: ${fuertes} palabras con fuerza`);
    assert.ok(fuertes / total < 0.35, `${f}: demasiada frase en dorado`);
  }
});

test("una frase larga admite dos apoyos, no uno solo", () => {
  const larga =
    "Hoy elijo cuidarme con la misma paciencia que le tendría a mi mejor amiga";
  assert.equal(conIntencion(larga, "fuerza").length, 2);
});

test("una sola palabra no revienta y se dice con fuerza", () => {
  assert.deepEqual(intenciones("Respira"), ["fuerza"]);
});

test("la puntuación viaja con su palabra", () => {
  const palabras = marcarFrase("Respiro, y con eso basta.");
  assert.ok(palabras.some((p) => p.texto === "Respiro,"));
  assert.ok(palabras.some((p) => p.texto === "basta."));
});

// ---------------------------------------------------------------------
// El guion con tiempos
// ---------------------------------------------------------------------

test("el guion avanza en el tiempo sin pisarse", () => {
  const guion = construirGuion(["Merezco el mismo cariño que doy", "Respira"]);
  const todas = guion.flatMap((f) => f.palabras);
  for (let i = 1; i < todas.length; i++) {
    assert.ok(
      todas[i].desdeSeg >= todas[i - 1].hastaSeg,
      `la palabra ${i} empieza antes de que termine la anterior`,
    );
  }
});

test("entre frase y frase hay tiempo para respirar", () => {
  const guion = construirGuion(["Respiro y suelto el día", "Estoy a salvo"]);
  const hueco = guion[1].desdeSeg - guion[0].hastaSeg;
  assert.equal(Number(hueco.toFixed(3)), RESPIRACION_SEG);
});

test("la palabra con fuerza dura más que una suave", () => {
  const [frase] = construirGuion(["Merezco el mismo cariño que doy"]);
  const fuerte = frase.palabras.find((p) => p.intencion === "fuerza")!;
  const suave = frase.palabras.find((p) => p.intencion === "suave")!;
  assert.ok(
    fuerte.hastaSeg - fuerte.desdeSeg > suave.hastaSeg - suave.desdeSeg,
    "la palabra con peso debería tomarse su tiempo",
  );
});

test("el ritmo sugerido es más lento que hablar normal", () => {
  // Hablar corrido va sobre 3 palabras por segundo; leer sintiendo, mucho menos.
  const texto = "Merezco el mismo cariño que doy";
  const [frase] = construirGuion([texto]);
  const palabrasPorSegundo =
    frase.palabras.length / (frase.hastaSeg - frase.desdeSeg);
  assert.ok(
    palabrasPorSegundo < 2.6,
    `va a ${palabrasPorSegundo.toFixed(2)} palabras por segundo, demasiado rápido`,
  );
});

test("sin frases devuelve un guion vacío", () => {
  assert.deepEqual(construirGuion([]), []);
  assert.deepEqual(construirGuion(["   "]), []);
});

// ---------------------------------------------------------------------
// El avance, contado en palabras
// ---------------------------------------------------------------------

test("el avance cuenta palabras dichas, no tiempo", () => {
  const guion = construirGuion(["Merezco el mismo cariño que doy"]);
  const total = guion[0].palabras.length;

  // Cuando se enciende la tercera, ya se dijeron dos.
  const tercera = guion[0].palabras[2];
  assert.equal(avanceDelGuion(guion, tercera.desdeSeg), 2 / total);
});

test("el avance no se mueve durante la respiración entre frases", () => {
  const guion = construirGuion(["Respiro y suelto", "Estoy a salvo"]);
  const finPrimera = guion[0].hastaSeg;
  const antesDeLaSegunda = guion[1].desdeSeg - 0.01;

  // En ese hueco no se enciende ninguna palabra nueva: la barra se queda
  // quieta, igual que el texto.
  assert.equal(
    avanceDelGuion(guion, finPrimera),
    avanceDelGuion(guion, antesDeLaSegunda),
  );
});

test("empieza en cero y termina en uno", () => {
  const guion = construirGuion(["Merezco el mismo cariño que doy", "Respira"]);
  assert.equal(avanceDelGuion(guion, 0), 0);
  assert.equal(avanceDelGuion(guion, 9999), 1);
});

test("nunca retrocede", () => {
  const guion = construirGuion(["Hoy empiezo de nuevo", "Voy a mi ritmo y llego"]);
  let anterior = 0;
  for (let t = 0; t < 15; t += 0.1) {
    const ahora = avanceDelGuion(guion, t);
    assert.ok(ahora >= anterior, `retrocedió en el segundo ${t.toFixed(1)}`);
    anterior = ahora;
  }
});

test("un guion vacío no divide por cero", () => {
  assert.equal(avanceDelGuion([], 5), 1);
});
