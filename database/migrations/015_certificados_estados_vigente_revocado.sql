-- 015: estados de certificado solo vigente|revocado.
-- borra borradores (nunca emitidos en el flujo real) y convierte vencido → revocado.
-- Luego estrecha los ENUM.

SET NAMES utf8mb4;

-- Tokens marcados como vencido → revocado.
UPDATE cert_tokens_verificacion
SET estado = 'revocado',
    revocado_en = COALESCE(revocado_en, CURRENT_TIMESTAMP)
WHERE estado = 'vencido';

-- Certificados vencidos → revocados (libera slot / historial coherente).
UPDATE cert_certificados
SET estado = 'revocado',
    revocado_en = COALESCE(revocado_en, CURRENT_TIMESTAMP),
    motivo_revocacion = COALESCE(
      NULLIF(TRIM(motivo_revocacion), ''),
      'Migración 015: estado vencido retirado del producto.'
    )
WHERE estado = 'vencido';

-- Borradores: eliminar dependencias y el certificado (no hay emisión real).
DELETE a
FROM cert_eventos_auditoria a
INNER JOIN cert_certificados c ON c.id = a.certificado_id
WHERE c.estado = 'borrador';

DELETE f
FROM cert_certificado_fechas f
INNER JOIN cert_certificados c ON c.id = f.certificado_id
WHERE c.estado = 'borrador';

DELETE t
FROM cert_tokens_verificacion t
INNER JOIN cert_certificados c ON c.id = t.certificado_id
WHERE c.estado = 'borrador';

DELETE FROM cert_certificados WHERE estado = 'borrador';

ALTER TABLE cert_certificados
  MODIFY COLUMN estado ENUM('vigente', 'revocado') NOT NULL DEFAULT 'vigente';

ALTER TABLE cert_tokens_verificacion
  MODIFY COLUMN estado ENUM('activo', 'revocado') NOT NULL DEFAULT 'activo';

INSERT IGNORE INTO cert_schema_migrations (version) VALUES ('015');
