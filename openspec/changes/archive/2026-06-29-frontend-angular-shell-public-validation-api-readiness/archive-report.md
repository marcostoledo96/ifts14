# Archive Report — frontend-angular-shell-public-validation-api-readiness

**Change**: `frontend-angular-shell-public-validation-api-readiness`
**Fecha de archive**: 2026-06-29
**Rama**: `frontend/angular-api-readiness`
**Modo**: hybrid (filesystem + Engram)
**Versión archive**: 1.1 (compactación de tamaño PR2)

## Resumen

Ciclo SDD completo: base Angular 20 standalone bajo `/certificados/`, validación pública con estados ficticios, mapper que colapsa `404 CERTIFICATE_NOT_FOUND` / revocado / expirado / inexistente a `not-verifiable`, y `HttpValidationSource` apuntando a `/certificados/api/certificados/{token}/verificacion`. Environments separados (mock dev / HTTP prod) vía `fileReplacements`. **Verdict**: PASS WITH WARNINGS. 0 CRITICAL. 35/35 tests, builds prod y dev verdes.

## Artefactos archivados

10 archivos markdown en `openspec/changes/archive/2026-06-29-frontend-angular-shell-public-validation-api-readiness/`: 6 de ciclo en la raíz del change folder (`proposal.md`, `explore.md`, `design.md`, `tasks.md` con 28/28 `[x]`, `apply-progress.md` cubriendo Fases 1-4 + fix batch, `verify-report.md` con 16/16 COMPLIANT) + 3 specs en `specs/{frontend-angular-shell,frontend-api-readiness,frontend-public-validation}/spec.md` (8 requirements, 16 escenarios) + este `archive-report.md`.

## Specs sincronizadas

3 specs nuevos completos (sin secciones `## ADDED/MODIFIED/REMOVED`); los dominios no existían en `openspec/specs/`. Copia directa a base.

| Dominio | Acción | Requirements |
|---|---|---:|
| `frontend-angular-shell` | Creado | 3 |
| `frontend-api-readiness` | Creado | 3 |
| `frontend-public-validation` | Creado | 2 |

Specs backend consumidas (`backend-contrato-api-certificados`, `backend-validacion-publica-certificados`, `api-rate-limiting`) ya vigentes; sin cambios.

## Archivos modificados fuera del change

| Archivo | Cambio |
|---|---|
| `docs/frontend/00-angular20-port-v0.md` | Sección "Estado de la app Angular 20" agregada (apply) + 2 URLs alineadas al fix batch en este archive. |

## Validación final

| Métrica | Valor |
|---|---|
| Tareas `[x]` | 28/28 |
| Escenarios del spec | 16/16 COMPLIANT |
| CRITICAL | 0 |
| WARNINGS | 2 (no bloqueantes) |
| Tests Angular | 35 SUCCESS |
| Build prod / dev | 252.98 kB initial / dev usa mock; ambos verdes |
| Auditoría estática | OK (sin `material_privado_no_versionar`, sin React/Next/JSX, sin DNI/hash/pepper) |

**Verdict**: PASS WITH WARNINGS. Apto para archive.

## Task Completion Gate

`tasks.md` con 28/28 `[x]` y 0 stale. Sin reconciliación mecánica. Regla de archive no se activó.

## Sincronización de specs

Cumple `openspec/AGENTS.md` ("Al cerrar un ciclo, ejecutar `sdd-archive` y actualizar `openspec/specs/` si el contrato cambió."): el contrato incorporó 3 dominios nuevos; se copiaron como specs base.

## Desviaciones

1. **`httpResource()` no implementado** (warning aceptable): la frontera `ValidationSource.fetch(): Promise<…>` establecida en Fase 2 no admite `httpResource()` sin reescribir servicio y página. Se implementó `HttpValidationSource` con `HttpClient` + `firstValueFrom`, mismo contrato y mismo mapeo de 404. Aprobado por verify.
2. **Endpoint path corregido en fix batch** (resuelto): el primer apply apuntó a `/api/...`; el fix batch alineó a `/certificados/api/certificados/{token}/verificacion` y agregó `fileReplacements` en `angular.json`.

## Archivos modificados en este archive

| Archivo | Estado | Alcance |
|---|---|---|
| `openspec/specs/frontend-angular-shell/spec.md` | Creado | Copia directa del delta. 3 req, 5 escenarios. |
| `openspec/specs/frontend-api-readiness/spec.md` | Creado | Copia directa del delta. 3 req, 6 escenarios. |
| `openspec/specs/frontend-public-validation/spec.md` | Creado | Copia directa del delta. 2 req, 5 escenarios. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado | 2 URLs alineadas al fix batch. |
| `openspec/changes/archive/2026-06-29-frontend-angular-shell-public-validation-api-readiness/` | Movido | proposal/explore/design/tasks/apply-progress/verify-report + 3 specs + este archive-report. |
| Engram `sdd/frontend-angular-shell-public-validation-api-readiness/archive-report` | Persistido | topic_key, `capture_prompt: false`, `type: architecture`. |

Aclaración sobre el alcance del archive vs el ciclo: el ciclo de apply (commits previos) sí modificó código en `apps/frontend-angular/` — `angular.json` (fileReplacements dev), `app.config.ts` (provideHttpClient + selector), `shared/certificates/mock-tokens.ts` (export `VALID_VALID_DTO`), más los nuevos `shared/certificates/http-validation.source.ts` y su spec, y `environments/environment{,.development}.ts`. Esa implementación ya está versionada en commits previos a este archive. La operación de archive en sí no agregó código de aplicación: solo sincronizó specs a `openspec/specs/`, movió el change folder a `openspec/changes/archive/2026-06-29-…/` y persistió este reporte. No se tocaron `material_privado_no_versionar/`, backend PHP, base de datos, deploy, migraciones SQL, `composer.json`, configs reales, credenciales, dumps ni logs. No se modificaron `git`, no se hicieron commits, push, merge, rebase, switch ni checkout.

## Warnings y notas

- **`httpResource()` no utilizado** (aceptable): `HttpClient` + `firstValueFrom` preserva la frontera `ValidationSource`/`ValidationService`. UI y servicio intactos; comportamiento público equivalente.
- **Sin umbral de cobertura**: verificación basada en 35 tests + builds + bundle. Sugerido: integration spec `404 CERTIFICATE_NOT_FOUND → not-verifiable` en ciclo posterior.
- **CORS/preflight pendiente**: adapter asume same-origin (`/certificados/api/...`). API PHP futura debe servir headers CORS. Heredado de `docs/backend/01-contrato-api-certificados.md`.

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Diseño visual final no aplicado | Media | Sistema visual en ciclos de Matías (F1-01/F1-02). |
| Adapter en `+18 kB` initial | Baja | 253 kB vs 500 kB warning; holgado. |
| CORS no verificado en cPanel real | Baja | Same-origin asumido; documentado. |
| Sin integration spec end-to-end | Baja | 35 tests cubren mapper, service y adapter por separado. |

## Estado

**SDD cycle complete.** 28/28 tareas, verify PASS WITH WARNINGS (0 CRITICAL), specs sincronizadas a `openspec/specs/`, docs frontend alineadas al fix batch. Próximo ciclo recomendado: F1-01/F1-02 de Matías (sistema visual) u operativos que consuman la app Angular.
