# Migración 003 — cursos, alumnos y asistencias

## Alcance

La migración `database/migrations/003_cursos_alumnos_asistencias.sql` agrega el modelo relacional para certificados de curso con fechas asistidas.

No modifica endpoints, PDF, frontend ni autenticación. No incluye datos reales.

## Tablas agregadas

| Tabla | Propósito |
|---|---|
| `cert_alumnos` | Identidad de alumnos con `dni_hash`, `dni_cifrado`, `dni_mostrar` opcional y `email VARCHAR(180) NULL` (migración `011`, D0 2026-07-20). |
| `cert_cursos` | Cursos certificables con código, nombre y estado. |
| `cert_curso_fechas` | Fechas normalizadas de cada curso con orden estable. |
| `cert_asistencias` | Presencia por existencia de fila; no guarda ausentes. |
| `cert_certificado_fechas` | Snapshot de fechas certificadas al momento de emisión. |
| `cert_configuracion_institucional` | Configuración institucional single-row. |

## Reglas relevantes

- `cert_asistencias` usa la columna generada `asistencia_activa` para impedir duplicar una asistencia activa por alumno y fecha.
- `eliminado_en` permite correcciones sin registrar ausentes.
- `cert_certificado_fechas` conserva FK a `cert_curso_fechas` y campos materializados para estabilidad histórica.
- `dni_cifrado` depende de clave externa a Git; no debe documentarse ni versionarse el valor real.
- `dni_mostrar`/`documentMasked` en DTO admin contiene DNI completo visible (D0); la columna legacy `documento_enmascarado` en certificados antiguos conserva nombre histórico.
- `email` es opcional desde migración `011`; ver `database/docs/011-alumnos-email-opcional.md`.
- `cert_curso_fechas.estado` (`programada` | `realizada` | `cancelada`): `cancelada` solo manual. Tras registrar/anular asistencias, el backend auto-ajusta `programada`↔`realizada` con día local `America/Argentina/Buenos_Aires`: `realizada` solo si hay ≥1 asistencia activa y `fecha <= hoy`; si no, `programada` (futuras sin presentes o sin asistencia). Sin migración ENUM adicional.

## Verificación local ejecutada

Se verificó con MariaDB 10.6 en Docker:

1. Aplicar `001_certificados_qr.sql`.
2. Aplicar `002_token_cifrado_entrega_manual.sql`.
3. Aplicar `003_cursos_alumnos_asistencias.sql`.
4. Aplicar seed ficticio `database/seeds/002_cursos_alumnos_asistencias_demo.sql`.
5. Confirmar tablas, índices, columna generada y bloqueo de asistencia activa duplicada.

## Rollback

La migración incluye plan de rollback comentado. Antes de ejecutarlo en staging o producción, realizar backup aprobado y validar dependencias de certificados emitidos.
