# Archive Report — F2-04 — Cursos y fechas admin

## Resumen ejecutivo

Ciclo `f2-04-admin-courses-dates` archivado. UI administrativa Angular 20 para cursos y fechas entregada sobre rama `frontend/admin-courses-dates`. Implementación contract-ready con datos en memoria, sin HTTP, sin `X-Admin-Key`, sin storage, sin auth real. Verificación formal `PASS WITH WARNINGS` (sin issues críticos; advertencia de tamaño de revisión y tarea documental propia de `sdd-archive` que se cierra en este pase).

## Cambio

| Campo | Valor |
|---|---|
| Change | `f2-04-admin-courses-dates` |
| Rama | `frontend/admin-courses-dates` |
| Modo SDD | Standard (`Strict TDD: false`) |
| Artifact store | hybrid (OpenSpec + Engram) |
| PR strategy | single-pr with `size:exception` (aprobado por maintainer Matías, 2026-07-07) |
| Review budget | 1500 (excedido: ~3452 estimadas / ~3800 medición real; advertencia obligatoria) |
| Archive path | `openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/` |

## Especificaciones sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-courses-frontend` | **Creada** | Spec nueva copiada desde el delta del cambio. 4 requirements: `Rutas protegidas de cursos`, `UI contract-ready de cursos y fechas`, `Frontera segura sin datos reales ni red`, `Documentación y handoff`. |
| `admin-foundation` | **Modificada** | 4 requirements `MODIFIED`: `Rutas administrativas aisladas` (agrega `/admin/cursos*`), `Login y shell explícitamente simulados` (dashboard con handoff F2-04), `Shell accesible, responsive y alineado a F1-02` (estado activo para `/admin/cursos*`), `Documentación y límites de handoff` (cierre F2-04 y handoff F2-05..F2-06). Requirement `Sesión mock solo en memoria` preservado sin cambios. |

Cuentas: 0 added, 4 modified, 0 removed (en `admin-foundation`); 4 added (en `admin-courses-frontend`, spec nueva). Sin requisitos `REMOVED` ni `RENAMED` en este ciclo.

## Trazabilidad de artefactos (Engram observation IDs)

| Artefacto | Topic key | Observation ID |
|---|---|---:|
| Exploración | `sdd/f2-04-admin-courses-dates/explore` | #5225 |
| Propuesta | `sdd/f2-04-admin-courses-dates/proposal` | #5226 |
| Especificación | `sdd/f2-04-admin-courses-dates/spec` | #5227 |
| Diseño | `sdd/f2-04-admin-courses-dates/design` | #5228 |
| Tareas | `sdd/f2-04-admin-courses-dates/tasks` | #5233 |
| Apply progress (correctivo) | `sdd/f2-04-admin-courses-dates/apply-progress` | #5234 |
| Verify report | `sdd/f2-04-admin-courses-dates/verify-report` | #5243 |
| Hallazgo de diseño (route order) | (transversal) | #5229 |

## Estado de tareas

| Métrica | Valor |
|---|---:|
| Total | 24 |
| Completadas al archive | 24/24 |
| Incompletas al verify | 5.3, 5.4 (`sdd-archive` por diseño) |
| Reconciliación excepcional | 5.3 y 5.4 marcadas `[x]` por `sdd-archive` con prueba de finalización en este archive-report y en `verify-report.md` (PASS WITH WARNINGS) |

### Reconciliación excepcional de checkboxes (5.3, 5.4)

El `verify-report.md` ([archived](openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/verify-report.md)) declara 22/24 tareas completas y lista `5.3` y `5.4` como pendientes por diseño de fase (pertenecen a `sdd-archive`). El orquestador instruyó explícitamente a `sdd-archive` para:

1. Actualizar `docs/frontend/00-angular20-port-v0.md` con estado F2-04, exclusiones y handoff F2-05/F2-06.
2. Mover la carpeta a `openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/`.
3. Mergear deltas en `openspec/specs/admin-courses-frontend/spec.md` y `admin-foundation/spec.md`.

Las dos acciones se ejecutaron en este pase (ver "Trabajo de archive realizado" abajo) y la sección 5.1.1 de `tasks.md` con apply-progress #5234 prueba que el resto del trabajo de implementación está completo (`npm run test:ci` 239/239, `npm run build` OK). Por lo tanto la reconciliación de las casillas 5.3 y 5.4 es mecánica, está respaldada por el trabajo real y queda registrada en este archive report. La auditoría del SDD no queda con tareas abiertas para trabajo ya realizado.

## Verificación final

| Ítem | Resultado |
|---|---|
| `npm run test:ci` | ✅ 239/239 SUCCESS (Chrome Headless 149.0.0.0, `no-focused-tests: ok`) |
| `npm run build` | ✅ Verde (`Application bundle generation complete`; Initial total 306.01 kB raw / 88.57 kB transfer; lazy `course-editor-page` 12.03 kB, `courses-list-page` 8.03 kB, `course-detail-page` 7.27 kB) |
| Cobertura | ➖ No disponible. El proyecto no expone comando de cobertura en este ciclo. |
| Negative checks source (12 archivos no spec de `src/app/features/admin/courses`) | ✅ 0 matches para admin key/header literals, storage/cookies/IndexedDB, HTTP/fetch/HttpClient, campos DNI/token/email/alumno/student, emails y números DNI-like. |
| Negative checks dist (chunks admin courses) | ✅ 0 matches para los mismos patrones. |
| Negative checks dist completo | ⚠️ `main` conserva código público existente de validación (`documentNumber`/mock público y `HttpValidationSource`); fuera de alcance F2-04 y amparado por D0 público. |
| Spec compliance | 11/13 compliant; 2/13 partial por tareas documentales propias de archive (ahora cerradas en este pase). |
| Issues críticos | **None**. |
| Verdict | **PASS WITH WARNINGS**. |

## Tamaño de revisión y decisión previa al PR

| Control | Resultado |
|---|---|
| Budget | 1500 |
| Diff estimado | ~3452 líneas (3384 altas + 68 bajas; 564 tracked + 2820 untracked) |
| Diff real (post) | ~3800 líneas |
| Estado | ⚠️ Excedido |
| Decisión del maintainer | **`size:exception`** aprobada por Matías (2026-07-07), sin split. Pre-PR reviews no hallaron blockers CRITICAL tras corregir persistencia de quitas de fechas. |
| Acción para esta archive | Solo advertencia y registro de la decisión; el archive NO bloquea por tamaño ni toca el diff de runtime. La política de tamaño se aplicó en el gate de PR con excepción aprobada. |
| Evidencia OpenSpec | Permanece en el mismo PR salvo cambio posterior del maintainer. |

## Límites cumplidos (F2-04)

- ❌ Sin backend, deploy, base de datos, `.htaccess`, material privado.
- ❌ Sin auth real, `X-Admin-Key`, clave admin temporal en Angular.
- ❌ Sin cookies/`localStorage`/`sessionStorage`/IndexedDB.
- ❌ Sin HTTP/HttpClient/fetch/XMLHttpRequest desde el browser en el flujo admin courses.
- ❌ Sin datos reales, DNI, tokens, matrículas, emails.
- ❌ Sin credenciales demo de `muestra_pagina/`.
- ❌ Sin mocks de alumnos/asistencias/certificaciones (queda en F2-05/F2-06).
- ❌ Sin Tailwind, shadcn, lucide, CVA ni copia literal React/Next.
- ❌ Sin dependencias nuevas (`package.json`/lockfiles sin cambios).

## Handoff a F2-05 y F2-06

- `CursoFecha` y `InMemoryCoursesService` quedan reusables para F2-05 (asistencias) y F2-06 (certificaciones).
- Asistencias y Certificaciones siguen como placeholders deshabilitados en el dashboard y en el detalle del curso ("Próximamente: F2-05" / "F2-06").
- `HeaderInstitucional` raíz en `/admin/*` (tech debt documentado en F2-03) sigue sin refactorizar; queda para un ciclo posterior.
- Sustitución real por `HttpCoursesService` queda para un ciclo con sesión segura aprobada (PHP HttpOnly o equivalente).

## Trabajo de archive realizado

1. Merge del delta `admin-courses-frontend` → creado `openspec/specs/admin-courses-frontend/spec.md` con 4 requirements.
2. Merge del delta `admin-foundation` → 4 requirements `MODIFIED` aplicados en `openspec/specs/admin-foundation/spec.md`; `Sesión mock solo en memoria` preservado sin cambios.
3. Actualización de `docs/frontend/00-angular20-port-v0.md` con sección "Estado F2-04 — cursos y fechas admin (mock)" que documenta archivos creados/modificados, límites explícitos, evidencia de verificación (PASS WITH WARNINGS), advertencia de tamaño de revisión y handoff F2-05/F2-06.
4. Carpeta `openspec/changes/f2-04-admin-courses-dates/` movida a `openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/`. El directorio `openspec/changes/` activo queda vacío.
5. `tasks.md` archivado: checkboxes 5.3 y 5.4 reconciliados a `[x]` con la justificación registrada en este archive report (cumplido por el archive actual; apply-progress #5234 prueba el resto).
6. Persistencia de este archive report:
   - Archivo: `openspec/changes/archive/2026-07-07-f2-04-admin-courses-dates/archive-report.md`.
   - Engram: `sdd/f2-04-admin-courses-dates/archive-report` (observation ID se completa en la respuesta al orquestador).

## Contenido del archivo

- `proposal.md` ✅
- `exploration.md` ✅
- `design.md` ✅
- `specs/admin-courses-frontend/spec.md` ✅
- `specs/admin-foundation/spec.md` ✅ (delta)
- `tasks.md` ✅ (24/24 tareas marcadas; reconciliación excepcional documentada arriba)
- `verify-report.md` ✅
- `archive-report.md` ✅ (este archivo)

## Reglas respetadas

- `sdd-archive` solo tocó artefactos archive, spec, docs y el checkbox del archive en `tasks.md`. No modificó runtime product.
- No se ejecutaron operaciones Git (`git add`, `git commit`, `git push`, `git switch`, `git checkout`, `git branch`, PR, merge, rebase).
- No se tocaron backend/deploy/base/material privado/`.env*`/package/dependencias.
- No se imprimieron secretos, dumps, logs ni credenciales.
- Comentarios y artefactos en español argentino formal, concisos.
- `capture_prompt: false` en la persistencia Engram de este archive-report (artefacto automatizado del pipeline SDD).
