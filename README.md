# MINTARA

Afirmaciones con la voz de la propia persona, sobre un fondo de lluvia, río o mar.

## Cómo correrlo

    npm install
    cp .env.example .env.local   # llenar con las claves de mandarina-DATA
    npm run dev

## Pruebas

    npm test

Sin librerías de pruebas: runner nativo de Node sobre `src/**/*.test.ts`.

⚠️ Los módulos que alcanzan las pruebas importan **con extensión `.ts`** (el runner de Node
no resuelve imports sin extensión). Por eso `allowImportingTsExtensions` está activo en
`tsconfig.json`.

## Cómo está armado

- El audio **se mezcla en vivo en el navegador**. No se genera ningún archivo final: se
  guardan la voz y los fondos, y el plan de mezcla decide qué suena y cuándo.
  Ver `src/lib/audio/plan.ts` — es código puro y ahí está el grueso de las pruebas.
- El **"sonido de estudio"** (corte de graves, presencia, compresión y normalización) se
  aplica al reproducir, con Web Audio: `src/lib/audio/vozEstudio.ts`. **No hay ningún
  servicio de IA en el camino** — se probó ElevenLabs Voice Isolator y no aportaba nada
  audible, porque solo quita ruido de fondo y el navegador ya lo suprime al grabar.
  Consecuencia: **el producto no tiene costo variable por uso**.
- El audio **nunca sale de la app**: bucket privado, URLs firmadas de una hora, y el modo
  sin internet usa la Cache API (no descargas al teléfono).
- Base de datos: schema `voz` dentro del proyecto Supabase `mandarina-DATA`.
- El login (celular + código por WhatsApp) reusa el hook de Supabase Auth que ya usa
  La Mata de los Premios. **No hay Edge Function propia en este repo.**
- En Next 16 el middleware es `src/proxy.ts`, no `middleware.ts`.

## Pendientes

1. **Los cinco audios de fondo.** Hoy solo existe `lluvia.mp3`, que es ruido rosa sintético
   generado por código, no una grabación. Ver `public/fondos/LICENCIAS.md`.
2. **Identidad visual**: colores y textos definitivos (la interfaz está en gris de relleno).
3. **Icono** de la app para el manifiesto.

Ya resueltos: schema `voz` expuesto en Supabase, desplegado en Vercel, repo en GitHub.

## Diseño y plan

- Diseño: `docs/superpowers/specs/2026-07-26-mi-voz-design.md`
- Plan: `docs/superpowers/plans/2026-07-26-mi-voz.md`
