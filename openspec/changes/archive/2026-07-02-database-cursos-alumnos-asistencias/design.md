# Diseño: modelo de cursos, alumnos y asistencias

## Enfoque técnico

Crear solo la migración `database/migrations/003_cursos_alumnos_asistencias.sql` y sincronizar specs/docs. No se toca PHP, Angular, API, PDF, auth, deploy ni datos reales. La migración es aditiva sobre `001_certificados_qr.sql` + `002_token_cifrado_entrega_manual.sql` y usa `InnoDB`, `utf8mb4_unicode_ci`, prefijo `cert_` y FKs explícitas.

## Decisiones de arquitectura

| Decisión | Alternativa | Fundamento |
|---|---|---|
| `cert_alumnos` guarda `dni_hash BINARY(32)`, `dni_cifrado VARBINARY(512)` y `dni_mostrar VARCHAR(20) NULL`. | DNI plano obligatorio. | Cumple D0 de DNI visible sin convertir la base en fuente plana obligatoria; la clave real vive fuera de Git. |
| `cert_asistencias` representa presencia por fila. | Booleano `presente` o estados de ausencia. | Menos estados inválidos: ausencia es ausencia de fila. |
| Unicidad activa con columna generada `asistencia_activa`. | `UNIQUE(alumno_id, curso_fecha_id, eliminado_en)`. | En MariaDB los `NULL` no bloquean duplicados; la columna generada permite un solo registro activo y múltiples eliminados. |
| `cert_certificado_fechas` conserva FK + snapshot materializado. | Recalcular desde fechas vivas. | El certificado debe seguir mostrando lo emitido aunque luego cambie una fecha del curso. |
| `cert_configuracion_institucional` es single-row (`id = 1`). | KV genérico. | Menor complejidad y columnas revisables para firmantes/textos. |

## Flujo de datos

```txt
cert_alumnos ─┐
              ├─ cert_asistencias ─ cert_curso_fechas ─ cert_cursos
cert_certificados ─ cert_certificado_fechas ───────────────┘
cert_configuracion_institucional ── futura emisión/PDF
```

## Contrato de migración `003`

- `cert_alumnos`: `id BIGINT UNSIGNED PK AI`, `apellido_nombre VARCHAR(160) NOT NULL`, `dni_hash BINARY(32) NOT NULL`, `dni_cifrado VARBINARY(512) NOT NULL`, `dni_mostrar VARCHAR(20) NULL`, `estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo'`, `created_at`, `updated_at`; `UNIQUE uq_cert_alumnos_dni_hash(dni_hash)`, índices `estado`, `apellido_nombre`.
- `cert_cursos`: `id`, `codigo VARCHAR(40) NOT NULL`, `nombre VARCHAR(180) NOT NULL`, `estado ENUM('borrador','activo','cerrado','archivado') DEFAULT 'activo'`, timestamps; `UNIQUE(codigo)`, índices `estado`, `nombre`.
- `cert_curso_fechas`: `id`, `curso_id BIGINT UNSIGNED NOT NULL`, `fecha DATE NOT NULL`, `descripcion VARCHAR(180) NULL`, `orden SMALLINT UNSIGNED NOT NULL`, `estado ENUM('programada','realizada','cancelada') DEFAULT 'programada'`, timestamps; FKs a `cert_cursos(id)` `ON UPDATE CASCADE ON DELETE RESTRICT`; `UNIQUE(curso_id, fecha)`, `UNIQUE(curso_id, orden)`, índices `curso_id`, `fecha`, `estado`.
- `cert_asistencias`: `id`, `alumno_id`, `curso_fecha_id`, `registrado_en DATETIME DEFAULT CURRENT_TIMESTAMP`, `eliminado_en DATETIME NULL`, `created_at`, `updated_at`, `asistencia_activa TINYINT AS (CASE WHEN eliminado_en IS NULL THEN 1 ELSE NULL END) STORED`; FKs a alumnos/fechas `ON DELETE RESTRICT`; `UNIQUE(alumno_id, curso_fecha_id, asistencia_activa)`, índices `alumno_id`, `curso_fecha_id`, `eliminado_en`.
- `cert_certificado_fechas`: `id`, `certificado_id BIGINT UNSIGNED NOT NULL`, `curso_fecha_id BIGINT UNSIGNED NOT NULL`, `fecha DATE NOT NULL`, `descripcion VARCHAR(180) NULL`, `orden SMALLINT UNSIGNED NOT NULL`, `created_at`; FKs a `cert_certificados(id)` y `cert_curso_fechas(id)` `ON DELETE RESTRICT`; `UNIQUE(certificado_id, curso_fecha_id)`, índices `certificado_id`, `curso_fecha_id`, `(certificado_id, orden)`.
- `cert_configuracion_institucional`: `id TINYINT UNSIGNED DEFAULT 1 PK`, `institucion_nombre VARCHAR(160) NOT NULL`, `rector_nombre VARCHAR(160) NULL`, `rector_cargo VARCHAR(80) NULL`, `asesor_nombre VARCHAR(160) NULL`, `asesor_cargo VARCHAR(80) NULL`, `texto_certificado VARCHAR(255) NULL`, timestamps, `CHECK (id = 1)`.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `database/migrations/003_cursos_alumnos_asistencias.sql` | Crear | DDL completo, prerequisitos y rollback comentado. |
| `database/seeds/001_certificados_qr_demo.sql` | Modificar opcional | Agregar curso/alumno/asistencias ficticias si se decide verificar relaciones con seed. |
| `docs/database/00-mariadb.md` | Modificar en archive | Mover tablas de futuras a migradas. |
| `docs/database/01-modelo-datos-certificados.md` | Modificar en archive | Documentar modelo M4-02, snapshot, DNI seguro y rollback. |
| `openspec/specs/*` | Modificar en archive | Fusionar deltas canónicos. |

## Verificación

| Capa | Qué verificar | Método |
|---|---|---|
| SQL estático | Sintaxis, orden de creación/drop, FKs e índices nombrados. | Revisión de `CREATE TABLE`, `SHOW CREATE TABLE` esperado. |
| MariaDB local | Aplicación de `001` + `002` + `003` en DB temporal. | Docker MariaDB 10.6 si está disponible y sin secretos. |
| Inspección | Columnas, índices, FKs y columna generada. | `DESCRIBE`, `SHOW INDEX`, `SHOW CREATE TABLE`. |
| Producto | Sin cambios runtime. | No hacen falta tests PHP/Angular en este ciclo. |

## Rollback y seguridad

Rollback manual solo con backup aprobado: dropear en orden inverso `cert_configuracion_institucional`, `cert_certificado_fechas`, `cert_asistencias`, `cert_curso_fechas`, `cert_cursos`, `cert_alumnos`. No tocar `cert_certificados`, tokens ni auditoría. El seed, si se amplía, debe usar únicamente datos ficticios y placeholders.

## Preguntas abiertas

Ninguna bloqueante.
