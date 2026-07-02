# Migración 004 — vínculo certificado, alumno y curso

## Objetivo

Agregar `alumno_id` y `curso_id` nullable en `cert_certificados` para emitir desde alumno, curso y asistencias reales sin romper certificados legacy.

## Precondiciones

- Backup aprobado antes de aplicar en entornos reales.
- Migraciones `001`, `002` y `003` aplicadas.
- MariaDB 10.6.27.

## Cambios

| Tabla | Cambio |
|---|---|
| `cert_certificados` | Agrega `alumno_id BIGINT UNSIGNED NULL`. |
| `cert_certificados` | Agrega `curso_id BIGINT UNSIGNED NULL`. |
| `cert_certificados` | Agrega índices por `alumno_id` y `curso_id`. |
| `cert_certificados` | Agrega FKs a `cert_alumnos(id)` y `cert_cursos(id)` con `ON UPDATE CASCADE` y `ON DELETE RESTRICT`. |

## Postcondiciones

- Los certificados nuevos pueden referenciar alumno y curso reales.
- Los certificados anteriores siguen válidos con `alumno_id` y `curso_id` en `NULL`.
- `cert_certificado_fechas` sigue siendo la fuente histórica de fechas certificadas.

## Rollback

Preferir dejar las columnas sin uso si el código se revierte. El `DROP` de FKs, índices y columnas está comentado en la migración y solo debe ejecutarse con backup y aprobación.

## Spec vinculada

- `openspec/changes/backend-emision-desde-asistencias/specs/backend-modelo-datos-certificados/spec.md`
