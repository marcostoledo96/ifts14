# Propuesta de Diseño — Ciclo M4-02 (Modelo de Cursos, Alumnos y Asistencias)

## Arquitectura de Tablas y Esquema MariaDB

Se propone la creación de la migración `003_cursos_alumnos_asistencias.sql` con el siguiente diseño, compatible con MariaDB 10.6 y alineado con las definiciones en `01-modelo-datos-certificados.md`.

### 1. `cert_alumnos`
```sql
CREATE TABLE cert_alumnos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dni_hash BINARY(32) NOT NULL COMMENT 'HMAC-SHA-256 del DNI',
    dni_cifrado VARBINARY(512) NOT NULL COMMENT 'DNI cifrado con AES-256-GCM',
    dni_mostrar VARCHAR(20) NULL COMMENT 'Enmascarado visual opcional',
    nombre VARCHAR(160) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_alumnos_dni_hash (dni_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. `cert_cursos`
```sql
CREATE TABLE cert_cursos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    estado ENUM('activo', 'inactivo', 'archivado') NOT NULL DEFAULT 'activo',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_cursos_codigo (codigo),
    KEY idx_cert_cursos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3. `cert_curso_fechas`
```sql
CREATE TABLE cert_curso_fechas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    curso_id BIGINT UNSIGNED NOT NULL,
    fecha DATE NOT NULL,
    descripcion VARCHAR(180) NOT NULL,
    orden SMALLINT UNSIGNED NOT NULL COMMENT '1..65535',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_curso_fechas_curso_orden (curso_id, orden),
    UNIQUE KEY uq_cert_curso_fechas_curso_fecha (curso_id, fecha),
    CONSTRAINT fk_cert_curso_fechas_curso FOREIGN KEY (curso_id) REFERENCES cert_cursos(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4. `cert_asistencias`
```sql
CREATE TABLE cert_asistencias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alumno_id BIGINT UNSIGNED NOT NULL,
    curso_fecha_id BIGINT UNSIGNED NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en DATETIME NULL,
    asistencia_activa TINYINT AS (CASE WHEN eliminado_en IS NULL THEN 1 ELSE NULL END) STORED,
    UNIQUE KEY uq_cert_asistencias_activa (alumno_id, curso_fecha_id, asistencia_activa),
    CONSTRAINT fk_cert_asistencias_alumno FOREIGN KEY (alumno_id) REFERENCES cert_alumnos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cert_asistencias_curso_fecha FOREIGN KEY (curso_fecha_id) REFERENCES cert_curso_fechas(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 5. `cert_certificado_fechas` (Snapshot)
```sql
CREATE TABLE cert_certificado_fechas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    certificado_id BIGINT UNSIGNED NOT NULL,
    curso_fecha_id BIGINT UNSIGNED NOT NULL COMMENT 'Referencia histórica',
    fecha DATE NOT NULL,
    descripcion VARCHAR(180) NOT NULL,
    orden SMALLINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_certificado_fechas_cert_orden (certificado_id, orden),
    CONSTRAINT fk_cert_certificado_fechas_cert FOREIGN KEY (certificado_id) REFERENCES cert_certificados(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cert_certificado_fechas_cf FOREIGN KEY (curso_fecha_id) REFERENCES cert_curso_fechas(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 6. `cert_configuracion_institucional`
```sql
CREATE TABLE cert_configuracion_institucional (
    id TINYINT UNSIGNED NOT NULL,
    rector_nombre VARCHAR(160) NOT NULL,
    asesor_pedagogico_nombre VARCHAR(160) NOT NULL,
    texto_certificado TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_cert_configuracion_institucional_id CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Reglas y Consideraciones Implementadas
- **MariaDB 10.6:** Se usa `STORED` para `asistencia_activa` permitiendo el constraint de duplicados sin violar reglas de campos temporales o restricciones vinculadas a las FKs.
- **Integridad Referencial:** Todas las claves foráneas tienen `ON DELETE RESTRICT` y `ON UPDATE CASCADE` para prevenir eliminaciones accidentales que comprometan la operativa histórica.
- **D0 Normativas:** No se expone el DNI; su resguardo en DB asegura consistencia criptográfica mediante hashing para búsquedas y cifrado simétrico AES para lectura.
- **Snapshot Histórico:** `cert_certificado_fechas` guarda una copia inmutable de la fecha y orden asistido al momento de la certificación, para independizarse de posibles mutaciones posteriores en la tabla `cert_curso_fechas`.
