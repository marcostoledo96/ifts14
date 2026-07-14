-- P4-01: Migración de revisión de contenido para certificados
-- Implementa soporte para modificar asistencias manteniendo URL/QR
-- y marca de desactualización del PDF.

ALTER TABLE cert_certificados
ADD COLUMN contenido_revision INT UNSIGNED NOT NULL DEFAULT 1,
ADD COLUMN contenido_actualizado_en DATETIME NULL,
ADD COLUMN pdf_estado ENUM('vigente','desactualizado','no_generado') NOT NULL DEFAULT 'no_generado',
ADD COLUMN pdf_generado_revision INT UNSIGNED NULL;
