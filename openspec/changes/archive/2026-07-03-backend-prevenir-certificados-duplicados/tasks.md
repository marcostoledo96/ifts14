# Tasks: Prevenir certificados vigentes duplicados

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas modificadas estimadas | 150-200 |
| Riesgo budget 400 | Low |
| Chained PRs recomendado | No |
| Estrategia de entrega | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

Cambio acotado: 1 migración + 1 servicio + 2 suites + documentación. PR único.

## Fase 0 — Migración correctiva

- [x] 0.1 Crear `database/migrations/005_prevenir_certificados_duplicados.sql` con preflight de duplicados, columna generada `certificado_bloqueo_activo` e índice único `uq_cert_certificados_alumno_curso_activo`.
- [x] 0.2 Actualizar reset/aplicación de migraciones en tests DB-backed para ejecutar `001`→`005`.

## Fase 1 — Servicio (foundation)

- [x] 1.1 Alinear `assertNoActiveCertificateForPair(int $alumnoId, int $cursoId): void` en `apps/backend-php/src/AdminCertificateService.php` con la semántica DB: `alumno_id`, `curso_id`, `estado='vigente'`, `revocado_en IS NULL`, `LIMIT 1`.
- [x] 1.2 Invocar el método en `emitir()` justo después de `$this->pdo->beginTransaction()` (línea 65) y antes del `INSERT cert_certificados`. Lanzar `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', 'Ya existe un certificado vigente para este alumno y curso.')` si la `SELECT` devuelve fila.
- [x] 1.3 Mapear `PDOException 23000` del índice `uq_cert_certificados_alumno_curso_activo` a `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', ...)`.
- [x] 1.4 `php -l apps/backend-php/src/AdminCertificateService.php` (Docker `scripts/php-docker-lint.sh`).

## Fase 2 — Tests DB-backed (`SnapshotEmissionTest`)

- [x] 2.1 Duplicado vigente rechazado: segunda `$service->emitir()` mismo `alumnoId+cursoId` debe lanzar `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS')` y `tableCounts($pdo)` no debe crecer.
- [x] 2.2 Revocación libera slot: `UPDATE cert_certificados SET estado='revocado', revocado_en=NOW() WHERE id=?`; nueva emisión debe pasar 201.
- [x] 2.3 `vence_en` pasado con `estado='vigente'` bloquea: `UPDATE cert_certificados SET vence_en=CURRENT_DATE - INTERVAL 1 DAY`; nueva emisión debe responder 409.
- [x] 2.3b `estado='vencido'` libera slot: `UPDATE cert_certificados SET estado='vencido'`; nueva emisión debe pasar 201.
- [x] 2.4 Legacy NULL no bloquea: insertar fila con `alumno_id`/`curso_id` nulos; emisión para par actual debe pasar 201.
- [x] 2.5 Ajustar línea 100 (fallback institucional): revocar el primer certificado antes del segundo `emitir` para no chocar con el chequeo. Documentar inline.
- [x] 2.6 `php apps/backend-php/tests/SnapshotEmissionTest.php` con `IFTS14_TEST_DB_DSN` + `IFTS14_TEST_DB_ALLOW_RESET=1`.

## Fase 3 — Test HTTP E2E (`HttpEmissionE2eTest`)

- [x] 3.1 Segundo `POST /admin/certificados` mismo `alumnoId+cursoId` debe responder `409 CERTIFICATE_ALREADY_EXISTS` con sobre seguro.
- [x] 3.2 `POST /admin/certificados/{id}/revocar` + tercer `POST /admin/certificados` debe responder 201 (slot liberado).
- [x] 3.3 `php apps/backend-php/tests/HttpEmissionE2eTest.php` con `IFTS14_TEST_DB_DSN` + `IFTS14_TEST_DB_ALLOW_RESET=1`.

## Fase 4 — Documentación y archivo

- [x] 4.1 En `docs/backend/01-contrato-api-certificados.md` agregar fila `409 | CERTIFICATE_ALREADY_EXISTS | Ya existe un certificado vigente para el mismo alumno y curso.` en la tabla de "Sobre de errores" (~línea 390) y referencia en `POST /admin/certificados` (~línea 125, tras "Sin asistencias activas").
- [x] 4.2 `sdd-verify`: re-correr 2.6 y 3.3, lint 1.3, validar que logs/errores no exponen DNI/token/SQL/secrets/rutas.
- [x] 4.3 `sdd-archive` para sincronizar deltas `admin-certificate-emission` y `backend-contrato-api-certificados` a `openspec/specs/`.

## Trazabilidad escenario → test

| Escenario (spec) | Test |
|---|---|
| Duplicado vigente rechazado | 2.1 / 3.1 |
| Revocación libera nueva emisión | 2.2 / 3.2 |
| `vence_en` pasado con estado vigente bloquea | 2.3 |
| Estado vencido libera nueva emisión | 2.3b / 3.2 |
| Legacy sin alumno o curso no bloquea | 2.4 |
| Certificado vigente duplicado documentado | 4.1 |

## Reversión

Revertir llamada + método/mapeo en `emitir()`. Quitar escenarios 2.1-2.4 y 3.1-3.2. Restaurar `01-contrato-api-certificados.md`. Rollback DB solo con backup aprobado: dropear índice `uq_cert_certificados_alumno_curso_activo` y columna `certificado_bloqueo_activo`.

## Defer (no aplica a este ciclo)

Job/mantenimiento de estado vencido: si se quiere liberar automáticamente por fecha, agregar un ciclo separado que materialice `estado='vencido'`; no usar `CURRENT_DATE` dentro del índice.
