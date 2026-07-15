-- Migración controlada: cursos, alumnos, fechas, asistencias y snapshot de certificación.
-- MariaDB 10.6 compatible.

CREATE TABLE IF NOT EXISTS cert_alumnos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dni_hash BINARY(32) NOT NULL COMMENT 'HMAC-SHA-256 del DNI',
    dni_cifrado VARBINARY(512) NOT NULL COMMENT 'DNI cifrado con AES-256-GCM',
    dni_mostrar VARCHAR(20) NULL COMMENT 'Enmascarado visual opcional',
    apellido_nombre VARCHAR(160) NOT NULL,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_alumnos_dni_hash (dni_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cert_cursos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    estado ENUM('borrador', 'activo', 'cerrado') NOT NULL DEFAULT 'borrador',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_cursos_codigo (codigo),
    KEY idx_cert_cursos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cert_curso_fechas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    curso_id BIGINT UNSIGNED NOT NULL,
    fecha DATE NOT NULL,
    descripcion VARCHAR(180) NULL,
    estado ENUM('programada', 'realizada', 'cancelada') NOT NULL DEFAULT 'programada',
    orden SMALLINT UNSIGNED NOT NULL COMMENT '1..65535',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_curso_fechas_curso_orden (curso_id, orden),
    UNIQUE KEY uq_cert_curso_fechas_curso_fecha (curso_id, fecha),
    CONSTRAINT fk_cert_curso_fechas_curso FOREIGN KEY (curso_id) REFERENCES cert_cursos(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cert_asistencias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alumno_id BIGINT UNSIGNED NOT NULL,
    curso_fecha_id BIGINT UNSIGNED NOT NULL,
    registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en DATETIME NULL,
    asistencia_activa TINYINT AS (CASE WHEN eliminado_en IS NULL THEN 1 ELSE NULL END) STORED,
    UNIQUE KEY uq_cert_asistencias_activa (alumno_id, curso_fecha_id, asistencia_activa),
    CONSTRAINT fk_cert_asistencias_alumno FOREIGN KEY (alumno_id) REFERENCES cert_alumnos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cert_asistencias_curso_fecha FOREIGN KEY (curso_fecha_id) REFERENCES cert_curso_fechas(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cert_certificado_fechas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    certificado_id BIGINT UNSIGNED NOT NULL,
    curso_fecha_id BIGINT UNSIGNED NOT NULL COMMENT 'Referencia histórica',
    fecha DATE NOT NULL,
    descripcion VARCHAR(180) NULL,
    orden SMALLINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_certificado_fechas_cert_orden (certificado_id, orden),
    CONSTRAINT fk_cert_certificado_fechas_cert FOREIGN KEY (certificado_id) REFERENCES cert_certificados(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cert_certificado_fechas_cf FOREIGN KEY (curso_fecha_id) REFERENCES cert_curso_fechas(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cert_configuracion_institucional (
    id TINYINT UNSIGNED NOT NULL,
    institucion_nombre VARCHAR(160) NOT NULL,
    rector_nombre VARCHAR(160) NOT NULL,
    rector_cargo VARCHAR(160) NOT NULL,
    asesor_nombre VARCHAR(160) NOT NULL,
    asesor_cargo VARCHAR(160) NOT NULL,
    texto_certificado TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_cert_configuracion_institucional_id CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
