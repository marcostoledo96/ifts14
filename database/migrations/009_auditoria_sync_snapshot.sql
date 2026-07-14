-- Añadir evento sync_snapshot a la auditoría
ALTER TABLE cert_eventos_auditoria
MODIFY COLUMN tipo_evento ENUM('emision', 'verificacion', 'revocacion', 'reenvio', 'error', 'sync_snapshot') NOT NULL;
