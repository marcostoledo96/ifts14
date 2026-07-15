-- P4-02: Backfill para el estado de los PDFs legacy
-- Asegura que los certificados emitidos antes de la migración 008 
-- se traten como vigentes con revisión 1.

UPDATE cert_certificados 
SET pdf_estado = 'vigente', 
    pdf_generado_revision = 1 
WHERE pdf_estado = 'no_generado' 
  AND pdf_generado_revision IS NULL;

INSERT IGNORE INTO cert_schema_migrations (version) VALUES ('010');
