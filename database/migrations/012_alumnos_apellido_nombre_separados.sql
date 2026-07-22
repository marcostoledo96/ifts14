-- Apellido y nombre separados en alumnos. MariaDB 10.6+.
-- Mantiene apellido_nombre sincronizado (denormalizado) para emisión/compat.

ALTER TABLE cert_alumnos
  ADD COLUMN IF NOT EXISTS apellido VARCHAR(80) NOT NULL DEFAULT ''
    COMMENT 'Apellido(s)' AFTER apellido_nombre,
  ADD COLUMN IF NOT EXISTS nombre VARCHAR(80) NOT NULL DEFAULT ''
    COMMENT 'Nombre(s)' AFTER apellido;

-- Backfill: coma → apellido / nombre; si no, primer espacio.
UPDATE cert_alumnos
SET
  apellido = CASE
    WHEN LOCATE(',', apellido_nombre) > 0 THEN
      TRIM(SUBSTRING_INDEX(apellido_nombre, ',', 1))
    WHEN LOCATE(' ', apellido_nombre) > 0 THEN
      TRIM(SUBSTRING_INDEX(apellido_nombre, ' ', 1))
    ELSE
      TRIM(apellido_nombre)
  END,
  nombre = CASE
    WHEN LOCATE(',', apellido_nombre) > 0 THEN
      TRIM(SUBSTRING(apellido_nombre, LOCATE(',', apellido_nombre) + 1))
    WHEN LOCATE(' ', apellido_nombre) > 0 THEN
      TRIM(SUBSTRING(apellido_nombre, LOCATE(' ', apellido_nombre) + 1))
    ELSE
      ''
  END
WHERE apellido = '' AND nombre = '';

INSERT IGNORE INTO cert_schema_migrations (version) VALUES ('012');
