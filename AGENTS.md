<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MÍNTARA

App donde una persona graba su propia voz leyendo afirmaciones y la escucha sobre un ambiente.
La promesa es **su voz, y no sale de la app**. Lee `HANDOFF.md` antes de tocar nada: trae el
estado, las trampas y los pendientes.

## Cómo se escribe aquí

- **Español de Ecuador, con tuteo.** `tú`, `puedes`, `cargas`, `dime`. Nunca voseo argentino
  (`vos`, `podés`, `decime`). Aplica a los commits, a los comentarios y a los textos de la app.
- Los mensajes de commit describen **qué cambia para quien usa la app**, no qué archivo se tocó.

## Reglas del proyecto

- **Sin IA de ningún tipo.** Se probó y se quitó. El sonido se hace en el navegador con Web
  Audio. Si una tarea parece pedir IA, pregunta antes: rompe la promesa del producto.
- **Las pruebas se corren siempre**: `npm test` (110, runner nativo de Node, sin librerías).
  Los módulos que alcanzan las pruebas se importan **con extensión `.ts`**.
- El middleware es `src/proxy.ts` con función `proxy`. En Next 16 `middleware.ts` ya no corre.
- No metas los `.mp3` de la raíz al repo: los ambientes viven en el bucket `fondos` de Supabase.

## Si corres en la nube (sesión desde el celular)

- **No puedes desplegar, y no hace falta.** La red de la sesión no alcanza a Vercel. El
  despliegue lo dispara Vercel solo cuando el cambio entra a `main`.
- Trabaja en **rama y PR**, nunca commitees directo a `main`: Rodrigo prueba el audio en el
  Preview del PR antes de aprobar. Lo que entra a `main` sale a la app de una vez.
- Deja el PR explicando **qué hay que oír** para saber si el cambio quedó bien. El audio no se
  revisa leyendo el diff.
