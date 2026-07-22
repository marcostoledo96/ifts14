#!/usr/bin/env bash
# Levanta la API PHP local en :8080 con certificados-config.local.php
# (usuario bedelia / password-demo-auth). No usar example.php para login.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/apps/backend-php"
CONFIG_LOCAL="$BACKEND/config/certificados-config.local.php"
NAME="ifts14-php84-local"
IMAGE="ifts14-php84"

if [[ ! -f "$CONFIG_LOCAL" ]]; then
  echo "Falta $CONFIG_LOCAL" >&2
  echo "Copiá apps/backend-php/config/certificados-config.example.php → certificados-config.local.php" >&2
  echo "y configurá admin_username=bedelia + admin_password_hash de password-demo-auth (fuera de Git)." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado o no está en PATH." >&2
  exit 1
fi

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo "Imagen Docker '$IMAGE' no encontrada. Construila antes de levantar la API." >&2
  exit 1
fi

docker stop "$NAME" >/dev/null 2>&1 || true

docker run -d --rm \
  --name "$NAME" \
  -p 8080:8080 \
  -v "$BACKEND":/app \
  -w /app \
  -e CERTIFICADOS_CONFIG_PATH=/app/config/certificados-config.local.php \
  "$IMAGE" \
  php -S 0.0.0.0:8080 -t /app /app/router.php >/dev/null

# Esperar health breve
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf http://127.0.0.1:8080/health >/dev/null 2>&1; then
    break
  fi
  sleep 0.3
done

if ! curl -sf http://127.0.0.1:8080/health >/dev/null; then
  echo "La API no respondió /health en :8080" >&2
  docker logs "$NAME" 2>&1 | tail -n 40 >&2 || true
  exit 1
fi

login_code="$(
  curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:8080/admin/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"username":"bedelia","password":"password-demo-auth"}'
)"

if [[ "$login_code" != "200" ]]; then
  echo "Login smoke falló (HTTP $login_code). Revisá admin_username/hash en certificados-config.local.php" >&2
  echo "No uses CERTIFICADOS_CONFIG_PATH=.../certificados-config.example.php para QA local." >&2
  exit 1
fi

echo "API local OK — http://127.0.0.1:8080"
echo "Login smoke OK — bedelia / password-demo-auth"
echo "Frontend: cd apps/frontend-angular && npm start → http://localhost:4200/certificados/"
