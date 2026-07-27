# MÍNTARA — handoff

**Última sesión:** 26–27 de julio de 2026
**Estado:** en producción, funcionando, con pendientes claros abajo.

---

## Lo primero que hay que saber

**URL estable:** https://mintara-app.vercel.app

⚠️ **Usar SIEMPRE esa.** Cada despliegue genera una URL propia
(`mintara-XXXX.vercel.app`) y para el navegador cada una es un sitio distinto: la sesión no
viaja, y hay que pedir otro código por WhatsApp, que **cuesta dinero**. El 26-jul se perdió
media tarde por esto: seis correcciones seguidas no llegaron al teléfono porque los dominios
apuntaban a un despliegue viejo.

**Desplegar SOLO con:**

```bash
npm run desplegar
```

Nunca `vercel --prod` a secas: los dominios de este proyecto no siguen solos al último
despliegue. El script corre las pruebas, despliega, reapunta los dominios y comprueba.

**Cómo saber qué versión corre un teléfono:** abajo del todo en la pantalla del audio hay una
línea gris con el commit. Ante cualquier "no me funciona", **eso es lo primero que hay que
mirar**, antes de tocar código.

---

## Qué es

App donde una persona graba su propia voz leyendo afirmaciones y la escucha sobre un ambiente
(lluvia, aire, montaña…). La promesa: **es su voz, y no sale de la app**.

- **Sin IA de ningún tipo.** Se probó ElevenLabs y no aportaba nada audible; se quitó. El
  "sonido de estudio" se hace en el navegador con Web Audio. Costo variable: **$0**.
- Web instalable (PWA). El plan es publicarla en **Google Play con TWA** cuando esté al 100%,
  sin envolverla en nada.
- El audio **nunca se exporta**: se puede oír sin internet, pero no descargar ni compartir.

## Dónde está todo

| Qué | Dónde |
|---|---|
| Código | `C:\Users\RodrigoWork\Desktop\MINTARA` · GitHub `mandarinarepublic-ux/MINTARA` (privado) |
| Despliegue | Vercel, proyecto `mintara` (misma cuenta que wa-inbox-v2 y lamata-premios) |
| Base de datos | Supabase `mandarina-DATA` (`piingkecjgoisnxccvaa`), **schema `voz`** |
| Voces | Bucket **privado** `voces`, URLs firmadas de 1 h |
| Ambientes | Bucket **público** `fondos` |
| Diseño | `docs/diseno/handoff-mintara.md` + `mockup-mintara.html` (ábrelo en el navegador) |
| Spec original | `docs/superpowers/specs/2026-07-26-mi-voz-design.md` |

**Claves:** `.env.local` (no versionado). Las de Supabase salieron de `lamata-premios`.
En Vercel están cargadas las tres de Supabase; **no hay ninguna clave de IA**.

---

## Lo que funciona hoy

**Recorrido completo:** landing → entrar con celular y código de WhatsApp → consentimiento →
elegir paquete y editar frases → grabar con guía → mezclar → escuchar → *Mis audios*.

**La guía de interpretación (lo último y más importante).** El texto se muestra apagado y las
palabras se encienden al ritmo sugerido, con el color de su intención: menta lo suave, crema el
cuerpo, dorado la palabra con peso. Entre frases hay un respiro. **No persigue a nadie**: si
vas más lento, espera. Se paró de golpe el problema de que la gente leyera como una lista.

- El marcado son **reglas** (`src/lib/audio/interpretacion.ts`). Está previsto que lo tome la
  IA: cambiaría solo `marcarFrase`, y ni la pantalla ni los tiempos se enteran.
- La grabación **se corta sola** tras 2 s de silencio, pero solo después de presentar la última
  frase.
- La barra del borde del texto **se consume por palabras dichas**, no por reloj.

**El audio.** Voz y ambiente son dos pistas que suenan a la vez y se arman completas antes de
sonar (por eso sigue sonando con la pantalla apagada y aparece en la pantalla de bloqueo).

- Volúmenes independientes de voz y ambiente. Van **horneados en la pista**: en Safari de iPhone
  `volume` guarda el valor pero no lo aplica, y **no hay forma fiable de detectarlo**.
- Entrada y salida ajustables (hasta 2 min de salida, para dormirse). **Solo afectan al
  ambiente**: aplicarlo a la voz sonaba a que se cortaba.
- Armonía: el ambiente **se agacha** bajo la voz, hay **espacio** ajustable alrededor de la voz,
  y una **nota grave** opcional.
- Se respetan los **silencios reales** de la grabación (tope de 6 s).

**Panel de administración** (`/admin`, solo rol admin): subir ambientes, editarlos, moverlos de
familia, ordenarlos, marcarlos visibles o gratis, y editar las familias.

**Ambientes cargados:** Lluvia y Moscos (dormir) · Tibet y Aire (concentrarte) · Montaña
(empezar el día). ⚠️ **Moscos dura 26 s** y el bucle se nota; los demás rondan el minuto.

---

## Pendientes

1. **Las 6 fotografías del diseño.** Hoy hay degradados de marca en su lugar (hero, ambientes,
   cierre). Cambiarlas es sustituir un componente, sin tocar el resto.
2. **Icono de la app** para el manifiesto (falta decidir el arte definitivo).
3. **Los audios de fondo definitivos**: reemplazar Moscos por algo de 60–90 s, y subir los que
   falten desde `/admin`.
4. **Cobro real.** Hoy Premium manda a un link de dLocal manual (`LINK_PAGO`, sin configurar).
5. **Dominio propio** (`mintara.app` / `mintara.ec`). `mintara.vercel.app` lo tiene un tercero.
6. **Spike de voz emocional** — hay una propuesta escrita de Andrés para usar modelos open
   source autohospedados. **Antes hay que juzgar si la guía de karaoke ya resolvió el
   problema**: si sí, se ahorra un servidor con GPU y romper la promesa de "sin IA".

## Trampas conocidas (documentadas para no repetirlas)

- **Despliegue:** ver arriba. Solo `npm run desplegar`.
- **Supabase, schemas expuestos:** manda `pgrst.db_schemas` del rol `authenticator`, **no el
  panel**. Estuvieron desincronizados y guardar el panel habría tumbado CRM, inboxes y RRHH.
- **Subir archivos al almacén:** lo hace el **servidor** con permisos de servicio. La subida
  directa desde el navegador fallaba porque la regla de permisos consultaba otra tabla
  protegida, y eso no se resuelve dentro del almacén.
- **Next 16:** el middleware es `src/proxy.ts` con función `proxy`. `middleware.ts` ya no se
  ejecuta.
- **Pruebas:** runner nativo de Node, sin librerías. Los módulos que alcanzan las pruebas
  importan **con extensión `.ts`**.
- **Variables de entorno:** cargarlas desde el panel de Vercel, no desde PowerShell (BOM
  invisible). Hay un helper `leerEntorno` que lo limpia igual.
- **Rol admin = Premium** en toda la app, para no toparse con límites al probar.

## Cómo seguir

```bash
cd C:\Users\RodrigoWork\Desktop\MINTARA
npm test          # 110 pruebas, sin librerías
npm run dev
npm run desplegar # pruebas + deploy + dominios
```

Todo está commiteado y subido a GitHub. La rama es `main`.
