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

## 0.1 Protocolo SDD Gentle-AI (obligatorio desde P8)

A partir de **P8** (y todas las fases pendientes), cada fase se ejecuta como **un ciclo Spec-Driven Development** con Gentle-AI / subagents `sdd-*`, store **`openspec/`** del repo. No improvisar fixes “a ojo” sin artifacts del cambio activo.

### Ciclo por fase (orden fijo)

```txt
sdd-explore → sdd-propose → sdd-spec → sdd-design → sdd-tasks
    → sdd-apply → gate 4R + tests → (OK humano) commit/push/PR
    → sdd-verify → sdd-archive
```

| Paso | Qué produce | Notas |
|---|---|---|
| `sdd-explore` | `openspec/changes/<change>/explore.md` | Alcance = checklist de la fase; leer spec canónica si existe |
| `sdd-propose` | `proposal.md` | Objetivo, fuera de alcance, riesgo, reversión |
| `sdd-spec` | `specs/…/spec.md` | Requirements + escenarios Given/When/Then |
| `sdd-design` | `design.md` | Decisiones técnicas mínimas |
| `sdd-tasks` | `tasks.md` | Tareas numeradas, una sesión |
| `sdd-apply` | código + `apply-progress.md` | Solo lo listado en tasks |
| Gate 4R + tests | — | Igual que § «Gate previo a cada PR» |
| `sdd-verify` | `verify-report.md` | Tras apply (+ preferible tras PR verde) |
| `sdd-archive` | archive + specs canónicas si cambió contrato | Cierre del cambio |

### Convención de nombre del cambio

```txt
audit-pNN-<slug>     ej. audit-p08-cursos-detail
audit-uNN-<slug>     ej. audit-u06-backend
```

Carpeta activa: `openspec/changes/<change>/` (un cambio a la vez).

### Orquestación en Cursor

1. Rama `audit/…` desde `staging1.0`.
2. Invocar subagents `sdd-*` en orden (o `gentle-ai sdd-continue` para el siguiente paso).
3. Artefactos SDD en **español argentino formal** (convención del repo); código sigue el estilo existente.
4. Spec canónica del módulo (`openspec/specs/…`) se actualiza en **archive** si el contrato cambió.
5. El prompt de cada fase (abajo) **incluye** el ciclo SDD; no sustituye el gate 4R.

### Excepciones (no saltan el ciclo)

- Typo / copy de una línea ya cubierta por el change activo: se puede incluir en el mismo `sdd-apply`.
- Hotfix de producción fuera de auditoría: rama `fix/…` + ciclo SDD corto si el cambio no es trivial.

Fases **P0–P7** ya mergeadas quedan como historial sin re-abrir SDD.

---

## 1. Cómo usar esta guía

### Ritmo de sesión

1. Elegí la siguiente fase **pendiente** (tabla de estado abajo).
2. Creá la rama desde `staging1.0`.
3. Pegá el **prompt de la fase** al agente (incluye ciclo SDD).
4. El agente corre **SDD completo** del alcance → apply → tests → **4R** → pide OK para PR.
5. Vos revisás el diff; si OK, merge a `staging1.0`.
6. El agente cierra con **sdd-verify** + **sdd-archive** (puede ir en el mismo PR o follow-up docs).
7. Marcá la fase como hecha en la tabla de estado.

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

- [ ] Ciclo SDD Gentle-AI completo (explore→…→apply; verify+archive al cerrar)
- [ ] Hallazgos listados (qué quedó fuera de alcance / deuda consciente)
- [ ] Fixes en alcance mergeados a `staging1.0`
- [ ] Tests del área verde o justificación
- [ ] Gate 4R sin CRITICAL/WARNING introducidos sin resolver
- [ ] Sin secretos ni PII en diffs
- [ ] PR con checklist de la fase + link al change `openspec/changes/…`
- [ ] Tabla de estado de este archivo actualizada

### Plantilla base de prompt (todas las fases la extienden)

```text
Contexto: repo ifts14. Rama base: staging1.0. Rama de trabajo: audit/<id>.
Cambio SDD: openspec/changes/audit-<id>/ (Gentle-AI, un change a la vez).
Modo: ciclo SDD obligatorio — explore → propose → spec → design → tasks → apply.
Luego gate 4R + tests del área. No refactorizar fuera de alcance.
Artefactos SDD en español argentino formal. Specs Given/When/Then.
Respetar D0 (token permanente, DNI en UI, sin PII en logs), AGENTS.md, paridad con muestra_pagina/.
Al final: resumen de hallazgos, cambios, tests, diferidos; verify+archive al cerrar la fase.
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
| P5 Config institucional | `audit/p05-config` | hecha | #90 | Mergeado a staging1.0 |
| P6 Cursos listado | `audit/p06-cursos-list` | hecha | #91 | Mergeado a staging1.0 |
| P7 Cursos editor | `audit/p07-cursos-editor` | hecha | #92 | Mergeado a staging1.0 |
| P8 Cursos detalle | `audit/p08-cursos-detail` | hecha | #93 | Mergeado a staging1.0 |
| P9 Alumnos listado | `audit/p09-alumnos-list` | hecha | #94 | Mergeado a staging1.0; archive `2026-07-28-audit-p09-alumnos-list` |
| P10 Alumnos editor | `audit/p10-alumnos-editor` | hecha | #95 | Mergeado a staging1.0; archive `2026-07-29-audit-p10-alumnos-editor`; HTTP 409 update omitido |
| P11 Alumnos detalle | `audit/p11-alumnos-detail` | hecha | #96 | Mergeado a staging1.0; archive `2026-07-29-audit-p11-alumnos-detail`; verify PASS WITH WARNINGS |
| P12 Asistencias hub | `audit/p12-asist-hub` | hecha | #97 | Mergeado a staging1.0 (`dae9026`); archive `2026-07-29-audit-p12-asist-hub`; índice lineal + HTTP one-pass |
| P13 Asistencias fechas | `audit/p13-asist-fechas` | hecha | #98 | Mergeado a staging1.0 (`dca5690`); archive `2026-07-29-audit-p13-asist-fechas`; verify PASS WITH WARNINGS |
| P14 Asistencias marcado+emisión | `audit/p14-asist-marcado` | hecha | #99 | Mergeado a staging1.0 (`7e6ff10`); archive `2026-07-29-audit-p14-asist-marcado`; verify PASS WITH WARNINGS; smoke staging 4.4 pendiente |
| P15 Certificados por fecha | `audit/p15-asist-certs` | hecha | #100 | Mergeado a staging1.0 (`101aff6`); archive `2026-07-29-audit-p15-asist-certs`; verify PASS |
| P16 Certificaciones listado | `audit/p16-certs-list` | hecha | #101 | Mergeado a staging1.0 (`7450a97`); archive `2026-07-29-audit-p16-certs-list`; verify PASS |
| P17 Certificación nueva | `audit/p17-certs-nueva` | hecha | #102 | Mergeado a staging1.0 (`c371e2a`); archive `2026-07-29-audit-p17-certs-nueva`; verify PASS |
| P18 Expediente preview | `audit/p18-certs-preview` | hecha | #103 | Mergeado a staging1.0 (`dc3ac99`); archive `2026-07-29-audit-p18-certs-preview`; verify PASS WITH WARNINGS |
| P19 Folio PDF | `audit/p19-certs-pdf` | hecha | #104 | Mergeado a staging1.0 (`4938024`); archive `2026-07-29-audit-p19-certs-pdf`; verify PASS WITH WARNINGS |
| P20 Entrega manual | `audit/p20-certs-entrega` | hecha | #105 | Mergeado a staging1.0 (`1cdb9f8`); archive `2026-07-29-audit-p20-certs-entrega`; verify PASS |
| P21 Revocación | `audit/p21-certs-revocar` | hecha | #106 | Mergeado a staging1.0 (`992201d`); archive `2026-07-29-audit-p21-certs-revocar`; verify PASS |
| P22 Validación pública | `audit/p22-validacion` | hecha | #107 | Mergeado a staging1.0 (`922ae59`); archive `2026-07-29-audit-p22-validacion`; verify PASS |
| P23 404 / rutas huérfanas | `audit/p23-not-found` | hecha | #108 | Mergeado a staging1.0 (`e9f6930`); archive `2026-07-29-audit-p23-not-found`; verify PASS |
| U1 Prolijidad código FE | `audit/u01-prolijidad-fe` | hecha | #109 | Mergeado a staging1.0 (`511ce7b`); archive `2026-07-29-audit-u01-prolijidad-fe`; verify PASS |
| U2 Carga / performance FE | `audit/u02-perf-fe` | hecha | #110 | Mergeado a staging1.0 (`125f6f8`); archive `2026-07-30-audit-u02-perf-fe`; verify PASS |
| U3 Copy / redacción global | `audit/u03-copy` | hecha | #111 | Mergeado a staging1.0 (`b0d23d4`); archive `2026-07-30-audit-u03-copy`; verify PASS |
| U4 Accesibilidad + responsive | `audit/u04-a11y-responsive` | hecha | #112 | Mergeado a staging1.0 (`7b7d3db`); archive `2026-07-30-audit-u04-a11y-responsive`; verify PASS; contraste DEFER |
| U5 Errores / estados vacíos | `audit/u05-estados-error` | hecha | #113 | Mergeado a staging1.0 (`0b9d786`); archive `2026-07-30-audit-u05-estados-error`; verify PASS WITH WARNINGS; SHELL-STATE-01..04 |
| U6 Backend contrato + errores | `audit/u06-backend` | hecha | #114 | Mergeado a staging1.0 (`613b305`); archive `2026-07-30-audit-u06-backend`; verify PASS; `state()`/`authorize` lastSeen + D-004→503 |
| U7 Seguridad + PII | `audit/u07-seguridad` | hecha | #115 | Mergeado (`f1fa2f5`); archive `2026-07-30-audit-u07-seguridad`; verify PASS WITH WARNINGS |
| U8 Docs + drift specs | `audit/u08-docs` | en PR | #116 | verify PASS WITH WARNINGS; changelog/checklist/drift; archiva U7 |
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
**Cambio SDD:** `openspec/changes/audit-p08-cursos-detail/`
**Ruta:** `/admin/cursos/:id`

**Checklist**

- [ ] Datos del curso, accesos a asistencias/fechas
- [ ] Estados vacíos
- [ ] IDs inválidos → error claro

**Prompt**

```text
Fase P8 — Detalle de curso (/admin/cursos/:id).
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · rama audit/p08-cursos-detail.
Cambio SDD Gentle-AI: audit-p08-cursos-detail (openspec/).
Correr ciclo completo: explore → propose → spec → design → tasks → apply.
Auditar course-detail-page. Lentes UI/UX, copy, errores id inválido, links a asistencias/edición, carga.
Spec canónica de referencia: openspec/specs/admin-courses-frontend/.
Tras apply: tests del área + gate 4R. No tocar listado/editor salvo links rotos.
Artefactos SDD en español argentino formal.
```

---

## Fase P9 — Alumnos · listado

**Rama:** `audit/p09-alumnos-list`
**Cambio SDD:** `openspec/changes/archive/2026-07-28-audit-p09-alumnos-list/`
**Ruta:** `/admin/alumnos`
**Estado:** hecha — PR #94 mergeado a `staging1.0` (`f1a9ec9`); archive local listo.

**Checklist**

- [x] DNI completo visible; filtros email/cert
- [x] Métricas certificaciones / cursos
- [x] Paginación, vacíos, QA toggles solo en dev
- [x] Copy “Contacto disponible” / etc. (sin «legajo»; sin chip «Con email»)

**Prompt**

```text
Fase P9 — Listado alumnos (/admin/alumnos) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #94 mergeado.
Cambio SDD: openspec/changes/archive/2026-07-28-audit-p09-alumnos-list/.
Siguiente: P10 editor (audit/p10-alumnos-editor). No reabrir listado salvo regresión.
```

---

## Fase P10 — Alumnos · editor

**Rama:** `audit/p10-alumnos-editor`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p10-alumnos-editor/`
**Rutas:** `/admin/alumnos/nuevo`, `/admin/alumnos/:id/editar`

**Checklist**

- [x] Validación DNI/email/nombre
- [x] Errores duplicado / 409
- [x] create vs edit

**Prompt**

```text
Fase P10 — Editor alumnos (/admin/alumnos/nuevo|/:id/editar) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #95 mergeado.
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p10-alumnos-editor/.
Siguiente: P11 detalle (audit/p11-alumnos-detail). No reabrir editor salvo regresión.
```

---

## Fase P11 — Alumnos · detalle

**Rama:** `audit/p11-alumnos-detail`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p11-alumnos-detail/`
**Ruta:** `/admin/alumnos/:id`

**Checklist**

- [x] Trayectoria cursos + estados cert
- [x] Links a expediente
- [x] Métricas válidas/revocadas (`0` vs «—»)
- [x] Id inválido (solo Volver; sin Reintentar)
- [x] Copy sin legajo (kicker Ficha)
- [x] Reintentar solo en fallo recuperable

**Prompt**

```text
Fase P11 — Detalle alumno (/admin/alumnos/:id) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #96 mergeado.
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p11-alumnos-detail/.
Siguiente: P12 hub asistencias (audit/p12-asist-hub). No reabrir detalle salvo regresión.
```

---

## Fase P12 — Asistencias · hub

**Rama:** `audit/p12-asist-hub`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p12-asist-hub/`
**Ruta:** `/admin/asistencias`
**Estado:** hecha — PR #97 mergeado a `staging1.0` (`dae9026`)

**Checklist**

- [x] Listado cursos con métricas de fechas
- [x] Búsqueda, paginación, vacío
- [x] Performance del hub (evitar trabajo O(n²) innecesario en cliente si se puede simplificar sin cambiar contrato)

**Prompt**

```text
Fase P12 — Hub asistencias (/admin/asistencias) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #97 mergeado (dae9026).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p12-asist-hub/.
Siguiente: P13 fechas del curso (audit/p13-asist-fechas). No reabrir hub salvo regresión.
```

---

## Fase P13 — Asistencias · fechas del curso

**Rama:** `audit/p13-asist-fechas`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p13-asist-fechas/`
**Ruta:** `/admin/asistencias/curso/:id`
**Estado:** hecha — PR #98 mergeado a `staging1.0` (`dca5690`)

**Checklist**

- [x] Orden cronológico
- [x] Filtros programada/realizada
- [x] Links a marcado
- [x] Curso inexistente
- [x] Reintentar solo recuperable; títulos not-found vs carga

**Prompt**

```text
Fase P13 — Fechas por curso (asistencias) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #98 mergeado (dca5690).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p13-asist-fechas/.
Siguiente: P14 marcado + emisión (audit/p14-asist-marcado). No reabrir intermedia salvo regresión.
```

---

## Fase P14 — Asistencias · marcado y emisión

**Rama:** `audit/p14-asist-marcado`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p14-asist-marcado/`
**Ruta:** `/admin/cursos/:id/fechas/:fechaId/asistencias`
**Estado:** hecha — PR #99 mergeado (`7e6ff10`); verify PASS WITH WARNINGS; smoke staging 4.4 pendiente (WARNING no bloqueante)

**Checklist**

- [x] Marcar presentes/ausentes; guardar
- [x] Emitir / regenerar PDF **en serie** (no 401 por session lock) — bucle intacto + test de orden
- [x] Mensajes 400 (fecha futura/programada, sin presentes) — tests + `mensajeErrorApi`
- [x] Token no rota al regenerar — assert `tokenPrefix` + sin tocar backend
- [ ] Feedback UX claro post-emisión — smoke staging (verify 4.4) pendiente; mitigado por tests seriales

**Prompt**

```text
Fase P14 — Marcado de asistencias + emisión — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #99 mergeado (7e6ff10).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p14-asist-marcado/.
Verify PASS WITH WARNINGS (smoke staging 4.4 pendiente).
Siguiente: P15 certificados por fecha (audit/p15-asist-certs). No reabrir marcado salvo regresión.
```

---

## Fase P15 — Certificados por fecha

**Rama:** `audit/p15-asist-certs`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p15-asist-certs/`
**Ruta:** `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados`
**Estado:** hecha — PR #100 mergeado (`101aff6`); verify PASS

**Checklist**

- [x] Apply: honesty carga + Expediente + tests unitarios
- [x] Listado coherente con emitidos (filtro `cursoId`; empty+CTA)
- [x] Links a expediente / PDF / entrega (Expediente + Copiar→QR→PDF inline)
- [x] Vacíos
- [x] Errores honestos (Reintentar solo recuperable; `mensajeErrorApi` en acciones)
- [x] Verify PASS + archive

**Prompt**

```text
Fase P15 — Certificados por fecha — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #100 mergeado (101aff6).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p15-asist-certs/.
Verify PASS (1 req / 7 escenarios; ng test date-certificates 10/10).
Siguiente: P16 listado certificaciones (audit/p16-certs-list). No reabrir certificados-por-fecha salvo regresión.
```

---

## Fase P16 — Certificaciones · listado

**Rama:** `audit/p16-certs-list`
**Ruta:** `/admin/certificaciones`
**Estado:** hecha — PR #101 mergeado (`7450a97`); archive `openspec/changes/archive/2026-07-29-audit-p16-certs-list/`

**Checklist**

- [x] Filtros vigente/revocado + curso + texto
- [x] DNI en listado según política
- [x] Paginación (`paginasVisibles`), vacíos, labels “Válida”/“Revocado”
- [x] `mostrarResumen` gated + grammar coincide/coinciden
- [x] Verify PASS + archive

**Prompt**

```text
Fase P16 — Listado certificaciones — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #101 mergeado (7450a97).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p16-certs-list/.
Verify PASS (1 req / 9 escenarios; ng test certifications-list 27/27).
Siguiente: P17 certificación nueva (audit/p17-certs-nueva). No reabrir listado salvo regresión.
```

---

## Fase P17 — Certificación · nueva

**Rama:** `audit/p17-certs-nueva`
**Ruta:** `/admin/certificaciones/nueva`
**Estado:** hecha — PR #102 mergeado (`c371e2a`); archive `openspec/changes/archive/2026-07-29-audit-p17-certs-nueva/`

**Checklist**

- [x] Flujo de emisión manual vs atajos desde asistencias (copy rol edge; pantalla conservada)
- [x] Validaciones y errores (honesty loads + `mensajeErrorApi` emit else)
- [x] ¿Sigue siendo necesaria la pantalla o hay copy confuso? Documentar hallazgo (se mantiene; sin «complementario»)
- [x] Verify PASS + archive

**Prompt**

```text
Fase P17 — Nueva certificación — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #102 mergeado (c371e2a).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p17-certs-nueva/.
Verify PASS (1 req / 7 escenarios; ng test certification-new-page 20/20).
Siguiente: P18 expediente preview (audit/p18-certs-preview). No reabrir nueva salvo regresión.
```

---

## Fase P18 — Expediente / preview

**Rama:** `audit/p18-certs-preview`
**Ruta:** `/admin/certificaciones/:id`
**Estado:** hecha — PR #103 mergeado (`dc3ac99`); archive `openspec/changes/archive/2026-07-29-audit-p18-certs-preview/`

**Checklist**

- [x] Datos, firmas preview reales (no SVG placeholder si hay imagen)
- [x] Acciones: PDF, entrega, revocar
- [x] Estado revocado visible
- [x] URL validación truncada en UI; token no completo
- [x] Honesty load/QR/regen (sin raw `Error.message`); Reintentar solo load hard
- [x] Post-regen sin `publicValidationUrl` completa

**Prompt**

```text
Fase P18 — Expediente certificación (preview) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #103 mergeado (dc3ac99).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p18-certs-preview/.
Verify PASS WITH WARNINGS (8/8 escenarios; ng test certification-preview-page 60/60).
Siguiente: P19 folio PDF (audit/p19-certs-pdf). No reabrir preview salvo regresión.
```

---

## Fase P19 — Folio PDF

**Rama:** `audit/p19-certs-pdf`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p19-certs-pdf/`
**Ruta:** `/admin/certificaciones/:id/pdf`
**Estado:** hecha — PR #104 mergeado (`4938024`); verify PASS WITH WARNINGS; archive cerrado

**Checklist**

- [x] Apply: honesty carga (`errorRecuperable` load-only + Reintentar) + tests unitarios
- [x] Descarga: `mensajeErrorApi` P15-strict; html2canvas+jsPDF (no seam API); filename prefer `detalle.numero`
- [x] Folio A4 print 1 página; firmas 3:2 (smoke verify)
- [x] QR apunta a URL canónica completa (regresión tests)
- [x] Sin disclaimers/`certificateText` en pie del folio
- [x] Revocado marcado (regresión tests)
- [x] Performance html2canvas aceptable (verify; scale:2 intacto)

**Prompt**

```text
Fase P19 — Folio PDF (CRÍTICA) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #104 mergeado (4938024).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p19-certs-pdf/.
Verify PASS WITH WARNINGS (9/13 escenarios; ng test certification-pdf-preview-page 43/43).
Siguiente: P20 entrega manual (audit/p20-certs-entrega). No reabrir folio salvo regresión.
```

---

## Fase P20 — Entrega manual

**Rama:** `audit/p20-certs-entrega`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p20-certs-entrega/`
**Ruta:** `/admin/certificaciones/:id/entrega`
**Estado:** hecha — PR #105 mergeado (`1cdb9f8`); verify PASS; archive cerrado

**Checklist**

- [x] Apply: `allSettled` (detalle hard / entrega soft) + honesty P15-strict
- [x] 409 `TOKEN_NOT_RECOVERABLE` soft operable (bedelía copy; Copiar/QR off; sin Reintentar)
- [x] `errorRecuperable` load-only + Reintentar gated; not-found sin Reintentar
- [x] Wire `regenerarPdf` + re-fetch; D0 sin rotar token; sin `publicValidationUrl` post-regen
- [x] PDF folio `?descargar=1` + seam `navigate=false`
- [x] Verify: focused `ng test` delivery + `tsc` → `verify-report.md`

**Prompt**

```text
Fase P20 — Entrega manual (CRÍTICA) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #105 mergeado (1cdb9f8).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p20-certs-entrega/.
Verify PASS (11/11 escenarios; ng test certification-delivery-page 25/25).
Siguiente: P21 revocación (audit/p21-certs-revocar). No reabrir entrega salvo regresión.
```

---

## Fase P21 — Revocación

**Rama:** `audit/p21-certs-revocar`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p21-certs-revocar/`
**Ruta:** `/admin/certificaciones/:id/revocar`
**Estado:** hecha — PR #106 mergeado (`992201d`); verify PASS; archive cerrado

**Checklist**

- [x] Confirmación explícita
- [x] Copy de consecuencias
- [ ] Estado posterior en expediente y validación pública *(flash `?revocada=1` diferido; P22 valida pública)*
- [x] Auditoría sin PII completa *(sanitize motivo DNI/TOKEN/EMAIL; honesty sin raw Error.message)*
- [x] Honesty load/submit (error vs errorAccion; Reintentar gated; MOTIVO_MAX 180)
- [x] Verify: focused `ng test` revoke + `tsc` → `verify-report.md`

**Prompt**

```text
Fase P21 — Revocación — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #106 mergeado (992201d).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p21-certs-revocar/.
Verify PASS (9/9 escenarios; ng test certification-revoke-page 17/17).
Siguiente: P22 validación pública (audit/p22-validacion). No reabrir revocar salvo regresión.
```

---

## Fase P22 — Validación pública

**Rama:** `audit/p22-validacion`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p22-validacion/`
**Ruta:** `/validar/:token`
**Estado:** hecha — PR #107 mergeado (`922ae59`); verify PASS; archive cerrado

**Checklist**

- [x] Válida OK (folio + fechas `dd/mm/yyyy` es-AR)
- [x] REVOCADO solo con código explícito `CERTIFICATE_REVOKED` (mock); staging revoked→`404 CERTIFICATE_NOT_FOUND` ≡ no-encontrada / SIN REGISTRO (contrato aceptado, no bug de front)
- [x] Sin datos de más; DNI completo (D0) en válida; sin token en DOM del cuerpo
- [x] Token inválido / no encontrado → SIN REGISTRO
- [ ] Responsive, trust/branding *(smoke visual U9)*
- [x] No filtrar stack traces / raw `Error.message`; Reintentar en técnico + no-encontrada
- [x] Verify: focused `ng test` public-validation + `tsc` → `verify-report.md`

**Nota staging (aceptada):** verify PHP colapsa certificado revocado a `404 CERTIFICATE_NOT_FOUND`. El front muestra chrome no-encontrada; no inventa REVOCADO. Unlock PHP `CERTIFICATE_REVOKED` queda fuera de P22 (`RATE_LIMITED` diferido).

**Prompt**

```text
Fase P22 — Validación pública — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #107 mergeado (922ae59).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p22-validacion/.
Verify PASS (8/8 escenarios; ng test public-validation-page 18/18).
Siguiente: P23 404/rutas huérfanas (audit/p23-not-found). No reabrir validación salvo regresión.
```

---

## Fase P23 — 404 y rutas huérfanas

**Rama:** `audit/p23-not-found`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-p23-not-found/`
**Estado:** hecha — #108 mergeado a staging1.0 (`e9f6930`); archive cerrado; verify PASS

**Checklist**

- [x] `NotFoundPage` clara (ES-AR; html/css split; title en `**`)
- [x] `/admin/typo` no cae en validación pública (catch-all prefix intacto; sin AdminNotFound)
- [x] Links “volver” sensatos (único CTA → `/admin/login`; sin `/validar/…`)
- [x] Verify: focused `ng test` not-found + routes + `tsc` → `verify-report.md`
- [x] Archive: delta → `openspec/specs/frontend-angular-shell/spec.md`; carpeta `2026-07-29-audit-p23-not-found`

**Prompt**

```text
Fase P23 — 404 y aislamiento de rutas — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #108 mergeado (e9f6930).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-p23-not-found/.
Verify PASS (7/7 escenarios; ng test not-found+routes 113/113).
Siguiente: Bloque C U1 prolijidad FE (audit/u01-prolijidad-fe) o U9 smokes según prioridad. No reabrir NotFound salvo regresión.
```

**Nota:** polish NotFound + CTA login + `title` en wildcard; isolation `/admin/typo` preservada. Cerrada.

---

# BLOQUE C — Fases universales (después de páginas críticas, o intercaladas)

Hacer **después** de P14–P22 al menos en primer pase, o en paralelo solo si no pisan los mismos archivos.

---

## Fase U1 — Prolijidad de código frontend

**Rama:** `audit/u01-prolijidad-fe`
**Cambio SDD:** `openspec/changes/archive/2026-07-29-audit-u01-prolijidad-fe/`
**Estado:** hecha — #109 mergeado a staging1.0 (`511ce7b`); verify PASS; archive cerrado

**Alcance transversal FE (sin rediseñar UX):**

- Código muerto, imports unused, comentarios obsoletos “ponytail” ya resueltos
- Duplicación de formatters de fecha / paginadores (extraer solo si reduce riesgo)
- Specs rotos o que testean mocks irrelevantes
- Consistencia OnPush / signals

**Checklist**

- [x] Delete `LandingPage` + specs (sin ruta canónica)
- [x] Delete `FolioShell` + specs (sin consumidores)
- [x] Remove alias muerto `guardar()` en marcado; canónico `guardarYGenerar`
- [x] Extract `paginasVisiblesWindow` + wire 4 listados; HTML/UX sin cambio
- [x] OnPush preservado (bajas Landing/FolioShell; restantes OnPush 30/30)
- [x] Verify (`sdd-verify`): SHELL-HYG-01..05 + `tsc` + specs focused → `verify-report.md`
- [x] Archive + merge a `staging1.0` (`511ce7b`; archive `2026-07-29-audit-u01-prolijidad-fe`)

**Diferidos (locked):** formatters fecha, clipboard, `mensajeErrorApi`, purge `// ponytail:`, copy/UX, U2, honesty P15–P23.

**Prompt**

```text
Fase U1 — Prolijidad FE transversal — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #109 mergeado (511ce7b).
Cambio SDD: openspec/changes/archive/2026-07-29-audit-u01-prolijidad-fe/.
Verify PASS (10/10 escenarios; OnPush 30/30; focused ng test 231+).
Siguiente: U2 performance FE (audit/u02-perf-fe) o U9 smokes según prioridad. No reabrir U1 salvo regresión.
```

**Nota:** delete Landing/FolioShell + alias `guardar()`; helper `paginasVisiblesWindow` en 4 listados; OnPush 30/30. Cerrada.

---

## Fase U2 — Optimización de carga (FE + contrato)

**Rama:** `audit/u02-perf-fe`

**Estado:** hecha — PR #110 mergeado a `staging1.0` (`125f6f8`); archive `openspec/changes/archive/2026-07-30-audit-u02-perf-fe/`; verify PASS (9/9; HTTP-PERF-01/02 + CERT-PERF-01; focused ng test 105 SUCCESS; tsc 0).

**Checklist**

- [x] Lazy routes OK (ya loadComponent; verificar bundles pesados html2canvas/jspdf) — `import()` solo en descarga PDF (CERT-PERF-01)
- [x] Hub asistencias: coalesce `hubPending` + invalidate en marcar/anular (HTTP-PERF-01); payload slim API diferido
- [x] Listados: filtro cliente — **cientos OK**; **miles → paginación/API (diferido)** — ver `docs/frontend/03-modulos-admin.md`
- [x] Firmas: cache de sesión `previewFirma`/`obtener` + invalidate (HTTP-PERF-02); `Cache-Control` PHP sin cambio
- [x] Evitar double-fetch al navegar (hub + config)
- [x] Archive + merge a `staging1.0` (`125f6f8`; archive `2026-07-30-audit-u02-perf-fe`)

**Nota de escala:** listados admin con filtro/paginación client-side soportan cientos de filas; miles requieren paginación servidor (fuera de U2).

**Diferidos (locked):** slim hub API, paginación servidor, `Cache-Control` firmas PHP, dashboard metrics, qrcode worker, CI bundle report.

**Prompt**

```text
Fase U2 — Performance / carga — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #110 mergeado (125f6f8).
Cambio SDD: openspec/changes/archive/2026-07-30-audit-u02-perf-fe/.
Verify PASS (9/9 escenarios; HTTP-PERF-01/02 + CERT-PERF-01; focused ng test 105 SUCCESS; tsc 0).
Siguiente: U3 copy (audit/u03-copy) o U9 smokes según prioridad. No reabrir U2 salvo regresión.
```

**Nota:** coalesce `listarHub`; cache sesión firma/`obtener`; PDF deps diferidas al descargar; escala listados documentada. Cerrada.

---

## Fase U3 — Redacción global (glosario + pass)

**Rama:** `audit/u03-copy`

**Estado:** hecha — PR #111 mergeado a `staging1.0` (`b0d23d4`); archive `openspec/changes/archive/2026-07-30-audit-u03-copy/`; verify PASS (5/5; SHELL-COPY-01 + CERT-COPY-01; focused ng test 125 SUCCESS; tsc 0).

**Checklist**

- [x] Glosario único: Válida/Revocado, Activo/Inactivo, Programada/Realizada, expediente, entrega manual — `docs/frontend/04-glosario-ui.md` (SHELL-COPY-01)
- [x] Pass de strings visibles inconsistentes entre páginas — badge **Revocado**; label **Documento**; copy «válidas»/«válida» (CERT-COPY-01)
- [x] Tono institucional AR
- [x] Archive + merge a `staging1.0` (`b0d23d4`; archive `2026-07-30-audit-u03-copy`)

**Diferidos (locked):** hub Activo/Inactivo en asistencias; patrones U5 error/vacío; paridad literal admin↔público; folio ceremonial.

**Prompt**

```text
Fase U3 — Redacción / copy global — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #111 mergeado (b0d23d4).
Cambio SDD: openspec/changes/archive/2026-07-30-audit-u03-copy/.
Verify PASS (5/5 escenarios; SHELL-COPY-01 + CERT-COPY-01; focused ng test 125 SUCCESS; tsc 0).
Siguiente: U4 a11y/responsive (audit/u04-a11y-responsive) o U9 smokes según prioridad. No reabrir U3 salvo regresión.
```

**Nota:** glosario UI + pass quirúrgico admin certs; hub DEFER; API `vigente` intacto; D0. Cerrada.

---

## Fase U4 — Accesibilidad y responsive global

**Rama:** `audit/u04-a11y-responsive`

**Estado:** hecha — PR #112 mergeado a `staging1.0` (`7b7d3db`); archive `openspec/changes/archive/2026-07-30-audit-u04-a11y-responsive/`; verify PASS (13/13; SHELL-A11Y-01..04 + PUB-A11Y-01..02 + REQ-DEL-007; focused ng test 70 SUCCESS; tsc 0).

**Checklist**

- [x] Focus visible, labels, contraste básico
- [x] Tablas admin en mobile (scroll/stack)
- [x] Modales/confirmaciones usables con teclado
- [x] Login + validación pública + shell prioritarios si quedó deuda
- [x] Archive + merge a `staging1.0` (`7b7d3db`; archive `2026-07-30-audit-u04-a11y-responsive`)

**Notas apply (U4):** contraste tokens / hoist `.sr-only` → **DEFER** (U9). Soft focus return. Error-dialog entrega con trap. Revoke backdrop fuera de tab. Helper `trapTabKey`.

**Prompt**

```text
Fase U4 — a11y + responsive transversal — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #112 mergeado (7b7d3db).
Cambio SDD: openspec/changes/archive/2026-07-30-audit-u04-a11y-responsive/.
Verify PASS (13/13 escenarios; SHELL-A11Y-01..04 + PUB-A11Y-01..02 + REQ-DEL-007; focused ng test 70 SUCCESS; tsc 0).
Siguiente: U5 estados error/vacío (audit/u05-estados-error) o U9 smokes según prioridad. No reabrir U4 salvo regresión.
```

**Nota:** trap compartido + drawer/diálogos; CTAs públicos `:focus-visible`; contraste/`.sr-only` DEFER (U9); D0. Cerrada.

---

## Fase U5 — Estados de error / vacío / loading unificados

**Rama:** `audit/u05-estados-error`

**Estado:** hecha — PR #113 mergeado a `staging1.0` (`0b9d786`); archive `openspec/changes/archive/2026-07-30-audit-u05-estados-error/`; verify PASS WITH WARNINGS (10/10; SHELL-STATE-01..04; focused ng test 103 SUCCESS; tsc 0).

**Checklist**

- [x] Patrones repetidos de error+reintentar
- [x] 401 interceptor: redirect limpio (regresión)
- [x] Empty states con CTA útil
- [x] QA vista forzada solo en dev
- [x] Archive + merge a `staging1.0` (`0b9d786`; archive `2026-07-30-audit-u05-estados-error`)

**Notas apply (U5):** EmptyState util / design system nuevo → **DEFER**. QA asistencias sin harness → DEFER. Canónico Reintentar listados = `btn-primary`. course-editor Reintentar gated a carga recuperable. csrf.interceptor.ts sin tocar (regresión).

**Prompt**

```text
Fase U5 — Estados loading/empty/error — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #113 mergeado (0b9d786).
Cambio SDD: openspec/changes/archive/2026-07-30-audit-u05-estados-error/.
Verify PASS WITH WARNINGS (10/10 escenarios; SHELL-STATE-01..04; focused ng test 103 SUCCESS; tsc 0).
Siguiente: U6 backend (audit/u06-backend) o U9 smokes según prioridad. No reabrir U5 salvo regresión.
```

**Nota:** listados Reintentar/empty CTA `btn-primary`; course-editor Reintentar load-only; QA solo `isDevMode`; 401 regresión; D0. Cerrada.

---

## Fase U6 — Backend (contrato, errores, prolijidad)

**Rama:** `audit/u06-backend` — **CERRADA** (PR #114 → `staging1.0` `613b305`; archive `2026-07-30-audit-u06-backend`)

**Alcance:** `apps/backend-php/` endpoints admin + público usados por las pantallas.

**Checklist**

- [ ] Envelope `data/meta` consistente — **DEFER** (salvo bug claro; no tocado en U6 apply)
- [ ] Códigos/mensajes 400/409 alineados a UI — **DEFER**
- [x] session_write_close / locks en rutas sensibles — `state()` toca `lastSeen` + `session_write_close` (paridad `authorize`)
- [x] **D-009:** TTL idle/absolute reales (`admin_session_idle_seconds` / `absolute`) vs config staging; `lastSeen` se renueva en lecturas auth (`GET /admin/auth/session` y GETs autorizados), no solo en mutaciones — docs 14400/28800; absolute 8 h cookies → U7
- [ ] Sin PII en logs — **DEFER** spot profundo (login storage→503 genérico sin PII)
- [x] Tests PHP del área tocada — `AdminSessionAuthTest` + `AdminAuthHttpTest` (+D-004 503≠429)

**Prompt**

```text
Fase U6 — Backend (contrato + sesión) — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #114 mergeado (613b305).
Cambio SDD: openspec/changes/archive/2026-07-30-audit-u06-backend/.
Verify PASS (5/5 escenarios; lastSeen state/authorize + D-004 503≠429; focused PHP AdminSessionAuthTest + AdminAuthHttpTest).
Siguiente: U7 seguridad (audit/u07-seguridad) o U9 smokes según prioridad. No reabrir U6 salvo regresión.
```

**Nota:** `state()`/`authorize` renuevan `lastSeen` + `session_write_close`; TTL docs/spec 14400/28800; storage rate-limit →503≠429; envelope/400/409 DEFER; D0. Cerrada.

---

## Fase U7 — Seguridad y privacidad

**Rama:** `audit/u07-seguridad` — **CERRADA** (PR #115 → `staging1.0` `f1fa2f5`; archive `2026-07-30-audit-u07-seguridad`)

**Checklist**

- [x] CSRF en mutaciones *(regresión `AdminAuthHttpTest` / authorize mutates)*
- [x] Rate limit login *(regresión `AdminSessionAuthTest` allowLoginAttempt + HTTP 429)*
- [x] **D-009:** política de sesión admin documentada y aplicada (idle ≥ jornada operativa esperada; absolute acotado; cookie Secure/HttpOnly/SameSite; sin sorpresa ~30 min si el producto promete 4 h) *(docs `00-php84-api.md` lifetime=0 vs absolute 28800; reflection `cookieOptions`; TTL 14400/28800 intactos)*
- [x] Bloqueo path traversal / exposición `src/` *(`apps/backend-php/.htaccess` deny `src|config` antes de FallbackResource; gate `test-privacy-headers.sh`; HTTP 403 live **DEFER U9**)*
- [x] Headers / cookies Secure/HttpOnly según entorno *(privacy headers + cookie attrs fijos)*
- [x] DNI/token nunca en logs ni en URLs de analytics *(regresión `AuthPrivacyTest`; spot profundo staging **DEFER U9**)*
- [x] `__checks__/no-secrets` / no-real-data verdes *(regresión apply Phase 4)*

**Prompt**

```text
Fase U7 — Seguridad + PII — CERRADA.
Plan: docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md · PR #115 mergeado (f1fa2f5).
Cambio SDD: openspec/changes/archive/2026-07-30-audit-u07-seguridad/.
Verify PASS WITH WARNINGS (7/8 escenarios; deny htaccess + cookie D-009; HTTP 403 live DEFER U9).
Siguiente: U8 docs (audit/u08-docs). No reabrir U7 salvo regresión.
```

**Nota:** deny `src|config` antes de FallbackResource; cookie lifetime=0 vs absoluto 28800; MUST NOT aflojar TTL U6; D0. Cerrada.
---

## Fase U8 — Documentación y drift

**Rama:** `audit/u08-docs`

**Checklist**

- [x] `docs/06-flujo-git` refleja staging1.0 / main=prod
- [x] `03-modulos-admin`, checklist QA, changelog viñeta si hubo cambios visibles acumulados
- [x] Specs `openspec/specs/` vs comportamiento real (nota de drift, no reescribir todo)
- [x] Índice enlaza este plan
- [x] Nada de secretos/dumps

### Nota de drift

Drift conocido (sin rewrite masivo de specs/contratos):

- `docs/backend/01-contrato-api-certificados.md` — tablas admin aún listan `X-Admin-Key` HTTP; prevalece el banner de supersesión + SoT.
- Spec `deploy-cpanel-certificados` / guías Marcos·Matías — mención histórica D0 «X-Admin-Key temporal».
- Residual en `docs/backend/00-php84-api.md` vs cuerpo D-009 (cookie `lifetime=0` vs absoluto app-side).
- **SoT auth/deploy:** `openspec/specs/admin-auth/spec.md`, `docs/backend/00-php84-api.md`, `docs/backend/API.md`.

**Prompt**

```text
Fase U8 — Documentación — en curso.
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
