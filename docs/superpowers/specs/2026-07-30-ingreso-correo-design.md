# Entrar a MÍNTARA con correo, además del celular

**Fecha:** 30 de julio de 2026
**Estado:** diseño aprobado, pendiente de plan de implementación
**Se construye apagado:** no se ve para nadie hasta que haya dominio y SMTP.

---

## Por qué

Dos motivos, los dos de Rodrigo:

1. **Hay gente que no usa WhatsApp** — clientes de otros países, o que no quieren dar su número.
2. **Cada código por WhatsApp se paga.** Meta cobra por mensaje de autenticación entregado, según
   el país del número que lo recibe. Y aplica una tarifa **"internacional"** bastante más alta
   cuando el número es de otro país que el de la cuenta: en India el salto va de $0,0014 a
   $0,0304, unas 22 veces. Justo el caso del motivo 1.

O sea: los dos motivos apuntan al mismo sitio. Quien entra por correo no cuesta nada, y quien
está fuera de Ecuador es precisamente el más caro por WhatsApp.

**La palanca de ahorro no es técnica, es de diseño:** el correo tiene que estar tan a la vista
como el celular. Cada persona que lo elige es un código que no se paga.

## Cómo funciona hoy

1. `/ingresar` → `signInWithOtp({ phone })`. Supabase genera el código de 6 dígitos y **no lo
   manda por SMS**: el hook «Send SMS» se lo pasa a la Edge Function `enviar-otp-whatsapp`, que
   lo despacha por WhatsApp. Mismo camino que La Mata de los Premios.
2. `/verificar?celular=…` → `verifyOtp({ phone, token, type: "sms" })`.
3. Se da de alta el perfil (`voz.perfiles`) y se manda a `/audios` o `/estudio`.

## Decisiones tomadas

1. **Código de 6 dígitos por correo, no enlace mágico.** Un enlace abre el navegador *del correo*,
   que muchas veces no es donde estaba la persona, y ahí se pierde la sesión. Además el código
   reutiliza la pantalla `/verificar` tal como está.
2. **Una sola cuenta por persona, si ella la junta.** Desde *Mi perfil* agrega su correo (o su
   celular) y desde entonces entra por cualquiera de los dos a los mismos audios.
3. **Se construye apagado.** La opción aparece solo con la variable `INGRESO_POR_CORREO` puesta.
4. **El remitente queda pendiente.** Rodrigo decidirá entre `mintara.app` (aún sin comprar) y
   `mandarinaec.com` (ya verificado). El código no depende de cuál sea.

## Requisito externo, sin el cual esto no sirve

**Hay que configurar SMTP propio en Supabase.** El servicio de correo que trae por defecto solo
escribe **a miembros del equipo del proyecto** y permite **2 mensajes por hora**: sirve para
probar, no para clientes. Sin SMTP, cualquier persona ajena recibe *Email address not
authorized* y se queda afuera.

Opción recomendada: **Resend**, gratis hasta **3.000 correos al mes / 100 al día / 1 dominio**.
A la escala de MÍNTARA sobra. El escalón siguiente son $20/mes por 50.000. Alternativas
compatibles: Brevo, Postmark, AWS SES, SendGrid, ZeptoMail.

Además hay que **editar la plantilla de correo en Supabase** para que incluya `{{ .Token }}`.
Si se deja la plantilla por defecto, manda un enlace en vez del código y la pantalla de
verificar no sirve.

## Cómo se ve

`/ingresar` gana dos pestañas: **Celular** (elegida por defecto, es la que ya funciona) y
**Correo**. Al cambiar de pestaña cambia el campo; el botón dice lo mismo y el destino es la
misma pantalla `/verificar`.

```
        Míntara
  Tu voz · Tus palabras · Tu intención

  ┌─────────────┬─────────────┐
  │  Celular ✓  │   Correo    │
  └─────────────┴─────────────┘

   Tu número
  ┌───────────────────────────┐
  │ +593 │ 98 374 5757        │
  └───────────────────────────┘

      [ Enviarme el código ]
```

Con `INGRESO_POR_CORREO` sin poner, las pestañas no existen y la pantalla se ve **idéntica a
hoy**.

## Que no se dupliquen las cuentas

Para Supabase, un celular y un correo son identidades distintas: entrar por correo teniendo
cuenta por WhatsApp crea una cuenta nueva y vacía. Es exactamente lo que le pasó a Rodrigo el
30-jul con dos números suyos, y el susto de ver la biblioteca vacía.

**Dos piezas:**

**1. Juntarlas desde *Mi perfil*.** Un bloque «Cómo entras» que muestra el celular y el correo,
con *Agregar mi correo* / *Agregar mi celular* según lo que falte. Se confirma con un código, y
desde ahí sirven los dos caminos para la misma cuenta.

**2. Avisar a tiempo.** Cuando alguien entra por correo y cae en una cuenta **recién creada**
—sin audios y sin consentimiento—, antes de mandarla al estudio:

> **¿Ya usabas Míntara?**
> Si antes entrabas con tu celular, tus audios están en esa cuenta. Entra con tu número y agrega
> este correo desde Mi perfil para juntarlas.
> [ Entrar con mi celular ] · [ Seguir, soy nuevo ]

Sale solo esa primera vez. A quien de verdad es nuevo le cuesta un toque; a quien se equivocó le
ahorra creer que perdió su trabajo.

## ⚠️ El supuesto que hay que verificar primero

El diseño de vincular cuentas se apoya en que **`updateUser({ email })` pueda añadir un correo a
una cuenta creada por teléfono**, y que después `signInWithOtp({ email })` encuentre esa misma
cuenta en vez de crear otra. La documentación de Supabase no lo dice explícitamente para el caso
teléfono → correo.

**Es lo primero que hay que probar en la implementación**, con una cuenta de prueba, antes de
construir la pantalla de *Mi perfil*.

Si no funciona, el plan B es habilitar el enlace manual de identidades
(`GOTRUE_SECURITY_MANUAL_LINKING_ENABLED`) y usar `linkIdentity()` con la persona ya dentro. Y
si ninguno de los dos sirve, se entrega solo el ingreso por correo sin vincular, dejando el aviso
del punto 2 —que es lo que evita el susto— y se avisa en el handoff.

## Base de datos

`voz.perfiles.celular` es **NOT NULL**. Tal como está, quien entre por correo no puede tener
perfil: el alta falla y la persona entra pero no existe para la app.

Migración `0007_ingreso_correo.sql`:

- `celular` pasa a admitir vacío
- se agrega `correo text`
- **restricción: al menos uno de los dos.** La pone la base, no el código, para que no haya forma
  de crear un perfil sin ninguna forma de contacto.

## Errores

| Situación | Qué pasa |
|---|---|
| Correo mal escrito | Se avisa antes de mandar nada |
| SMTP sin configurar | La opción no aparece; si alguien fuerza la URL, mensaje claro |
| Código vencido o errado | El mismo mensaje de hoy |
| Correo ya usado por otra cuenta | «Ese correo ya está en otra cuenta. Entra con él.» |
| Piden el código muchas veces | Supabase ya limita a uno por minuto |

## Pruebas

Mismo estilo del proyecto: runner nativo de Node, lógica pura en `lib/`, imports con `.ts`.

- **Validar correos**, incluidos los casos feos: mayúsculas, espacios sobrantes, tildes, sin `@`,
  dos arrobas, dominio sin punto.
- **El interruptor apagado deja la pantalla idéntica a hoy** — que no se cuele ni una pestaña.
- **La regla de «al menos celular o correo»** se cumple.
- **Normalizar el correo** antes de guardarlo (minúsculas y sin espacios), para que
  `Rodrigo@Gmail.com ` y `rodrigo@gmail.com` no acaben siendo dos cuentas.

## Fuera de alcance

- Contraseñas. Sigue siendo sin contraseña, con código.
- Entrar con Google o Apple.
- Cambiar el celular de una cuenta existente (solo agregar).
- Unificar dos cuentas que ya existan por separado, con audios en ambas. Se avisa antes de que
  pase; arreglarlo después es un trabajo aparte y delicado.

## Archivos

**Nuevos:**
- `supabase/migrations/0007_ingreso_correo.sql`
- `src/lib/correo.ts` + `correo.test.ts` — validar y normalizar
- `src/lib/ingreso.ts` + `ingreso.test.ts` — qué formas de entrar están disponibles
- `src/app/(app)/cuenta/ComoEntras.tsx` — juntar cuentas

**Modificados:**
- `src/app/(auth)/ingresar/Formulario.tsx` — pestañas
- `src/app/(auth)/ingresar/acciones.ts` — pedir código por correo
- `src/app/(auth)/verificar/` — aceptar correo además de celular
- `src/app/(app)/cuenta/page.tsx` y `acciones.ts`
- `src/lib/textos/catalogo.ts` — los textos nuevos, editables desde el panel
