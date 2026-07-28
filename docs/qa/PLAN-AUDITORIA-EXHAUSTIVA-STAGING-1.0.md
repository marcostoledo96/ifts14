# Plan de auditoría exhaustiva — Staging 1.0

Guía de trabajo **sesión por sesión**. Cada fase tiene: objetivo, alcance, checklist, criterios de cierre y un **prompt listo para pegar** en Cursor/OpenCode.

> **Solo planificación y ejecución por fases.** No mezclar varias páginas en la misma rama salvo que la fase lo diga explícitamente.

---

## 0. Protocolo Git (obligatorio)

### Modelo de ramas

```txt
main                 → PRODUCCIÓN (estable). Solo merge desde staging1.0 cuando esté validado.
staging1.0           → Integración pre-producción. Acumula merges de ramas de auditoría/fix.
audit/<fase>-…       → Una rama por fase (o por página). Merge → staging1.0 vía PR.
fix/<bug>            → Correcciones puntuales detectadas fuera de una fase. Merge → staging1.0.
```

### Reglas

1. **No pushear ni mergear directo a `main`** durante esta auditoría.
2. Crear `staging1.0` desde `main` actualizado (una sola vez, al arrancar).
3. Cada fase trabaja en `audit/…` (o `fix/…`) **basada en `staging1.0` actualizado**.
4. Al cerrar la fase: PR → `staging1.0` (no a `main`). Diff revisable, checklist de la fase en la descripción.
5. Deploy a hosting staging (`/certificados_staging/`) sale de artefactos preparados desde `staging1.0`, no de `main`.
6. **Land a producción**: solo cuando el bloque de fases críticas esté verde en staging real → PR `staging1.0` → `main` con checklist QA completo.
7. Commit / push / merge solo con aprobación humana explícita (política del repo).
8. No stagear: secretos, `.env`, dumps, ZIPs de servidor, `.codegraph/`, `vendor/`, `dist/`.

### Comandos de arranque (una vez)

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b staging1.0
# push con aprobación: git push -u origin staging1.0
```

### Comandos por fase

```bash
git fetch origin
git checkout staging1.0
git pull origin staging1.0
git checkout -b audit/<id-fase>-<slug-corto>
# … trabajo …
# PR hacia staging1.0 (no main)
```

### Convención de nombres de rama

| Prefijo | Ejemplo | Uso |
|---|---|---|
| `audit/pNN-…` | `audit/p03-login-ui` | Fase de este plan |
| `audit/uNN-…` | `audit/u02-carga-bundles` | Fase universal |
| `fix/…` | `fix/asistencias-401-pdf` | Bug fuera de fase |

---

### Gate previo a cada PR (obligatorio)

Antes de **commit + push + abrir/actualizar PR** hacia `staging1.0`:

1. **4R Gentle-AI** (subagents en paralelo sobre el diff de la rama):
   - **R1 Risk** (`review-risk`)
   - **R2 Readability** (`review-readability`)
   - **R3 Reliability** (`review-reliability`)
   - **R4 Resilience** (`review-resilience`)
2. Corregir hallazgos **CRITICAL / WARNING introducidos** por la fase (los preexistentes → registro de diferidos).
3. **Tests del área en verde** (`ng test` con includes del módulo tocado; backend PHP si aplica).
4. Recién entonces pedir OK humano para commit/push/PR.

No abrir PR “para después revisar”: el gate es **antes** del PR (o, si el PR ya existía, push de follow-up antes de merge).

---

## 1. Cómo usar esta guía

### Ritmo de sesión

1. Elegí la siguiente fase **pendiente** (tabla de estado abajo).
2. Creá la rama desde `staging1.0`.
3. Pegá el **prompt de la fase** al agente.
4. El agente **audita → propone plan corto → implementa fixes en alcance → tests/checks**.
5. Vos revisás el diff; si OK, merge a `staging1.0`.
6. Marcá la fase como hecha en la tabla de estado (editar este archivo al cerrar).

### Reglas duras del producto (no negociables en ninguna fase)

- Token/QR **permanente**: actualizar certificado o regenerar PDF **no** rota token/QR.
- DNI **completo** en UI; logs/auditoría/errores **sin** DNI ni token completos.
- Auth admin: sesión PHP + CSRF. `X-Admin-Key` solo CLI/smokes.
- Paridad visual con `muestra_pagina/` (intención, no port React).
- Español argentino formal en copy de producto y docs.

### Lectura mínima por sesión (no leer todo el repo)

- `README.md`, `GUIA.md`, `docs/00-indice-general.md`
- Este plan (fase actual)
- Spec del módulo si existe en `openspec/specs/`
- `docs/frontend/03-modulos-admin.md` o `docs/backend/…` según el área
- Pantalla en `muestra_pagina/` equivalente (si aplica)
- Código de la página/ruta listada en la fase

### Definición de “hecho” de una fase

- [ ] Hallazgos listados (qué quedó fuera de alcance / deuda consciente)
- [ ] Fixes en alcance mergeados a `staging1.0`
- [ ] Tests del área verde o justificación
- [ ] Sin secretos ni PII en diffs
- [ ] PR con checklist de la fase
- [ ] Tabla de estado de este archivo actualizada

### Plantilla base de prompt (todas las fases la extienden)

```text
Contexto: repo ifts14. Rama base: staging1.0. Rama de trabajo: audit/<id>.
Modo: auditar + corregir SOLO el alcance de esta fase. No refactorizar fuera de alcance.
Respetar D0 (token permanente, DNI en UI, sin PII en logs), AGENTS.md, paridad con muestra_pagina/.
Al final: resumen de hallazgos, cambios hechos, tests corridos, ítems deferidos.
Commit/push/merge solo si yo lo pido explícitamente.
```

---

## 2. Inventario de superficies (páginas y shells)

### Público

| ID | Ruta | Archivos clave |
|---|---|---|
| PUB-01 | `/validar/:token` | `features/public-validation/` |
| PUB-02 | `/**` (404) | `features/not-found/` |
| PUB-03 | `/` → redirect login | `app.routes.ts` |

### Admin — shell y acceso

| ID | Ruta | Archivos clave |
|---|---|---|
| ADM-00 | Shell + sidebar | `admin-shell.*`, `sidebar-admin.*` |
| ADM-01 | `/admin/login` | `login-page.*`, `login-form.*` |
| ADM-02 | `/admin/dashboard` | `admin-dashboard-page.*` |
| ADM-03 | `/admin/guia` | `guide/admin-guide-page.*` |
| ADM-04 | `/admin/configuracion` | `institutional-config/pages/…` |

### Cursos

| ID | Ruta | Archivos clave |
|---|---|---|
| CUR-01 | `/admin/cursos` | `courses/courses-list-page.*` |
| CUR-02 | `/admin/cursos/nuevo` | `courses/course-editor-page.*` (create) |
| CUR-03 | `/admin/cursos/:id` | `courses/course-detail-page.*` |
| CUR-04 | `/admin/cursos/:id/editar` | `courses/course-editor-page.*` (edit) |

### Alumnos

| ID | Ruta | Archivos clave |
|---|---|---|
| ALU-01 | `/admin/alumnos` | `students/pages/list/…` |
| ALU-02 | `/admin/alumnos/nuevo` | `students/pages/new/…` (create) |
| ALU-03 | `/admin/alumnos/:id` | `students/pages/detail/…` |
| ALU-04 | `/admin/alumnos/:id/editar` | `students/pages/new/…` (edit) |

### Asistencias

| ID | Ruta | Archivos clave |
|---|---|---|
| ASI-01 | `/admin/asistencias` | `attendances/pages/list/…` |
| ASI-02 | `/admin/asistencias/curso/:id` | `attendances/pages/course-dates/…` |
| ASI-03 | `/admin/cursos/:id/fechas/:fechaId/asistencias` | `attendances/pages/marking/…` |
| ASI-04 | `…/asistencias/certificados` | `attendances/pages/date-certificates/…` |

### Certificaciones

| ID | Ruta | Archivos clave |
|---|---|---|
| CER-01 | `/admin/certificaciones` | `certifications/pages/list/…` |
| CER-02 | `/admin/certificaciones/nueva` | `certifications/pages/new/…` |
| CER-03 | `/admin/certificaciones/:id` | `certifications/pages/preview/…` |
| CER-04 | `/admin/certificaciones/:id/pdf` | `certifications/pages/pdf/…` |
| CER-05 | `/admin/certificaciones/:id/entrega` | `certifications/pages/delivery/…` |
| CER-06 | `/admin/certificaciones/:id/revocar` | `certifications/pages/revoke/…` |

### Capas universales (no son páginas)

| ID | Área |
|---|---|
| BE-* | Backend PHP (`apps/backend-php/`) |
| DB-* | Schema / migraciones (`database/`) |
| DEP-* | Deploy staging/prod (`docs/deploy/`, `deploy/`) |
| DOC-* | Documentación canónica (`docs/`) |
| PERF-* | Bundles, lazy load, N+1, payloads |
| SEC-* | Auth, CSRF, rate limit, PII, headers |
| QA-* | Tests, smokes, checklist manual |

---

## 3. Tabla de estado (actualizar al cerrar cada fase)

| Fase | Rama sugerida | Estado | PR → staging1.0 | Notas |
|---|---|---|---|---|
| P0 Setup ramas | `staging1.0` | hecha | — | Rama integración + flujo Git documentado |
| P1 Login | `audit/p01-login` | hecha | #86 | Mergeado a staging1.0 |
| P2 Shell / sidebar / nav | `audit/p02-shell-nav` | hecha | #87 | Mergeado a staging1.0 |
| P3 Dashboard | `audit/p03-dashboard` | hecha | #88 | Mergeado a staging1.0 |
| P4 Guía admin | `audit/p04-guia` | hecha | #89 | Mergeado a staging1.0 |
| P5 Config institucional | `audit/p05-config` | en PR | | 4R + 27/27 tests |
| P6 Cursos listado | `audit/p06-cursos-list` | pendiente | | |
| P7 Cursos editor | `audit/p07-cursos-editor` | pendiente | | |
| P8 Cursos detalle | `audit/p08-cursos-detail` | pendiente | | |
| P9 Alumnos listado | `audit/p09-alumnos-list` | pendiente | | |
| P10 Alumnos editor | `audit/p10-alumnos-editor` | pendiente | | |
| P11 Alumnos detalle | `audit/p11-alumnos-detail` | pendiente | | |
| P12 Asistencias hub | `audit/p12-asist-hub` | pendiente | | |
| P13 Asistencias fechas | `audit/p13-asist-fechas` | pendiente | | |
| P14 Asistencias marcado+emisión | `audit/p14-asist-marcado` | pendiente | | |
| P15 Certificados por fecha | `audit/p15-asist-certs` | pendiente | | |
| P16 Certificaciones listado | `audit/p16-certs-list` | pendiente | | |
| P17 Certificación nueva | `audit/p17-certs-nueva` | pendiente | | |
| P18 Expediente preview | `audit/p18-certs-preview` | pendiente | | |
| P19 Folio PDF | `audit/p19-certs-pdf` | pendiente | | |
| P20 Entrega manual | `audit/p20-certs-entrega` | pendiente | | |
| P21 Revocación | `audit/p21-certs-revocar` | pendiente | | |
| P22 Validación pública | `audit/p22-validacion` | pendiente | | |
| P23 404 / rutas huérfanas | `audit/p23-not-found` | pendiente | | |
| U1 Prolijidad código FE | `audit/u01-prolijidad-fe` | pendiente | | |
| U2 Carga / performance FE | `audit/u02-perf-fe` | pendiente | | |
| U3 Copy / redacción global | `audit/u03-copy` | pendiente | | |
| U4 Accesibilidad + responsive | `audit/u04-a11y-responsive` | pendiente | | |
| U5 Errores / estados vacíos | `audit/u05-estados-error` | pendiente | | |
| U6 Backend contrato + errores | `audit/u06-backend` | pendiente | | |
| U7 Seguridad + PII | `audit/u07-seguridad` | pendiente | | |
| U8 Docs + drift specs | `audit/u08-docs` | pendiente | | |
| U9 QA staging real + smokes | `audit/u09-qa-staging` | pendiente | | |
| L1 Land staging1.0 → main | PR release | pendiente | | Solo cuando estable |

Estados: `pendiente` · `en curso` · `en PR` · `hecha` · `diferida`

---

## 4. Lentes de auditoría (usar en TODA fase página)

Al auditar una página, recorrer siempre estas lentes:

### A. UI / UX

- Jerarquía visual, densidad, alineación, espaciado, estados hover/focus/disabled
- Flujo: ¿se entiende qué hacer después?
- Paridad con `muestra_pagina/` (igual o mejor; no portar React)
- Responsive: mobile / tablet / desktop sin romper tablas ni CTAs
- Loading, empty, error, success: visibles y recuperables

### B. Redacción (copy)

- Español argentino formal, tono institucional
- Etiquetas de botones/acciones claras (verbos)
- Mensajes de error accionables (“Reintentá”, qué falló)
- Sin jerga técnica en UI de operador (salvo IDs de expediente útiles)
- Consistencia de términos: Válida/Revocado, Activo/Inactivo, etc.

### C. Errores y robustez

- Catch de HTTP: 401 → login limpio; 403/404/409/429/5xx mensajes útiles
- Race conditions / loadGeneration / requests obsoletos
- Validación de IDs de ruta (`0`, `1e0`, no numéricos)
- No perder datos del form al fallar un submit

### D. Optimización de carga

- Llamadas HTTP innecesarias o duplicadas al entrar
- Overfetch / payloads grandes / N+1 en listados
- Imágenes (firmas, logos): tamaño, ratio, lazy si aplica
- Trabajo pesado en main thread (html2canvas/PDF) sin bloquear UI mal

### E. Prolijidad de código

- Archivos de la página: TS/HTML/CSS coherentes, sin muertos
- Duplicación obvia vs shared (solo extraer si hay 2+ usos claros)
- Comentarios útiles (no narrar lo obvio); nombres claros
- Specs alineados al comportamiento real
- Sin `any` injustificado, sin console.log de debug

### F. Documentación local

- ¿La ruta/comportamiento está reflejado en `docs/frontend/` o checklist QA?
- Si el fix cambia comportamiento visible → anotar para U8 / changelog

---

# BLOQUE A — Setup

## Fase P0 — Crear integración `staging1.0`

**Objetivo:** dejar el modelo de ramas operativo.

**Alcance:** solo Git/docs de flujo. Sin cambios de producto.

**Checklist**

- [ ] `main` actualizado
- [ ] Rama `staging1.0` creada y en remoto
- [ ] Este plan referenciado desde `docs/00-indice-general.md` (opcional en esta fase o en U8)
- [ ] Acuerdo de equipo: PRs → `staging1.0`; `main` = prod

**Prompt**

```text
Fase P0 del plan docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md.
Solo setup Git: verificar estado de main, proponer/crear rama staging1.0 desde main actualizado.
Actualizar docs/06-flujo-git-recomendado.md para documentar: main=producción, staging1.0=integración, ramas audit/* mergean a staging1.0.
No tocar código de producto. Commit solo si lo pido.
```

---

# BLOQUE B — Auditoría página por página

Cada fase: **una página (o par create/edit del mismo editor)**. Auditar con las 6 lentes → fix en alcance → PR a `staging1.0`.

---

## Fase P1 — Login (`/admin/login`)

**Rama:** `audit/p01-login`
**Archivos:** `login-page.*`, `login-form.*`, auth service/interceptor si el hallazgo lo exige (mínimo).

**Checklist**

- [ ] Copy, validación local, errores 401/429
- [ ] Focus al error, show/hide password, disabled mientras loading
- [ ] Branding / logos / footer año
- [ ] Redirect post-login a dashboard
- [ ] Sin credenciales demo hardcodeadas en UI
- [ ] Paridad `muestra_pagina/` login

**Prompt**

```text
Fase P1 — Login admin. Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md
Rama desde staging1.0: audit/p01-login.
Auditar y corregir SOLO /admin/login (login-page + login-form).
Lentes: UI/UX, copy, errores 401/429, a11y (focus error), prolijidad, paridad muestra_pagina/.
No tocar dashboard ni shell salvo bug bloqueante del login.
Entregar: hallazgos, fixes, tests login-*.spec, deferidos.
```

---

## Fase P2 — Shell, sidebar y navegación

**Rama:** `audit/p02-shell-nav`
**Archivos:** `admin-shell.*`, `sidebar-admin.*`, `admin-guard.ts`

**Checklist**

- [ ] Items de nav correctos y activos por ruta
- [ ] Logout limpio + CSRF
- [ ] Responsive sidebar / colapso
- [ ] Guard: sin sesión → login; con sesión no re-login loop
- [ ] Títulos / landmarks

**Prompt**

```text
Fase P2 — Shell admin + sidebar + guard.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p02-shell-nav desde staging1.0.
Auditar admin-shell, sidebar-admin, admin-guard.
Lentes: nav correcta, estado activo, logout, responsive, a11y, copy de menú, prolijidad.
No reescribir features hijas. Fix solo shell/nav/guard.
```

---

## Fase P3 — Dashboard

**Rama:** `audit/p03-dashboard`
**Ruta:** `/admin/dashboard`

**Checklist**

- [ ] CTAs / instructivo coherentes con flujo real (cursos → asistencias → certs)
- [ ] Métricas o placeholders: no mentir datos
- [ ] Loading/error
- [ ] Links rotos
- [ ] Densidad vs `muestra_pagina/`

**Prompt**

```text
Fase P3 — Dashboard admin (/admin/dashboard).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p03-dashboard.
Auditar y fix admin-dashboard-page (ts/html/css) + specs.
Lentes: UI/UX, copy instructivo, links, estados carga/error, paridad muestra_pagina/, prolijidad.
No cambiar APIs salvo bug evidente de mapping en esta página.
```

---

## Fase P4 — Guía de flujo (`/admin/guia`)

**Rama:** `audit/p04-guia`

**Checklist**

- [ ] Pasos alineados al flujo real actual (asistencias → emisión, no flujos obsoletos)
- [ ] Redacción clara para bedelía
- [ ] Links a pantallas correctas

**Prompt**

```text
Fase P4 — Guía admin (/admin/guia).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p04-guia.
Auditar admin-guide-page. Verificar que el instructivo refleje el flujo real (cursos, fechas, asistencias, emisión, entrega, validación pública). Corregir copy desactualizado y links.
Sin cambios de backend.
```

---

## Fase P5 — Configuración institucional

**Rama:** `audit/p05-config`
**Ruta:** `/admin/configuracion`

**Checklist**

- [ ] Textos institucionales, preview firmas ratio 3:2
- [ ] Upload/validación imagen; mensajes de error
- [ ] Persistencia y feedback de guardado
- [ ] No exponer paths de servidor ni secretos

**Prompt**

```text
Fase P5 — Configuración institucional.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p05-config.
Auditar institutional-config-page + servicio HTTP asociado solo si el bug es de esta pantalla.
Lentes: UI firmas 3:2, copy, errores upload, loading/save, prolijidad, a11y formularios.
No rotar claves ni tocar deploy.
```

---

## Fase P6 — Cursos · listado

**Rama:** `audit/p06-cursos-list`
**Ruta:** `/admin/cursos`

**Checklist**

- [ ] Filtros Activo/Inactivo coherentes con API
- [ ] Métricas columnas (alumnos presentes, certificaciones) no en “—” injustificado
- [ ] Paginación, vacío, error, búsqueda
- [ ] Copy estados

**Prompt**

```text
Fase P6 — Listado de cursos (/admin/cursos).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p06-cursos-list.
Auditar courses-list-page + mapping HttpCoursesService si métricas/estados fallan.
Lentes: UI filtros/métricas, copy estados, errores, carga duplicada, prolijidad.
No rediseñar el editor ni el detalle en esta fase.
```

---

## Fase P7 — Cursos · editor (nuevo / editar)

**Rama:** `audit/p07-cursos-editor`
**Rutas:** `/admin/cursos/nuevo`, `/admin/cursos/:id/editar`

**Checklist**

- [ ] Validaciones, fechas del curso, estados
- [ ] Mensajes 400 de negocio entendibles
- [ ] Modo create vs edit sin fugas de estado
- [ ] UX de agregar/quitar fechas

**Prompt**

```text
Fase P7 — Editor de cursos (nuevo + editar).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p07-cursos-editor.
Auditar course-editor-page en ambos modos.
Lentes: formularios, validación, copy, errores API, UX fechas, prolijidad.
No tocar listado salvo link roto hacia el editor.
```

---

## Fase P8 — Cursos · detalle

**Rama:** `audit/p08-cursos-detail`
**Ruta:** `/admin/cursos/:id`

**Checklist**

- [ ] Datos del curso, accesos a asistencias/fechas
- [ ] Estados vacíos
- [ ] IDs inválidos → error claro

**Prompt**

```text
Fase P8 — Detalle de curso (/admin/cursos/:id).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p08-cursos-detail.
Auditar course-detail-page. Lentes UI/UX, copy, errores id inválido, links a asistencias/edición, carga.
```

---

## Fase P9 — Alumnos · listado

**Rama:** `audit/p09-alumnos-list`
**Ruta:** `/admin/alumnos`

**Checklist**

- [ ] DNI completo visible; filtros email/cert
- [ ] Métricas certificaciones / cursos
- [ ] Paginación, vacíos, QA toggles solo en dev
- [ ] Copy “Contacto disponible” / etc.

**Prompt**

```text
Fase P9 — Listado alumnos (/admin/alumnos).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p09-alumnos-list.
Auditar students-list-page + mapping HttpStudentsService si métricas fallan.
DNI completo en UI. Sin PII en logs. Lentes UI/filtros/copy/errores/carga/prolijidad.
```

---

## Fase P10 — Alumnos · editor

**Rama:** `audit/p10-alumnos-editor`
**Rutas:** `/admin/alumnos/nuevo`, `/admin/alumnos/:id/editar`

**Checklist**

- [ ] Validación DNI/email/nombre
- [ ] Errores duplicado / 409
- [ ] create vs edit

**Prompt**

```text
Fase P10 — Editor alumnos (nuevo/editar).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p10-alumnos-editor.
Auditar student-editor-page. Formularios, copy, errores negocio, a11y, prolijidad.
```

---

## Fase P11 — Alumnos · detalle

**Rama:** `audit/p11-alumnos-detail`
**Ruta:** `/admin/alumnos/:id`

**Checklist**

- [ ] Trayectoria cursos + estados cert
- [ ] Links a expediente
- [ ] Métricas válidas/revocadas
- [ ] Id inválido

**Prompt**

```text
Fase P11 — Detalle alumno (/admin/alumnos/:id).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p11-alumnos-detail.
Auditar student-detail-page. Verificar métricas/cursos[]/links a certificaciones. Lentes completas.
```

---

## Fase P12 — Asistencias · hub

**Rama:** `audit/p12-asist-hub`
**Ruta:** `/admin/asistencias`

**Checklist**

- [ ] Listado cursos con métricas de fechas
- [ ] Búsqueda, paginación, vacío
- [ ] Performance del hub (evitar trabajo O(n²) innecesario en cliente si se puede simplificar sin cambiar contrato)

**Prompt**

```text
Fase P12 — Hub asistencias (/admin/asistencias).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p12-asist-hub.
Auditar attendances-list-page. UI/métricas/copy/errores/carga/prolijidad. No rediseñar marcado.
```

---

## Fase P13 — Asistencias · fechas del curso

**Rama:** `audit/p13-asist-fechas`
**Ruta:** `/admin/asistencias/curso/:id`

**Checklist**

- [ ] Orden cronológico
- [ ] Filtros programada/realizada
- [ ] Links a marcado
- [ ] Curso inexistente

**Prompt**

```text
Fase P13 — Fechas por curso (asistencias).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p13-asist-fechas.
Auditar attendance-course-dates-page. Orden cronológico, filtros, copy, errores, links.
```

---

## Fase P14 — Asistencias · marcado y emisión

**Rama:** `audit/p14-asist-marcado`
**Ruta:** `/admin/cursos/:id/fechas/:fechaId/asistencias`

**Checklist**

- [ ] Marcar presentes/ausentes; guardar
- [ ] Emitir / regenerar PDF **en serie** (no 401 por session lock)
- [ ] Mensajes 400 (fecha futura/programada, sin presentes)
- [ ] Token no rota al regenerar
- [ ] Feedback UX claro post-emisión

**Prompt**

```text
Fase P14 — Marcado de asistencias + emisión (CRÍTICA).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p14-asist-marcado.
Auditar attendance-marking-page + http-attendance relacionados al flujo de esta pantalla.
Reglas: no rotar token/QR; emisión/regenerar en serie si hace falta evitar 401; mensajes de negocio claros.
Lentes UI/UX, copy, errores 400/401/409, carga, prolijidad. Tests del área.
```

---

## Fase P15 — Certificados por fecha

**Rama:** `audit/p15-asist-certs`
**Ruta:** `…/asistencias/certificados`

**Checklist**

- [ ] Listado coherente con emitidos
- [ ] Links a expediente / PDF / entrega
- [ ] Vacíos

**Prompt**

```text
Fase P15 — Listado certificados por fecha de curso.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p15-asist-certs.
Auditar date-certificates-page. Links, estados, copy, errores, prolijidad.
```

---

## Fase P16 — Certificaciones · listado

**Rama:** `audit/p16-certs-list`
**Ruta:** `/admin/certificaciones`

**Checklist**

- [ ] Filtros vigente/revocado + curso + texto
- [ ] DNI en listado según política
- [ ] Paginación, vacíos, labels “Válida”/“Revocado”

**Prompt**

```text
Fase P16 — Listado certificaciones.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p16-certs-list.
Auditar certifications-list-page. Filtros, copy estados, UI, errores, carga, prolijidad.
```

---

## Fase P17 — Certificación · nueva

**Rama:** `audit/p17-certs-nueva`
**Ruta:** `/admin/certificaciones/nueva`

**Checklist**

- [ ] Flujo de emisión manual vs atajos desde asistencias
- [ ] Validaciones y errores
- [ ] ¿Sigue siendo necesaria la pantalla o hay copy confuso? Documentar hallazgo

**Prompt**

```text
Fase P17 — Nueva certificación.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p17-certs-nueva.
Auditar certification-new-page. Claridad del flujo vs emisión desde asistencias, copy, errores, UI.
Si la pantalla está obsoleta parcialmente, proponer ajuste mínimo (no eliminar sin acuerdo).
```

---

## Fase P18 — Expediente / preview

**Rama:** `audit/p18-certs-preview`
**Ruta:** `/admin/certificaciones/:id`

**Checklist**

- [ ] Datos, firmas preview reales (no SVG placeholder si hay imagen)
- [ ] Acciones: PDF, entrega, revocar
- [ ] Estado revocado visible
- [ ] URL validación truncada en UI; token no completo

**Prompt**

```text
Fase P18 — Expediente certificación (preview).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p18-certs-preview.
Auditar certification-preview-page. Firmas desde config, acciones, copy, D0 (no token completo), UI, errores.
```

---

## Fase P19 — Folio PDF

**Rama:** `audit/p19-certs-pdf`
**Ruta:** `/admin/certificaciones/:id/pdf`

**Checklist**

- [ ] Folio A4 print 1 página; firmas 3:2
- [ ] QR apunta a URL canónica completa
- [ ] Descarga filename semántico
- [ ] Sin disclaimers/textos no deseados en pie
- [ ] Revocado marcado
- [ ] Performance html2canvas aceptable

**Prompt**

```text
Fase P19 — Folio PDF (CRÍTICA).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p19-certs-pdf.
Auditar certification-pdf-preview-page (ts/html/css).
Print A4 una página, firmas 3:2, QR canónico, copy del folio, descarga, prolijidad, carga de imágenes.
No rotar token. No reintroducir textos institucionales no deseados en el PDF.
```

---

## Fase P20 — Entrega manual

**Rama:** `audit/p20-certs-entrega`
**Ruta:** `/admin/certificaciones/:id/entrega`

**Checklist**

- [ ] Copiar link / descargar PDF o QR
- [ ] 409 TOKEN_NOT_RECOVERABLE mensaje operable
- [ ] No rotar token al “reenviar”/regenerar vista
- [ ] Copy claro para bedelía

**Prompt**

```text
Fase P20 — Entrega manual (CRÍTICA).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p20-certs-entrega.
Auditar certification-delivery-page + contrato entrega-manual si mensajes fallan.
D0 token permanente. UX copiar/descargar. Errores 409 claros sin filtrar secretos.
```

---

## Fase P21 — Revocación

**Rama:** `audit/p21-certs-revocar`
**Ruta:** `/admin/certificaciones/:id/revocar`

**Checklist**

- [ ] Confirmación explícita
- [ ] Copy de consecuencias
- [ ] Estado posterior en expediente y validación pública
- [ ] Auditoría sin PII completa

**Prompt**

```text
Fase P21 — Revocación.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p21-certs-revocar.
Auditar certification-revoke-page. Confirmación, copy, errores, efecto en UI, prolijidad. D0.
```

---

## Fase P22 — Validación pública

**Rama:** `audit/p22-validacion`
**Ruta:** `/validar/:token`

**Checklist**

- [ ] Válida vs revocada
- [ ] Sin datos de más; DNI según política pública acordada
- [ ] Token inválido / no encontrado
- [ ] Responsive, trust/branding
- [ ] No filtrar stack traces

**Prompt**

```text
Fase P22 — Validación pública (/validar/:token).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p22-validacion.
Auditar public-validation-page + API pública consumida.
Lentes UI/UX, copy, errores token, a11y, carga, prolijidad, seguridad de respuesta.
Paridad muestra_pagina/ validación.
```

---

## Fase P23 — 404 y rutas huérfanas

**Rama:** `audit/p23-not-found`

**Checklist**

- [ ] `NotFoundPage` clara
- [ ] `/admin/typo` no cae en validación pública
- [ ] Links “volver” sensatos

**Prompt**

```text
Fase P23 — 404 y aislamiento de rutas.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p23-not-found.
Auditar not-found-page y catch-all admin en app.routes.ts. Copy, UI, redirects seguros.
```

---

# BLOQUE C — Fases universales (después de páginas críticas, o intercaladas)

Hacer **después** de P14–P22 al menos en primer pase, o en paralelo solo si no pisan los mismos archivos.

---

## Fase U1 — Prolijidad de código frontend

**Rama:** `audit/u01-prolijidad-fe`

**Alcance transversal FE (sin rediseñar UX):**

- Código muerto, imports unused, comentarios obsoletos “ponytail” ya resueltos
- Duplicación de formatters de fecha / paginadores (extraer solo si reduce riesgo)
- Specs rotos o que testean mocks irrelevantes
- Consistencia OnPush / signals

**Prompt**

```text
Fase U1 — Prolijidad FE transversal.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u01-prolijidad-fe desde staging1.0.
Barrido quirúrgico: dead code, imports, duplicación obvia de helpers, comentarios obsoletos, specs desalineados.
NO cambiar copy/UI salvo lo necesario por rename interno. Diff chico y revisable. Listar deferidos.
```

---

## Fase U2 — Optimización de carga (FE + contrato)

**Rama:** `audit/u02-perf-fe`

**Checklist**

- [ ] Lazy routes OK (ya loadComponent; verificar bundles pesados html2canvas/jspdf)
- [ ] Hub asistencias: tamaño payload / procesamiento cliente
- [ ] Listados: ¿traer todo y filtrar en cliente escala? Documentar límite y mitigación
- [ ] Firmas/logos cacheables
- [ ] Evitar double-fetch al navegar

**Prompt**

```text
Fase U2 — Performance / carga.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u02-perf-fe.
Medir/inspectar: bundles admin, hub asistencias, listados, PDF.
Proponer e implementar mejoras de bajo riesgo (dedupe fetch, lazy de deps pesadas, menos trabajo sync).
Si hace falta cambio de API, documentarlo y limitar el fix; no rediseñar el modelo entero.
```

---

## Fase U3 — Redacción global (glosario + pass)

**Rama:** `audit/u03-copy`

**Checklist**

- [ ] Glosario único: Válida/Revocado, Activo/Inactivo, Programada/Realizada, expediente, entrega manual
- [ ] Pass de strings visibles inconsistentes entre páginas
- [ ] Tono institucional AR

**Prompt**

```text
Fase U3 — Redacción / copy global.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u03-copy.
Crear glosario breve en el PR (o en docs/frontend/) y unificar etiquetas/mensajes inconsistentes en UI admin+pública.
Sin cambios de lógica de negocio. Español argentino formal.
```

---

## Fase U4 — Accesibilidad y responsive global

**Rama:** `audit/u04-a11y-responsive`

**Checklist**

- [ ] Focus visible, labels, contraste básico
- [ ] Tablas admin en mobile (scroll/stack)
- [ ] Modales/confirmaciones usables con teclado
- [ ] Login + validación pública + shell prioritarios si quedó deuda

**Prompt**

```text
Fase U4 — a11y + responsive transversal.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u04-a11y-responsive.
Auditar breakpoints y a11y en shell, listados y formularios críticos. Fixes CSS/HTML/atributos; sin rediseño visual grande.
```

---

## Fase U5 — Estados de error / vacío / loading unificados

**Rama:** `audit/u05-estados-error`

**Checklist**

- [ ] Patrones repetidos de error+reintentar
- [ ] 401 interceptor: redirect limpio (regresión)
- [ ] Empty states con CTA útil
- [ ] QA vista forzada solo en dev

**Prompt**

```text
Fase U5 — Estados loading/empty/error.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u05-estados-error.
Unificar mensajes/patrones inconsistentes entre listados. Verificar interceptor 401. No inventar design system nuevo: alinear a lo existente.
```

---

## Fase U6 — Backend (contrato, errores, prolijidad)

**Rama:** `audit/u06-backend`

**Alcance:** `apps/backend-php/` endpoints admin + público usados por las pantallas.

**Checklist**

- [ ] Envelope `data/meta` consistente
- [ ] Códigos/mensajes 400/409 alineados a UI
- [ ] session_write_close / locks en rutas sensibles
- [ ] **D-009:** TTL idle/absolute reales (`admin_session_idle_seconds` / `absolute`) vs config staging; `lastSeen` se renueva en lecturas auth (`GET /admin/auth/session` y GETs autorizados), no solo en mutaciones
- [ ] Sin PII en logs
- [ ] Tests PHP del área tocada

**Prompt**

```text
Fase U6 — Backend PHP auditoría.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u06-backend.
Auditar endpoints usados por admin y validación pública: contrato, mensajes, auth/CSRF, PII en logs, prolijidad.
Incluir D-009 (sesión ~30 min en staging QA): verificar TTL config vs código y renovación de lastSeen.
Fixes de bajo riesgo. No rotar encryption keys. No cambiar semántica de token permanente.
```

---

## Fase U7 — Seguridad y privacidad

**Rama:** `audit/u07-seguridad`

**Checklist**

- [ ] CSRF en mutaciones
- [ ] Rate limit login
- [ ] **D-009:** política de sesión admin documentada y aplicada (idle ≥ jornada operativa esperada; absolute acotado; cookie Secure/HttpOnly/SameSite; sin sorpresa ~30 min si el producto promete 4 h)
- [ ] Bloqueo path traversal / exposición `src/`
- [ ] Headers / cookies Secure/HttpOnly según entorno
- [ ] DNI/token nunca en logs ni en URLs de analytics
- [ ] `__checks__/no-secrets` / no-real-data verdes

**Prompt**

```text
Fase U7 — Seguridad + PII.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u07-seguridad.
Revisión: CSRF, sesión (D-009 TTL idle/absolute), rate limit, exposición de archivos, PII en logs/respuestas de error, checks no-secrets.
Corregir hallazgos P0/P1. Documentar P2 diferidos.
```

---

## Fase U8 — Documentación y drift

**Rama:** `audit/u08-docs`

**Checklist**

- [ ] `docs/06-flujo-git` refleja staging1.0 / main=prod
- [ ] `03-modulos-admin`, checklist QA, changelog viñeta si hubo cambios visibles acumulados
- [ ] Specs `openspec/specs/` vs comportamiento real (nota de drift, no reescribir todo)
- [ ] Índice enlaza este plan
- [ ] Nada de secretos/dumps

**Prompt**

```text
Fase U8 — Documentación.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/u08-docs.
Actualizar docs canónicas para reflejar flujo Git (main=prod, staging1.0=integración), mapa admin, checklist QA, enlace a este plan en 00-indice-general.md.
Español argentino formal. Sin dumps ni secretos. Listar drift de specs sin obligatoriedad de cerrarlo todo.
```

---

## Fase U9 — QA en staging real + smokes

**Rama:** `audit/u09-qa-staging` (o solo checklist sin código)

**Checklist** (basada en `docs/qa/CHECKLIST-TESTING-MANUAL.md`)

- [ ] Health API
- [ ] Login local + staging
- [ ] Flujo completo: curso → fecha → asistencia → emitir → PDF → entrega → validar QR
- [ ] Revocar → validación muestra revocado
- [ ] Regenerar PDF no cambia token
- [ ] Idle/sesión 401 limpio
- [ ] **D-009:** en staging real, sesión **no** debe caer ~30 min de uso/idle corta si la config es 14400/28800; repro con reloj y evidencia sin PII (hora login → hora 401)
- [ ] Smokes CLI si existen

**Prompt**

```text
Fase U9 — QA staging real.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md.
Ejecutar/guiar checklist docs/qa/CHECKLIST-TESTING-MANUAL.md contra staging.
Incluir D-009: comprobar que la sesión no cae ~30 min si idle/absolute son 14400/28800.
Registrar evidencias sin PII (IDs, no DNI/token completos). Abrir fix/* solo para fallos bloqueantes → merge a staging1.0.
No mergear a main en esta fase.
```

---

# BLOQUE D — Cierre a producción

## Fase L1 — Land `staging1.0` → `main`

**Condiciones de entrada (todas):**

- [ ] Fases críticas hechas: P14, P19, P20, P21, P22, U7, U9
- [ ] Staging hosting verde en flujo completo
- [ ] Sin P0 abiertos
- [ ] Artefacto de deploy preparado y probado
- [ ] Aprobación humana explícita de Marcos

**Prompt**

```text
Fase L1 — Release a producción (SOLO planificación de PR y checklist).
No pushear a main sin mi OK explícito.
Preparar resumen de lo integrado en staging1.0, riesgos, checklist de rollback, y el cuerpo del PR staging1.0 → main.
Seguir docs/deploy/. No incluir secretos.
```

---

## 5. Orden recomendado de sesiones

### Oleada 1 — Fundaciones

1. P0 Setup
2. P1 Login → P2 Shell → P3 Dashboard → P4 Guía → P5 Config

### Oleada 2 — Maestros

3. P6–P8 Cursos
4. P9–P11 Alumnos

### Oleada 3 — Núcleo de negocio (prioridad máxima)

5. P12–P15 Asistencias
6. P16–P21 Certificaciones
7. P22 Validación pública → P23 404

### Oleada 4 — Universal

8. U5 Errores → U3 Copy → U4 a11y → U1 Prolijidad → U2 Perf
9. U6 Backend → U7 Seguridad → U8 Docs
10. U9 QA staging
11. L1 → `main` cuando esté estable

Podés adelantar U7 si aparece un hallazgo de seguridad en cualquier fase página (abrir `fix/` o rama U7 temprana).

---

## 6. Plantilla de PR hacia `staging1.0`

```markdown
## Summary
- Fase: Pxx / Uxx — <título>
- Hallazgos principales:
- Fixes aplicados:

## Test plan
- [ ] Specs del área
- [ ] Smoke manual de la ruta
- [ ] Sin secretos / sin PII en diff
- [ ] D0 respetado (si toca certificados)

## Fuera de alcance / diferido
- …
```

---

## 7. Registro de diferidos (llenar durante la auditoría)

| ID | Fase origen | Hallazgo | Severidad | Destino sugerido |
|---|---|---|---|---|
| D-001 | P1 | Aside “SHA-256 / SSL” cosmético | P3 | U3 / dejar |
| D-002 | P1/R4 | `session()` autenticado sin CSRF en cliente | — | **Cerrado en P2** |
| D-003 | P1/R4 | Guard `session()` falla post-login → bounce silencioso | P2 | Mitigado por D-002; toast queda U5 |
| D-004 | P1/R4 | Backend 429 por fallo de storage de rate-limit | P2 | U6 |
| D-005 | P1/R4 | Clave limpiada antes de conocer resultado (reintento red) | P3 | U5 |
| D-006 | P2 | Guía (`/admin/guia`) solo desde dashboard, no en sidebar | — | **Cerrado en P4** (by design: instructivo, no módulo operativo; TOC en la propia guía) |
| D-007 | P3 | Pasos del instructivo no son links (solo CTA a guía) | P3 | producto |
| D-008 | P3/R4 | `conTimeout` no aborta HTTP; reintento puede apilar requests | P2 | U2 / seams con AbortSignal |
| D-009 | QA staging (`main`) | Sesión admin se cae ~**30 min** en `certificados-qa…/certificados_staging/admin/login` (reportado 2026-07-28). Código/ejemplo esperan idle **14400** (4 h) y absolute **28800** (8 h) vía `admin_session_*` + `AdminSessionAuth::sessionIsActive`. Hipótesis a probar: config staging con TTL corto; `lastSeen` no refresca en `GET /admin/auth/session` (solo en `authorize`); GC/cookie del hosting. | **P1** | **U6** (TTL + `lastSeen`) → **U7** (política sesión) → **U9** (repro staging) |

Severidad: `P0` bloquea staging · `P1` debe ir antes de L1 · `P2` puede diferir · `P3` nice-to-have

---

## 8. Referencias rápidas

| Tema | Doc |
|---|---|
| Índice | `docs/00-indice-general.md` |
| Git | `docs/06-flujo-git-recomendado.md` (actualizar en P0/U8) |
| Módulos admin | `docs/frontend/03-modulos-admin.md` |
| Checklist manual | `docs/qa/CHECKLIST-TESTING-MANUAL.md` |
| Deploy staging | `docs/deploy/01-staging-cpanel-certificados.md` |
| Roadmap producto | `docs/04-roadmap.md` |
| Referencia visual | `muestra_pagina/` |
| Optimización tokens agentes | `docs/opencode/optimizacion-tokens.md` |

---

*Documento vivo: actualizar la tabla de estado y el registro de diferidos al cerrar cada sesión.*
