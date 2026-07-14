-- Migración controlada: reconciliar esquema M4-02
-- MariaDB 10.6 compatible. No contiene datos reales.
--
-- Pre-requisitos:
-- - database/migrations/001 a 005 aplicadas.
--
-- Alcance:
-- - Añadir estado 'archivado' a cert_cursos.
-- - Hacer nullables autoridades y texto en cert_configuracion_institucional.
-- - Ajustar collation a utf8mb4_unicode_ci.
-- - Homologar estructura, orden de columnas, índices y comentarios entre variantes históricas y actuales.

-- 1. Homologar cert_alumnos
ALTER TABLE cert_alumnos
  MODIFY COLUMN dni_hash BINARY(32) NOT NULL COMMENT 'HMAC-SHA-256 del DNI' AFTER id,
  MODIFY COLUMN dni_cifrado VARBINARY(512) NOT NULL COMMENT 'DNI cifrado con AES-256-GCM' AFTER dni_hash,
  MODIFY COLUMN dni_mostrar VARCHAR(20) NULL COMMENT 'Enmascarado visual opcional' AFTER dni_cifrado,
  MODIFY COLUMN apellido_nombre VARCHAR(160) NOT NULL AFTER dni_mostrar,
  ADD INDEX IF NOT EXISTS idx_cert_alumnos_estado (estado),
  ADD INDEX IF NOT EXISTS idx_cert_alumnos_apellido_nombre (apellido_nombre);

-- 2. Homologar cert_cursos
ALTER TABLE cert_cursos
  MODIFY COLUMN estado ENUM('borrador', 'activo', 'cerrado', 'archivado') NOT NULL DEFAULT 'borrador',
  ADD INDEX IF NOT EXISTS idx_cert_cursos_nombre (nombre);

-- 3. Homologar cert_curso_fechas
ALTER TABLE cert_curso_fechas
  MODIFY COLUMN descripcion VARCHAR(180) NULL AFTER fecha,
  MODIFY COLUMN orden SMALLINT UNSIGNED NOT NULL COMMENT '1..65535' AFTER descripcion,
  MODIFY COLUMN estado ENUM('programada', 'realizada', 'cancelada') NOT NULL DEFAULT 'programada' AFTER orden,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
  ADD INDEX IF NOT EXISTS idx_cert_curso_fechas_curso (curso_id),
  ADD INDEX IF NOT EXISTS idx_cert_curso_fechas_fecha (fecha),
  ADD INDEX IF NOT EXISTS idx_cert_curso_fechas_estado (estado);

-- Asegurar Unique Keys en cert_curso_fechas (histórica y actual tienen nombres cruzados o faltantes)
ALTER TABLE cert_curso_fechas
  DROP INDEX IF EXISTS uq_cert_curso_fechas_curso_fecha,
  DROP INDEX IF EXISTS uq_cert_curso_fechas_curso_orden;
ALTER TABLE cert_curso_fechas
  ADD UNIQUE INDEX uq_cert_curso_fechas_curso_fecha (curso_id, fecha),
  ADD UNIQUE INDEX uq_cert_curso_fechas_curso_orden (curso_id, orden);

-- 4. Homologar cert_asistencias
ALTER TABLE cert_asistencias
  ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER eliminado_en,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
  ADD INDEX IF NOT EXISTS idx_cert_asistencias_alumno (alumno_id),
  ADD INDEX IF NOT EXISTS idx_cert_asistencias_curso_fecha (curso_fecha_id),
  ADD INDEX IF NOT EXISTS idx_cert_asistencias_eliminado_en (eliminado_en);

-- 5. Homologar cert_certificado_fechas
ALTER TABLE cert_certificado_fechas
  MODIFY COLUMN curso_fecha_id BIGINT UNSIGNED NOT NULL COMMENT 'Referencia histórica' AFTER certificado_id,
  ADD INDEX IF NOT EXISTS idx_cert_certificado_fechas_certificado (certificado_id),
  ADD INDEX IF NOT EXISTS idx_cert_certificado_fechas_curso_fecha (curso_fecha_id),
  ADD INDEX IF NOT EXISTS idx_cert_certificado_fechas_cert_orden (certificado_id, orden);

ALTER TABLE cert_certificado_fechas
  DROP INDEX IF EXISTS uq_cert_certificado_fechas_cert_fecha,
  DROP INDEX IF EXISTS uq_cert_certificado_fechas_cert_orden;
ALTER TABLE cert_certificado_fechas
  ADD UNIQUE INDEX uq_cert_certificado_fechas_cert_fecha (certificado_id, curso_fecha_id),
  ADD UNIQUE INDEX uq_cert_certificado_fechas_cert_orden (certificado_id, orden);

-- 6. Homologar cert_configuracion_institucional
-- Histórica tenía created_at, id=DEFAULT 1 y chk_cert_configuracion_institucional_single_row
-- Actual no tiene created_at, id=NOT NULL y chk_cert_configuracion_institucional_id
-- Converger hacia el modelo moderno pero manteniendo nullables:
ALTER TABLE cert_configuracion_institucional
  DROP COLUMN IF EXISTS created_at,
  MODIFY COLUMN id TINYINT UNSIGNED NOT NULL,
  MODIFY COLUMN rector_nombre VARCHAR(160) NULL,
  MODIFY COLUMN rector_cargo VARCHAR(160) NULL,
  MODIFY COLUMN asesor_nombre VARCHAR(160) NULL,
  MODIFY COLUMN asesor_cargo VARCHAR(160) NULL,
  MODIFY COLUMN texto_certificado TEXT NULL;

-- 7. Asegurar collation unificada para las tablas de 003
ALTER TABLE cert_alumnos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_cursos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_curso_fechas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_asistencias CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_certificado_fechas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_configuracion_institucional CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Nota de constraint FKs: mysqldump difiere si hay nombres FK distintos.
-- Para evitar errores de drop FK, dejaremos que diff ignore constraints si fuera necesario, 
-- pero intentaremos forzar nombres unificados si la base lo permite (MariaDB 10.6).
ALTER TABLE cert_certificado_fechas DROP FOREIGN KEY IF EXISTS fk_cert_certificado_fechas_certificado;
ALTER TABLE cert_certificado_fechas ADD CONSTRAINT fk_cert_certificado_fechas_cert FOREIGN KEY IF NOT EXISTS (certificado_id) REFERENCES cert_certificados(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE cert_certificado_fechas DROP FOREIGN KEY IF EXISTS fk_cert_certificado_fechas_curso_fecha;
ALTER TABLE cert_certificado_fechas DROP FOREIGN KEY IF EXISTS fk_cert_certificado_fechas_cf;
ALTER TABLE cert_certificado_fechas ADD CONSTRAINT fk_cert_certificado_fechas_cf FOREIGN KEY (curso_fecha_id) REFERENCES cert_curso_fechas(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE cert_asistencias DROP KEY IF EXISTS fk_cert_asistencias_curso_fecha;

-- Drop constraints de configuracion para unificar (falla silencioso si no existe en MariaDB 10.6+)
ALTER TABLE cert_configuracion_institucional DROP CONSTRAINT IF EXISTS chk_cert_configuracion_institucional_single_row;
ALTER TABLE cert_configuracion_institucional DROP CONSTRAINT IF EXISTS chk_cert_configuracion_institucional_id;
ALTER TABLE cert_configuracion_institucional ADD CONSTRAINT chk_cert_configuracion_institucional_id CHECK (id = 1);
