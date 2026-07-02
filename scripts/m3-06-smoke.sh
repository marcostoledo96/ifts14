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
#   - php CLI en PATH (PHP 8.4+). Si no está, el script sale 2 (BLOCKED).
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

if ! command -v php >/dev/null 2>&1; then
  echo "[m3-06-smoke] BLOCKED: php CLI no disponible en PATH." >&2
  exit 2
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "[m3-06-smoke] BLOCKED: curl no disponible en PATH." >&2
  exit 2
fi

# Config ficticia: no usar en producción. Sin DB real de producción.
# CertificateValidator valida el formato del token (32–128 chars,
# [A-Za-z0-9_-]) antes de abrir PDO. El smoke usa un token ficticio BIEN
# formado (32–128 chars, sin datos reales) para forzar el flujo de búsqueda: si la
# DB local está disponible pero no hay certificado sembrado para ese hash,
# findCertificate devuelve null → 404 controlado. Si la DB no está disponible,
# PDO lanza → 500 → FAIL. /health cubre 200. 400 y 500 siempre se tratan
# como FAIL conforme a la spec frontend-api-readiness.
CFG="$(mktemp /tmp/m3-06-cfg.XXXXXX.php)"
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

trap 'rm -f "$CFG"; [[ -n "${PID:-}" ]] && kill "$PID" 2>/dev/null || true' EXIT

export CERTIFICADOS_CONFIG_PATH="$CFG"
echo "[m3-06-smoke] Levantando API PHP en http://$PORT ..."
php -S "$PORT" -t "$BACKEND_DIR" "$BACKEND_DIR/index.php" >/tmp/m3-06-server.log 2>&1 &
PID=$!

# Esperar a que el server responda.
for _ in $(seq 1 20); do
  if curl -fsS "http://$PORT/certificados/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

echo "[m3-06-smoke] GET /certificados/api/health"
HEALTH_STATUS=$(curl -s -o /tmp/m3-06-health.json -w '%{http_code}' "http://$PORT/certificados/api/health")
echo "  status=$HEALTH_STATUS body=$(cat /tmp/m3-06-health.json)"
if [[ "$HEALTH_STATUS" != "200" ]]; then
  echo "[m3-06-smoke] FAIL: /certificados/api/health esperaba 200, got $HEALTH_STATUS" >&2
  exit 1
fi

assert_json_path() {
  local file="$1"
  local path="$2"
  local expected="$3"
  php -r '
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
  php -r '
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

assert_json_path /tmp/m3-06-health.json data.status ok
assert_json_path /tmp/m3-06-health.json data.service certificados-api

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
VERIF_STATUS=$(curl -s -o /tmp/m3-06-verif.json -w '%{http_code}' "http://$PORT/certificados/api/certificados/$TOKEN_FICTICIO/verificacion")
echo "  status=$VERIF_STATUS body=$(cat /tmp/m3-06-verif.json)"
case "$VERIF_STATUS" in
  200)
    if ! assert_200_dto /tmp/m3-06-verif.json; then
      echo "[m3-06-smoke] FAIL: verificación 200 sin DTO público esperado." >&2
      exit 1
    fi
    echo "[m3-06-smoke] OK: verificación 200 (certificado existente mapeado al DTO público)."
    ;;
  404)
    if ! assert_json_path /tmp/m3-06-verif.json error.code CERTIFICATE_NOT_FOUND; then
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
