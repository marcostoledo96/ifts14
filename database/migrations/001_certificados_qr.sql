-- Migración controlada: modelo de certificados QR.
-- MariaDB 10.6 compatible. No contiene datos reales.

CREATE TABLE IF NOT EXISTS cert_certificados (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_certificado VARCHAR(40) NOT NULL,
  estado ENUM('borrador', 'vigente', 'revocado', 'vencido') NOT NULL DEFAULT 'borrador',
  alumno_nombre_mostrar VARCHAR(160) NOT NULL,
  documento_hash BINARY(32) NULL,
  documento_enmascarado VARCHAR(20) NOT NULL,
  curso_nombre VARCHAR(180) NOT NULL,
  emitido_en DATE NOT NULL,
  vence_en DATE NULL,
  revocado_en DATETIME NULL,
  motivo_revocacion VARCHAR(180) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_certificados_codigo (codigo_certificado),
  KEY idx_cert_certificados_estado (estado),
  KEY idx_cert_certificados_emitido_en (emitido_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cert_tokens_verificacion (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  certificado_id BIGINT UNSIGNED NOT NULL,
  token_hash BINARY(32) NOT NULL,
  token_prefijo VARCHAR(12) NULL,
  estado ENUM('activo', 'revocado', 'vencido') NOT NULL DEFAULT 'activo',
  vigente_desde DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vigente_hasta DATETIME NULL,
  ultimo_uso_en DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revocado_en DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_tokens_hash (token_hash),
  KEY idx_cert_tokens_certificado (certificado_id),
  KEY idx_cert_tokens_estado (estado),
  KEY idx_cert_tokens_vigente_hasta (vigente_hasta),
  CONSTRAINT fk_cert_tokens_certificado
    FOREIGN KEY (certificado_id) REFERENCES cert_certificados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cert_eventos_auditoria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  certificado_id BIGINT UNSIGNED NULL,
  tipo_evento ENUM('emision', 'verificacion', 'revocacion', 'reenvio', 'error') NOT NULL,
  resultado ENUM('ok', 'rechazado', 'error') NOT NULL,
  request_id VARCHAR(80) NULL,
  token_hash_prefijo VARCHAR(16) NULL,
  ip_hash_prefijo VARCHAR(16) NULL,
  detalle_seguro VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cert_auditoria_certificado (certificado_id),
  KEY idx_cert_auditoria_tipo (tipo_evento),
  KEY idx_cert_auditoria_resultado (resultado),
  KEY idx_cert_auditoria_created_at (created_at),
  CONSTRAINT fk_cert_auditoria_certificado
    FOREIGN KEY (certificado_id) REFERENCES cert_certificados (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rollback manual seguro, en orden inverso:
-- DROP TABLE IF EXISTS cert_eventos_auditoria;
-- DROP TABLE IF EXISTS cert_tokens_verificacion;
-- DROP TABLE IF EXISTS cert_certificados;
