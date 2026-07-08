# Reporte de archive — F2-06 Certificaciones admin

**Change**: `f2-06-admin-certifications`
**Rama**: `frontend/admin-certifications`
**Fecha de archive**: 2026-07-08
**Almacén de artefactos**: OpenSpec + Engram (hybrid)
**Veredicto verify**: PASS (re-verificado tras correcciones pre-commit)
**Modo**: Standard, Strict TDD desactivado
**Líneas diff estimadas**: 1100–1800 (forecast inicial); diff final mayor por tests/docs 2600 insertions / 47 deletions en 32 archivos (single-pr, dentro del budget 5000)

## Resumen ejecutivo

El ciclo F2-06 cierra la UI administrativa Angular 20 para Certificaciones mock-only: rutas protegidas (`/admin/certificaciones` y `/admin/certificaciones/:id`), listado navegable con filtro por estado y búsqueda libre, previsualización segura con `documentMasked`, `tokenPrefix`, URL pública truncada a 60 chars, `attendedDates` y `auditEvents` mínimos. Activa Certificaciones como ruta navegable en el shell admin (sidebar y dashboard) con conteo desde `CERTIFICATIONS_SOURCE.contar()`. Datos ficticios en memoria (3–6 certificados demo, `documentMasked` `XX****XX`, `tokenPrefix` `prefijo_demo_xxx`). Sin HTTP, sin `X-Admin-Key`, sin storage/cookies/IndexedDB, sin backend, sin auth real y sin dependencias nuevas. CTAs de emisión, PDF, entrega manual, revocación y listado real quedan deshabilitados con handoff explícito a F4-01/F4-02/F5-01/F5-04/F6-01.

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-certifications-frontend` | **Creada** | Spec nueva, 4 requirements con 8 escenarios Given/When/Then. |
| `admin-foundation` | **Modificada** (previamente) | 4 requirements actualizados durante apply: Rutas administrativas aisladas (incluye `/admin/certificaciones*`), Login y shell simulados (Certificaciones activa, mock-only F2-06), Shell accesible y alineado a F1-02 (estado activo para `/admin/certificaciones*`), Documentación y límites de handoff (F2-06 → F4-F6). Requirement `Sesión mock solo en memoria` preservado sin cambios. |

## Fuente de verdad actualizada

Las siguientes specs reflejan el nuevo comportamiento tras el merge:

- `openspec/specs/admin-certifications-frontend/spec.md` (nueva, creada en este archive)
- `openspec/specs/admin-foundation/spec.md` (4 requirements modificados, 1 preservado, ya sincronizado en apply)

## Delta specs archivados (referencia)

- `openspec/changes/archive/2026-07-08-f2-06-admin-certifications/specs/admin-certifications-frontend/spec.md` (4 ADDED)
- `openspec/changes/archive/2026-07-08-f2-06-admin-certifications/specs/admin-foundation/spec.md` (4 MODIFIED)

## Tareas

- Total: 19
- Completadas: 19 (5.5 marcada `[x]` durante este archive)
- Pendientes: 0
- Tarea 5.5 (`sdd-archive`) marcada como completada en este archive: el orquestador instruyó su ejecución como parte de las archive requirements y el `verify-report` la registró como pendiente de cierre documental (no es tarea de implementación rezagada). `sdd-apply` no debía marcarla porque es tarea de fase de cierre. `sdd-archive` ejecutó el cierre mecánico con autorización explícita del orquestador y prueba (`verify-report` PASS WITH WARNINGS → PASS, 0 CRITICAL) de que toda la implementación core está completa. Re-verificación posterior (PASS, 394/394 SUCCESS) confirmó el cierre limpio.

## Evidencia de verificación (resumen)

- **Tests**: `npm run test:ci` → **TOTAL: 394 SUCCESS** en Chrome Headless 149 (re-verify post correcciones pre-commit; antes 390). Incluye specs de `InMemoryCertificationsService` (listar/obtener/contar, id inválido, clone defensivo, filtros por estado y texto, formato `documentMasked`/`tokenPrefix`, URL truncada sin UUID), `CertificationsListPage` (banner demo, búsqueda, filtro, empty state, enlaces), `CertificationPreviewPage` (`<dl>` seguro, URL truncada vía constante nombrada, CTAs deshabilitados, handoff F4-F6, id inválido sin excepción, rechazo de `0x1`/`1e0`), `__checks__/no-secrets.spec.ts` y `no-real-data.spec.ts` (seguridad y datos, con enumeración de métodos/getters/constructor), `app.routes.spec.ts` (orden de children, sesión mock con/sin, runtime `CERTIFICATIONS_SOURCE`, id inválido `abc` sin `NullInjectorError`, regresión sin provider), `sidebar-admin.spec.ts` y `admin-dashboard-page.spec.ts` (link, `aria-current`, conteo desde seam, fallback a `0` ante rechazo).
- **Build**: `npm run build` → verde sin warnings. Initial total 313.84 kB raw / 90.36 kB transfer; lazy `certification-preview-page` 8.38 kB, `certifications-list-page` 7.76 kB. Vs F2-05: 310.43 kB / 89.66 kB (delta +3.41 kB initial, +0.70 kB transfer).
- **`git diff --check`**: PASS (sin salida).
- **Compliance**: 14/14 escenarios compliant. Sin escenarios `PARTIAL`, sin `needs-verify`, sin issues CRITICAL ni WARNING.
- **Negative checks (heredados del verify)**: 0 matches en runtime de `X-Admin-Key`/admin key, storage/cookies/IndexedDB, llamadas HTTP/`fetch`/`HttpClient`, DNI completo, email, token, legajo, matrícula, UUID plausible, URL pública con token completo. Las URLs mock visibles en UI (`https://ifrm/validar/…`) son display-only, truncadas y ficticias; no se emiten llamadas HTTP hacia ellas (ningún `fetch`/`HttpClient`/`XMLHttpRequest` en el código de la feature).

## Advertencias

Ninguna. La advertencia previa de cierre documental quedó resuelta en este archive; la re-verificación posterior la confirma PASS sin warnings (ver "Correcciones pre-commit" abajo).

## Correcciones pre-commit (registradas en re-verify)

Correcciones aplicadas tras el pre-PR review y consolidadas en el re-verify (PASS, 394/394 SUCCESS):

- **Strict id parsing**: la regex de `CertificationPreviewPage` acepta únicamente enteros decimales positivos; rechaza coercibles como `0x1` y `1e0`. `app.routes.spec.ts` y `certification-preview-page.spec.ts` cubren los casos rechazados y la normalización válida (` 1 `).
- **Dashboard fallback**: `admin-dashboard-page` consume `CERTIFICATIONS_SOURCE.contar()` (signal hidratado vía `contar().then()`) y, ante rechazo de la promesa, cae explícitamente a `0` para no propagar un contador roto al shell admin. `inject(CERTIFICATIONS_SOURCE, { optional: true })` protege el consumo fuera del árbol admin.
- **No-secrets check endurecido**: el spec negativo `__checks__/no-secrets.spec.ts` enumera métodos públicos, getters y constructores de las clases del feature más las funciones module-level puras (`seed`, `truncarUrl`) que contienen los literales del seed ficticio, evitando falsos negativos por literales que viven fuera de los cuerpos de clase. Las URLs mock display-only (`https://ifrm/...`) no se flaggean: lo prohibido son APIs HTTP de runtime (`HttpClient`/`fetch`/`XMLHttpRequest`), storage/cookies, admin keys y tokens/DNI completos.
- **Constante nombrada para truncado de URL**: la longitud de truncado de la URL pública (`publicValidationUrl`) deja de ser un literal disperso y pasa a una constante nombrada en el modelo/feature, citada en specs y tests. Esto fija el límite (60 chars) y deja un único punto de cambio si el ciclo siguiente redefine la política.

## Correcciones tras revisión pre-PR (registradas durante apply)

Correcciones aplicadas tras el pre-PR review sobre la rama `frontend/admin-certifications`:

- **Dashboard contaba fijo 6**: `admin-dashboard-page` ahora consume `CERTIFICATIONS_SOURCE.contar()` (signal hidratado vía `contar().then()`); spec nuevo afirma el conteo contra el servicio real para atrapar drift del seed. `inject(CERTIFICATIONS_SOURCE, { optional: true })` protege el consumo fuera del árbol admin.
- **Texto del design en conflicto con rutas**: `design.md` corregido: certificaciones va DESPUÉS de `cursos/*` (no antes), coincidiendo con `app.routes.ts` y `app.routes.spec.ts`. Los paths no solopan, por lo que el orden relativo es seguro y queda declarado.

## Límites de handoff a F4-01/F4-02/F5-01/F5-04/F6-01

Quedan excluidos de F2-06 y se delegan a ciclos posteriores: emisión real de certificados, generación de PDF/QR, entrega manual, revocación, listado real desde backend, integración HTTP, `X-Admin-Key`, claves admin temporales, backend, deploy, base de datos, `.htaccess`, material privado, auth real, cookies/`localStorage`/`sessionStorage`/IndexedDB, datos reales, DNI completo administrativo, tokens completos, emails, legajos, matrículas, credenciales demo de `muestra_pagina/`, Tailwind/shadcn/lucide/CVA, copia literal React/Next, y dependencias nuevas (`package.json`/lockfiles sin cambios). La sustitución real por `HttpCertificationsService` queda para un ciclo con sesión segura aprobada (PHP HttpOnly o equivalente). `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar.

## Artefactos archiveados

- `proposal.md` (3.0K)
- `specs/admin-certifications-frontend/spec.md` (3.3K, 4 ADDED)
- `specs/admin-foundation/spec.md` (3.4K, 4 MODIFIED)
- `design.md` (5.2K)
- `tasks.md` (6.4K, 19/19 tareas marcadas `[x]`)
- `verify-report.md` (7.9K, PASS, 394/394 SUCCESS)
- `archive-report.md` (este archivo)
- `exploration.md` (18.2K, referencia histórica)

## Fuera de alcance (no se tocaron)

- Runtime product: app Angular, servicios, componentes, build, bundle.
- Backend, deploy, base de datos, material privado, `package.json`, lockfiles.
- `openspec/changes/f2-06-admin-certifications/.atl/skill-registry.md` si existiera (drift tooling, fuera de alcance).
- Operaciones git (commit, push, branch, checkout). Cambio queda en la rama `frontend/admin-certifications` para revisión y merge posterior por Matías, fuera de este turno.

## Cierre del ciclo SDD

El ciclo F2-06 ha sido planificado, implementado, verificado y archivado en su totalidad. Las specs de source of truth (`openspec/specs/`) reflejan el comportamiento vigente. La documentación frontend (`docs/frontend/00-angular20-port-v0.md`) registra el estado F2-06, sus límites y el handoff a F4-01/F4-02/F5-01/F5-04/F6-01. La memoria persistente (Engram topic `sdd/f2-06-admin-certifications/archive-report`) preserva la trazabilidad del cierre. Listo para el próximo ciclo.
