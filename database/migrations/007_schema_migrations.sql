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
INSERT IGNORE INTO cert_schema_migrations (version) VALUES 
('001'), ('002'), ('003'), ('004'), ('005'), ('006'), ('007');

-- Rollback manual seguro, en orden inverso:
-- DROP TABLE IF EXISTS cert_schema_migrations;
