-- Staging: alinear datos al producto (solo vigente|revocado) ANTES o JUNTO
-- a aplicar la migración 015. Seguro repetir (idempotente en la práctica).
-- No tocar producción.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

UPDATE cert_tokens_verificacion
SET estado = 'revocado',
    revocado_en = COALESCE(revocado_en, CURRENT_TIMESTAMP)
WHERE estado = 'vencido';

UPDATE cert_certificados
SET estado = 'revocado',
    revocado_en = COALESCE(revocado_en, CURRENT_TIMESTAMP),
    motivo_revocacion = COALESCE(
      NULLIF(TRIM(motivo_revocacion), ''),
      'Limpieza staging: estado vencido retirado.'
    )
WHERE estado = 'vencido';

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

-- Estrechar ENUM (si ya está aplicado 015, estas ALTER fallan benigno o no-op según motor).
ALTER TABLE cert_certificados
  MODIFY COLUMN estado ENUM('vigente', 'revocado') NOT NULL DEFAULT 'vigente';

ALTER TABLE cert_tokens_verificacion
  MODIFY COLUMN estado ENUM('activo', 'revocado') NOT NULL DEFAULT 'activo';

SET FOREIGN_KEY_CHECKS = 1;
