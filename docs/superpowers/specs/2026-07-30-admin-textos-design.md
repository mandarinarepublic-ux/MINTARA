# Editar los textos de MÍNTARA desde el panel

**Fecha:** 30 de julio de 2026
**Estado:** diseño aprobado, pendiente de plan de implementación

---

## El problema

Hoy `/admin` solo administra ambientes y familias. Todo el resto del texto de la app vive
incrustado en el código, mezclado con el marcado. Cambiar una frase exige editar un `.tsx`,
commitear y desplegar.

Eso ya tiene consecuencias visibles. **La portada miente**: promete mezclar tu voz con
*"lluvia, río o mar"* y muestra esas tres tarjetas, pero los ambientes realmente cargados son
Lluvia, Moscos, Tibet, Aire y Montaña. El texto envejeció y nadie sin conocimientos de
programación puede arreglarlo.

El objetivo es que una persona que no programa pueda cambiar cualquier texto que el cliente lee,
verlo antes de publicarlo, y equivocarse sin consecuencias.

## Dónde está el texto hoy

| Dónde | Qué | ¿Editable hoy? |
|---|---|---|
| Base de datos | Ambientes y familias | ✅ desde `/admin` |
| `src/lib/afirmaciones/paquetes.ts` | 5 listas × (nombre + descripción + 6 frases) | ❌ código |
| `src/app/(publico)/Secciones.tsx` | Portada: titulares, pasos, ambientes, cierre | ❌ código |
| `src/app/page.tsx` | Hero de la portada | ❌ código |
| `src/app/(app)/premium/page.tsx` | Pantalla de premium | ❌ código |
| `src/app/(app)/consentimiento/page.tsx` | Texto del consentimiento | ❌ código |
| `src/app/(app)/estudio/page.tsx` | Elegir paquete y editar frases | ❌ código |
| `src/app/(auth)/ingresar/page.tsx` | Entrar con celular | ❌ código |
| `src/lib/planes.ts` | Precios y límites | ❌ código — **fuera de alcance** |
| `src/app/privacidad/page.tsx` | Texto legal | ❌ código — **fuera de alcance** |

## Decisiones tomadas

1. **Alcance:** afirmaciones + portada + pantallas. Fuera: precios, límites y privacidad.
2. **Publicar:** sale al instante, como los ambientes hoy, con un botón de volver atrás por texto.
3. **Forma:** panel ordenado por pantalla, con ventana de previsualización al lado que se
   actualiza mientras se escribe.
4. **Libertad:** en las afirmaciones se puede agregar, quitar y reordenar; en la portada y las
   pantallas solo se cambia el texto que ya existe. La estructura es diseño, no contenido.
5. **Acceso:** lo edita Rodrigo con su cuenta admin. No se crea un rol nuevo.

## Arquitectura

### Los textos viven en la base, y el código es la red de seguridad

Tres tablas nuevas en el schema `voz`, siguiendo el patrón de `familias` y `ambientes`
(migración `supabase/migrations/0006_textos.sql`):

| Tabla | Para qué | Columnas |
|---|---|---|
| `textos` | Textos sueltos de pantalla | `clave` (PK), `valor`, `valor_anterior`, `actualizado_en` |
| `paquetes` | Las listas de afirmaciones | `id` (PK), `nombre`, `descripcion`, `orden`, `activo` |
| `frases` | Las frases de cada lista | `id` (PK), `paquete` (FK), `texto`, `orden` |

Los textos sueltos van en una tabla clave-valor porque son piezas independientes. Las
afirmaciones necesitan dos tablas propias porque tienen estructura: se agregan, se quitan y se
reordenan, y una clave-valor no modela eso.

`valor_anterior` guarda **una sola** versión previa. Un historial completo sería otra tabla y
otra pantalla para resolver algo que casi nunca pasa.

### La mezcla

En `src/lib/textos/catalogo.ts` queda el catálogo de los textos actuales:

```ts
export const CATALOGO = {
  "portada.como_funciona.titulo": {
    porDefecto: "Tres pasos y ya es tuyo.",
    etiqueta: "Título de la sección",
    donde: "Sale grande, arriba de los tres pasos",
  },
  // …
} as const;
```

`src/lib/textos/mezcla.ts` expone una función pura:

```ts
export function mezclarTextos(
  catalogo: Catalogo,
  guardados: Record<string, string>,
): Record<string, string>
```

**Lo guardado en la base gana; lo que falte sale del catálogo.** Eso cubre tres casos:

- La base no responde → la app muestra textos correctos, no huecos
- Alguien borra un texto → sale el original
- Se agrega una pantalla nueva → funciona desde el primer día, sin llenar nada a mano

El principio, en una frase: **la app nunca muestra un hueco.**

`paquetes.ts` deja de ser la fuente y pasa a ser el respaldo: si la tabla `paquetes` viene
vacía, se usan las cinco listas del código.

### Rendimiento

Los textos se leen **una vez por pantalla**, no uno por uno, y quedan cacheados. Al guardar en
el admin se refresca la caché de la pantalla afectada con `revalidatePath`, para que el cambio
se vea de una sin volver la portada más lenta.

### Extraer los textos a props

Hoy el texto está incrustado en el marcado:

```jsx
<h2>Tres pasos y ya es tuyo.</h2>
```

Pasa a recibirse como datos:

```jsx
<h2>{t["portada.como_funciona.titulo"]}</h2>
```

Esto es lo que **hace posible una previsualización fiel**: el panel puede pintar el mismo
componente que ve el cliente, con los estilos de verdad, alimentado con lo que se está
escribiendo. La alternativa —imitar la pantalla dentro del panel— se despega de la realidad con
el primer cambio de diseño, y entonces la previsualización empieza a mentir.

Es el grueso del trabajo: recorrer la portada y las pantallas sacando el texto al catálogo. Es
mecánico y verificable.

## El panel

`/admin` pasa a tener **dos pestañas**: **Textos** y **Ambientes**. Lo que ya funciona no se
toca.

### Pestaña Textos

El menú lista las pantallas **en el orden en que el cliente las recorre** —portada, ingresar,
consentimiento, elegir afirmaciones, grabar, mezclar, premium—, no por orden alfabético ni por
nombre de archivo. Quien edita busca "eso que sale cuando el cliente entra" y lo encuentra donde
espera.

Cada texto muestra:

- **Un nombre en cristiano**: "Título de la sección", "Paso 1 · título". Nunca la clave interna.
- **Dónde sale**: "Sale grande, arriba de los tres pasos".
- **↩ volver a como estaba**, activo solo si ese texto se cambió alguna vez.

### La ventana de previsualización

Al lado en computadora, apilada en el celular (previsualización arriba, campo abajo). Se
actualiza mientras se escribe. **Nada se guarda hasta apretar Guardar**, así que se pueden
probar tres versiones de un titular sin que el cliente vea ninguna.

### Pantalla de afirmaciones

Pantalla propia, con libertad completa: editar nombre y descripción de cada lista, editar cada
frase, agregar, quitar, reordenar con flechas y crear listas nuevas.

Dos frenos que impiden dejar la app rota:

- Una lista no puede quedar con cero frases
- No se puede desactivar ni borrar la última lista activa

## Qué pasa cuando algo sale mal

| Situación | Comportamiento |
|---|---|
| La base no responde | Salen los textos del catálogo |
| Un texto queda vacío | No se guarda. Aviso: *"Este texto no puede quedar vacío"* |
| Se corta el internet al guardar | Avisa y **no borra lo escrito**; se reintenta con Guardar |
| Se borró una frase por error | ↩ volver a como estaba, o el texto del catálogo |
| Queda una clave vieja en la base | Se ignora |

## Pruebas

Siguiendo lo que ya hace el proyecto (runner nativo de Node, lógica pura en `lib/`, imports con
extensión `.ts`):

- **La mezcla**: que lo guardado gane, que lo faltante salga del catálogo, que una base caída no
  deje huecos. Es el corazón.
- **Ninguna clave huérfana**: una prueba recorre el catálogo y falla si algún texto que la app
  pide no tiene valor por defecto. Esto impide que agregar una pantalla nueva rompa algo.
- **Agregar, quitar y reordenar frases.**
- **Los dos frenos**: lista sin frases, y desactivar la última lista activa.
- **Deshacer** devuelve exactamente el valor anterior.

Las 110 pruebas actuales siguen pasando.

## Fuera de alcance, a propósito

- Precios, límites del plan y texto de privacidad
- Cambiar la estructura de la portada (agregar o quitar pasos)
- Historial largo de versiones: una sola versión anterior por texto
- Traducciones a otros idiomas

## Punto a resolver en la implementación

**La sección de ambientes de la portada.** Hoy lista "Lluvia, Río, Mar" a mano, y por eso está
desactualizada. Convertirla en texto editable arregla el síntoma pero deja la trampa puesta:
volvería a desfasarse en cuanto se suba un ambiente nuevo.

La propuesta es que esa sección **lea los ambientes reales de la base** en vez de ser texto
suelto, de modo que se mantenga sola. Queda por confirmar con Rodrigo, porque cambia lo que la
portada muestra hoy.

## Archivos que se tocan

**Nuevos:**
- `supabase/migrations/0006_textos.sql`
- `src/lib/textos/catalogo.ts`
- `src/lib/textos/mezcla.ts` + `mezcla.test.ts`
- `src/lib/textos/servidor.ts` (lectura con caché)
- `src/app/(app)/admin/textos/` (pantalla, formularios y previsualización)

**Modificados:**
- `src/app/(app)/admin/page.tsx` — pestañas
- `src/app/(app)/admin/acciones.ts` — guardar, deshacer, frases
- `src/app/(publico)/Secciones.tsx`, `src/app/page.tsx`
- `src/app/(app)/premium/page.tsx`, `consentimiento/page.tsx`, `estudio/page.tsx`
- `src/app/(auth)/ingresar/page.tsx`
- `src/lib/afirmaciones/paquetes.ts` — pasa de fuente a respaldo
