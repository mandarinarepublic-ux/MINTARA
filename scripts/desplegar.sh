#!/usr/bin/env bash
#
# Despliegue de Míntara.
#
# ESTE YA NO ES EL CAMINO NORMAL. Desde el 30-jul Vercel está conectado a
# GitHub: lo que entra a `main` se publica solo, y `mintara-app.vercel.app`
# quedó registrado como dominio DEL PROYECTO, así que se mueve solo al último
# despliegue de producción. Eso es lo que permite ajustar desde el celular.
#
# El script queda como respaldo para cuando GitHub o la integración fallen, y
# porque reapuntar el dominio de más nunca hace daño.
#
# POR QUÉ NACIÓ: `vercel --prod` creaba un despliegue nuevo y el dominio no lo
# seguía, porque era un alias suelto y no un dominio del proyecto. El 26-jul
# eso hizo que seis correcciones seguidas nunca llegaran al teléfono de
# Rodrigo, y se perdió una tarde arreglando cosas que ya estaban arregladas.
set -euo pipefail

ALCANCE="mandarinarepublic-6819s-projects"
# Una sola URL, a propósito. El 30-jul se borraron los alias `mi-voz*` que
# habían quedado del nombre viejo del proyecto: dos de ellos seguían vivos
# sirviendo el despliegue del 26-jul. Una URL de más es una versión vieja
# esperando confundir a alguien. Si algún día hay dominio propio, va aquí.
DOMINIOS=("mintara-app.vercel.app")

echo "→ Pruebas"
npm test >/dev/null
echo "  ✓ en verde"

echo "→ Desplegando"
URL=$(vercel --prod --yes --scope "$ALCANCE" 2>&1 |
  grep -oE 'https://mintara-[a-z0-9]+-mandarinarepublic-6819s-projects\.vercel\.app' |
  head -1)

if [ -z "$URL" ]; then
  echo "  ✗ no se pudo leer la URL del despliegue" >&2
  exit 1
fi
echo "  ✓ $URL"

echo "→ Apuntando los dominios"
for D in "${DOMINIOS[@]}"; do
  vercel alias set "$URL" "$D" --scope "$ALCANCE" >/dev/null 2>&1
  echo "  ✓ $D"
done

echo "→ Comprobando que sirve la versión nueva"
VERSION=$(git rev-parse --short=7 HEAD)
sleep 2
for D in "${DOMINIOS[@]}"; do
  CODIGO=$(curl -s -o /dev/null -w "%{http_code}" "https://$D/")
  echo "  $D → HTTP $CODIGO (commit $VERSION)"
done

echo
echo "Listo. La app muestra su versión abajo del todo en la pantalla del audio:"
echo "  debe decir $VERSION"
