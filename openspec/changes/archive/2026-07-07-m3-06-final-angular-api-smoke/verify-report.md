## Verification Report

**Change**: `m3-06-final-angular-api-smoke`  
**Version**: N/A  
**Mode**: Standard verify; Strict TDD inactivo; ciclo verify-only/documental sin cambios de runtime de producto.  
**Artifact store**: híbrido, OpenSpec + Engram.

### Completeness

| Métrica | Valor |
|---|---:|
| Tasks totales en `tasks.md` | 17 |
| Tasks completas | 17 |
| Tasks incompletas | 0 |
| Cambios fuera de alcance | 0 |

> Nota: `apply-progress` declara “13/13”, pero `tasks.md` contiene 17 checkboxes y las 17 están marcadas. Se toma `tasks.md` como fuente de verdad para la completitud.

### Alcance git inspeccionado

Comandos ejecutados:

```text
rtk git status --short --untracked-files=all
rtk git diff --name-only
rtk git diff --cached --name-only
rtk git diff --stat
```

Archivos modificados o nuevos:

| Archivo | Tipo | Permitido |
|---|---|---|
| `docs/backend/01-contrato-api-certificados.md` | Doc | Sí |
| `docs/frontend/00-angular20-port-v0.md` | Doc | Sí |
| `openspec/changes/m3-06-final-angular-api-smoke/exploration.md` | OpenSpec | Sí |
| `openspec/changes/m3-06-final-angular-api-smoke/proposal.md` | OpenSpec | Sí |
| `openspec/changes/m3-06-final-angular-api-smoke/design.md` | OpenSpec | Sí |
| `openspec/changes/m3-06-final-angular-api-smoke/tasks.md` | OpenSpec | Sí |
| `openspec/changes/m3-06-final-angular-api-smoke/specs/**/spec.md` | OpenSpec | Sí |
| `openspec/changes/m3-06-final-angular-api-smoke/verify-report.md` | OpenSpec | Sí |

No se detectaron cambios en runtime frontend/backend, deploy, cPanel, `public_html`, `vendor/`, `material_privado_no_versionar/` ni material privado.

### Build & Tests Execution

**Frontend tests**: ✅ Passed

```text
cd apps/frontend-angular && npm test -- --watch=false --browsers=ChromeHeadless
Resultado: TOTAL: 74 SUCCESS
Entorno observado: Chrome Headless 149.0.0.0, Karma 6.4.4.
```

**Frontend build**: ✅ Passed

```text
cd apps/frontend-angular && npm run build
Resultado: verde.
Initial total: 253.46 kB raw / 72.04 kB transfer.
Lazy public-validation-page: 5.18 kB raw / 1.84 kB transfer.
Output: apps/frontend-angular/dist/frontend-angular.
```

**Backend Docker image**: ✅ Passed con advertencia operativa

```text
docker build -t ifts14-php84 -f docker/php84/Dockerfile .
Resultado: imagen construida/tagueada correctamente.
Advertencia: el build context intentó agregar .codegraph/daemon.sock y Docker informó “sockets not supported”; no falló el build.
```

**Backend unit tests**: ✅ Passed

```text
docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php tests/AuthGateTest.php && php tests/NormalizePathTest.php && php tests/EntregaManualTest.php && php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php && php tests/PdfResilienceTest.php'
Resultado: 6/6 OK.
Observación: `HttpContractTest.php` emitió notices PHP de `file_get_contents()` sin `Content-type`; no fallaron los tests.
```

**Backend E2E Docker + MariaDB 10.6**: ✅ Passed

```text
Red Docker descartable: m3-06-verify-net.
Contenedor MariaDB descartable: m3-06-verify-mariadb, imagen mariadb:10.6.
DSN: mysql:host=m3-06-verify-mariadb;dbname=ifts14_test.
Tests: SnapshotEmissionTest, HttpEmissionE2eTest, AdminMasterDataHttpTest, AdminCertificadosConsultaHttpTest.
Resultado: 4/4 OK.
```

**Smoke local**: ⚠️ BLOCKED esperado

```text
bash scripts/m3-06-smoke.sh
Salida: [m3-06-smoke] BLOCKED: php CLI no disponible en PATH.
Exit: 2
```

**Coverage**: ➖ No disponible; el proyecto no expone comando de coverage para este ciclo.

### Spec Compliance Matrix

| Dominio | Requirement | Scenario | Evidencia | Resultado |
|---|---|---|---|---|
| `frontend-api-readiness` | Checkpoint final de consumo Angular/API | Evidencia reproducible sin datos reales | `npm test` 74/74, `npm run build`, backend Docker 6/6 + 4/4, smoke ejecutado y bloqueado sin PHP CLI; docs registran evidencia sin datos reales. | ⚠️ PARTIAL |
| `frontend-api-readiness` | Checkpoint final de consumo Angular/API | Bloqueo local documentado | `bash scripts/m3-06-smoke.sh` → exit 2; docs y reporte registran fuente alternativa Docker/MariaDB. | ✅ COMPLIANT |
| `frontend-public-validation` | Confirmación pública D0 sin cambio visual | Certificado D0 verificable | `public-validation-page.spec.ts`, `result-mapper.spec.ts`, `dto.ts`, `result-mapper.ts`; 74/74 tests pasan. | ✅ COMPLIANT |
| `frontend-public-validation` | Confirmación pública D0 sin cambio visual | No verificable por 404 | `http-validation.source.spec.ts`, `result-mapper.spec.ts`, `validation.service.spec.ts`; 74/74 tests pasan. | ✅ COMPLIANT |
| `backend-contrato-api-certificados` | Checklist compartido post-merge Angular/API | Privacidad preservada | Inspección de docs + `CertificateValidator`, `AdminCertificateService`, `Response`; backend unit/E2E 10/10 OK. | ✅ COMPLIANT |
| `backend-contrato-api-certificados` | Checklist compartido post-merge Angular/API | Invariantes D0 preservados | Docs confirman token/QR permanente, sin email/SMTP/PHPMailer, `X-Admin-Key` temporal; backend unit/E2E 10/10 OK. | ✅ COMPLIANT |

**Compliance summary**: 5/6 escenarios compliant, 1/6 partial por smoke local bloqueado sin PHP CLI.

### Correctness (Static Evidence)

| Requisito | Estado | Notas |
|---|---|---|
| Sólo documentación + OpenSpec | ✅ Implementado | `git status` no muestra runtime/deploy/vendor/private. |
| Checklist frontend/backend D0 | ✅ Implementado | Docs modificados contienen DTO público, DTO admin, errores, privacidad, invariantes y evidencia. |
| Angular D0 público | ✅ Implementado | `dto.ts` admite `documentNumber` + `attendedDates`; mapper exige fechas para D0 y tolera legado `documentMasked`. |
| Backend D0 público/admin | ✅ Implementado | Público emite `documentNumber` + `attendedDates` para certificados nuevos; admin usa `documentMasked` y `tokenPrefix`. |
| Smoke local bloqueado | ✅ Documentado | Bloqueo reproducido con exit 2 y fuente alternativa Docker/MariaDB validada. |

### Coherence (Design)

| Decisión de diseño | Cumplimiento | Notas |
|---|---|---|
| Ciclo verify-only/documental | ✅ Sí | No hubo cambios de runtime. |
| CI/Docker como evidencia backend principal | ✅ Sí | Docker local validado: build + 6 unit + 4 E2E. |
| Corregir producto sólo si aparece brecha | ✅ Sí | No se detectó brecha contractual. |
| Mantener `X-Admin-Key` temporal | ✅ Sí | Sin login real ni admin Angular en scope. |
| No deploy/cPanel/staging/material privado | ✅ Sí | Sin cambios ni lecturas en esas zonas. |

### Issues Found

**CRITICAL**: Ninguno.

**WARNING**:
- Smoke Angular→PHP local no queda ejecutado end-to-end por falta de `php` CLI; se reprodujo el bloqueo esperado con exit 2 y se validó evidencia alternativa Docker/MariaDB.
- `docker build` incluye `.codegraph/daemon.sock` en el contexto y Docker avisa que no puede empaquetar sockets; el build igualmente pasa. Conviene revisar `.dockerignore` en otro ciclo si molesta o ralentiza builds.
- `apply-progress` declara 13/13 tasks, mientras `tasks.md` tiene 17/17 checkboxes completas.
- `HttpContractTest.php` emite notices de `file_get_contents()` sin `Content-type`; no rompe la suite.

**SUGGESTION**:
- En `sdd-archive`, conservar el bloqueo del smoke como riesgo operativo hasta instalar PHP CLI local o agregar runner equivalente.

### Verdict

**PASS WITH WARNINGS**

El ciclo cumple el alcance documental y la evidencia reproducible disponible, sin cambios fuera de docs/OpenSpec ni runtime de producto. Queda una advertencia por smoke local bloqueado sin PHP CLI; no bloquea el archive porque el bloqueo está documentado y la evidencia alternativa Docker/MariaDB + Angular test/build pasó.
