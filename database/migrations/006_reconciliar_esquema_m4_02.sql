-- Migración controlada: reconciliar esquema M4-02
-- MariaDB 10.6 compatible. No contiene datos reales.
--
-- Pre-requisitos:
-- - database/migrations/001 a 005 aplicadas.
--
-- Alcance:
-- - Añadir estado 'archivado' a cert_cursos.
-- - Hacer nullables autoridades y texto en cert_configuracion_institucional.
-- - Ajustar collation a utf8mb4_unicode_ci para tablas creadas en 003.

-- 1. Modificar enum de estado en cert_cursos
ALTER TABLE cert_cursos
  MODIFY COLUMN estado ENUM('borrador', 'activo', 'cerrado', 'archivado') NOT NULL DEFAULT 'borrador';

-- 2. Hacer nullables las autoridades y el texto en la configuración
ALTER TABLE cert_configuracion_institucional
  MODIFY COLUMN rector_nombre VARCHAR(160) NULL,
  MODIFY COLUMN rector_cargo VARCHAR(160) NULL,
  MODIFY COLUMN asesor_nombre VARCHAR(160) NULL,
  MODIFY COLUMN asesor_cargo VARCHAR(160) NULL,
  MODIFY COLUMN texto_certificado TEXT NULL;

-- 3. Asegurar collation unificada para las tablas de 003
ALTER TABLE cert_alumnos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_cursos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_curso_fechas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_asistencias CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_certificado_fechas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cert_configuracion_institucional CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Rollback manual seguro, solo con backup aprobado:
-- ALTER TABLE cert_cursos MODIFY COLUMN estado ENUM('borrador', 'activo', 'cerrado') NOT NULL DEFAULT 'borrador';
-- ALTER TABLE cert_configuracion_institucional
--   MODIFY COLUMN rector_nombre VARCHAR(160) NOT NULL,
--   MODIFY COLUMN rector_cargo VARCHAR(160) NOT NULL,
--   MODIFY COLUMN asesor_nombre VARCHAR(160) NOT NULL,
--   MODIFY COLUMN asesor_cargo VARCHAR(160) NOT NULL,
--   MODIFY COLUMN texto_certificado TEXT NOT NULL;
-- (Collation rollback no estricto, dado que utf8mb4 default suele coincidir o no romper)
