-- Migración controlada: artefacto recuperable de token cifrado para entrega manual.
-- MariaDB 10.6 compatible. No contiene datos reales.
--
-- Fundamento: el `token_hash` (SHA-256 con pepper) permite verificación pública
-- pero NO reconstruir el link `/validar/{token}`. La entrega manual de Bedelía
-- exige recomponer esa URL sin rotar token ni guardar texto plano. Se agrega
-- `token_cifrado` con envelope `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`
-- (AES-256-GCM, clave externa a Git). Los certificados previos sin esta columna
-- quedan limitados: 409 TOKEN_NOT_RECOVERABLE en entrega manual; no se regeneran
-- salvo decisión auditada explícita.
--
-- Compatible con 001 ya aplicada: ALTER additive, nullable, sin reescribir datos.

ALTER TABLE cert_tokens_verificacion
  ADD COLUMN token_cifrado VARBINARY(512) NULL AFTER token_prefijo;

-- Rollback manual seguro:
-- ALTER TABLE cert_tokens_verificacion DROP COLUMN token_cifrado;