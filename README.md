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
  guardan la voz limpia y los fondos, y el plan de mezcla decide qué suena y cuándo.
  Ver `src/lib/audio/plan.ts` — es código puro y ahí está el grueso de las pruebas.
- El pulido con IA se paga **una vez por grabación** y su resultado (la "voz master")
  sirve para todos los audios que arme la persona después.
- El audio **nunca sale de la app**: bucket privado, URLs firmadas de una hora, y el modo
  sin internet usa la Cache API (no descargas al teléfono).
- Base de datos: schema `voz` dentro del proyecto Supabase `mandarina-DATA`.
- El login (celular + código por WhatsApp) reusa el hook de Supabase Auth que ya usa
  La Mata de los Premios. **No hay Edge Function propia en este repo.**
- En Next 16 el middleware es `src/proxy.ts`, no `middleware.ts`.

## Pendientes para poder probarlo de punta a punta

1. Agregar `voz` a los schemas expuestos de Supabase (Settings → API → Exposed schemas).
   Hoy la lista es `public, graphql_public, crm, inbox, rrhh, mata`.
2. Poner `PULIDO_API_KEY` (ElevenLabs) en `.env.local` y en Vercel.
3. Conseguir los cinco audios de fondo: ver `public/fondos/LICENCIAS.md`.
4. Icono de la app para el manifiesto (falta el nombre comercial definitivo).

## Diseño y plan

- Diseño: `docs/superpowers/specs/2026-07-26-mi-voz-design.md`
- Plan: `docs/superpowers/plans/2026-07-26-mi-voz.md`
