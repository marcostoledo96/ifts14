# Tasks: API admin mínima para cursos, alumnos, fechas y asistencias

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas (additions + deletions) | ~950-1100 |
| Riesgo de presupuesto 400 líneas | Medium |
| Chained PRs recomendados | No |
| Suggested split | PR único (`size:exception`) |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

Trazabilidad: `admin-master-data-api` S1..S11, `backend-contrato-api-certificados` BCT-S3..S7.

## Phase 1 — Servicio y helpers internos

- [x] 1.1 Crear `apps/backend-php/src/AdminMasterDataService.php` con `__construct(PDO, requestId, ?dniCipherKey)`, constantes de estados, `maskDni()` y `hashDni()` privados. Reusar `AdminCertificateException`.
- [x] 1.2 Crear `apps/backend-php/tests/AdminMasterDataServiceTest.php` (Reflection): `maskDni('00000000') === '00****00'`, `hashDni()` produce 32 bytes, `DniCipher::envelopeLooksValid`.

## Phase 2 — Cursos (CRUD)

- [x] 2.1 `createCourse($body)`: validar `codigo` (≤40) y `nombre` (≤180); mapear `uq_cert_cursos_codigo` a `409 CONFLICT`. S1.
- [x] 2.2 `listCourses(?estado)` y `getCourse(int $id)` con `404`. DTO `{id, codigo, nombre, estado, createdAt, updatedAt}`.
- [x] 2.3 `updateCourseStatus(int $id, string $estado)` validando enum `borrador|activo|cerrado|archivado`; `400` si inválido. S2.

## Phase 3 — Alumnos con DNI cifrado

- [x] 3.1 `createStudent($body)`: normalizar DNI a dígitos, longitud 7-10, **validar `dniCipherKey` ANTES de la transacción** → `500 CONFIGURATION_ERROR` sin INSERT. S4, BCT-S6.
- [x] 3.2 Persistir `dni_hash` (sha256 crudo), `dni_cifrado` (DniCipher::encrypt) y `dni_mostrar` (12****78); mapear `uq_cert_alumnos_dni_hash` a `409`. S3.
- [x] 3.3 `listStudents()`/`getStudent()`/`updateStudentStatus()`. DTO `{id, apellidoNombre, dniMostrar, estado}`; nunca `dni_cifrado`/`dni_hash`/DNI completo. BCT-S3.

## Phase 4 — Fechas de curso

- [x] 4.1 `createCourseDate($cursoId, $body)`: verificar curso, calcular `orden` siguiente si ausente, validar enum; mapear `uq_cert_curso_fechas_curso_fecha` y `..._curso_orden` a `409`. S6.
- [x] 4.2 `listCourseDates($cursoId)`: `ORDER BY orden ASC, fecha ASC`. S5.
- [x] 4.3 `updateCourseDate($cursoId, $fechaId, $body)`: validar FK, estado y orden sin colisión.

## Phase 5 — Asistencias (registro y anulación lógica)

- [x] 5.1 `recordAttendance($body)`: alumno `activo`, curso `activo`, fecha `programada|realizada`; capturar `PDOException` SQLSTATE 23000 sobre `uq_cert_asistencias_activa` → `409`. S7, S8, BCT-S7.
- [x] 5.2 `listAttendances($cursoId, $alumnoId)`: `WHERE eliminado_en IS NULL` con join a `cert_curso_fechas`.
- [x] 5.3 `voidAttendance($id)`: `UPDATE cert_asistencias SET eliminado_en = NOW() WHERE id = ? AND eliminado_en IS NULL`; sin `DELETE` físico. S9.

## Phase 6 — Ruteo en index.php

- [x] 6.1 Registrar las 14 rutas admin con `requireJsonContentType` (POST/PATCH), `requireAdmin`, `readJsonBody`, `respondToAdmin` y `Response::error(404)` para método no permitido.
- [x] 6.2 `POST /admin/alumnos` y `PATCH /admin/alumnos/{id}/estado` invocan `loadDniCipherKey()` antes del servicio; `RuntimeException` → `500 CONFIGURATION_ERROR`. BCT-S6.

## Phase 7 — Tests HTTP con servidor embebido

- [x] 7.1 Crear `apps/backend-php/tests/AdminMasterDataHttpTest.php`: `proc_open(PHP -S)` + `waitForServer` + `IFTS14_TEST_DB_DSN` (Docker MariaDB 10.6 opcional, skip limpio). Aplica 003+004, fixtures ficticios, cubre S1..S11: curso CRUD, alumno create+DTO sin DNI completo, asistencia duplicada `409`, anulación lógica, `401`/`415`/`400`/`500`.
- [x] 7.2 Modificar `apps/backend-php/tests/HttpEmissionE2eTest.php`: reemplazar `INSERT` SQL directo por HTTP a los nuevos endpoints; resto (emitir, validar, entrega manual, sin reenvío) igual. BCT-S4, BCT-S5.

## Phase 8 — Documentación

- [x] 8.1 Actualizar `docs/backend/01-contrato-api-certificados.md`: 14 rutas admin, DTOs, tabla de errores (`401/400/404/409/415/500`) y nota de privacidad DNI admin. Español argentino formal.
- [x] 8.2 Sincronizar `openspec/specs/backend-contrato-api-certificados/spec.md` con los nuevos endpoints.
