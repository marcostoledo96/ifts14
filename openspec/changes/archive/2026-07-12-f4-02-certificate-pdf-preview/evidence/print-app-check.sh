#!/usr/bin/env bash
# CHECK AUTORITATIVO — Fix R3-001/R4-001.
# Ejercita la app Angular real: arranca dev server, login mock por UI,
# navegación SPA a /admin/certificaciones/:id/pdf, media print, PDF Chromium.
# Verifica: 1 página A4, sin chrome, sin truncamiento, normal + revocado.
# Cero dependencias nuevas (Node 24 + google-chrome + poppler-utils).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")/apps/frontend-angular}"
PORT="${APP_PORT:-4321}"
OUT_DIR="${SCRIPT_DIR}/.app-pdf-check"

# Iniciar dev server en background con puerto fijo.
cd "$APP_DIR"
echo "Iniciando dev server (puerto $PORT)..."
npx ng serve --port "$PORT" --host 127.0.0.1 > /tmp/ng-serve-$$.log 2>&1 &
NG_PID=$!

cleanup() { kill "$NG_PID" 2>/dev/null || true; rm -f /tmp/ng-serve-$$.log; }
trap cleanup EXIT

# Esperar a que el dev server responda (máx 90s).
for i in $(seq 1 90); do
  if curl -s "http://127.0.0.1:$PORT" > /dev/null 2>&1; then
    echo "Dev server listo (intento $i)"
    break
  fi
  sleep 1
  if [[ $i -eq 90 ]]; then
    echo "FAIL: dev server no respondió en 90s"
    cat /tmp/ng-serve-$$.log 2>/dev/null | tail -20
    exit 1
  fi
done

# Ejecutar check real contra la app.
APP_BASE="http://127.0.0.1:$PORT/certificados/" node "${SCRIPT_DIR}/print-app-check.mjs" "$OUT_DIR"
"${PDFTOPPM:-pdftoppm}" -png -r 96 -singlefile "${OUT_DIR}/normal.pdf" "${OUT_DIR}/normal"
cp "${OUT_DIR}/normal.png" "${SCRIPT_DIR}/pdf-print.png"
