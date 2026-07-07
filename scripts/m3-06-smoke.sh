#!/usr/bin/env bash
# M3-06: smoke local Angular↔API PHP real con datos ficticios.
# Arranca la API PHP en 127.0.0.1:8080 con config ficticia, consulta las
# mismas rutas que usa Angular vía proxy (`/certificados/api/...`) y sale 0 si
# las respuestas son controladas: health=200 y verificación=200|404 únicamente.
# 400 (VALIDATION_ERROR) y 500 (INTERNAL_ERROR) se tratan como FAIL,
# conforme a spec frontend-api-readiness "Smoke de verificación con token
# ficticio" (DEBE recibir 200 o 404 según el fixture).
# No usa datos reales.
#
# Requisitos:
#   - php CLI en PATH (PHP 8.4+). Si no está, cae a la imagen Docker local
#     `ifts14-php84` (construida con `bash scripts/php-docker-build.sh`).
#     Si la imagen tampoco está disponible, el script sale 2 (BLOCKED).
#   - curl.
#   - Puerto 8080 libre.
#   - MariaDB/MySQL local alcanzable en 127.0.0.1 con la DB ficticia de la
#     config (no requiere certificado sembrado: token bien formado pero
#     inexistente → 404 controlado). Si la DB no está disponible, la
#     verificación resulta 500 → FAIL (correcto: el smoke exige enlace real).
#
# Uso:
#   bash scripts/m3-06-smoke.sh
#
# Nota: este script NO levanta Angular/ng serve. La validación Angular→API
# vía proxy.conf.json es manual (ver environment.development.ts).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/apps/backend-php"
PORT=127.0.0.1:8080
DOCKER_IMG="ifts14-php84"

# Resuelve cómo invocar Docker en setups donde el socket requiere sudo.
# Estrategia mínima: probar `docker` directo; si falla por permisos y existe
# `sudo`, usar `sudo docker`; si no, fallar con mensaje accionable.
# `DOCKER_SUDO` se mantiene vacío en el caso normal (sin sudo) para no alterar
# los comandos existentes. Cuando se setea, se interpola delante de `docker`.
DOCKER_SUDO=""
resolve_docker_cmd() {
  if docker info >/dev/null 2>&1; then
    DOCKER_SUDO=""
    return 0
  fi
  if command -v sudo >/dev/null 2>&1 && sudo -n docker info >/dev/null 2>&1; then
    DOCKER_SUDO="sudo"
    return 0
  fi
  echo "[m3-06-smoke] BLOCKED: docker no accesible (permiso denegado al socket)." >&2
  echo "  Agregá tu usuario al grupo 'docker' o ejecutá el smoke con sudo." >&2
  return 1
}

if ! command -v curl >/dev/null 2>&1; then
  echo "[m3-06-smoke] BLOCKED: curl no disponible en PATH." >&2
  exit 2
fi

# Resuelve cómo invocar PHP:
#   1) php CLI del host (preferido)
#   2) imagen Docker local `ifts14-php84` (fallback)
#   3) BLOCKED con mensaje accionable
PHP_MODE="host"
PHP_CMD=(php)
if ! command -v php >/dev/null 2>&1; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "[m3-06-smoke] BLOCKED: ni php CLI ni docker disponibles en PATH." >&2
    exit 2
  fi
  # Docker requiere permisos: resolver `docker` vs `sudo docker` una vez aquí
  # ANTES de image inspect, porque en hosts sudo-only el `docker` directo falla
  # por permisos y se reportaría falsamente como "imagen faltante". Reusar
  # DOCKER_SUDO en todos los comandos posteriores (run, rm -f del cleanup).
  # `sudo -n` evita prompt interactivo: si necesita password, falla limpio
  # antes de arrancar el server.
  if ! resolve_docker_cmd; then
    exit 2
  fi
  if ! $DOCKER_SUDO docker image inspect "$DOCKER_IMG" >/dev/null 2>&1; then
    echo "[m3-06-smoke] BLOCKED: falta php CLI y la imagen Docker '$DOCKER_IMG' no está construida." >&2
    echo "  Construí la imagen con: bash scripts/php-docker-build.sh" >&2
    echo "  O directamente: docker build -t $DOCKER_IMG -f docker/php84/Dockerfile ." >&2
    exit 2
  fi
  PHP_MODE="docker"
  # /tmp:ro permite que los helpers `php -r` lean los JSON que `curl -o /tmp/...`
  # escribe en el host (mismo path dentro del contenedor).
  PHP_CMD=($DOCKER_SUDO docker run --rm -i -v "$REPO_ROOT":/app -w /app -v /tmp:/tmp:ro "$DOCKER_IMG" php)
fi

# Config ficticia: no usar en producción. Sin DB real de producción.
# CertificateValidator valida el formato del token (32–128 chars,
# [A-Za-z0-9_-]) antes de abrir PDO. El smoke usa un token ficticio BIEN
# formado (32–128 chars, sin datos reales) para forzar el flujo de búsqueda: si la
# DB local está disponible pero no hay certificado sembrado para ese hash,
# findCertificate devuelve null → 404 controlado. Si la DB no está disponible,
# PDO lanza → 500 → FAIL. /health cubre 200. 400 y 500 siempre se tratan
# como FAIL conforme a la spec frontend-api-readiness.
# Inicialización segura antes del trap: las vars de temp/estado se setean
# vacías para que el cleanup no falle por unset bajo `set -u` si el script
# aborta antes de su asignación real.
CFG=""
HEALTH_JSON=""
VERIF_JSON=""
SERVER_LOG=""
SERVER_PID=""
DOCKER_CONTAINER=""
CFG="$(mktemp /tmp/m3-06-cfg.XXXXXX.php)"
# ponytail: log único por invocación para evitar colisiones en corridas
# paralelas. En modo host captura salida del server embebido PHP; en modo
# Docker captura salida de `docker run` (id/comando del contenedor), NO logs
# PHP del contenedor.
SERVER_LOG="$(mktemp /tmp/m3-06-server.XXXXXX.log)"
cat > "$CFG" <<'PHP'
<?php
declare(strict_types=1);
// Config ficticia M3-06. Sin credenciales reales.
return [
    'db_host' => '127.0.0.1',
    'db_name' => getenv('M3_06_DB_NAME') ?: 'ifts14_certificados_demo',
    'db_user' => 'usuario_demo',
    'db_pass' => 'clave_demo_no_real',
    'token_pepper' => 'pepper_demo_ficticio_2026_no_usar',
    'dni_cipher_key' => 'ZGVtby1rZXktMzItYnl0ZXMtZmljdGljaW8tMjAyNiE=',
];
PHP

cleanup() {
  rm -f "$CFG" "$HEALTH_JSON" "$VERIF_JSON" "$SERVER_LOG"
  [[ -n "${SERVER_PID:-}" ]] && kill "$SERVER_PID" 2>/dev/null || true
  [[ -n "${DOCKER_CONTAINER:-}" ]] && $DOCKER_SUDO docker rm -f "$DOCKER_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

export CERTIFICADOS_CONFIG_PATH="$CFG"
# ponytail: temp files únicos por invocación para evitar colisiones si se
# corre el smoke en paralelo. mktemp garantiza paths distintos.
HEALTH_JSON="$(mktemp /tmp/m3-06-health.XXXXXX.json)"
VERIF_JSON="$(mktemp /tmp/m3-06-verif.XXXXXX.json)"
echo "[m3-06-smoke] Levantando API PHP en http://$PORT ..."
if [[ "$PHP_MODE" == "host" ]]; then
  php -S "$PORT" -t "$BACKEND_DIR" "$BACKEND_DIR/index.php" >"$SERVER_LOG" 2>&1 &
  SERVER_PID=$!
else
  # Docker con --network host: el contenedor comparte la red del host, así
  # el servidor embebido ligado a 127.0.0.1:8080 es alcanzable por el `curl`
  # del host y, a la vez, el contenedor puede conectar a MariaDB en
  # 127.0.0.1:3306 del host (donde bind real). Sin --network host, el
  # contenedor no vería 127.0.0.1 del host y la DB quedaría inalcanzable.
  DOCKER_CONTAINER="ifts14-m3-06-smoke-$$"
  # Forward del override opcional de DB al contenedor: el config generado lee
  # `getenv('M3_06_DB_NAME')` (default 'ifts14_certificados_demo'). Sin esto,
  # el contenedor no ve la var del host y siempre usa el default.
  DB_ENV_ARGS=()
  if [[ -n "${M3_06_DB_NAME:-}" ]]; then
    DB_ENV_ARGS+=(-e "M3_06_DB_NAME=$M3_06_DB_NAME")
  fi
  $DOCKER_SUDO docker run -d --rm \
    --name "$DOCKER_CONTAINER" \
    --network host \
    -v "$BACKEND_DIR":/app/apps/backend-php:ro \
    -v "$CFG":/tmp/m3-06-cfg.php:ro \
    -e CERTIFICADOS_CONFIG_PATH=/tmp/m3-06-cfg.php \
    "${DB_ENV_ARGS[@]}" \
    "$DOCKER_IMG" \
    php -S 127.0.0.1:8080 -t /app/apps/backend-php /app/apps/backend-php/index.php \
    >"$SERVER_LOG" 2>&1
  SERVER_PID=""
fi

# Esperar a que el server responda.
for _ in $(seq 1 20); do
  if curl -fsS "http://$PORT/certificados/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

echo "[m3-06-smoke] GET /certificados/api/health"
HEALTH_STATUS=$(curl -s -o "$HEALTH_JSON" -w '%{http_code}' "http://$PORT/certificados/api/health")
echo "  status=$HEALTH_STATUS body=$(cat "$HEALTH_JSON")"
if [[ "$HEALTH_STATUS" != "200" ]]; then
  echo "[m3-06-smoke] FAIL: /certificados/api/health esperaba 200, got $HEALTH_STATUS" >&2
  exit 1
fi

assert_json_path() {
  local file="$1"
  local path="$2"
  local expected="$3"
  "${PHP_CMD[@]}" -r '
    $data = json_decode(file_get_contents($argv[1]), true);
    if (!is_array($data)) { exit(1); }
    $value = $data;
    foreach (explode(".", $argv[2]) as $key) {
      if (!is_array($value) || !array_key_exists($key, $value)) { exit(1); }
      $value = $value[$key];
    }
    exit((string) $value === $argv[3] ? 0 : 1);
  ' "$file" "$path" "$expected"
}

assert_200_dto() {
  local file="$1"
  "${PHP_CMD[@]}" -r '
    $data = json_decode(file_get_contents($argv[1]), true);
    $dto = is_array($data) ? ($data["data"] ?? null) : null;
    $student = is_array($dto) ? ($dto["student"] ?? null) : null;
    $hasDocument = is_array($student) && (isset($student["documentMasked"]) || isset($student["documentNumber"]));
    $ok = is_array($dto)
      && ($dto["valid"] ?? null) === true
      && ($dto["status"] ?? null) === "vigente"
      && $hasDocument
      && isset($dto["certificateCode"], $dto["student"]["displayName"], $dto["course"]["name"], $dto["course"]["issuedAt"], $dto["verifiedAt"], $data["meta"]["requestId"]);
    exit($ok ? 0 : 1);
  ' "$file"
}

assert_json_path "$HEALTH_JSON" data.status ok
assert_json_path "$HEALTH_JSON" data.service certificados-api

# Verificación con token ficticio BIEN formado (32 chars, charset válido, sin
# datos reales): pasa la validación de formato y llega a la búsqueda en DB.
# Si la DB local está disponible pero no hay certificado sembrado para ese
# hash, findCertificate devuelve null → 404 CERTIFICATE_NOT_FOUND controlado,
# conforme al escenario spec "HTTP 404 no verificable". Si la DB no está
# disponible, PDO lanza → 500 → FAIL (el smoke exige enlace real Angular↔PHP↔DB).
# 400 (token mal formado) y 500 (error técnico) siempre se tratan como FAIL,
# conforme a la spec: el smoke solo acepta 200 o 404 como éxito controlado.
TOKEN_FICTICIO="m3-06-token-ficticio-smoke-2026-abcdef0123456789"
echo "[m3-06-smoke] GET /certificados/api/certificados/$TOKEN_FICTICIO/verificacion (token ficticio bien formado, 32+ chars)"
VERIF_STATUS=$(curl -s -o "$VERIF_JSON" -w '%{http_code}' "http://$PORT/certificados/api/certificados/$TOKEN_FICTICIO/verificacion")
echo "  status=$VERIF_STATUS body=$(cat "$VERIF_JSON")"
case "$VERIF_STATUS" in
  200)
    if ! assert_200_dto "$VERIF_JSON"; then
      echo "[m3-06-smoke] FAIL: verificación 200 sin DTO público esperado." >&2
      exit 1
    fi
    echo "[m3-06-smoke] OK: verificación 200 (certificado existente mapeado al DTO público)."
    ;;
  404)
    if ! assert_json_path "$VERIF_JSON" error.code CERTIFICATE_NOT_FOUND; then
      echo "[m3-06-smoke] FAIL: verificación 404 sin error.code CERTIFICATE_NOT_FOUND." >&2
      exit 1
    fi
    echo "[m3-06-smoke] OK: token ficticio bien formado inexistente → 404 CERTIFICATE_NOT_FOUND (controlado, sin DB de producción)."
    ;;
  400)
    echo "[m3-06-smoke] FAIL: verificación esperaba 200/404, got 400 VALIDATION_ERROR (token mal formado NO se acepta como éxito según spec)." >&2
    exit 1
    ;;
  *)
    echo "[m3-06-smoke] FAIL: verificación esperaba 200/404 controlados, got $VERIF_STATUS (400/500 no se aceptan como éxito según spec)." >&2
    exit 1
    ;;
esac

echo "[m3-06-smoke] OK: respuestas controladas (sin datos reales)."
exit 0
