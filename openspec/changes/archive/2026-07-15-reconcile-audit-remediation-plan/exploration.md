# Exploración: reconciliación del plan de remediación de auditoría

## Resultado ejecutivo

La evidencia efectiva en `origin/main` después de los merges `1a6a1cf` (PR #63) y `27b34c6` (PR #65) confirma P3 y P4 cerradas, P0/P0-01 `PARTIAL` por falta de veredicto formal y fallo backend, P5-01 cerrada con advertencias, y P1/P2/P5/P6/P7/P8 parcialmente cerradas. El tablero del plan es obsoleto: conserva `fase_actual: P3`, `ultimo_ciclo_cerrado: P2-02` y marca P5-P8 completas como `PENDIENTE`, pero tampoco debe reemplazarse por afirmaciones de implementación sin evidencia runtime, OpenSpec archivado o CI verificable.

La exploración fue de planificación y documentación únicamente. No se modificó código de producto, infraestructura, base de datos, deploy, Git ni material privado.

## Current State

- `origin/main` apunta a `1a6a1cf`, merge de PR #63, y contiene como ancestro `27b34c6`, merge de PR #65.
- PR #63 implementa autenticación PHP por sesión nativa, CSRF, autorización HTTP sin `X-Admin-Key`, matriz de autorización, readiness y evidencia sanitizada de staging.
- PR #65 limita la revocación Angular a certificados `vigente`, con tests para estados no revocables; no convierte el admin Angular en integración HTTP real.
- Las specs canónicas ya describen sesión PHP/CSRF (`admin-auth`), entrega manual sin email (`admin-certificate-delivery`) y frontera pública DTO/API (`frontend-api-readiness`), pero `admin-certifications-frontend` sigue describiendo explícitamente una UI mock-only.
- El único workflow vigente es `.github/workflows/backend-tests.yml`: ejecuta backend PHP, MariaDB 10.6, tests Angular y build Angular; no ejecuta build `production-staging`, escaneo de secretos, links/docs ni una prohibición de mocks en el bundle productivo.
- La evidencia de P5-01 declara `PASS WITH WARNINGS`, requisitos `16/16`, escenarios `52/52`, tests y lint con exit `0`, y staging aislado PASS; producción `/certificados/` no fue activada ni validada.

## Evidence Matrix

Estados usados en esta reconciliación: `DONE`, `PARTIAL`, `PENDING`, `BLOCKED`, `SUPERSEDED`. `DONE` requiere evidencia actual; el texto histórico del plan, por sí solo, no cuenta como prueba.

| Fase/ciclo | Estado | Evidencia actual verificable | Lectura operativa |
|---|---|---|---|
| P0 — baseline | PARTIAL | `docs/auditoria/03-reporte-baseline-p0-01.md`; commit `9bc0dbd` / PR #57 | El baseline existe, pero no tiene veredicto formal aprobatorio y el backend Docker falló por contexto/EOF. |
| P0-01 | PARTIAL | Mismo reporte; `543 SUCCESS` frontend, migraciones inventariadas | El frontend pasó, pero el backend falló y no existe veredicto formal de aprobación; `ARCHIVADO` es historia. |
| P1 — esquema | PARTIAL | `database/migrations/006_reconciliar_esquema_m4_02.sql`, `007_schema_migrations.sql`; `openspec/changes/archive/2026-07-02-database-cursos-alumnos-asistencias/verify-report.md` | El esquema y registry están presentes y MariaDB 10.6 efímero pasó. Falta una evidencia directa, separada y actual de todas las variantes de upgrade exigidas por P1-03. |
| P1-01 | DONE | Verify de `database-cursos-alumnos-asistencias`: assertions MariaDB 10.6 y contrato de modelo | Hay evidencia runtime del contrato de esquema, no solo checklist. |
| P1-02 | DONE | Migraciones `006` y `007`; staging reporta migraciones `001`–`010` | La implementación aditiva está presente; la aplicación en una DB institucional sigue fuera de alcance. |
| P1-03 | PARTIAL | `openspec/changes/archive/2026-07-02-database-cursos-alumnos-asistencias/verify-report.md` documenta migración/seed y snapshot, pero no demuestra explícitamente las dos variantes históricas de `003` llegando al mismo final | Mantener abierta hasta producir la prueba de upgrade exacta o registrar formalmente que fue superseded por el esquema ya consolidado. |
| P2 — docs/OpenSpec | PARTIAL | `openspec/changes/archive/2026-06-29-docs-openspec-drift-cleanup/verify-report.md`; specs canónicas actualizadas; advertencias de `verify-report` P5-01 | La sincronización principal existe, pero P5-01 todavía detecta referencias históricas operativas a `X-Admin-Key` HTTP, `STOP DESPLIEGUE` y smoke remoto como gate. El tablero y algunas fuentes históricas no reflejan el estado actual. |
| P2-01 | DONE | `openspec/specs/admin-auth/spec.md`, `admin-certificate-delivery/spec.md`, `backend-contrato-api-certificados/spec.md`; archive de drift cleanup | Contratos principales alineados con sesión, entrega manual y ausencia de email. |
| P2-02 | PARTIAL | `README.md`, `GUIA.md`, docs backend/deploy actualizados por PR #63; warnings P5-01, líneas 156–162 | La documentación activa mejoró, pero queda reconciliación de términos y patch PHP 8.4.22 frente a referencias 8.4.21. |
| P3 — hardening | DONE | `openspec/changes/archive/2026-06-27-qa-backend-hardening-certificados/verify-report.md`; P5-01 workflow/verify | Body limit, headers privacy, readiness, validación temporal, auditoría segura y regresión tienen evidencia Docker/MariaDB/CI. |
| P3-01 | DONE | `apps/backend-php/tests/HttpContractTest.php`; workflow backend; verify P5-01 | Contrato HTTP y body limit verificados. |
| P3-02 | DONE | `scripts/test-privacy-headers.sh`; workflow y verify P5-01 | Headers/noindex/no-referrer tienen check ejecutado con exit `0`. |
| P3-03 | DONE | `apps/backend-php/tests/ReadinessTest.php`, `apps/backend-php/bin/readiness.php`, staging evidence | Readiness local/CI y staging sanitizado PASS. |
| P3-04 | DONE | `SnapshotEmissionTest.php`, `HttpEmissionE2eTest.php`, `CertificateValidator.php`; workflow MariaDB | Emisión, fechas, vigencia, snapshot y token activo tienen regresión DB-backed. |
| P4 — revisiones | DONE | Migraciones `008`, `009`, `010`; tests `CertificateRevisionMigrationTest.php`, `AttendanceRevisionTest.php`, `CourseDateRevisionTest.php`, `PdfResilienceTest.php` | El flujo de snapshot/revisión/PDF stale está implementado y entra en CI MariaDB. |
| P4-01 | DONE | `database/migrations/008_certificados_revision_contenido.sql`; `CertificateRevisionMigrationTest.php` | Columnas/revisión verificadas. |
| P4-02 | DONE | `AttendanceRevisionTest.php`; workflow y verify P5-01 | Anulación actualiza revisión/snapshot sin rotar token. |
| P4-03 | DONE | `AttendanceRevisionTest.php`; workflow | Agregar/restaurar asistencia cubierto. |
| P4-04 | DONE | `CourseDateRevisionTest.php`; workflow | Cambios de fecha/estado/orden cubiertos; cancelación no debe inferirse fuera de ese test. |
| P4-05 | DONE | `010_backfill_pdf_revision.sql`, `PdfResilienceTest.php`, `HttpEmissionE2eTest.php` | PDF stale y entrega segura tienen evidencia; no se afirma regeneración automática. |
| P5 — auth/integración admin | PARTIAL | P5-01 DONE; P5-02/03/04 sin evidencia de implementación HTTP Angular completa | La autenticación backend está cerrada, pero la fase exige además fronteras HTTP, environments y login Angular real. |
| P5-01 | DONE | `openspec/changes/archive/2026-07-15-p5-01-auth-php/verify-report.md`; `task-4-1-staging-evidence.md`; PR #63, merge `1a6a1cf`; commit verificado `9d1948e` | `PASS WITH WARNINGS`: 16/16 requirements, 52/52 scenarios, tests/lint exit `0`, staging aislado PASS. Producción no validada. |
| P5-02 | PENDING | CodeGraph muestra interfaces `CoursesService`/`StudentsService` e implementaciones in-memory; no aparecen `HttpCoursesService`, `HttpStudentsService`, `HttpAttendanceService`, `HttpCertificationsService` ni `HttpInstitutionalConfigService` | Gap explícito: crear fronteras HTTP y tests `HttpTestingController`; no tocar UI en ese ciclo. |
| P5-03 | PARTIAL | `apps/frontend-angular/src/environments/environment.development.ts` y `environment.staging.ts`; workflow solo `npm run build` | Existe conmutación para validación pública, pero no hay evidencia de build production-staging ni gate que falle si el admin productivo usa mocks. |
| P5-04 | PENDING | CodeGraph muestra `InMemoryMockSession` y `CertificationDeliveryPage` mock; spec `admin-certifications-frontend` declara sesión mock | No existe login Angular real consumiendo sesión PHP, manejo global de 401, logout/refresh ni QA manual de cookie/bundle. |
| P6 — frontend | PARTIAL | Archives F4/F5; PR #65; specs `admin-certifications-frontend` y `frontend-api-readiness` | Hay mucha UI mock y correcciones puntuales, pero no hay cierre de la integración real ni de todos los criterios P6. |
| P6-01 | PARTIAL | `openspec/changes/archive/2026-07-02-backend-entrega-manual-certificados/verify-report.md`; `CertificationDeliveryPage`; `admin-certificate-delivery/spec.md` | Backend manual PASS parcial; UI todavía usa `VALIDACION_HOST` hardcodeado, mock source y evidencia previa reconoce wiring Angular fuera de alcance. El código actual también marca éxito de clipboard aunque falle. |
| P6-02 | PARTIAL | PR #65 / merge `27b34c6`; tests `certifications.service.spec.ts`, preview/revoke specs | Revocación desde estados no vigentes quedó protegida. No hay evidencia de retiro completo de `entregado`, `pendiente-entrega`, `requiere-nueva-entrega` y copy de firma/validez en toda la UI activa. |
| P6-03 | PARTIAL | `openspec/specs/frontend-api-readiness/spec.md`; modelos/servicios frontend actuales | DTO público está especificado, pero las fuentes admin continúan in-memory y faltan las cinco implementaciones HTTP de P5-02. |
| P6-04 | PARTIAL | `frontend-api-readiness/spec.md`; environments y servicio de validación real local | La frontera pública mock/API existe, pero no hay evidencia de una validación pública staging end-to-end actual con el refinamiento completo de aceptación. |
| P6-05 | PARTIAL | Verifies F4/F5: tests/build pasan; warnings CSS en `certification-preview-page.css` y `certification-pdf-preview-page.css` | Hay QA automatizado responsive/accessibility, pero no cierre de la matriz manual completa 1440–360, teclado, zoom, screen reader y consola para todos los flujos. |
| P7 — CI/gates | PARTIAL | `.github/workflows/backend-tests.yml`, 105 líneas; CI verde reportado en PR #63 | Hay CI backend/MariaDB/frontend básico, pero faltan gates explícitos del plan. |
| P7-01 | PARTIAL | workflow `frontend-tests`: `npm ci`, `npm run test:ci`, `npm run build` | Falta `production-staging` y check de bundle/config contra mocks. |
| P7-02 | PARTIAL | workflow backend: Docker build, Composer install, PHP tests/lint indirecto | No hay step explícito `composer validate --strict`, `composer audit` ni un lint PHP nombrado como criterio independiente. |
| P7-03 | DONE | workflow MariaDB 10.6 ejecuta migraciones implícitamente vía tests y E2E `SnapshotEmission`, `HttpEmission`, master data, readiness, revisions; no usa `SKIP` | El núcleo MariaDB/E2E está obligatorio y pasó en PR #63. Upgrade fixtures específicos de P1 siguen siendo una brecha aparte. |
| P7-04 | PENDING | No se encontró workflow/step versionado para gitleaks, archivos prohibidos, OpenSpec mal archivado, links internos, términos obsoletos y `git diff --check` | Crear un gate documental/security separado, sin leer secretos reales. |
| P8 — staging cPanel | PARTIAL | `openspec/changes/archive/2026-07-15-p5-01-auth-php/task-4-1-staging-evidence.md`; `docs/deploy/01-staging-cpanel-certificados.md` | Capacidades, paquete, sesión, readiness y rollback del candidato aislado están verificadas; el flujo de negocio completo no. |
| P8-01 | DONE | staging evidence: PHP 8.4.22, extensiones, CGI/FastCGI, permisos, `.user.ini`, storage | Investigación de capacidades operativas completada y sanitizada. |
| P8-02 | PARTIAL | staging schema dedicado vacío, diez tablas, migraciones `001`–`010`; no hubo filas de negocio | DB staging existe y es aislada, pero no se ejecutó el seed ficticio/flujo de negocio requerido por el ciclo. |
| P8-03 | PARTIAL | staging evidence: paquete, Composer/autoload, config privada, permisos, PHP/GD/mbstring; `SetEnv` reemplazado por `.user.ini` | Paquete/runtime PASS, pero falta demostrar build Angular staging integrada y cierre de artefactos operativos de entrega. |
| P8-04 | PENDING | verify P5-01 dice explícitamente que el smoke remoto con datos de negocio quedó fuera y el esquema siguió vacío | No existe smoke remoto completo health→login→curso→alumno→asistencia→emisión→validación→QR→revisión→revocación. |
| P8-05 | PENDING | No hay evidencia archivada de QA manual conjunto Marcos/Matías para el flujo integrado | Requiere staging con datos ficticios y checklist visual/backend separado. |
| P9 | PENDING (no bloqueante) | Sección P9 del plan; no condiciona el milestone | Mantener backlog: PDF robusto, firmas, email opcional, entrega manual persistida, keyring, token fuera del path, roles y observabilidad. |

## Affected Areas

- `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` — tablero, metadatos y estados de ciclos; es la fuente que debe reconciliarse.
- `openspec/specs/` — contratos canónicos de auth, entrega, frontend/API y UI mock; deben conservarse como fuente de comportamiento, no como prueba runtime por sí solos.
- `openspec/changes/archive/` — evidencia histórica y verificaciones archivadas de baseline, esquema, hardening, revisiones, frontend y P5-01.
- `apps/frontend-angular/src/app/features/admin/` — interfaces actuales e implementaciones in-memory; evidencia directa de los gaps P5-02/P5-04/P6.
- `apps/frontend-angular/src/environments/` — conmutación mock/API pública; evidencia parcial de P5-03.
- `.github/workflows/backend-tests.yml` — CI actual y límites de los gates P7.
- `docs/backend/`, `docs/deploy/`, `README.md`, `GUIA.md`, `docs/00-indice-general.md` — documentación activa actualizada por PR #63, con deriva residual documentada en verify.

## Stale Statements

1. El frontmatter del plan conserva `commit_auditado: 9bc0dbd`, `fase_actual: P3` y `ultimo_ciclo_cerrado: P2-02`; ya no representa `origin/main` posterior a PR #63/#65.
2. El tablero general marca P5, P6, P7 y P8 como `PENDIENTE` sin distinguir P5-01 cerrado, CI parcial y staging parcial.
3. El registro de ciclos termina en P4-05 y no registra P5-01 ni PR #65.
4. El plan contiene criterios y tareas futuras que no equivalen a evidencia; en particular no debe usarse su tabla como prueba de P3/P4/P5.
5. `openspec/config.yaml` todavía declara `strict_tdd: false` y frontend “pendiente de diseño v0”, afirmaciones que deben contextualizarse frente a los archives F4/F5; no deben confundirse con API admin real.
6. Algunas docs activas conservan referencias históricas a `X-Admin-Key` HTTP/STOP/smoke remoto; P5-01 ya las clasifica como warnings de sincronización.

## Risks

- El mayor riesgo es declarar “P8 completa” por la evidencia de autenticación staging: el esquema está vacío y no existe E2E de negocio remoto.
- El segundo riesgo es llamar “integración admin real” a interfaces Angular mock-only; P5-02 y P5-04 son gaps concretos, no detalles cosméticos.
- P7 no impide regresiones de mocks en producción porque falta el gate de bundle/environment y el workflow no ejecuta todas las validaciones del plan.
- La evidencia archivada de algunos ciclos antiguos es PASS WITH WARNINGS o mantiene gates de archive; debe citarse con su veredicto exacto y no resumirse como PASS pleno.
- Producción `/certificados/` permanece fuera de la evidencia; no debe inferirse desde `/certificados_staging/`.

## Decisions / Proposed Minimal Next-Cycle Sequence

1. **Primero, ciclo documental de reconciliación**: actualizar el frontmatter, tablero y registro del plan con esta matriz; agregar enlaces a PR #63/#65, commits y archives; conservar P9 como backlog no bloqueante.
2. **P5-02 — fronteras HTTP Angular**: implementar únicamente los cinco servicios HTTP y sus tests de mapeo/errores, sin cambiar pantallas.
3. **P5-03 — environments/gate de mocks**: separar desarrollo, staging y producción para admin; agregar build `production-staging` y un check mínimo que falle ante fuentes mock en builds reales.
4. **P5-04 — login Angular real**: conectar login/session/logout a cookie PHP, interceptor/guard de 401 y CSRF donde corresponda; incluir tests runtime y QA manual de refresh/logout/cookie/bundle.
5. **P6-01/P6-02**: reemplazar la entrega mock por contrato real y retirar estados no sustentados; preservar la corrección ya mergeada de revocación por estado vigente.
6. **P6-03/P6-05**: cerrar DTO admin/API y accesibilidad responsive, con matriz manual trazable.
7. **P7-01/P7-04**: completar CI frontend staging, mock gate y seguridad/documentación.
8. **P8-02→P8-05**: recién después, ejecutar staging con DB ficticia, seed generado por aplicación, smoke E2E completo y QA manual; no tocar producción.

## Recommendation

Recomiendo clasificar el estado global como **PARTIAL**, con P0/P0-01 también `PARTIAL`, no como “en curso P3” ni como “P0–P8 completos”. El siguiente ciclo mínimo debe ser documental y luego P5-02, porque P5-02 es la dependencia técnica más pequeña que desbloquea P5-03/P5-04 y evita seguir ampliando UI mock sin contrato HTTP.

## Ready for Proposal

**Yes.** La exploración identifica alcance, evidencia, gaps y una secuencia mínima. El proposal debe limitarse a reconciliar el plan y, si se continúa el pipeline, declarar explícitamente que la implementación posterior de P5-02 es un ciclo separado.

## Skill Resolution

- `sdd-explore`: cargado desde el path inyectado por el orquestador.
- `cognitive-doc-design`: cargado desde el path inyectado; aplicado mediante matriz, señalización de estado y evidencia enlazable.
- `karpathy-guidelines`: cargado desde el path inyectado; aplicado evitando inferir DONE desde texto histórico y separando gaps de producto, CI y staging.
- `CodeGraph`: consultado antes de búsquedas amplias para claims de flujo/código; se usó para confirmar interfaces in-memory, sesión PHP, environments y entrega mock.
- `context7`: no requerido; no se investigó documentación externa de librerías.

## Return Contract

**Status**: success

**Summary**: Reconciliación read-only completada contra `origin/main` posterior a PR #63/#65, archives OpenSpec, specs canónicas, CI, docs y evidencia Engram disponible. Estado recomendado: global `PARTIAL`; P0/P0-01 `PARTIAL`, P3/P4 `DONE`, P5-01 `DONE WITH WARNINGS`, P5/P6/P7/P8 parcialmente cerradas y P9 pendiente no bloqueante.

**Artifacts**: `openspec/changes/reconcile-audit-remediation-plan/exploration.md` | Engram `sdd/reconcile-audit-remediation-plan/explore`

**Next**: `sdd-propose` para el ciclo documental de reconciliación; después P5-02.

**Risks**: Producción no validada; staging sin datos de negocio; P5-02/P5-04 y gates P7 incompletos; warnings documentales históricos.

**Skill Resolution**: `paths-injected` — 3 skills (`sdd-explore`, `cognitive-doc-design`, `karpathy-guidelines`).
