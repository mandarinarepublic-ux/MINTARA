# mi-voz — Diseño

**Fecha:** 2026-07-26
**Estado:** implementado y desplegado
**Nombre:** **MINTARA** (el nombre `mi-voz` de este archivo es histórico)

> ## ⚠️ Cambio de fondo tras la primera prueba real (26-jul, misma tarde)
>
> **Se eliminó el pulido con IA.** Se probó ElevenLabs Voice Isolator con una grabación real y
> **no cambió nada audible**: ese servicio solo separa la voz del ruido de fondo, y no había
> ruido que quitar (el navegador ya aplica supresión de ruido al capturar el micrófono).
> Sonar "a estudio" no es quitar ruido: es emparejar volumen, comprimir dinámica y dar presencia.
>
> Eso ahora se hace **en el navegador, con Web Audio**, al reproducir (`src/lib/audio/vozEstudio.ts`).
>
> Consecuencias, todas favorables:
> - **Costo variable: $0.** Ya no hay $0,06–0,66 por grabación. El producto no tiene costo por uso.
> - **Nadie externo toca la voz.** Antes viajaba a un tercero; ahora no sale del almacenamiento
>   propio. Es un argumento de venta, no solo una mejora técnica.
> - **Desapareció la espera.** Ya no hay pantalla de pulido: se graba y se escucha.
> - El plan gratis ya no está limitado por costo, sino solo por producto.
>
> Las secciones 6 y 8.1 de abajo conservan el análisis de costos del pulido como registro de
> por qué se tomó esta decisión.

---

## 1. Qué es

Una app web donde una persona graba su propia voz leyendo afirmaciones positivas, y recibe una
pieza de audio de hasta ~3 minutos con su voz limpia sobre un fondo de lluvia, río o mar.

La promesa: **oírte a ti mismo diciéndote cosas buenas, sonando como si lo hubieras grabado en un
estudio.** El valor no está en el texto ni en el fondo: está en que es *tu* voz.

Producto comercial nuevo, independiente de Mandarina, IND y La Mata.

---

## 2. Recorrido del usuario

1. **Entra con su celular.** Código de un solo uso por WhatsApp (mismo mecanismo que La Mata).
2. **Elige un paquete de afirmaciones** de la biblioteca: Autoestima, Calma, Abundancia, Dormir,
   Empezar el día. Puede editar cualquier frase o escribir las suyas desde cero.
3. **Graba de corrido.** El texto aparece grande, tipo teleprompter. Un solo botón: grabar / parar.
   Puede volver a grabar completo si no le gustó.
4. **La IA pule la toma.** Quita ruido de cuarto y eco, empareja el volumen, y la toma se corta en
   frases sueltas. Ocurre **una sola vez** por grabación y queda guardada como su **voz master**.

   Los **silencios muertos desaparecen solos**: como la pieza se arma frase por frase, lo que quedó
   entre frases nunca llega al audio final. Las **muletillas** ("eeeh", "o sea") sí sobreviven —
   ninguno de los tres servicios de pulido las corta, eso exige transcribir el audio. Queda fuera
   del primer entregable a propósito: la persona está **leyendo** un texto en pantalla, que es
   justo la situación donde menos muletillas aparecen. Si en las primeras grabaciones reales
   molesta, se agrega un servicio de transcripción sin tocar nada más, porque el pulido vive detrás
   de una interfaz.
5. **Arma su audio.** Elige fondo, qué tan presente está ese fondo frente a la voz, y cuánto
   silencio queda entre frase y frase. Todo suena **al instante** mientras mueve los controles.
6. **Escucha dentro de la app**, en repetición si quiere. En el plan pago puede además guardarlo
   para usarlo **sin internet**. El audio nunca sale de la app: no hay archivo que se pueda
   exportar, mandar por WhatsApp ni pasar a otro dispositivo fuera de su cuenta.
7. **Vuelve cuando quiera** y arma audios nuevos con la misma voz master: otro fondo, otro ritmo,
   otro orden de frases. Sin volver a grabar y sin volver a pagar el pulido.

---

## 3. Decisiones de diseño y su porqué

### 3.1 Sin clonación de voz

La voz es siempre una grabación real de la persona. Nada de sintetizar voz con IA.
Es más barato, más honesto y evita todo el terreno legal del consentimiento biométrico para clonar.

### 3.2 Grabación de corrido, no frase por frase

La persona lee todo seguido; la app se encarga de que suene bien después.
Grabar frase por frase da más control, pero rompe el ritmo natural de la lectura y hace la
experiencia larga y tediosa. El pulido con IA es lo que hace viable la toma única.

### 3.3 No se genera ningún archivo final

**Esta es la decisión estructural del proyecto.** Como el audio nunca sale de la app, no tiene
sentido renderizar y guardar un MP3 por cada combinación que arme el usuario.

Guardamos los ingredientes —la voz master y los sonidos de fondo— y la app los **mezcla en vivo**
en cada reproducción.

Consecuencias, todas favorables:
- Cambiar de lluvia a río es instantáneo, sin esperas ni barras de progreso.
- La repetición es infinita y sin costura.
- Ocupa mucho menos espacio en el celular y en el servidor.
- No existe ningún archivo que alguien pueda extraer, porque literalmente no existe.

### 3.4 Todo el procesamiento de audio ocurre en el navegador

Piezas de hasta ~3 minutos son perfectamente manejables por el navegador de un celular común.
No hace falta worker de audio, ni ffmpeg en servidor, ni infraestructura extra más allá de
Vercel y Supabase.

La única excepción es el pulido con IA, que necesita un servicio externo especializado.

### 3.5 Límite honesto de la protección del audio

En la web, todo lo que suena en un navegador es técnicamente recuperable por alguien con
conocimientos (herramientas de desarrollador, grabar la salida de sonido del sistema).

Lo hacemos **muy difícil** —sin archivo final, sin URL directa, permisos temporales que caducan—
y para la enorme mayoría de usuarios será imposible. Pero no se promete blindaje total mientras
sea web. La versión nativa de una fase posterior sí permite cerrarlo de verdad.

Esto no se le oculta al usuario ni a nadie: es una limitación conocida y aceptada.

---

## 4. Piezas del sistema

Cada pieza tiene un trabajo, una interfaz clara y se puede entender sin leer las demás.

| Pieza | Responsabilidad | Depende de |
|---|---|---|
| **Cuenta** | Entrar con celular + código por WhatsApp. Saber si el usuario es gratis o pago. | Supabase Auth |
| **Biblioteca** | Los paquetes de afirmaciones y la edición del texto por parte del usuario. | Base de datos |
| **Grabador** | Captura del micrófono, teleprompter, y subida de la toma cruda. | Navegador, Storage |
| **Pulido** | Orquesta el servicio externo de limpieza. Proceso lento: expone estados (en cola, procesando, listo, falló) para que la pantalla nunca se vea congelada. | Servicio externo, Storage |
| **Frases** | Corta la voz limpia en frases detectando los silencios. Produce una lista de marcas de tiempo, no archivos sueltos. | Voz master |
| **Motor de audio** | El corazón. Arma el plan de mezcla y lo reproduce. Código puro, sin pantallas. | Nada (deliberadamente aislado) |
| **Modo sin internet** | Guarda voz master y fondos en el celular para que suene en avión. | Navegador |
| **Planes** | Aplica los límites del plan gratis y el flujo de pago manual. | Cuenta |

### 4.1 El motor de audio y el plan de mezcla

El motor **no reproduce sonido a ciegas**. Primero construye un *plan de mezcla*: una estructura de
datos que dice exactamente qué suena, cuándo y con qué volumen.

```
plan = {
  duracionTotal: 174.2,
  voz: [
    { frase: 0, entraEn: 0.0,  desde: 0.0,  hasta: 4.2, ganancia: 1.0 },
    { frase: 1, entraEn: 6.2,  desde: 4.9,  hasta: 9.1, ganancia: 1.0 },
    ...
  ],
  fondo: { pista: 'lluvia', ganancia: 0.35, entrada: 2.0, salida: 3.0 }
}
```

Como el plan es solo datos, se puede verificar automáticamente: que las pausas midan lo pedido, que
dos frases nunca se pisen, que el fondo entre y salga suave, que la duración total cuadre.
Los errores de audio son horribles de cazar oyendo; así se cazan leyendo.

La reproducción es una capa delgada encima que ejecuta ese plan con el motor de audio del navegador.

---

## 5. Datos y privacidad

La voz de una persona es de lo más personal que existe, y esto además guarda lo que esa persona
necesita decirse a sí misma. Eso pide cuidado real, no una casilla de "acepto".

- **Antes de la primera grabación**, pantalla clara: qué se guarda, para qué, quién lo oye (nadie)
  y cómo se borra.
- Las voces viven en almacenamiento **privado**. Ninguna URL pública, ni adivinable. Cada
  reproducción pide un permiso temporal que caduca.
- **Borrar es borrar.** Un botón elimina la voz del servidor y del celular. Sin retenciones de
  cortesía, sin "se conserva 30 días".
- La **toma cruda se descarta** una vez que el pulido termina. Solo se conserva la voz master.
- El servicio externo de pulido recibe la grabación para limpiarla. Es requisito de selección que
  **no entrene modelos con lo que se le manda** y que borre el archivo al terminar.
- Política de privacidad en español, sin letra chica.

**Estructura de datos** (schema `voz` dentro de `mandarina-DATA`, mismo patrón que `mata` y `rrhh`):
usuarios · paquetes de afirmaciones · textos del usuario · grabaciones (estado del pulido, marcas
de tiempo de las frases) · configuraciones de audio guardadas.

---

## 6. Modelo de negocio

El único costo variable real es el pulido con IA, y se paga **una vez por grabación**. Armar audios,
cambiar fondos y escuchar mil veces no cuesta nada. Por eso el límite del plan gratis son las
**grabaciones**, no el uso.

- **Gratis:** una grabación, dos fondos, y todos los audios que quiera armar con ella.
  Suficiente para llegar al momento decisivo: oírse a sí mismo.
- **Pago:** varias grabaciones, todos los fondos, todos los paquetes, y el modo sin internet.

**Cobro manual al inicio.** La app distingue gratis de pago, pero para pagar el usuario toca un
botón que le manda un link de dLocal por WhatsApp y la cuenta se activa a mano. Construir
facturación automática para un producto sin validar sería trabajo tirado.

---

## 7. Riesgos

**Riesgo principal: la calidad del pulido con IA.** Si la voz de una persona común, grabada con el
micrófono de un celular en un cuarto normal, no queda sonando bien, el producto entero se cae.

**Mitigación — prueba de una tarde, antes de escribir código:** grabar 2 minutos en condiciones
reales (no en silencio de estudio) y pasar esa misma grabación por los tres candidatos:
ElevenLabs, Dolby.io y Auphonic. Comparar a oído y comparar precio por minuto. La decisión sale de
esa prueba, no de la documentación de los proveedores.

**Riesgo secundario:** el costo del pulido escala con usuarios nuevos, incluso gratuitos. Se
contiene con el límite de una grabación en el plan gratis y se vigila desde el primer día.

**Riesgo menor:** diferencias entre navegadores al capturar micrófono y reproducir audio, sobre
todo Safari en iPhone. Se prueba en iPhone real temprano, no al final.

---

## 8. Alcance

**El primer entregable incluye:** entrar con el celular, elegir un paquete, editarlo, grabar,
ver el progreso del pulido, armar el audio con fondo y pausas, escucharlo en repetición, guardarlo
para usar sin internet, volver otro día a armar otro distinto con la misma voz, los límites del plan
gratis y el botón de pago manual.

**Queda fuera a propósito:** clonar voces con IA, exportar archivos, compartir en redes, comunidad
o feed social, notificaciones push, app nativa, pasarela de pago automática, estadísticas de uso.

Nada de eso se construye hasta saber si la gente vuelve una segunda vez.

---

## 8.1 Costos

La infraestructura **no suma costo**: Supabase Pro y Vercel Pro ya están pagados y este producto
consume una fracción mínima de ambos (~1,5 MB de almacenamiento por usuario, y tráfico bajo porque
el audio se mezcla en el celular, no en el servidor).

Por eso el schema va dentro de `mandarina-DATA` y no en un proyecto Supabase nuevo: en una
organización Pro, cada proyecto adicional cuesta unos $10/mes de cómputo. Un schema aparte da
aislamiento suficiente sin costo.

**La única partida nueva es el pulido con IA.** Precios verificados el 26-jul-2026, para una
grabación de 3 minutos:

| Servicio | Precio | Por grabación | Gratis al mes |
|---|---|---|---|
| Auphonic S ($11–13/mes por 9 h) | ~$0,024/min | $0,07 | 2 horas (con jingle) |
| Dolby.io Media Enhance | $0,05/min | $0,15 | 200 min |
| ElevenLabs Voice Isolator (1.000 créditos/min) | ~$0,15–0,22/min | $0,45–0,66 | 10.000 créditos ≈ 10 min |

**La prueba de la sección 7 cuesta $0**: los tres planes gratuitos cubren de sobra 2 minutos de
audio.

Es un costo que se paga también por usuarios que nunca van a pagar, y esa es toda la razón del
límite de una grabación en el plan gratis.

---

## 9. Stack

- **Next.js en Vercel** (plan Pro ya existente) — la app.
- **Supabase** (plan Pro ya existente) — cuentas, base de datos (schema `voz` en `mandarina-DATA`)
  y almacenamiento privado de las voces.
- **Motor de audio del navegador** — mezcla, volúmenes, pausas y repetición. Sin servidor.
- **Servicio externo de pulido** — a definir en la prueba del punto 7.
- **dLocal** — link de pago manual.

---

## 10. Decisión pendiente

**Nombre comercial.** Se usa `mi-voz` para carpeta, repositorio y schema mientras aparece el
definitivo. Cambiarlo después es barato; esperar a tenerlo para empezar, no.
