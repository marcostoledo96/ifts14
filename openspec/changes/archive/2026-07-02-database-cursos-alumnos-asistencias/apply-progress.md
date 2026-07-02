# Apply Progress — database-cursos-alumnos-asistencias

## Estado

- Fecha: 2026-07-02
- Modo: Standard (strict TDD desactivado en `openspec/config.yaml`; verificación SQL con MariaDB 10.6 efímero)
- Delivery strategy: single-pr-default
- Review budget: 800 líneas
- PR boundary: una entrega DB/docs/OpenSpec, sin cambios runtime PHP/Angular/API

## Tareas completadas

- [x] 1.1 Migración `003_cursos_alumnos_asistencias.sql` con `cert_alumnos`, `cert_cursos`, `cert_curso_fechas`, `cert_asistencias`, `cert_certificado_fechas`, `cert_configuracion_institucional`, FKs, `InnoDB`, `utf8mb4_unicode_ci`.
- [x] 1.2 `asistencia_activa` generada y `UNIQUE(alumno_id, curso_fecha_id, asistencia_activa)` en `cert_asistencias`.
- [x] 1.3 `cert_configuracion_institucional` single-row con `CHECK (id = 1)`.
- [x] 1.4 Encabezado de prerequisitos `001` + `002` y rollback manual inverso.
- [x] 1.5 Grep estático de riesgos sensibles sin hallazgos accionables.
- [x] 2.1 Seed ficticio `002_cursos_alumnos_asistencias_demo.sql` para relaciones.
- [x] 2.2 Seed `001_certificados_qr_demo.sql` intacto.
- [x] 3.1 `docs/database/00-mariadb.md` actualizado.
- [x] 3.2 `docs/database/01-modelo-datos-certificados.md` actualizado.
- [x] 3.3 Seed ficticio enlazado sin datos sensibles.
- [x] 4.1-4.5 Verificación Docker MariaDB 10.6 aplicada y contenedor removido.

## Archivos cambiados

| Archivo | Acción | Resumen |
|---|---|---|
| `database/migrations/003_cursos_alumnos_asistencias.sql` | Creado | DDL aditivo con seis tablas nuevas, FKs, índices, columna generada y rollback manual. |
| `database/seeds/002_cursos_alumnos_asistencias_demo.sql` | Creado | Seed ficticio para curso, fechas, alumnos, asistencias, snapshot y configuración institucional. |
| `docs/database/00-mariadb.md` | Modificado | Tablas M4-02 pasan de futuras a migradas y se referencia `003`. |
| `docs/database/01-modelo-datos-certificados.md` | Modificado | Sección M4-02 con DNI seguro, presencia por fila, snapshot, `CHECK id=1`, seed y rollback. |
| `openspec/changes/database-cursos-alumnos-asistencias/tasks.md` | Modificado | Fases 1-4 marcadas como completadas. |
| `openspec/changes/database-cursos-alumnos-asistencias/apply-progress.md` | Creado | Evidencia acumulada de apply. |

## Verificación ejecutada

| Comando | Resultado |
|---|---|
| `docker run --rm --name ifts14-m4-02-verify -e MARIADB_ROOT_PASSWORD=verify_tmp -e MARIADB_DATABASE=ifts14_verify -d mariadb:10.6` | OK, contenedor iniciado. |
| `mariadb-admin ping` dentro del contenedor | OK, servidor listo. |
| Aplicar `001_certificados_qr.sql` + `002_token_cifrado_entrega_manual.sql` + `003_cursos_alumnos_asistencias.sql` | OK, sin errores SQL. |
| Aplicar `database/seeds/002_cursos_alumnos_asistencias_demo.sql` | OK, seed ficticio aplicado. |
| `SHOW TABLES LIKE 'cert_%'` | OK, 9 tablas: `cert_alumnos`, `cert_asistencias`, `cert_certificado_fechas`, `cert_certificados`, `cert_configuracion_institucional`, `cert_curso_fechas`, `cert_cursos`, `cert_eventos_auditoria`, `cert_tokens_verificacion`. |
| `DESCRIBE cert_asistencias` + `SHOW INDEX FROM cert_asistencias` | OK, `asistencia_activa` aparece como `STORED GENERATED` y el índice único activo existe. |
| `SELECT COUNT(*)` smoke | OK: cursos=1, fechas=2, alumnos=2, asistencias_activas=3, snapshot_fechas=2. |
| `INSERT IGNORE` duplicado sobre asistencia activa | OK: `ROW_COUNT() = 0`, total conserva 3 asistencias. |
| `SHOW CREATE TABLE cert_configuracion_institucional` | OK, conserva `CHECK (id = 1)`. |
| `docker rm -f ifts14-m4-02-verify` | OK, contenedor removido. |

## Seguridad y alcance

- No se leyó `material_privado_no_versionar/`.
- No se tocaron `public_html/`, `vendor/`, dumps, logs, secretos ni runtime PHP/Angular/API.
- Los seeds usan valores ficticios y placeholders; no contienen DNI real, token real, IP real ni credenciales.
- `database/seeds/001_certificados_qr_demo.sql` no fue modificado.

## Desviaciones

Ninguna. La implementación sigue el diseño: modelo SQL/documentación únicamente, sin código runtime.

## Pendientes

- [ ] Phase 5: `sdd-archive` para fusionar deltas en specs canónicas y mover el cambio al archivo histórico.

## Skill resolution

- `sdd-apply`: aplicado desde instrucciones de fase.
- `work-unit-commits`: aplicado para mantener una única unidad revisable DB/docs.
- `karpathy-guidelines`: aplicado para cambios quirúrgicos y verificación explícita.
- `ponytail`: aplicado; sin abstracciones ni runtime innecesario.
- `mariadb-features`: aplicado; verificada sintaxis MariaDB 10.6 con Docker.
- `systematic-debugging`: cargado para fallas de verificación; no hubo fix iterativo necesario.
