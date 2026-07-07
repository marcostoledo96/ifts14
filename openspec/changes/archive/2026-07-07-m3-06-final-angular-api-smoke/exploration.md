# Exploración: M3-06 final — checkpoint integración Angular/API (post-merge)

> Exploración SDD post-merge, lectura only. Esta corrida no implementa producto, no toca cPanel y no activa deploy (M4-07 maneja staging). Rama actual `main`, árbol limpio. PR #30 y PR #31 ya están mergeados.

## Cambios leídos mínimos

- `AGENTS.md`, `README.md`, `GUIA.md`.
- `docs/00-indice-general.md`, `docs/opencode/optimizacion-tokens.md`.
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (sección M3-06 en línea 398 y referencia a `integration/angular-api-contract` en línea 75).
- `docs/backend/01-contrato-api-certificados.md`, `docs/frontend/00-angular20-port-v0.md`.
- `openspec/specs/admin-certificate-consulta/spec.md` y `openspec/changes/archive/2026-07-06-backend-admin-certificados-consulta/{proposal,archive-report}.md`.
- `openspec/changes/archive/2026-07-06-m4-01b-angular-dto-d0-alignment/{proposal,tasks,verify,archive-report}.md`.
- `openspec/changes/archive/2026-06-30-m3-06-angular-api-integration-checkpoint/{proposal,design,tasks,verify-report}.md` (ciclo previo, contexto histórico).
- `apps/backend-php/src/{CertificateValidator,AdminCertificateService,Response}.php` y `apps/backend-php/index.php`.
- `apps/frontend-angular/src/app/{app.config,shared/certificates/{dto,result-mapper,http-validation.source,mock-tokens},features/public-validation/public-validation-page}.ts` y `.html`.
- `apps/frontend-angular/src/environments/environment{,.development}.ts`, `apps/frontend-angular/proxy.conf.json`.
- `apps/backend-php/tests/AdminCertificadosConsultaHttpTest.php` (extracto).
- `scripts/m3-06-smoke.sh`, `scripts/php-docker-lint.sh`, `scripts/php-docker-modules-check.sh`, `scripts/php-docker-build.sh`, `scripts/php-docker-version.sh`.
- `.github/workflows/backend-tests.yml`.
- Memoria Engram previa: `sdd/m3-06-angular-api-integration-checkpoint/{proposal,design,tasks,apply-progress,verify-report}` (M3-06 ciclo previo).
- `git log --oneline -20` confirma PR #30 (`2c25cff`) y PR #31 (`dfc948b` + `fc2ea5d` + `615f638` + `96656a4` + `a923f9f`) en `main`.

## Estado actual (post-merge)

### PR #30 — Angular validación pública D0 (`2c25cff`, 13 archivos, +276/-49)

- `apps/frontend-angular/src/app/shared/certificates/dto.ts`: `CertificateStudentDto` admite `documentNumber?` (D0) o `documentMasked?` (legado); `CertificateCourseDto.attendedDates?` opcional.
- `apps/frontend-angular/src/app/shared/certificates/result-mapper.ts`: regla D0 ⇒ `documentNumber` exige `attendedDates` no vacío; legacy acepta `documentMasked` sin fechas; códigos 404/REVOKED/EXPIRED/MISSING/VALIDATION_ERROR colapsan a `not-verifiable`; resto → `technical-error`.
- `apps/frontend-angular/src/app/shared/certificates/mock-tokens.ts`: `VALID_VALID_DTO` (D0, DNI completo + fechas) y `LEGACY_VALID_DTO` (masked, sin fechas).
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.html`: muestra `attendedDates` mediante `formatAttendedDates`; usa `studentDocumentDisplay(v.certificate.student)`.
- Spec `openspec/specs/frontend-public-validation/spec.md` recibió el escenario legado `documentMasked`.
- Verify `m4-01b-angular-dto-d0-alignment` PASS: `npm test --watch=false` 74/74, `npm run build` OK, sin cambios en backend PHP. **Smoke `scripts/m3-06-smoke.sh` sigue bloqueado sin PHP CLI.**

### PR #31 — Backend admin consulta (`dfc948b` + endurecimiento `fc2ea5d`, 8 archivos, +886/-3)

- `apps/backend-php/src/AdminCertificateService.php`: `listCertificados(array $filters)` con `estado`/`cursoId`/`alumnoId` y `getCertificado(int $id)`. DTO admin usa `documentMasked` (`documento_enmascarado`), no expone `documentNumber` ni token completo. Detalle añade `attendedDates` (objetos `{fecha, descripcion, orden}`), `auditEvents` seguros y `links` relativos (`pdf`, `manualDelivery`, `qrPng`). `tokenPrefix` permitido como ayuda operativa.
- `apps/backend-php/src/AdminInstitutionalConfigService.php`: `get` y `update` para `GET/PUT /admin/configuracion-institucional` con fallback seguro.
- `apps/backend-php/index.php`: handlers para `GET /admin/certificados`, `GET /admin/certificados/{id}`, `GET /admin/configuracion-institucional`, `PUT /admin/configuracion-institucional`. Pasa por `adminConfig()` (X-Admin-Key) y respeta `Content-Type: application/json` en PUT.
- `apps/backend-php/tests/AdminCertificadosConsultaHttpTest.php`: 317 líneas, requiere `IFTS14_TEST_DB_DSN` + `IFTS14_TEST_DB_USER/PASS` + `IFTS14_TEST_DB_ALLOW_RESET=1`; si no, `return` con SKIP (no rompe CI sin DB).
- Spec nueva `openspec/specs/admin-certificate-consulta/spec.md` (listado, detalle, configuración institucional).
- Workflow `.github/workflows/backend-tests.yml` (commits `a923f9f`, `96656a4`, `615f638`): pipeline con `mariadb:10.6` service + build Docker + `composer install --no-dev` + 6 unit tests + 4 E2E tests (`SnapshotEmissionTest`, `HttpEmissionE2eTest`, `AdminMasterDataHttpTest`, `AdminCertificadosConsultaHttpTest`).
- Archive report PASS en sintaxis; HTTP test requiere MariaDB descartable.

### Estado git

- `main`, árbol limpio.
- `git log --oneline -20` muestra PR #30 (`2c25cff` + merge `e29d9c1`) y PR #31 (`dfc948b` + `fc2ea5d` + `615f638` + `96656a4` + `a923f9f` + merge `5d247f3`).
- Ningún cambio en `public_html`, `material_privado_no_versionar/`, ni en `vendor/`.

## Áreas afectadas (lectura; sin modificar)

- Frontend Angular
  - `apps/frontend-angular/src/environments/environment{,.development}.ts` (`useRealApi: false`, `apiBaseUrl: '/certificados/api'`).
  - `apps/frontend-angular/src/app/app.config.ts` (conmutador `useRealApi ? HttpValidationSource : MockValidationSource`).
  - `apps/frontend-angular/src/app/shared/certificates/{dto,result-mapper,validation.service,validation-source,http-validation.source,mock-tokens}.ts` + specs.
  - `apps/frontend-angular/src/app/features/public-validation/public-validation-page.{ts,html,css,spec.ts}`.
  - `apps/frontend-angular/proxy.conf.json` + `apps/frontend-angular/angular.json` (`serve.options.proxyConfig`).
- Backend PHP
  - `apps/backend-php/index.php` (rutas admin y públicas).
  - `apps/backend-php/src/{CertificateValidator,AdminCertificateService,AdminMasterDataService,AdminInstitutionalConfigService,CertificatePdfService,CertificateQrImageService,TokenCipher,DniCipher,InstitutionalConfig,AuthGate,RateLimiter,Config,Response,Database}.php`.
  - `apps/backend-php/tests/{AuthGateTest,NormalizePathTest,EntregaManualTest,AdminCertificateServiceTest,HttpContractTest,PdfResilienceTest,SnapshotEmissionTest,HttpEmissionE2eTest,AdminMasterDataHttpTest,AdminCertificadosConsultaHttpTest,QrImageTest,fault-injection-audit}.php`.
- CI
  - `.github/workflows/backend-tests.yml`.
- Specs y docs
  - `openspec/specs/{admin-certificate-consulta,frontend-public-validation,backend-contrato-api-certificados,frontend-api-readiness}/spec.md`.
  - `docs/backend/01-contrato-api-certificados.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/deploy/00-cpanel-certificados.md`.
- Scripts
  - `scripts/{m3-06-smoke,php-docker-lint,php-docker-modules-check,php-docker-build,php-docker-version}.sh`.

## Capacidades de smoke / CI disponibles (sin implementar nada nuevo)

| Capa | Comando | Estado local | Estado CI |
|---|---|---|---|
| Backend lint | `bash scripts/php-docker-lint.sh` | Bloqueado (`sudo` sin TTY). Fallback directo sin `sudo` ya validó 13/13 archivos en M3-06 previo. | N/A (no se invoca desde el workflow). |
| Backend módulos PHP | `bash scripts/php-docker-modules-check.sh` | Bloqueado (`sudo`). Requeridos: `pdo_mysql openssl mbstring curl zip xml gd`. | N/A. |
| Backend unit tests (sin DB) | `docker run --rm -v apps/backend-php:/app ifts14-php84 sh -lc 'php tests/AuthGateTest.php && php tests/NormalizePathTest.php && php tests/EntregaManualTest.php && php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php && php tests/PdfResilienceTest.php'` | Ejecutable con Docker local; sin passwordless docker se necesitaría root o pertenecer al grupo. | ✅ Workflow los corre. |
| Backend E2E con MariaDB | `docker run --rm --network host ... ifts14-php84 sh -lc '... SnapshotEmissionTest && HttpEmissionE2eTest && AdminMasterDataHttpTest && AdminCertificadosConsultaHttpTest'` | Requiere MariaDB alcanzable + env `IFTS14_TEST_DB_*`. | ✅ Workflow los corre con `mariadb:10.6` service. |
| Smoke Angular↔PHP manual | `bash scripts/m3-06-smoke.sh` | Bloqueado: `php` CLI no está en `PATH` (exit 2). | N/A. |
| Frontend unit | `cd apps/frontend-angular && npm test --watch=false` | Ejecutable (Node 24.18, npm 11.16 disponibles). | No usado en CI. |
| Frontend build | `cd apps/frontend-angular && npm run build` | Ejecutable. | No usado en CI. |

## Brechas de contrato detectadas

1. **Público validación**: sin brecha. DTO backend (`CertificateValidator::verify` con `$isNewCertificate && snapshotDates !== []`) emite `student.documentNumber` + `course.attendedDates`; legacy emite `documentMasked` sin fechas. El mapper Angular exige la misma regla D0 y tolera legacy con la misma forma.
2. **Admin backend**: DTO seguro (masked, sin token completo, attendedDates como objetos, auditEvents seguros, links relativos). **No hay aún consumidor Angular** (F4-F6 de Matías). Esto no es brecha de M3-06.
3. **Conmutador `useRealApi: true`**: la cobertura actual del conmutador es via `HttpTestingController` + stub de `apiBaseUrl`, no contra un PHP local real detrás del proxy. Riesgo bajo (la URL es estática y trivial). Cobertura runtime real requiere `scripts/m3-06-smoke.sh` o equivalente con PHP CLI + María DB local.
4. **CORS / preflight**: backend sin `Access-Control-*` y sin handler `OPTIONS`. Decisión documentada en `docs/backend/01-contrato-api-certificados.md:617`. El smoke Angular local usa `proxy.conf.json` → `127.0.0.1:8080` (mismo origen en `ng serve`). En cPanel, frontend y API viven bajo `/certificados/` y `/certificados/api/`, mismo origen, no se necesita preflight.
5. **`scripts/m3-06-smoke.sh` no valida módulos PHP** ni dispara el conmutador Angular. Es smoke backend-only. La parte Angular↔PHP real queda manual con toggle `useRealApi: true` (documentado en `docs/frontend/00-angular20-port-v0.md:117-135` y en comentarios de `environment.development.ts`).
6. **Test E2E específico para el flujo público con HTTP** existe vía `HttpContractTest.php` (M3-06 lo cita) más el smoke `m3-06-smoke.sh`. El nuevo `AdminCertificadosConsultaHttpTest.php` cubre admin; no hay duplicación.
7. **`/health` route**: backend `index.php` matchea `/health` tras `normalizePath` (que strippea `/certificados/api`). `scripts/m3-06-smoke.sh` lo verifica via `/certificados/api/health`. OK.
8. **Path `encodeURIComponent`**: `HttpValidationSource` construye `${apiBaseUrl}/certificados/${encodeURIComponent(token)}/verificacion`. El smoke usa `TOKEN_FICTICIO="m3-06-token-ficticio-smoke-2026-abcdef0123456789"` (49 chars, regex válido). No se valida explícitamente un token con caracteres a encodear (`%`, `/`, `+`); el smoke los rechaza con `400 VALIDATION_ERROR` (fuera de scope M3-06).
9. **Token permanente y QR**: `CertificateValidator::findCertificate` no rota token. `AdminCertificateService::entregaManual` descifra `token_cifrado` en memoria y conserva `publicValidationUrl`. Cumple D0.
10. **Privacidad D0**: backend público descifra `dni_cifrado` solo para emitir `documentNumber` en el DTO público; admin usa `documento_enmascarado` (enmascarado). No se observa DNI completo en logs, auditoría ni errores por inspección estática de `AdminCertificateService`, `Response`, `CertificateValidator`.

## Bloqueos

- `php` CLI no disponible localmente → `scripts/m3-06-smoke.sh` exit 2.
- `sudo docker` sin TTY → `scripts/php-docker-{lint,modules-check,build,version}.sh` no ejecutables tal cual. CI corre como root y no sufre esto.
- No hay `mariadb` local sembrada → el smoke con DB de prueba sólo lo aporta el workflow CI.

## Riesgos

- La evidencia runtime del smoke público Angular↔PHP depende exclusivamente del workflow CI; el script local no se puede correr aquí. Riesgo bajo: el CI fue añadido en PR #31 y cubre lint + 6 unit + 4 E2E, suficiente como evidencia reproducible de producto.
- El conmutador `useRealApi: true` se valida solo a nivel de URL y código (Karma + HttpTestingController). Una corrida end-to-end con el proxy Angular contra PHP local requiere PHP CLI o un runner dedicado (no en alcance de esta exploración).
- `material_privado_no_versionar/`, dumps, logs y secretos: no se tocaron, no se leyeron, no se imprimieron.
- Política Git de AGENTS.md: sin commit/push/PR/merge/rebase/push a main en esta corrida. Las acciones de cierre del ciclo quedan propuestas, no ejecutadas.

## Checklist de integración (resumen compartido, en español argentino formal)

- **DTOs públicos**: D0 (`documentNumber` + `attendedDates`) emitido por backend cuando el certificado tiene FK alumno/curso; legacy (`documentMasked` sin `attendedDates`) emitido en caso contrario. Angular exige D0 con `attendedDates` no vacío y tolera legacy. ✅
- **DTOs admin**: enmascarado (`documentMasked`), sin DNI completo, sin token completo; detalle añade `attendedDates` (objetos), `auditEvents` seguros y `links` relativos a `pdf`, `manualDelivery`, `qrPng`. ✅
- **Códigos de error**: backend emite `VALIDATION_ERROR`, `UNAUTHORIZED`, `CERTIFICATE_NOT_FOUND`, `PDF_NOT_FOUND`, `METHOD_NOT_ALLOWED`, `CERTIFICATE_NOT_REVOCABLE`, `CERTIFICATE_ALREADY_EXISTS`, `CONFLICT`, `TOKEN_NOT_RECOVERABLE`, `UNSUPPORTED_MEDIA_TYPE`, `RATE_LIMITED`, `CONFIGURATION_ERROR`, `INTERNAL_ERROR`. Angular colapsa `CERTIFICATE_NOT_FOUND|REVOKED|EXPIRED|MISSING|VALIDATION_ERROR` → `not-verifiable`; resto (incluido 5xx/red/JSON inválido) → `technical-error`. ✅
- **Estados no verificables**: revocado, expirado, inexistente, 404 → `not-verifiable` con `reason` interno (sólo logs). 5xx/red/JSON inválido → `technical-error` sin detalles de infraestructura. ✅
- **Privacidad (D0)**: DNI completo sólo en DTO público. Admin usa `documentMasked`. Logs, auditoría, errores y respuestas administrativas no exponen DNI completo ni token completo. `X-Admin-Key` queda fuera del bundle Angular (header técnico, no UI browser). ✅
- **CORS / preflight**: no se habilita en backend. Smoke local Angular↔PHP usa `proxy.conf.json` → `127.0.0.1:8080` (mismo origen en `ng serve`). Cpanel: `/certificados/` y `/certificados/api/` mismo origen, no requiere preflight. ✅
- **Headers de seguridad**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0` centralizados en `Response::noStoreSecurityHeaders`. ✅
- **QR / token permanente**: `findCertificate` no rota. Entrega manual conserva `publicValidationUrl` descifrando `token_cifrado` en memoria; sin regeneración, sin email, sin SMTP/PHPMailer. ✅
- **Entrega manual vs reenvío**: `POST /admin/certificados/{id}/reenviar` responde `404 NOT_FOUND` (MVP no tiene email). La entrega manual es de solo lectura, conserva token/QR. ✅

## Recomendación

- Abrir `sdd-propose` con scope **verify-only / cierre de checkpoint** (sin implementación nueva). La propuesta debe:
  1. Confirmar la convergencia Angular↔PHP a partir de PR #30 y PR #31 ya en `main`.
  2. Documentar el checklist compartido (sección previa) en `docs/frontend/00-angular20-port-v0.md` (anexo "Checkpoint M3-06 final — convergencia post-merge") y en `docs/backend/01-contrato-api-certificados.md` (anexo "M3-06 final — checklist Angular").
  3. Establecer como evidencia reproducible el workflow `.github/workflows/backend-tests.yml` (PR #31) y los comandos locales de Angular: `cd apps/frontend-angular && npm test --watch=false && npm run build`.
  4. NO tocar cPanel, NO activar deploy, NO modificar componentes Angular sin coordinación. NO abrir rama todavía: la fase `propose` se hace desde `main` limpio y la rama se crea tras aprobación explícita de Marcos.
- `sdd-spec` mínimo: 1-2 escenarios Given/When/Then que cierren el checkpoint (DTO D0 público, error 404 → `not-verifiable`).
- `sdd-design` mínimo: confirmar la conmutación local Angular→PHP + proxy + CI como fuente de evidencia.
- `sdd-tasks` mínimo: tareas de documentación + ejecución de evidencia (sin código nuevo).
- `sdd-apply` documentará la corrida; `sdd-verify` validará la checklist; `sdd-archive` sincronizará specs (`frontend-public-validation`, `backend-contrato-api-certificados`, `frontend-api-readiness`) y docs.
- `sdd-archive` finalizará M3-06. M4-07 (staging real) y F4-F6 (admin Angular) siguen en su hoja de ruta separada; este ciclo no los habilita.

## Listo para propuesta

Sí, con scope verify-only y checklist documental. Marcos debe confirmar:

1. Si el `propose` se materializa como nuevo change `m3-06-final-angular-api-smoke` o si prefiere cerrar M3-06 sin change nuevo (sólo archive) ya que PR #30 y PR #31 cubrieron la integración.
2. Si autoriza abrir rama `integration/angular-api-contract` (o el nombre que defina) desde `main` limpio para anclar la documentación del checklist.
3. Si requiere ejecución real de `scripts/m3-06-smoke.sh` con PHP CLI antes de archivar, o si basta con evidencia del workflow CI añadido en PR #31.
