#!/bin/bash
#
# Instalar dependencias al arrancar una sesión de Claude Code EN LA NUBE.
#
# En la nube el repo llega recién clonado, sin node_modules, así que sin esto
# la primera orden que dé Rodrigo desde el celular se gasta en un npm install.
#
# En tu computadora no hace nada: CLAUDE_CODE_REMOTE solo vale "true" dentro
# de la máquina de Anthropic.

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

if [ -d node_modules ]; then
  exit 0
fi

npm install
exit 0
