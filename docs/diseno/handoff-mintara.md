# Handoff: Míntara — identidad de marca aplicada al producto (landing + app)

## Overview

Míntara es una app donde la usuaria **graba su propia voz leyendo afirmaciones**; el sistema limpia el audio, lo deja "sonando a estudio" y lo mezcla con un ambiente (lluvia, río o mar) para que después lo escuche cuando lo necesite. Ingreso sin contraseña: código por WhatsApp.

El producto actual (Next.js, desplegado en Vercel) ya tiene el mensaje correcto pero está **sin identidad visual**. Este handoff contiene el rediseño completo con la identidad Míntara aplicada:

- 3 alternativas de **hero** para el landing (elegir una)
- El **resto del landing**: cómo funciona, ambientes, privacidad, precios, cierre, footer
- **6 pantallas de la app**: Ingresar, Inicio, Grabar, Biblioteca, Premium, Perfil

Idioma: **español (Ecuador)**, tuteo, tono directo y humano. Moneda USD.

---

## About the Design Files

Los archivos de este bundle son **referencias de diseño hechas en HTML** — prototipos que muestran la apariencia y el comportamiento buscados, **no código de producción para copiar y pegar**.

La tarea es **recrear estos diseños dentro del codebase existente** (Next.js 14 App Router + React + Tailwind, según el proyecto actual en Vercel), usando sus patrones y librerías establecidas. Concretamente:

- El HTML usa **estilos inline** por requisitos de la herramienta de diseño. En el codebase real esto debe traducirse a **clases de Tailwind** (o CSS modules), con los colores y tipografías registrados como tokens en `tailwind.config.js`.
- Los marcos de iPhone que rodean las pantallas de la app son **solo para presentación** — no forman parte del producto. Lo que se implementa es el contenido interior de cada pantalla, responsive.
- Los recuadros grises con texto ("Cielo nocturno, nubes lila y loto sobre el agua") son **placeholders de imagen**: hay que sustituirlos por las imágenes reales (ver sección Assets).
- Los `<sc-for>` que dibujan las barras del waveform son un loop de la herramienta; en React es un `.map()` sobre un array de alturas (o mejor, alturas reales derivadas del audio).

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografías, tamaños, radios y estados están definidos y deben respetarse. Todos los valores exactos están más abajo en Design Tokens. Lo único abierto es la fotografía/ilustración de fondo, que es placeholder.

---

## Marca

**Nombre:** Míntara (con tilde, siempre).
**Tagline oficial (según el logo entregado):** `Tu voz. Tus palabras. Tu intención.`
En el diseño se usa como eyebrow con separadores medios: `Tu voz · Tus palabras · Tu intención`, 11px, uppercase, `letter-spacing: 0.30em`, color `#D88BC8`.

> Nota: existe un brand board anterior con el tagline "Tu voz. Tus afirmaciones. Tu poder." Está **descontinuado** — usar el del logo.

**Personalidad:** femenina, espiritual, nocturna, calmada. Fondo violeta profundo, tipografía serif elegante, acento dorado, detalles menta. Nada estridente, nada corporativo, sin emoji en el chrome.

---

## Screens / Views

### 1. Landing — Hero (3 alternativas, elegir una)

Las tres comparten: nav superior (emblema + wordmark "Míntara" en Playfair 24–26px a la izquierda; enlaces `Cómo funciona`, `Precios`, `Ingresar` en 13px con `letter-spacing:0.06em` a la derecha; CTA pill), titular `Escúchate decirte cosas buenas.` en Playfair Display, subtítulo, CTA primario `Grabar mi voz`.

Alto de diseño: **760px** en desktop a 1180px de ancho.

#### Hero A — Cielo nocturno full-bleed (recomendado, el más fiel a la marca)
- Imagen de fondo a sangre completa (`position:absolute; inset:0`), overlay encima:
  `linear-gradient(180deg, rgba(26,14,46,0.82) 0%, rgba(26,14,46,0.45) 42%, rgba(26,14,46,0.92) 100%)`
- Contenido centrado vertical y horizontalmente, `text-align:center`, gap 26px:
  - Eyebrow tagline (ver Marca)
  - H1 Playfair Display **80px / line-height 1.06**, color `#FFF4E6`, `max-width:820px`, `text-wrap:pretty`
  - Párrafo Montserrat 18px / 1.7, `rgba(230,214,245,0.82)`, `max-width:560px`:
    *"Grabas tu voz una vez. La dejamos sonando a estudio y la ponemos sobre lluvia, río o mar. Después la escuchas cuando la necesites."*
  - Fila de CTAs, gap 14px: primario dorado + secundario ghost `Oír un ejemplo`
- Franja inferior centrada, 13px, `rgba(230,214,245,0.62)`:
  *"Tu voz vive en tu teléfono y no se comparte con nadie."* + enlace `Cómo la cuidamos →` en `#D88BC8`
- **Importante:** el overlay y los bloques de texto llevan `pointer-events:none` con `pointer-events:auto` reactivado en los elementos clicables.

#### Hero B — Editorial partido
- Grid `1.05fr 0.95fr`. Columna izquierda con padding `44px 56px`, texto alineado a la izquierda: eyebrow, H1 Playfair **66px / 1.07**, párrafo 17px / 1.75 `max-width:460px`, CTA dorado + texto `Gratis, sin tarjeta` (14px).
- Debajo, separados por `border-top: 1px solid rgba(230,214,245,0.12)` y `padding-top:22px`, tres pruebas sociales en 14px con bullet `◆` en `#7ED1C1`:
  - "Nadie más oye tu audio. Vive en tu teléfono."
  - "Listo en menos de dos minutos."
  - "Tres ambientes: lluvia, río y mar."
- Columna derecha: imagen a sangre (`min-width:0; overflow:hidden` en la celda del grid, imagen en un contenedor `position:absolute; inset:0`), degradado lateral `linear-gradient(90deg, rgba(26,14,46,0.9) 0%, rgba(26,14,46,0) 35%)` para fundir con el texto.
- Sobre la imagen, tarjeta flotante de reproductor (`left:36px; right:36px; bottom:44px`): fondo `rgba(26,14,46,0.78)`, borde `1px solid rgba(230,214,245,0.18)`, radio 20px, `backdrop-filter: blur(8px)`, padding `18px 20px`. Contiene botón play 48px circular `#D88BC8` con glifo `▶` en `#2A1746`, título "Mi mañana" (Playfair 17px), metadata "Mi voz · lluvia suave · 0:47" (12px), y un mini waveform de barras de 3px en `#7ED1C1` (alto máx 30px).

#### Hero C — Reproductor protagonista
- Imagen de fondo al **55% de opacidad** + overlay radial `radial-gradient(circle at 50% 62%, rgba(107,63,160,0.55) 0%, rgba(14,8,25,0.94) 70%)`.
- Nav más ligero (solo `Ingresar` como pill ghost).
- H1 Playfair 64px, subtítulo 17px, y debajo una **tarjeta de reproductor de 640px**: fondo `rgba(26,14,46,0.72)`, borde `1px solid rgba(230,214,245,0.2)`, radio 26px, padding `26px 28px`, `box-shadow: 0 30px 80px rgba(0,0,0,0.45)`.
  - Botón play 62px circular `#D88BC8`, con animación `mtPulse` (ver Interactions).
  - Waveform flexible: barras `flex:1`, radio 3px, `background: linear-gradient(180deg,#7ED1C1,#A26DBE)`, alto máx 54px.
  - Duración `0:47` a la derecha, 13px, `letter-spacing:0.06em`.
  - Fila de ambientes separada por `border-top:1px solid rgba(230,214,245,0.14)` + `padding-top:18px`: label `AMBIENTE` (12px uppercase, `letter-spacing:0.14em`), chip activo `Lluvia` (fondo `#7ED1C1`, texto `#2A1746`) y chips inactivos `Río` / `Mar` (borde `rgba(230,214,245,0.25)`).
- CTA dorado + `Toma dos minutos` (14px).

---

### 2. Landing — Resto de la página

Se coloca debajo del hero elegido. Fondo de sección `#1A0E2E`. Ancho de contenido 1180px, padding lateral 80px.

**2.1 Cómo funciona** (`padding: 96px 80px`, gap 56px)
- Encabezado centrado: eyebrow `CÓMO FUNCIONA` + H2 Playfair 48px `Tres pasos y ya es tuyo.`
- Grid de 3 columnas, gap 24px. Cada tarjeta: fondo `rgba(255,255,255,0.05)`, borde `1px solid rgba(230,214,245,0.14)`, radio 22px, padding `34px 30px`, gap 16px.
  - Número `01`/`02`/`03` en Playfair 40px color `#D4AF37`
  - Título Playfair 24px `#FFF4E6`
  - Cuerpo 15px / 1.7 `rgba(230,214,245,0.72)`
  - Hover: `border-color:#A26DBE; transform:translateY(-4px)`; transición `all .25s ease`
- Contenido exacto:
  1. **Lees tus afirmaciones** — "Escribes las tuyas o eliges de nuestras listas. Después las lees en voz alta una sola vez."
  2. **Elegimos tu ambiente** — "Limpiamos el ruido, dejamos tu voz sonando a estudio y la mezclamos con lluvia, río o mar."
  3. **Lo escuchas cuando quieras** — "Queda en tu biblioteca. Al despertar, antes de dormir o cuando necesites acordarte de quién eres."

**2.2 Ambientes** (grid de 3, gap 24px, `padding: 0 80px 96px`)
- Cada tarjeta: 300px de alto, radio 22px, imagen a sangre + degradado `linear-gradient(180deg, rgba(26,14,46,0) 35%, rgba(26,14,46,0.9) 100%)`.
- Texto abajo-izquierda (`left:26px; bottom:24px`): nombre Playfair 28px + descripción 13px.
  - **Lluvia** — "Para dormir y soltar el día"
  - **Río** — "Para concentrarte y avanzar"
  - **Mar** — "Para empezar la mañana"

**2.3 Privacidad** — *la sección más importante del landing.* Fondo `#150C25`, bordes superior e inferior `1px solid rgba(230,214,245,0.1)`, `padding: 90px 80px`, grid `1fr 1fr` con gap 70px.
- Izquierda: eyebrow `TU VOZ ES TUYA` en `#7ED1C1`, H2 Playfair 44px **"Nadie va a oír tu audio. Nunca."**, párrafo 16px / 1.8:
  *"Tu grabación se procesa y se guarda para ti. No se comparte, no se publica, no se usa para entrenar nada y no se vende a nadie. Si borras un audio, se borra."*
  Enlace `Leer la política de privacidad →` 15px `#7ED1C1`.
- Derecha: dos tarjetas de objeción (radio 18px, padding `22px 24px`), título Playfair 19px + cuerpo 15px / 1.7:
  - Destacada (fondo `rgba(126,209,193,0.08)`, borde `rgba(126,209,193,0.3)`): **«Me da vergüenza oír mi voz»** — "Es lo más normal los primeros segundos. A los tres días deja de sonar raro y empieza a sonar como alguien en quien confías. Y nadie más la va a escuchar."
  - Neutra (fondo `rgba(255,255,255,0.04)`, borde `rgba(230,214,245,0.14)`): **«¿Y si no me gusta cómo suena?»** — "Puedes volver a grabar cuantas veces quieras. Lo que subes se queda solo hasta que decidas borrarlo."

**2.4 Precios** (`padding: 96px 80px`, gap 48px)
- Encabezado centrado: eyebrow `PRECIOS`, H2 Playfair 48px `Empieza gratis.`, sub 16px "Sin tarjeta. Pasas a Premium solo si quieres más audios y más ambientes."
- Grid de 3 columnas, gap 22px, tarjetas radio 24px, padding `34px 30px`. El precio va en Playfair 44px; los features en 14px / 1.6; el botón al fondo con `margin-top:auto`.

| Plan | Precio | Incluye | CTA |
|---|---|---|---|
| **Gratis** | `$0` | 1 audio guardado · Hasta 1 minuto de grabación · Ambiente lluvia · Tus afirmaciones escritas por ti | `Grabar mi voz` (ghost) |
| **Premium mensual** (destacado) | `$6.99 / mes` | Audios ilimitados · Hasta 10 minutos por grabación · Lluvia, río y mar · La IA mejora tus afirmaciones · Descargas para oír sin internet | `Empezar Premium` (dorado) |
| **Premium anual** | `$49.99 / año` | Todo lo de Premium mensual · Casi cinco meses de regalo · Ambientes nuevos primero | `Pagar un año` (ghost) |

- La tarjeta destacada lleva fondo `linear-gradient(180deg, rgba(107,63,160,0.45), rgba(162,109,190,0.18))`, borde `1px solid #D4AF37` y un badge `MÁS ELEGIDO` absolutamente posicionado (`top:-13px; left:30px`), 11px uppercase `letter-spacing:0.16em`, fondo `#D4AF37`, texto `#2A1746`, pill.
- **Los precios no están cerrados** — dejarlos como constantes/config, no hardcodeados en el JSX.

**2.5 Cierre** — banda de 420px con imagen + overlay `linear-gradient(180deg, rgba(26,14,46,0.8), rgba(26,14,46,0.92))`, texto centrado Playfair 52px / 1.12, `max-width:700px`:
*"La voz que más escuchas es la tuya. Que diga algo bueno."* + CTA dorado `Grabar mi voz`.

**2.6 Footer** — `padding: 34px 80px`, `border-top: 1px solid rgba(230,214,245,0.1)`, 13px `rgba(230,214,245,0.55)`. Izquierda: emblema 26px + wordmark Playfair 17px. Derecha: `Privacidad`, `Términos`, `Ayuda por WhatsApp` (gap 28px).

---

### 3. App — pantallas

Todas mobile-first (diseñadas a 402px de ancho), fondo `#1A0E2E`, cuerpo en Montserrat, títulos en Playfair. Padding lateral 22px.

**3.1 Ingresar**
- Centrado: emblema 88px (con animación `mtFloat`), wordmark Playfair 38px, tagline 10px uppercase `letter-spacing:0.24em` en `#D88BC8`.
- Tarjeta (radio 22px, padding `26px 22px`, gap 18px): título Playfair 22px `Tu voz`, cuerpo 14px "Te mandamos un código por WhatsApp para entrar. Sin contraseñas.", label `TU NÚMERO` (10px uppercase `letter-spacing:0.18em`), input (fondo `rgba(14,8,25,0.7)`, borde `rgba(230,214,245,0.22)`, radio 14px, padding `15px 16px`) con prefijo `+593` y número en **monospace** `letter-spacing:0.06em`, y botón dorado full-width `Enviarme el código`.
- Pie 12px centrado: "Al entrar aceptas los términos. Tu voz no se comparte con nadie."
- **Falta por diseñar:** la pantalla de ingreso del código OTP. Implementarla con la misma tarjeta, 6 casillas monospace y enlace "Reenviar código".

**3.2 Inicio**
- Barra superior: `☰` (20px), wordmark Playfair 26px centrado, avatar circular 30px.
- Saludo: Playfair 26px `Hola, Camila` + 14px `¿Qué quieres escuchar hoy?` (personalizado con el nombre real).
- Tres tarjetas de acción (fondo `rgba(162,109,190,0.22)`, borde `rgba(230,214,245,0.16)`, radio 20px, padding 20px, gap 12px). Cada una: título 16px/600, subtítulo 13px/1.5, y a la derecha un cuadro 42px radio 12px `rgba(255,244,230,0.12)` con el glifo. Hover: `border-color:#D88BC8`.
  - **Escribir mis afirmaciones** — "La IA te ayuda a pulir tus palabras." · `✎`
  - **Grabar mi voz** — "Una lectura y queda listo." · `◉`
  - **Mis audios** — "Escúchalos cuando lo necesites." · `♪`
- Sección `ESCUCHADO HOY` (label 10px uppercase `letter-spacing:0.2em`) con una fila de audio: play 44px `#D88BC8`, título Playfair 17px, metadata 12px, mini waveform 26px.
- **Tab bar** fija abajo: `padding: 14px 18px 30px`, `border-top: 1px solid rgba(230,214,245,0.12)`, fondo `rgba(14,8,25,0.6)`. Cinco slots de 56px con glifo 19px + label 10px; el activo en `#FFF4E6`, inactivos `rgba(230,214,245,0.5)`. En el centro, botón de grabar 58px circular `#D88BC8` elevado (`margin-bottom:6px`) con animación `mtPulse`.
  Orden: `Inicio` · `Biblioteca` · **(grabar)** · `Premium` · `Perfil`.
  *Nota de accesibilidad:* los glifos `⌂ ❑ ✦ ◍ ✎ ◉ ♪ ▶` son marcadores de posición tipográficos. En producción sustituirlos por iconos SVG de trazo fino y peso ligero, coherentes con la delicadeza del logo, y **nunca** por emoji.

**3.3 Grabar**
- Cabecera: `← Volver` (15px) y `Paso 2 de 3` (12px).
- Título Playfair 28px `Lee esto en voz alta` + 14px "Tranquila, puedes repetirlo cuantas veces quieras."
- Tarjeta de afirmaciones (radio 22px, padding `26px 22px`): la afirmación actual en Playfair **23px / 1.5** color `#FFF4E6`; debajo, separadas por hairline, las siguientes en 14px con opacidad decreciente (`0.6`, `0.4`) — así se lee el avance.
- Zona inferior (`margin-top:auto`, gap 22px, centrada): waveform de 70px de alto a todo el ancho (barras `flex:1`, radio 3px, degradado `#7ED1C1 → #A26DBE`), cronómetro monospace 15px `letter-spacing:0.1em` en `#7ED1C1` (`00:24`), botón de grabación **88px** circular `#D88BC8` con cuadrado interno de 26px radio 6px `#2A1746` (estado grabando) y animación `mtPulse`, y hint 13px `Toca para pausar`.

**3.4 Biblioteca**
- Cabecera: `Mis audios` Playfair 28px + `Nuevo +` 13px `#D88BC8`.
- Chips de filtro: activo fondo `#E6D6F5` texto `#2A1746`; inactivos borde `rgba(230,214,245,0.22)`. `Todos` · `Mañana` · `Dormir`.
- Filas de audio (radio 18px, padding 16px, gap 12px, hover `border-color:#A26DBE`): play 44px (activo `#D88BC8`, resto `rgba(230,214,245,0.16)`), título Playfair 18px, metadata 12px `ambiente · duración · cuándo`, menú `⋯`.
  Ejemplos: `Mi mañana` (lluvia · 0:47 · hace 2 h), `Antes de dormir` (mar · 3:10 · ayer), `Para el trabajo` (río · 1:52 · lun).
- **Muro de Premium** al alcanzar el límite gratis: tarjeta radio 20px, fondo `linear-gradient(135deg, rgba(107,63,160,0.5), rgba(216,139,200,0.2))`, borde `1px solid #D4AF37`. Título Playfair 19px "Llegaste a tu límite gratis", cuerpo 13px "Con Premium guardas todos los audios que quieras y usas río y mar.", botón dorado `Ver Premium`.
- Pie 12px centrado: "Solo tú puedes oír estos audios."
- **Falta por diseñar:** estado vacío (sin audios). Usar el emblema al 40% de opacidad + "Todavía no tienes audios" + CTA `Grabar mi voz`.

**3.5 Premium** (modal / pantalla completa)
- Cabecera: `✕` a la izquierda, `PREMIUM` centrado (12px uppercase `letter-spacing:0.2em` en `#D4AF37`).
- Bloque centrado: emblema 58px (`mtFloat`), H1 Playfair 30px / 1.2 `Tu voz, sin límites`, cuerpo 14px "Todos los audios que quieras, los tres ambientes y la IA puliendo tus afirmaciones."
- Lista de beneficios, gap 11px, check `✓` en `#7ED1C1` + texto 14px: audios ilimitados · hasta 10 minutos por grabación · lluvia, río y mar · descargas para oír sin internet.
- Dos opciones de precio (radio 18px, padding 18px, `space-between`):
  - **Un año** — destacada (mismo gradiente + borde dorado), sublabel `Casi 5 meses de regalo` en `#D4AF37`, precio Playfair 26px.
  - **Un mes** — neutra, sublabel `Cancelas cuando quieras`.
- Al fondo: botón dorado `Empezar ahora` + nota 12px "Se renueva solo. Cancelas en dos toques."

**3.6 Perfil**
- Título Playfair 28px `Perfil`.
- Tarjeta de identidad (radio 20px, padding 18px): avatar circular 56px, nombre 17px/600, teléfono en **monospace** 12px.
- Grupo `TU CUENTA` (label 10px uppercase `letter-spacing:0.2em`): filas `padding: 16px 0` separadas por `border-bottom: 1px solid rgba(230,214,245,0.1)`, etiqueta 15px `#FFF4E6` a la izquierda y valor a la derecha.
  - `Plan` → `Gratis · Ver Premium →` en `#D4AF37`
  - `Recordatorio diario` → toggle 44×26px, pista `#7ED1C1`, perilla 20px `#FFF4E6`
  - `Ambiente favorito` → `Lluvia` (14px, `rgba(230,214,245,0.6)`)
- Grupo `TU VOZ`: tarjeta menta (fondo `rgba(126,209,193,0.08)`, borde `rgba(126,209,193,0.28)`, radio 18px) con "Tus grabaciones son solo tuyas. No se comparten ni se usan para nada más." + acción `Borrar todos mis audios` 13px `#7ED1C1`. **Debe pedir confirmación y borrar de verdad, incluido el servidor.**
- Al fondo: `Ayuda por WhatsApp` (14px) y `Cerrar sesión` (14px `#D88BC8`).

---

## Interactions & Behavior

**Transiciones.** Todo lo interactivo usa `transition: all .2s ease` (tarjetas: `.25s ease`).

**Hover.**
- Botón dorado: `background: #D4AF37 → #E3C158` + `transform: translateY(-2px)`
- Botón ghost: `background: rgba(255,244,230,0.08)`, `border-color: #FFF4E6`
- Tarjetas de contenido: `border-color: #A26DBE` (landing) / `#D88BC8` (app) y, en el landing, `translateY(-4px)`
- Chips de ambiente: `border-color` y `color` pasan a `#7ED1C1`

**Press (móvil).** Añadir `active:scale-[0.97]` en botones y filas tocables — no está en el mock pero la app lo necesita.

**Animaciones** (`@keyframes`, las únicas dos del sistema):
```css
@keyframes mtPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(216,139,200,0.45); }
  50%      { box-shadow: 0 0 0 18px rgba(216,139,200,0); }
}
@keyframes mtFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
```
- `mtPulse`: botón de grabar (2.2s durante la grabación, 2.8s en reposo en la tab bar) y botón play del hero C (2.6s).
- `mtFloat`: emblema en Ingresar y Premium, 5s `ease-in-out infinite`.
- Respetar `prefers-reduced-motion: reduce` desactivando ambas.

**Flujos.**
- Landing: `Grabar mi voz` → `/ingresar`. `Cómo la cuidamos` / `Leer la política de privacidad` → `/privacidad`.
- Ingresar: teléfono → OTP por WhatsApp → sesión → `Inicio`.
- Inicio → `Escribir mis afirmaciones` → editor → `Grabar` (paso 2 de 3) → procesado → `Biblioteca` con el audio nuevo.
- Cualquier acción bloqueada por el plan gratis abre `Premium`.

**Estados que faltan en el mock y hay que implementar:**
- **Permiso de micrófono** denegado o pendiente, con explicación de por qué se necesita.
- **Procesando el audio** (limpieza + mezcla): spinner fino en `#D88BC8` sobre el emblema + copy tranquilizador ("Estamos dejando tu voz sonando a estudio…"). No es instantáneo, y es el momento más frágil del flujo.
- **Error de red** al subir la grabación, con reintento que **no pierda el audio grabado**.
- **Reproducción**: play/pausa, barra de progreso, y comportamiento con la pantalla apagada.
- **Vacíos**: biblioteca sin audios, sin afirmaciones escritas.

**Responsive.** Los diseños son desktop (1180px) para el landing y 402px para la app.
- ≥1024px: landing como está, contenido a `max-width: 1180px` centrado.
- 640–1023px: heroes pasan a una sola columna (el hero B pone la imagen arriba, 320px de alto); grids de 3 columnas → 1; H1 baja a 48–56px; padding lateral a 32px.
- <640px: padding lateral 22px; H1 a 40px; los precios se apilan con la tarjeta destacada primero.

---

## State Management

Cliente:
- `session` — usuario autenticado (teléfono, nombre, plan `gratis | premium_mensual | premium_anual`)
- `otpState` — `idle | enviando | enviado | verificando | error`, con cooldown de reenvío
- `affirmations[]` — texto de las afirmaciones a leer, más el índice de la actual en la pantalla Grabar
- `recorder` — `idle | permiso_pendiente | grabando | pausado | procesando | listo | error`, más `elapsedMs` y las alturas del waveform en vivo
- `ambient` — `lluvia | rio | mar` (bloqueados río y mar en plan gratis)
- `library[]` — audios: `{ id, titulo, ambiente, duracionSeg, creadoEn }`
- `player` — `{ audioId | null, playing, progress }` — un solo audio suena a la vez
- `filter` — chip activo de la biblioteca
- `prefs` — recordatorio diario on/off, ambiente favorito

Datos:
- El **waveform en vivo** viene del `AnalyserNode` de Web Audio; el de la biblioteca debe ser un array de picos precalculado y guardado con el audio (no recalcular en cliente).
- **Límites del plan** los decide el servidor, no el cliente: cantidad de audios, minutos por grabación, ambientes disponibles.
- **Persistir la posición de reproducción** para poder retomar.
- Los audios deben servirse por **URL firmada de vida corta**, nunca públicos. Eso sostiene toda la promesa de privacidad del landing.

---

## Design Tokens

### Colores

| Token | Hex | Uso |
|---|---|---|
| `violeta-900` | `#0E0819` | Fondo del lienzo / franja más profunda |
| `violeta-800` | `#150C25` | Fondo de la sección de privacidad |
| `violeta-700` | `#1A0E2E` | **Fondo principal** de landing y app |
| `violeta-600` | `#2A1746` | Texto sobre superficies claras/doradas |
| `violeta-500` | `#6B3FA0` | Violeta de marca (gradientes, destacados) |
| `lila-400` | `#A26DBE` | Lila de marca, hover de bordes |
| `rosa-400` | `#D88BC8` | **Acento primario**: play, botón de grabar, eyebrows, enlaces |
| `menta-400` | `#7ED1C1` | Confianza / privacidad, waveform, checks, toggles |
| `lavanda-100` | `#E6D6F5` | Texto de cuerpo (con alfa), chip activo |
| `crema-50` | `#FFF4E6` | Titulares y texto sobre fondo oscuro |
| `oro-500` | `#D4AF37` | **CTA primario**, numerales, badges, precios |
| `oro-400` | `#E3C158` | Hover del CTA dorado |

Alfas recurrentes: superficie de tarjeta `rgba(255,255,255,0.05)` · `rgba(255,255,255,0.04)`; tarjeta de app `rgba(162,109,190,0.22)`; borde hairline `rgba(230,214,245,0.14)`; borde de control `rgba(230,214,245,0.22)`; divisor `rgba(230,214,245,0.1)`; texto cuerpo `rgba(230,214,245,0.72)`; texto secundario `rgba(230,214,245,0.6)`; texto tenue `rgba(230,214,245,0.5)`.

Gradientes:
- Destacado Premium: `linear-gradient(180deg, rgba(107,63,160,0.45), rgba(162,109,190,0.18))` (vertical) / `linear-gradient(135deg, rgba(107,63,160,0.5), rgba(216,139,200,0.2))` (diagonal, en app)
- Waveform: `linear-gradient(180deg, #7ED1C1, #A26DBE)`
- Overlay de hero: ver Hero A / Hero C

### Tipografía

- **Display / titulares y cifras:** `'Playfair Display', serif` — 400/500/600, Google Fonts.
- **Cuerpo, labels y controles:** `Montserrat` — 300/400/500/600/700, Google Fonts.
- **Códigos, teléfono y cronómetro:** `ui-monospace, monospace`.

| Rol | Tamaño / line-height | Peso | Notas |
|---|---|---|---|
| H1 hero A | 80 / 1.06 | 400 Playfair | `text-wrap: pretty` |
| H1 hero B | 66 / 1.07 | 400 Playfair | |
| H1 hero C | 64 / 1.08 | 400 Playfair | |
| H2 sección | 48 / 1.15 | 400 Playfair | |
| H2 privacidad / cierre | 44 / 1.15 · 52 / 1.12 | 400 Playfair | |
| Título de tarjeta | 24 · 22 · 19 · 18 · 17 | 400 Playfair | |
| Cifra grande (precio, numeral) | 44 · 40 · 26 | 400 Playfair | |
| Cuerpo landing | 18 / 1.7 · 17 / 1.75 · 16 / 1.8 · 15 / 1.7 | 400 Montserrat | |
| Cuerpo app | 15 · 14 / 1.6 · 13 / 1.5 | 400 Montserrat | |
| Botón | 15 · 14 | 600 Montserrat | Sentence case, verbo primero |
| Eyebrow / tagline | 11 | 400 | uppercase, `letter-spacing: 0.30em` (0.24em en app) |
| Label de campo | 10 | 400 | uppercase, `letter-spacing: 0.18–0.20em` |
| Metadata | 12–13 | 400 | |
| Nav / enlaces | 13 | 400–600 | `letter-spacing: 0.04–0.06em` |

### Espaciado
Escala base de 4px. Valores usados: 2 · 4 · 5 · 6 · 8 · 10 · 11 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 26 · 28 · 30 · 34 · 36 · 40 · 44 · 48 · 56 · 70 · 80 · 96.
Padding de sección landing: `96px 80px` (privacidad `90px 80px`). Padding de tarjeta: `34px 30px` (landing), `16–26px` (app). Padding lateral de app: `22px`. Gaps de grid: `22–24px`. Gap de lista: `11–14px`.

### Radios
`999px` (pills, avatares, botones circulares, toggles) · `26px` (tarjeta de reproductor hero C) · `24px` (tarjeta de precio) · `22px` (tarjeta de paso, tarjeta de app, ambiente) · `20px` (tarjeta de acción, reproductor flotante) · `18px` (fila de audio, opción de precio) · `14px` (input) · `12px` (cuadro de glifo) · `6px` (cuadrado de stop) · `28px` (marco de presentación, no del producto).

### Sombras
Solo dos, y solo en capas flotantes:
- Tarjeta de reproductor hero C: `0 30px 80px rgba(0,0,0,0.45)`
- Pulso de grabación: ver `mtPulse`
Sin sombras internas. Los bordes hairline hacen el trabajo de separación.

### Bordes
`1px solid` siempre. `rgba(230,214,245,0.14)` por defecto, `rgba(230,214,245,0.22)` en controles, `rgba(230,214,245,0.1)` en divisores, `#D4AF37` en superficies Premium, `rgba(126,209,193,0.28–0.3)` en superficies de privacidad.

### Foco (a implementar — no está en el mock)
`outline: 2px solid #D88BC8; outline-offset: 2px`. Obligatorio en todos los interactivos.

---

## Assets

En `assets/` de este bundle:

| Archivo | Qué es | Dónde se usa |
|---|---|---|
| `mintara-badge.png` | Emblema circular: loto + luna + onda de voz, aro dorado, fondo violeta. Recortado en círculo con esquinas transparentes, 512×512. | **Marca principal en el producto**: headers del landing, footer, Ingresar (88px), Premium (58px) |
| `mintara-icon.png` | Ícono de app (cuadrado redondeado, degradado lila→menta, loto blanco + wordmark) | Ícono de PWA / App Store, favicon, splash |
| `mintara-lockup-dark.png` | Lockup completo sobre fondo violeta con tagline | Marketing, email, splash |
| `mintara-lockup-light.png` | Lockup completo sobre fondo crema | Documentos y superficies claras |
| `mintara-brand-board.png` | Hoja de logos original entregada por el cliente | Referencia |

Notas de assets:
- Los logos fueron **recortados de una hoja de marca en PNG**. Para producción hay que pedir/vectorizar **SVG** (el emblema en al menos 2 tamaños: completo y una versión simplificada para 16–32px, donde la onda de voz se pierde).
- **Toda la fotografía es placeholder.** Hacen falta 6 imágenes: cielo nocturno con nubes lila y loto sobre el agua (hero A), loto rosa sobre agua con luz cálida (hero B), nubes lila al atardecer o luna (hero C), lluvia sobre agua, río entre piedras, olas al amanecer (ambientes), y loto con luna en agua en calma (cierre). Servirlas con `next/image`, AVIF/WebP, y un LQIP borroso, porque son grandes y están en el primer viewport.
- Los glifos `⌂ ❑ ✦ ◍ ✎ ◉ ♪ ▶ ⋯ ← ✕ ☰ ✓ ◆` son **marcadores tipográficos**: sustituir por SVG de trazo fino. No usar emoji.

---

## Files

En este bundle:

- `Mintara.dc.html` — el diseño completo (los 3 heroes, el landing y las 6 pantallas de app). Ábrelo en el navegador para verlo. Es la fuente de verdad visual.
- `image-slot.js`, `ios-frame.jsx` — helpers de presentación del prototipo (placeholders de imagen y marco de iPhone). **No forman parte del producto**; no portarlos.
- `assets/` — logos y hoja de marca.

Fuente de referencia del producto actual: `https://mintara-3hackx8jp-mandarinarepublic-6819s-projects.vercel.app` (landing y `/ingresar`).

---

## Decisiones abiertas

1. **Qué hero se usa** — el cliente aún no eligió entre A, B y C. A es el más fiel a la marca; C es el que explica mejor el producto.
2. **Precios** — `$6.99/mes` y `$49.99/año` son tentativos. Dejarlos configurables.
3. **Tagline** — el logo entregado dice *"Tu voz. Tus palabras. Tu intención."* y así está en el diseño. Hay un brand board anterior con *"Tu voz. Tus afirmaciones. Tu poder."*; confirmar con el cliente antes de imprimir nada.
4. **Límites exactos del plan gratis** (1 audio, 1 minuto, solo lluvia) — puestos por diseño, hay que validarlos con el negocio.
