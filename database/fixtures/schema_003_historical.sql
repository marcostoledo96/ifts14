-- Migración controlada: cursos, alumnos, fechas, asistencias y snapshot de certificación.
-- MariaDB 10.6 compatible. No contiene datos reales.
--
-- Pre-requisitos:
-- - database/migrations/001_certificados_qr.sql aplicada.
-- - database/migrations/002_token_cifrado_entrega_manual.sql aplicada o validada como gate operativo.
--
-- Alcance: solo agrega tablas nuevas `cert_`; no modifica runtime PHP/Angular/API/PDF.

CREATE TABLE IF NOT EXISTS cert_alumnos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  apellido_nombre VARCHAR(160) NOT NULL,
  dni_hash BINARY(32) NOT NULL,
  dni_cifrado VARBINARY(512) NOT NULL,
  dni_mostrar VARCHAR(20) NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_alumnos_dni_hash (dni_hash),
  KEY idx_cert_alumnos_estado (estado),
  KEY idx_cert_alumnos_apellido_nombre (apellido_nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cert_cursos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(40) NOT NULL,
  nombre VARCHAR(180) NOT NULL,
  estado ENUM('borrador', 'activo', 'cerrado', 'archivado') NOT NULL DEFAULT 'activo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_cursos_codigo (codigo),
  KEY idx_cert_cursos_estado (estado),
  KEY idx_cert_cursos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cert_curso_fechas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  curso_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  descripcion VARCHAR(180) NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  estado ENUM('programada', 'realizada', 'cancelada') NOT NULL DEFAULT 'programada',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_curso_fechas_curso_fecha (curso_id, fecha),
  UNIQUE KEY uq_cert_curso_fechas_curso_orden (curso_id, orden),
  KEY idx_cert_curso_fechas_curso (curso_id),
  KEY idx_cert_curso_fechas_fecha (fecha),
  KEY idx_cert_curso_fechas_estado (estado),
  CONSTRAINT fk_cert_curso_fechas_curso
    FOREIGN KEY (curso_id) REFERENCES cert_cursos (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cert_asistencias (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  alumno_id BIGINT UNSIGNED NOT NULL,
  curso_fecha_id BIGINT UNSIGNED NOT NULL,
  registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  asistencia_activa TINYINT AS (CASE WHEN eliminado_en IS NULL THEN 1 ELSE NULL END) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_asistencias_activa (alumno_id, curso_fecha_id, asistencia_activa),
  KEY idx_cert_asistencias_alumno (alumno_id),
  KEY idx_cert_asistencias_curso_fecha (curso_fecha_id),
  KEY idx_cert_asistencias_eliminado_en (eliminado_en),
  CONSTRAINT fk_cert_asistencias_alumno
    FOREIGN KEY (alumno_id) REFERENCES cert_alumnos (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_cert_asistencias_curso_fecha
    FOREIGN KEY (curso_fecha_id) REFERENCES cert_curso_fechas (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cert_certificado_fechas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  certificado_id BIGINT UNSIGNED NOT NULL,
  curso_fecha_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  descripcion VARCHAR(180) NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_certificado_fechas_cert_fecha (certificado_id, curso_fecha_id),
  KEY idx_cert_certificado_fechas_certificado (certificado_id),
  KEY idx_cert_certificado_fechas_curso_fecha (curso_fecha_id),
  KEY idx_cert_certificado_fechas_cert_orden (certificado_id, orden),
  CONSTRAINT fk_cert_certificado_fechas_certificado
    FOREIGN KEY (certificado_id) REFERENCES cert_certificados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_cert_certificado_fechas_curso_fecha
    FOREIGN KEY (curso_fecha_id) REFERENCES cert_curso_fechas (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cert_configuracion_institucional (
  id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  institucion_nombre VARCHAR(160) NOT NULL,
  rector_nombre VARCHAR(160) NULL,
  rector_cargo VARCHAR(80) NULL,
  asesor_nombre VARCHAR(160) NULL,
  asesor_cargo VARCHAR(80) NULL,
  texto_certificado VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_cert_configuracion_institucional_single_row CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rollback manual seguro, solo con backup aprobado y en orden inverso de FK:
-- DROP TABLE IF EXISTS cert_configuracion_institucional;
-- DROP TABLE IF EXISTS cert_certificado_fechas;
-- DROP TABLE IF EXISTS cert_asistencias;
-- DROP TABLE IF EXISTS cert_curso_fechas;
-- DROP TABLE IF EXISTS cert_cursos;
-- DROP TABLE IF EXISTS cert_alumnos;
