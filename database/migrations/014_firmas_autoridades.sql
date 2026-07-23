-- Firmas de autoridades (imagen PNG/JPEG) en configuración institucional.
-- Columnas aditivas nullable; no altera PDFs ya emitidos.
-- MariaDB 10.6+.

ALTER TABLE cert_configuracion_institucional
  ADD COLUMN rector_firma_filename VARCHAR(64) NULL COMMENT 'Basename seguro (rector.png|jpg)',
  ADD COLUMN rector_firma_sha256 CHAR(64) NULL COMMENT 'SHA-256 hex del archivo',
  ADD COLUMN asesor_firma_filename VARCHAR(64) NULL COMMENT 'Basename seguro (asesor.png|jpg)',
  ADD COLUMN asesor_firma_sha256 CHAR(64) NULL COMMENT 'SHA-256 hex del archivo';

INSERT IGNORE INTO cert_schema_migrations (version) VALUES ('014');
