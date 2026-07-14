#!/usr/bin/env bash
set -e

DB_NAME="ifts14_test"
DB_USER="root"
DB_PASS="root"

CONT_HIST="mariadb_hist_test"
CONT_CURR="mariadb_curr_test"

function cleanup() {
  echo "Limpiando MariaDB descartables..."
  docker rm -f $CONT_HIST $CONT_CURR >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Iniciando MariaDB descartables..."
docker rm -f $CONT_HIST $CONT_CURR 2>/dev/null || true
docker run -d --name $CONT_HIST -e MYSQL_ROOT_PASSWORD=$DB_PASS -e MYSQL_DATABASE=$DB_NAME mariadb:10.6 >/dev/null
docker run -d --name $CONT_CURR -e MYSQL_ROOT_PASSWORD=$DB_PASS -e MYSQL_DATABASE=$DB_NAME mariadb:10.6 >/dev/null

echo "Esperando a que MariaDB estén listos..."
until docker exec $CONT_HIST mysql -u$DB_USER -p$DB_PASS -e "SELECT 1" >/dev/null 2>&1; do sleep 1; done
until docker exec $CONT_CURR mysql -u$DB_USER -p$DB_PASS -e "SELECT 1" >/dev/null 2>&1; do sleep 1; done

echo "Aplicando migraciones a HISTORICAL..."
docker exec -i $CONT_HIST mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/001_certificados_qr.sql
docker exec -i $CONT_HIST mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/002_token_cifrado_entrega_manual.sql
docker exec -i $CONT_HIST mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/fixtures/schema_003_historical.sql
docker exec -i $CONT_HIST mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/004_certificados_alumno_curso.sql
docker exec -i $CONT_HIST mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/005_prevenir_certificados_duplicados.sql
docker exec -i $CONT_HIST mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/006_reconciliar_esquema_m4_02.sql
docker exec -i $CONT_HIST mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/007_schema_migrations.sql

echo "Aplicando migraciones a CURRENT..."
docker exec -i $CONT_CURR mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/001_certificados_qr.sql
docker exec -i $CONT_CURR mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/002_token_cifrado_entrega_manual.sql
docker exec -i $CONT_CURR mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/fixtures/schema_003_current.sql
docker exec -i $CONT_CURR mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/004_certificados_alumno_curso.sql
docker exec -i $CONT_CURR mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/005_prevenir_certificados_duplicados.sql
docker exec -i $CONT_CURR mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/006_reconciliar_esquema_m4_02.sql
docker exec -i $CONT_CURR mysql -u$DB_USER -p$DB_PASS $DB_NAME < database/migrations/007_schema_migrations.sql

echo "Exportando esquemas para comparar..."
docker exec -i $CONT_HIST mysqldump -u$DB_USER -p$DB_PASS --no-data --skip-comments --skip-opt $DB_NAME | sed 's/ AUTO_INCREMENT=[0-9]*//g' > /tmp/schema_hist.sql
docker exec -i $CONT_CURR mysqldump -u$DB_USER -p$DB_PASS --no-data --skip-comments --skip-opt $DB_NAME | sed 's/ AUTO_INCREMENT=[0-9]*//g' > /tmp/schema_curr.sql

if diff -u /tmp/schema_hist.sql /tmp/schema_curr.sql; then
  echo "PASS: Ambos esquemas convergen a la misma estructura exacta."
else
  echo "FAIL: Los esquemas difieren luego de 006."
  exit 1
fi
