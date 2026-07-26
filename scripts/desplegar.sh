#!/usr/bin/env bash
#
# Despliegue de Míntara.
#
# POR QUÉ EXISTE ESTE SCRIPT: `vercel --prod` crea un despliegue nuevo, pero
# los dominios de este proyecto NO lo siguen solos — se quedaron apuntando a
# despliegues viejos. El 26-jul eso hizo que seis correcciones seguidas nunca
# llegaran al teléfono de Rodrigo, y se perdió una tarde arreglando cosas que
# ya estaban arregladas.
#
# Aquí se despliega Y se reapuntan los dominios, siempre, en el mismo paso.
set -euo pipefail

ALCANCE="mandarinarepublic-6819s-projects"
DOMINIOS=("mintara-app.vercel.app" "mi-voz.vercel.app")

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
