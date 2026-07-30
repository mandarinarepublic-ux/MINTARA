/**
 * Catálogo de los textos de la app.
 *
 * Cada entrada es un texto que el cliente lee. `porDefecto` es el texto
 * original, el que salía escrito en el código antes de que esto existiera, y
 * es lo que la app muestra mientras nadie lo cambie desde el panel.
 *
 * Ese respaldo es lo que permite que la app NUNCA muestre un hueco: si la base
 * no responde, si alguien borra una fila, o si agregamos una pantalla nueva y
 * todavía no hay nada guardado, sale el texto de aquí.
 *
 * `etiqueta` y `donde` son para quien edita, que no programa: nunca ve la
 * clave, ve "Título de la sección" y "Sale grande, arriba de los tres pasos".
 *
 * QUÉ NO ESTÁ AQUÍ, A PROPÓSITO:
 * - Los textos que llevan números calculados (los minutos del plan premium,
 *   las viñetas de la tabla de precios). Si se pudieran escribir a mano,
 *   alguien podría prometer "5 audios gratis" cuando el límite real es 1, y la
 *   pantalla mentiría. Esos se siguen armando desde `lib/planes.ts`.
 * - El aviso de privacidad completo, que es un texto legal.
 * - Los nombres y frases de los ambientes: esos ya se editan en la pestaña
 *   Ambientes, que es su sitio.
 */

export type Entrada = {
  porDefecto: string;
  etiqueta: string;
  donde: string;
  /** `parrafo` pinta un área de varias líneas; `corto`, un campo de una. */
  largo?: "corto" | "parrafo";
};

const ENTRADAS = {
  // ─────────────────────────── Portada · arriba ───────────────────────────
  "portada.menu.privacidad": {
    porDefecto: "Cómo la cuidamos",
    etiqueta: "Menú · enlace de privacidad",
    donde: "Arriba a la derecha, junto a Ingresar",
  },
  "portada.menu.ingresar": {
    porDefecto: "Ingresar",
    etiqueta: "Menú · botón de entrar",
    donde: "Arriba a la derecha del todo",
  },
  "portada.hero.eslogan": {
    porDefecto: "Tu voz · Tus palabras · Tu intención",
    etiqueta: "Eslogan",
    donde: "Chiquito y rosado, encima del titular grande",
  },
  "portada.hero.titulo": {
    porDefecto: "Escúchate decirte cosas buenas.",
    etiqueta: "Titular principal",
    donde: "Lo más grande de la portada, lo primero que se lee",
  },
  "portada.hero.cuerpo": {
    porDefecto:
      "Grabas tu voz una vez. La dejamos sonando a estudio y la ponemos sobre lluvia, río o mar. Después la escuchas cuando la necesites.",
    etiqueta: "Explicación bajo el titular",
    donde: "Debajo del titular grande, antes de los botones",
    largo: "parrafo",
  },
  "portada.hero.boton": {
    porDefecto: "Grabar mi voz",
    etiqueta: "Botón principal",
    donde: "El botón dorado del centro",
  },
  "portada.hero.boton_secundario": {
    porDefecto: "Cómo funciona",
    etiqueta: "Botón secundario",
    donde: "El botón con borde, al lado del dorado",
  },
  "portada.hero.pie": {
    porDefecto: "Tu voz vive en tu teléfono y no se comparte con nadie.",
    etiqueta: "Promesa del pie",
    donde: "Abajo del todo en la primera pantalla",
    largo: "parrafo",
  },
  "portada.hero.pie_enlace": {
    porDefecto: "Cómo la cuidamos →",
    etiqueta: "Enlace del pie",
    donde: "Justo después de la promesa, en rosado",
  },

  // ───────────────────────── Portada · Cómo funciona ─────────────────────────
  "portada.como_funciona.etiqueta": {
    porDefecto: "Cómo funciona",
    etiqueta: "Etiqueta de la sección",
    donde: "Chiquito y rosado, encima del título",
  },
  "portada.como_funciona.titulo": {
    porDefecto: "Tres pasos y ya es tuyo.",
    etiqueta: "Título de la sección",
    donde: "Sale grande, arriba de los tres pasos",
  },
  "portada.paso1.titulo": {
    porDefecto: "Lees tus afirmaciones",
    etiqueta: "Paso 1 · título",
    donde: "Primera tarjeta, bajo el número 01",
  },
  "portada.paso1.cuerpo": {
    porDefecto:
      "Escribes las tuyas o eliges de nuestras listas. Después las lees en voz alta una sola vez.",
    etiqueta: "Paso 1 · explicación",
    donde: "Primera tarjeta, bajo su título",
    largo: "parrafo",
  },
  "portada.paso2.titulo": {
    porDefecto: "Eliges tu ambiente",
    etiqueta: "Paso 2 · título",
    donde: "Segunda tarjeta, bajo el número 02",
  },
  "portada.paso2.cuerpo": {
    porDefecto:
      "Dejamos tu voz sonando a estudio y la mezclamos con lluvia, río o mar, al volumen que tú quieras.",
    etiqueta: "Paso 2 · explicación",
    donde: "Segunda tarjeta, bajo su título",
    largo: "parrafo",
  },
  "portada.paso3.titulo": {
    porDefecto: "Lo escuchas cuando quieras",
    etiqueta: "Paso 3 · título",
    donde: "Tercera tarjeta, bajo el número 03",
  },
  "portada.paso3.cuerpo": {
    porDefecto:
      "Queda en tu biblioteca. Al despertar, antes de dormir o cuando necesites acordarte de quién eres.",
    etiqueta: "Paso 3 · explicación",
    donde: "Tercera tarjeta, bajo su título",
    largo: "parrafo",
  },

  // ───────────────────────── Portada · Tu voz es tuya ─────────────────────────
  "portada.privacidad.etiqueta": {
    porDefecto: "Tu voz es tuya",
    etiqueta: "Etiqueta de la sección",
    donde: "Chiquito y verde menta, encima del título",
  },
  "portada.privacidad.titulo": {
    porDefecto: "Nadie va a oír tu audio. Nunca.",
    etiqueta: "Título de la sección",
    donde: "Grande, a la izquierda de la franja oscura",
  },
  "portada.privacidad.cuerpo": {
    porDefecto:
      "Tu grabación se guarda para ti y no sale de la app. No se comparte, no se publica, no se usa para entrenar nada y no se vende a nadie. Si borras un audio, se borra.",
    etiqueta: "Explicación",
    donde: "Bajo el título, a la izquierda",
    largo: "parrafo",
  },
  "portada.privacidad.enlace": {
    porDefecto: "Leer la política de privacidad →",
    etiqueta: "Enlace al aviso completo",
    donde: "Al final de la columna izquierda",
  },
  "portada.privacidad.duda1.titulo": {
    porDefecto: "«Me da vergüenza oír mi voz»",
    etiqueta: "Primera duda · pregunta",
    donde: "Tarjeta verde de la derecha",
  },
  "portada.privacidad.duda1.cuerpo": {
    porDefecto:
      "Es lo más normal los primeros segundos. A los tres días deja de sonar raro y empieza a sonar como alguien en quien confías. Y nadie más la va a escuchar.",
    etiqueta: "Primera duda · respuesta",
    donde: "Tarjeta verde de la derecha",
    largo: "parrafo",
  },
  "portada.privacidad.duda2.titulo": {
    porDefecto: "«¿Y si no me gusta cómo suena?»",
    etiqueta: "Segunda duda · pregunta",
    donde: "Segunda tarjeta de la derecha",
  },
  "portada.privacidad.duda2.cuerpo": {
    porDefecto:
      "Puedes volver a grabar cuantas veces quieras. Lo que subes se queda solo hasta que decidas borrarlo.",
    etiqueta: "Segunda duda · respuesta",
    donde: "Segunda tarjeta de la derecha",
    largo: "parrafo",
  },

  // ─────────────────────────── Portada · Cierre y pie ───────────────────────────
  "portada.cierre.titulo": {
    porDefecto: "La voz que más escuchas es la tuya. Que diga algo bueno.",
    etiqueta: "Frase de cierre",
    donde: "La última frase grande, antes del pie de página",
    largo: "parrafo",
  },
  "portada.cierre.boton": {
    porDefecto: "Grabar mi voz",
    etiqueta: "Botón de cierre",
    donde: "Bajo la frase de cierre",
  },
  "portada.pie.privacidad": {
    porDefecto: "Privacidad",
    etiqueta: "Pie · privacidad",
    donde: "Abajo del todo",
  },
  "portada.pie.ayuda": {
    porDefecto: "Ayuda por WhatsApp",
    etiqueta: "Pie · ayuda",
    donde: "Abajo del todo, a la derecha",
  },

  // ───────────────────────────────── Ingresar ─────────────────────────────────
  "ingresar.eslogan": {
    porDefecto: "Tu voz · Tus palabras · Tu intención",
    etiqueta: "Eslogan",
    donde: "Bajo el logo, en rosado",
  },
  "ingresar.titulo": {
    porDefecto: "Tu voz",
    etiqueta: "Título de la tarjeta",
    donde: "Arriba de la tarjeta donde se pone el número",
  },
  "ingresar.cuerpo": {
    porDefecto:
      "Te mandamos un código por WhatsApp para entrar. Sin contraseñas.",
    etiqueta: "Explicación",
    donde: "Bajo el título, antes del campo del número",
    largo: "parrafo",
  },
  "ingresar.etiqueta_numero": {
    porDefecto: "Tu número",
    etiqueta: "Nombre del campo",
    donde: "Encima de la casilla del celular",
  },
  "ingresar.boton": {
    porDefecto: "Enviarme el código",
    etiqueta: "Botón",
    donde: "El botón dorado",
  },
  "ingresar.boton_enviando": {
    porDefecto: "Enviando…",
    etiqueta: "Botón mientras envía",
    donde: "Reemplaza al botón el segundo que tarda en mandar el código",
  },
  "ingresar.pie": {
    porDefecto: "Al entrar aceptas los términos. Tu voz no se comparte con nadie.",
    etiqueta: "Nota del pie",
    donde: "Abajo del todo, chiquito",
    largo: "parrafo",
  },

  // ─────────────────────────────── Consentimiento ───────────────────────────────
  "consentimiento.titulo": {
    porDefecto: "Antes de grabar tu voz",
    etiqueta: "Título",
    donde: "Bajo el logo",
  },
  "consentimiento.entrada": {
    porDefecto:
      "Tu voz es tuya. Esto es lo que hacemos con ella, sin letra chica:",
    etiqueta: "Frase de entrada",
    donde: "Lo primero de la tarjeta, antes de los cuatro puntos",
    largo: "parrafo",
  },
  "consentimiento.punto1.titulo": {
    porDefecto: "La guardamos para ti.",
    etiqueta: "Punto 1 · en negrita",
    donde: "Primer punto de la lista",
  },
  "consentimiento.punto1.cuerpo": {
    porDefecto:
      "Queda en un almacén privado al que nadie llega por una dirección de internet. Ninguna persona de nuestro equipo la escucha.",
    etiqueta: "Punto 1 · resto",
    donde: "Sigue a la negrita, en el mismo párrafo",
    largo: "parrafo",
  },
  "consentimiento.punto2.titulo": {
    porDefecto: "No se la mandamos a nadie.",
    etiqueta: "Punto 2 · en negrita",
    donde: "Segundo punto de la lista",
  },
  "consentimiento.punto2.cuerpo": {
    porDefecto:
      "El tratamiento que le da presencia y empareja el volumen ocurre en tu propio teléfono, cuando le das play. Tu voz no viaja a ninguna empresa ajena, ni siquiera para procesarla.",
    etiqueta: "Punto 2 · resto",
    donde: "Sigue a la negrita, en el mismo párrafo",
    largo: "parrafo",
  },
  "consentimiento.punto3.titulo": {
    porDefecto: "Nunca la compartimos ni la vendemos.",
    etiqueta: "Punto 3 · en negrita",
    donde: "Tercer punto de la lista",
  },
  "consentimiento.punto3.cuerpo": {
    porDefecto: "A nadie, por ningún motivo.",
    etiqueta: "Punto 3 · resto",
    donde: "Sigue a la negrita, en el mismo párrafo",
    largo: "parrafo",
  },
  "consentimiento.punto4.titulo": {
    porDefecto: "Puedes borrarla cuando quieras",
    etiqueta: "Punto 4 · en negrita",
    donde: "Cuarto punto de la lista",
  },
  "consentimiento.punto4.cuerpo": {
    porDefecto: ", desde tu perfil, en un toque. Borrar es borrar.",
    etiqueta: "Punto 4 · resto",
    donde: "Sigue a la negrita. Empieza con coma a propósito",
    largo: "parrafo",
  },
  "consentimiento.enlace": {
    porDefecto: "Leer el aviso completo →",
    etiqueta: "Enlace al aviso",
    donde: "Al final de la tarjeta",
  },
  "consentimiento.boton": {
    porDefecto: "Entiendo, quiero grabar",
    etiqueta: "Botón",
    donde: "El botón dorado de abajo",
  },

  // ───────────────────────────────── Estudio ─────────────────────────────────
  "estudio.paso": {
    porDefecto: "Paso 1 de 2",
    etiqueta: "Indicador de paso",
    donde: "Chiquito, encima del título",
  },
  "estudio.titulo": {
    porDefecto: "¿Qué quieres decirte?",
    etiqueta: "Título",
    donde: "Lo grande de la pantalla de elegir afirmaciones",
  },
  "estudio.agregar": {
    porDefecto: "Agregar una frase mía",
    etiqueta: "Enlace para agregar frase",
    donde: "Bajo la última frase, en rosado",
  },
  "estudio.boton": {
    porDefecto: "Ya está, vamos a grabar",
    etiqueta: "Botón",
    donde: "El botón dorado, pegado abajo",
  },
  "estudio.boton_guardando": {
    porDefecto: "Guardando…",
    etiqueta: "Botón mientras guarda",
    donde: "Reemplaza al botón el segundo que tarda en guardar",
  },

  // ───────────────────────────────── Premium ─────────────────────────────────
  "premium.etiqueta": {
    porDefecto: "Premium",
    etiqueta: "Etiqueta de arriba",
    donde: "Arriba al centro, en dorado",
  },
  "premium.titulo": {
    porDefecto: "Tu voz, sin límites",
    etiqueta: "Título",
    donde: "Bajo el logo",
  },
  "premium.cuerpo": {
    porDefecto:
      "Todos los audios que quieras, los tres ambientes y tus grabaciones guardadas para escucharlas donde sea.",
    etiqueta: "Explicación",
    donde: "Bajo el título, antes de la lista de beneficios",
    largo: "parrafo",
  },
  "premium.beneficio1": {
    porDefecto: "Todos los audios que quieras",
    etiqueta: "Beneficio 1",
    donde: "Primera línea con visto verde",
  },
  "premium.beneficio3": {
    porDefecto: "Lluvia, río y mar, con todas sus variantes",
    etiqueta: "Beneficio 3",
    donde: "Tercera línea con visto verde",
  },
  "premium.beneficio4": {
    porDefecto: "Guardarlos para oírlos sin internet",
    etiqueta: "Beneficio 4",
    donde: "Cuarta línea con visto verde",
  },
  "premium.anual.titulo": {
    porDefecto: "Un año",
    etiqueta: "Plan anual · nombre",
    donde: "Tarjeta dorada de arriba",
  },
  "premium.anual.nota": {
    porDefecto: "Casi 5 meses de regalo",
    etiqueta: "Plan anual · gancho",
    donde: "Bajo el nombre, en dorado",
  },
  "premium.mensual.titulo": {
    porDefecto: "Un mes",
    etiqueta: "Plan mensual · nombre",
    donde: "Tarjeta de abajo",
  },
  "premium.mensual.nota": {
    porDefecto: "Cancelas cuando quieras",
    etiqueta: "Plan mensual · nota",
    donde: "Bajo el nombre",
  },
  "premium.boton": {
    porDefecto: "Empezar ahora",
    etiqueta: "Botón",
    donde: "El botón dorado de abajo",
  },
  "premium.pie": {
    porDefecto:
      "Te escribimos por WhatsApp para activarlo. Cancelas cuando quieras.",
    etiqueta: "Nota del pie",
    donde: "Bajo el botón, chiquito",
    largo: "parrafo",
  },
} as const satisfies Record<string, Entrada>;

/**
 * El `as const` de arriba es lo que permite que `Clave` sea la lista exacta de
 * claves y que TypeScript avise si una pantalla pide una que no existe. Pero
 * también vuelve cada entrada un tipo literal, donde `largo` "no existe" en
 * las que no lo traen. Esta segunda vista, ya tipada como `Entrada`, es la que
 * usa el panel.
 */
export type Clave = keyof typeof ENTRADAS;

export const CATALOGO: Record<Clave, Entrada> = ENTRADAS;

/** Los textos ya resueltos, listos para pintar. */
export type Textos = Record<Clave, string>;

/**
 * Las pantallas, en el orden en que las recorre el cliente. No alfabético ni
 * por nombre de archivo: quien edita busca "eso que sale cuando entra" y lo
 * encuentra donde lo espera.
 */
export type Grupo = {
  id: string;
  nombre: string;
  pista: string;
  /** Para el enlace "ver dónde sale". */
  ruta: string;
  claves: Clave[];
};

export const GRUPOS: Grupo[] = [
  {
    id: "portada-arriba",
    nombre: "Portada · lo primero que se ve",
    pista: "El titular grande y los botones de la primera pantalla",
    ruta: "/",
    claves: [
      "portada.menu.privacidad",
      "portada.menu.ingresar",
      "portada.hero.eslogan",
      "portada.hero.titulo",
      "portada.hero.cuerpo",
      "portada.hero.boton",
      "portada.hero.boton_secundario",
      "portada.hero.pie",
      "portada.hero.pie_enlace",
    ],
  },
  {
    id: "portada-como-funciona",
    nombre: "Portada · Cómo funciona",
    pista: "Los tres pasos",
    ruta: "/",
    claves: [
      "portada.como_funciona.etiqueta",
      "portada.como_funciona.titulo",
      "portada.paso1.titulo",
      "portada.paso1.cuerpo",
      "portada.paso2.titulo",
      "portada.paso2.cuerpo",
      "portada.paso3.titulo",
      "portada.paso3.cuerpo",
    ],
  },
  {
    id: "portada-privacidad",
    nombre: "Portada · Tu voz es tuya",
    pista: "La franja oscura con las dos dudas",
    ruta: "/",
    claves: [
      "portada.privacidad.etiqueta",
      "portada.privacidad.titulo",
      "portada.privacidad.cuerpo",
      "portada.privacidad.enlace",
      "portada.privacidad.duda1.titulo",
      "portada.privacidad.duda1.cuerpo",
      "portada.privacidad.duda2.titulo",
      "portada.privacidad.duda2.cuerpo",
    ],
  },
  {
    id: "portada-cierre",
    nombre: "Portada · cierre y pie",
    pista: "La última frase y el pie de página",
    ruta: "/",
    claves: [
      "portada.cierre.titulo",
      "portada.cierre.boton",
      "portada.pie.privacidad",
      "portada.pie.ayuda",
    ],
  },
  {
    id: "ingresar",
    nombre: "Entrar con el celular",
    pista: "Donde se pide el número para mandar el código",
    ruta: "/ingresar",
    claves: [
      "ingresar.eslogan",
      "ingresar.titulo",
      "ingresar.cuerpo",
      "ingresar.etiqueta_numero",
      "ingresar.boton",
      "ingresar.boton_enviando",
      "ingresar.pie",
    ],
  },
  {
    id: "consentimiento",
    nombre: "Antes de grabar",
    pista: "Las cuatro promesas sobre la voz",
    ruta: "/consentimiento",
    claves: [
      "consentimiento.titulo",
      "consentimiento.entrada",
      "consentimiento.punto1.titulo",
      "consentimiento.punto1.cuerpo",
      "consentimiento.punto2.titulo",
      "consentimiento.punto2.cuerpo",
      "consentimiento.punto3.titulo",
      "consentimiento.punto3.cuerpo",
      "consentimiento.punto4.titulo",
      "consentimiento.punto4.cuerpo",
      "consentimiento.enlace",
      "consentimiento.boton",
    ],
  },
  {
    id: "estudio",
    nombre: "Elegir las afirmaciones",
    pista: "La pantalla donde se escogen y editan las frases",
    ruta: "/estudio",
    claves: [
      "estudio.paso",
      "estudio.titulo",
      "estudio.agregar",
      "estudio.boton",
      "estudio.boton_guardando",
    ],
  },
  {
    id: "premium",
    nombre: "Premium",
    pista: "La pantalla de pago",
    ruta: "/premium",
    claves: [
      "premium.etiqueta",
      "premium.titulo",
      "premium.cuerpo",
      "premium.beneficio1",
      "premium.beneficio3",
      "premium.beneficio4",
      "premium.anual.titulo",
      "premium.anual.nota",
      "premium.mensual.titulo",
      "premium.mensual.nota",
      "premium.boton",
      "premium.pie",
    ],
  },
];
