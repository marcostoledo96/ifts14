#!/usr/bin/env bash
set -e

# Configuración
CONTAINER_NAME="mariadb_ifts14_test"
DB_NAME="ifts14_test"
DB_USER="root"
DB_PASS="root"

function cleanup() {
  echo "Limpiando MariaDB descartable..."
  docker rm -f $CONTAINER_NAME >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Iniciando MariaDB 10.6 descartable..."
docker rm -f $CONTAINER_NAME 2>/dev/null || true
docker run -d --name $CONTAINER_NAME -e MYSQL_ROOT_PASSWORD=$DB_PASS -e MYSQL_DATABASE=$DB_NAME mariadb:10.6 >/dev/null

echo "Esperando a que MariaDB esté listo..."
until docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done

echo "Aplicando migraciones 001-005..."
for file in database/migrations/00[1-5]*.sql; do
  echo "  -> $file"
  docker exec -i $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS $DB_NAME < "$file"
done

# Si existen 006 y 007 (fase GREEN), aplicarlas
for file in database/migrations/00[6-7]*.sql; do
  if [ -f "$file" ]; then
    echo "  -> $file"
    docker exec -i $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS $DB_NAME < "$file"
  fi
done

echo ""
echo "Ejecutando aserciones de esquema..."

function assert_sql_fails() {
  local sql="$1"
  local desc="$2"
  if docker exec -i $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS $DB_NAME -e "$sql" >/dev/null 2>&1; then
    echo "FAIL: $desc DEBERIA haber fallado, pero fue exitoso."
    exit 1
  else
    echo "PASS: $desc falló como se esperaba (Restricción DB funciona)."
  fi
}

function assert_sql_succeeds() {
  local sql="$1"
  local desc="$2"
  if ! docker exec -i $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS $DB_NAME -e "$sql" 2>/dev/null; then
    echo "FAIL: $desc DEBERIA haber sido exitoso, pero falló."
    exit 1
  else
    echo "PASS: $desc exitoso."
  fi
}

# 1. archivado en cert_cursos
assert_sql_succeeds "INSERT INTO cert_cursos (codigo, nombre, estado) VALUES ('TEST-01', 'Curso Test', 'activo'); UPDATE cert_cursos SET estado='archivado' WHERE codigo='TEST-01';" "Estado 'archivado' soportado en cert_cursos"

# 2. configuracion institucional nullable (autoridades null, texto null)
assert_sql_succeeds "INSERT INTO cert_configuracion_institucional (id, institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado) VALUES (1, 'IFTS 14', NULL, NULL, NULL, NULL, NULL);" "Configuracion institucional nullable"

# 3. descripcion opcional
assert_sql_succeeds "INSERT INTO cert_curso_fechas (curso_id, fecha, descripcion, orden) VALUES (1, '2026-07-14', NULL, 1);" "Descripcion nula en cert_curso_fechas soportada"

# 4. asistencia activa unica (unique conflict)
assert_sql_succeeds "INSERT INTO cert_alumnos (dni_hash, dni_cifrado, apellido_nombre) VALUES (UNHEX('A1B2C3D4'), 'cipher', 'Alumno Test'); INSERT INTO cert_asistencias (alumno_id, curso_fecha_id) VALUES (1, 1);" "Insertar asistencia valida"
assert_sql_fails "INSERT INTO cert_asistencias (alumno_id, curso_fecha_id) VALUES (1, 1);" "Evitar asistencia duplicada por unique constraint"

# 5. schema migrations registry
assert_sql_succeeds "SELECT version FROM cert_schema_migrations LIMIT 1;" "Tabla cert_schema_migrations existe"

echo "¡Todas las aserciones completadas correctamente!"
