#!/usr/bin/env bash
set -euo pipefail

ADMIN_KEY="demo_admin_key_123"
API="http://127.0.0.1:8080"

echo "============================================================"
echo "   Prueba interactiva ALTO-C: Desactualización de PDF"
echo "============================================================"

cleanup() {
    echo ""
    echo "Limpiando contenedores..."
    docker rm -f ifts14-mariadb-demo ifts14-php-demo >/dev/null 2>&1 || true
    rm -f "${CFG:-}" "${TMP_BODY:-}"
    echo "¡Entorno limpio!"
}
trap cleanup EXIT

# 1. Levantar MariaDB temporal en puerto alternativo
echo "[1/5] Levantando MariaDB temporal en el puerto 3314..."
docker rm -f ifts14-mariadb-demo >/dev/null 2>&1 || true
docker run -d --name ifts14-mariadb-demo \
    -e MYSQL_ROOT_PASSWORD=root \
    -e MYSQL_DATABASE=ifts14_demo \
    -p 3314:3306 \
    mariadb:10.6 \
    --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci >/dev/null

echo "Esperando a que MariaDB acepte conexiones SQL..."
for i in {1..30}; do
    if docker exec ifts14-mariadb-demo mysql -u root -proot -e "SELECT 1" >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

# 2. Aplicar migraciones
echo "[2/5] Aplicando migraciones..."
docker run --rm --network host \
    -v "$(pwd)/database/migrations:/migrations" \
    mariadb:10.6 \
    sh -c 'cat /migrations/*.sql | mysql -h 127.0.0.1 -P 3314 -u root -proot ifts14_demo'

# Insertar config institucional requerida
docker exec -i ifts14-mariadb-demo mysql -u root -proot ifts14_demo -e \
    "INSERT INTO cert_configuracion_institucional (id, institucion_nombre, texto_certificado) VALUES (1, 'IFTS 14', 'Certificado de prueba ALTO-C');" 2>/dev/null

# 3. Generar config PHP con TODAS las claves necesarias
echo "[3/5] Generando configuración PHP..."
# Generar una clave AES-256 de 32 bytes en base64 para token_encryption_key
DEMO_KEY=$(openssl rand -base64 32)
CFG=$(mktemp /tmp/ifts14-cfg.XXXXXX.php)
cat > "$CFG" <<PHP
<?php
return [
    'db_host' => '127.0.0.1;port=3314',
    'db_name' => 'ifts14_demo',
    'db_user' => 'root',
    'db_pass' => 'root',
    'token_pepper' => 'pepper_demo_alto_c_2026',
    'token_encryption_key' => '$DEMO_KEY',
    'dni_cipher_key' => '$DEMO_KEY',
    'admin_api_key' => '$ADMIN_KEY',
    'app_salt' => 'salt_demo_alto_c',
    'public_base_url' => 'http://127.0.0.1:8080',
    'certificate_storage_path' => '/tmp',
];
PHP

# 4. Iniciar servidor PHP
echo "[4/5] Levantando servidor PHP en $API..."
docker rm -f ifts14-php-demo >/dev/null 2>&1 || true
docker run -d --name ifts14-php-demo --network host \
    -v "$(pwd)/apps/backend-php:/app" \
    -v "$CFG":/tmp/cfg.php:ro \
    -e CERTIFICADOS_CONFIG_PATH=/tmp/cfg.php \
    -w /app \
    ifts14-php84 \
    php -d variables_order=EGPCS -S 127.0.0.1:8080 index.php >/dev/null

echo "Esperando a que el servidor PHP responda..."
for i in {1..20}; do
    if curl -sf "$API/certificados/api/health" >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

# 5. Sembrar datos de prueba
echo "[5/5] Sembrando datos de prueba..."

CURSO_RESP=$(curl -sf -X POST "$API/admin/cursos" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"codigo":"TEST01","nombre":"Curso Demo ALTO-C"}')
CURSO_ID=$(echo "$CURSO_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "  Curso creado: ID=$CURSO_ID"

ALUMNO_RESP=$(curl -sf -X POST "$API/admin/alumnos" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"dni":"12345678","apellidoNombre":"Alumno Demo"}')
ALUMNO_ID=$(echo "$ALUMNO_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "  Alumno creado: ID=$ALUMNO_ID"

FECHA1_RESP=$(curl -sf -X POST "$API/admin/cursos/$CURSO_ID/fechas" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"fecha":"2026-06-01","descripcion":"Clase 1","orden":1,"estado":"realizada"}')
FECHA1_ID=$(echo "$FECHA1_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

FECHA2_RESP=$(curl -sf -X POST "$API/admin/cursos/$CURSO_ID/fechas" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"fecha":"2026-06-08","descripcion":"Clase 2","orden":2,"estado":"realizada"}')
FECHA2_ID=$(echo "$FECHA2_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "  Fechas creadas: ID=$FECHA1_ID, ID=$FECHA2_ID"

curl -sf -X POST "$API/admin/asistencias" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"alumnoId\":$ALUMNO_ID,\"cursoId\":$CURSO_ID,\"cursoFechaId\":$FECHA1_ID}" >/dev/null

curl -sf -X POST "$API/admin/asistencias" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"alumnoId\":$ALUMNO_ID,\"cursoId\":$CURSO_ID,\"cursoFechaId\":$FECHA2_ID}" >/dev/null
echo "  Asistencias registradas: 2"

EMISSION_RESP=$(curl -sf -X POST "$API/admin/certificados" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"alumnoId\":$ALUMNO_ID,\"cursoId\":$CURSO_ID,\"issuedAt\":\"2026-07-14\"}")
CERT_ID=$(echo "$EMISSION_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
TOKEN=$(echo "$EMISSION_RESP" | grep -o '"publicValidationUrl":"[^"]*"' | cut -d'"' -f4 | awk -F/ '{print $NF}')
echo "  Certificado emitido: ID=$CERT_ID"

echo ""
echo "============================================================"
echo "   ¡ENTORNO LISTO PARA TESTEAR!"
echo "============================================================"
echo ""
echo "PRUEBA 1 — Verificación pública (abrí en el navegador):"
echo "   -> $API/certificados/api/certificados/$TOKEN/verificacion"
echo "   Esperado: JSON con valid=true, 2 fechas de cursada."
echo ""
echo "PRUEBA 2 — Descarga de PDF (copiá en otra terminal):"
echo "   curl -i -H 'X-Admin-Key: $ADMIN_KEY' $API/admin/certificados/$CERT_ID/pdf"
echo "   Esperado: HTTP 200 con contenido binario PDF."
echo ""
read -p ">> Presioná ENTER cuando hayas comprobado ambas pruebas..."

echo ""
echo "============================================================"
echo "   SIMULANDO CAMBIO ADMINISTRATIVO"
echo "============================================================"
echo ""
echo "La secretaría decide cancelar la 'Clase 2' desde el panel admin..."
PATCH_RESP=$(curl -s -w '\n%{http_code}' -X PATCH "$API/admin/cursos/$CURSO_ID/fechas/$FECHA2_ID" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"estado":"cancelada"}')
PATCH_HTTP=$(echo "$PATCH_RESP" | tail -1)
PATCH_BODY=$(echo "$PATCH_RESP" | sed '$d')
if [ "$PATCH_HTTP" != "200" ]; then
    echo "ERROR: La cancelación falló con HTTP $PATCH_HTTP"
    echo "Respuesta: $PATCH_BODY"
    echo ""
    read -p ">> Presioná ENTER para limpiar el entorno y salir..."
    exit 1
fi
echo "¡Clase 2 cancelada exitosamente en BD! (HTTP $PATCH_HTTP)"
echo ""
echo "Ahora repetí las 2 pruebas:"
echo ""
echo "PRUEBA 3 — Refrescá el link público en el navegador:"
echo "   -> $API/certificados/api/certificados/$TOKEN/verificacion"
echo "   Esperado: MISMO link (no rotó), pero ahora muestra SOLO 1 fecha."
echo ""
echo "PRUEBA 4 — Intentá bajar el PDF de nuevo:"
echo "   curl -i -H 'X-Admin-Key: $ADMIN_KEY' $API/admin/certificados/$CERT_ID/pdf"
echo "   Esperado: HTTP 409 Conflict con código PDF_OUTDATED."
echo ""
read -p ">> Presioná ENTER para limpiar el entorno y terminar..."
echo ""
echo "¡ALTO-C validado!"
