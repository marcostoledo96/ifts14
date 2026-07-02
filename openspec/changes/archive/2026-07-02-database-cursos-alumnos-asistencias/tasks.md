# Tasks: database-cursos-alumnos-asistencias (M4-02)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 300-450 (003 ≈180, docs ≈120, seed ficticio opcional ≈40) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR — entrega autocontenida SQL + docs |
| Delivery strategy | single-pr-default |
| Chain strategy | size:exception (no aplica) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size:exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Migración 003 + docs + seed opcional en una sola entrega SDD | PR 1 | base `database-cursos-alumnos-asistencias`; sin código runtime |

## Phase 1: Migración 003 controlada

- [x] 1.1 Crear `database/migrations/003_cursos_alumnos_asistencias.sql` con `cert_alumnos`, `cert_cursos`, `cert_curso_fechas`, `cert_asistencias`, `cert_certificado_fechas`, `cert_configuracion_institucional`, FKs, `InnoDB`, `utf8mb4_unicode_ci`.
- [x] 1.2 Definir `asistencia_activa TINYINT AS (CASE WHEN eliminado_en IS NULL THEN 1 ELSE NULL END) STORED` y `UNIQUE(alumno_id, curso_fecha_id, asistencia_activa)` en `cert_asistencias`.
- [x] 1.3 `cert_configuracion_institucional` con `id TINYINT UNSIGNED DEFAULT 1` PK y `CHECK (id = 1)`.
- [x] 1.4 Encabezado con pre-requisitos `001`+`002` aplicadas y bloque de rollback manual en orden inverso de FK.
- [x] 1.5 Grep estático: confirmar ausencia de DNI real, token real, IP real ni credenciales embebidas.

## Phase 2: Seed ficticio opcional (verificación de relaciones)

- [x] 2.1 Crear `database/seeds/002_cursos_alumnos_asistencias_demo.sql` con cabecera `No usar en producción`, 1 curso activo, 1-2 fechas, 1-2 alumnos con `dni_hash` y `dni_cifrado` placeholder, y 2-3 filas en `cert_asistencias`.
- [x] 2.2 Mantener `database/seeds/001_certificados_qr_demo.sql` intacto.

## Phase 3: Documentación de base de datos

- [x] 3.1 En `docs/database/00-mariadb.md`, mover las tablas de "futuras" a "migradas" y referenciar `003_cursos_alumnos_asistencias.sql`.
- [x] 3.2 En `docs/database/01-modelo-datos-certificados.md`, agregar sección M4-02: DNI seguro (`dni_hash`+`dni_cifrado`+`dni_mostrar`), presencia por fila, snapshot de fechas, `CHECK id=1` y nota de clave externa a Git.
- [x] 3.3 Enlazar el seed ficticio opcional sin listar valores sensibles.

## Phase 4: Verificación con MariaDB temporal (Docker)

- [x] 4.1 Levantar MariaDB 10.6 efímero: `docker run --rm --name ifts14-m4-02-verify -e MARIADB_ROOT_PASSWORD=verify_tmp -e MARIADB_DATABASE=ifts14_verify -d mariadb:10.6`.
- [x] 4.2 Esperar healthy y aplicar 001+002+003 en orden con `mariadb ifts14_verify < database/migrations/00X_*.sql`.
- [x] 4.3 `SHOW TABLES` debe listar las 9 tablas `cert_` esperadas; `DESCRIBE cert_asistencias` y `SHOW INDEX FROM cert_asistencias` confirman columna generada y UNIQUE activa.
- [x] 4.4 Si el seed existe, aplicarlo y correr INSERT smoke (curso → fecha → alumno → asistencia) con `SELECT COUNT(*)` que confirme visibilidad.
- [x] 4.5 `docker rm -f ifts14-m4-02-verify`. No commitear dumps ni credenciales reales.

## Phase 5: Archive SDD (promoción canónica de specs)

- [x] 5.1 Fusionar deltas en `openspec/specs/backend-modelo-datos-certificados/spec.md` y crear `openspec/specs/database-cursos-alumnos-asistencias/spec.md` con escenarios consolidados.
- [x] 5.2 Mover el cambio a `openspec/changes/archive/2026-07-02-database-cursos-alumnos-asistencias/`.

## Reglas de seguridad

- Sin DNI real, token real, IP real ni credenciales en migraciones, seeds, docs o commits.
- No tocar `material_privado_no_versionar/`, `vendor/`, `public_html/` ni dumps reales.
- No aplicar la migración a la DB real/staging sin aprobación operativa separada.
- Contenedor Docker efímero y local; sin credenciales productivas.
