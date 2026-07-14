-- Migración controlada: crear tabla de versiones de esquema
-- MariaDB 10.6 compatible. No contiene datos reales.
--
-- Pre-requisitos:
-- - Ninguno estricto (puede correrse en cualquier momento).
--
-- Alcance:
-- - Tabla cert_schema_migrations para llevar registro de migraciones aplicadas.

CREATE TABLE IF NOT EXISTS cert_schema_migrations (
    version VARCHAR(20) NOT NULL PRIMARY KEY,
    aplicado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sembrar las migraciones históricas ya aplicadas como baseline
-- (Solo si existe el esquema base 001-006)
INSERT IGNORE INTO cert_schema_migrations (version)
SELECT version FROM (
    SELECT '001' AS version UNION ALL
    SELECT '002' UNION ALL
    SELECT '003' UNION ALL
    SELECT '004' UNION ALL
    SELECT '005' UNION ALL
    SELECT '006' UNION ALL
    SELECT '007'
) AS v
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_name = 'cert_alumnos'
);

-- Rollback manual seguro, en orden inverso:
-- DROP TABLE IF EXISTS cert_schema_migrations;
