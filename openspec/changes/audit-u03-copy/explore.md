# Exploration: audit-u03-copy

**Cambio**: `audit-u03-copy`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-30
**Almacén**: hybrid (OpenSpec + Engram)
**Rama**: `audit/u03-copy` (base staging1.0 @ `125f6f8`, post-merge PR #110 / U2 archivado)
**Alcance de fase**: U3 — Redacción global (glosario + pass de strings visibles); sin lógica de negocio, sin rediseño API/UX
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U3; hard locks D0; no tocar archive U2

## Exploration: Redacción / copy global (U3)

### Current State

- **Glosario en docs/frontend/**: **no existe**. Solo `00-angular20-port-v0.md`, `02-sistema-visual-v0-f1-02.md`, `03-modulos-admin.md`. Ninguno es glosario de etiquetas.
- **Canon parcial en specs**: `admin-certifications-frontend` ya fija labels UI `vigente` → **Válida**, `revocado` → **Revocado**; guía admin (`admin-guide-page`) refuerza «Válida o Revocado». API/DTO siguen en inglés interno (`vigente`/`revocado`) — correcto; U3 no cambia contratos.
- **Cursos UI real**: listado colapsa a **Activo / Inactivo** (chips Activos/Inactivos). Spec `admin-courses-frontend` aún habla de chips de cuatro estados (Borrador/Activos/Cerrados/Archivados) → **drift spec↔UI**.
- **Fechas**: `Programada` / `Realizada` / `Cancelada` ya alineados en detalle de curso e intermedia de asistencias.
- **Expediente / entrega manual**: término «expediente» estable en preview/PDF/revocar; CTA «Entrega manual» **no** aparece en expediente (intencional: Copiar link + QR). Dashboard sí tiene acción «Entrega manual» → listado de certificaciones.
- **Pública**: folio ceremonial (`Certificación válida`, `ESTADO: VÁLIDO` / `REVOCADO`); distinto del badge admin — no forzar paridad literal admin↔público.
- **Tono**: mayoría es-AR con voseo (`Reintentá`, `Intentá`); mezcla residual «No pudimos…» vs «No se pudo…» en títulos/cuerpos de error.

### Top gaps (ranqueados)

| # | Gap | Evidencia | Valor U3 | Notas |
|---|-----|-----------|----------|-------|
| 1 | **Badge expediente `Revocada` ≠ listado/guía `Revocado`** | `estadoToLabel` en `certification-preview-page.ts` → `'Revocada'`; listado/date-certs/guía → `'Revocado'`; PLAN §U3: Válida/**Revocado** | **Alto** | Unificar a **Revocado** (canon glosario + spec existente) |
| 2 | **Copy «certificaciones vigentes» en UI bedelía** | Preview/delivery/revoke/new: «Solo… vigentes…», «Puede existir una certificación vigente» | **Alto** | Sustituir por **válidas** / estado **Válida** en copy visible; dejar `vigente` solo en código/API |
| 3 | **Label «Documento (mascarado)» con DNI completo (D0)** | `certification-preview-page.html` dt; valor = `documentMasked` completo | **Alto** | Renombrar a **DNI** / **Documento** (paridad delivery/revoke/list); D0 |
| 4 | **Asistencias hub: Borrador/Cerrado/Archivado vs cursos Activo/Inactivo** | `ESTADO_CURSO_LABEL` en `attendances-list-page.ts` vs colapso cursos | **Medio-alto** | Alinear badges hub a Activo/Inactivo |
| 5 | **Sin glosario versionado** | `docs/frontend/` sin `*glosario*` | **Alto (doc)** | Crear `docs/frontend/04-glosario-ui.md` breve |
| 6 | **Editor curso: «Inactivo (borrador\|cerrado\|archivado)»** | `course-editor-page.ts` `ESTADO_CURSO_LABEL` | **Bajo-medio** | Detalle operativo OK; glosario puede permitir subtítulo en editor |
| 7 | **Jerga técnica en soft-errors entrega** | `token_cipher_key`, `public_base_url` en mensajes expediente/entrega | **Bajo en U3** | **DEFER U5** (patrón error); opcional tono si sobra presupuesto |
| 8 | **«No pudimos» vs «No se pudo» / empty CTAs** | Cursos/certs/alumnos/pública vs mensajes TS | **Bajo en U3** | **DEFER U5** unificación error/vacío/loading |
| 9 | **Pública: VÁLIDO vs admin Válida; «vigente» en bajada** | `public-validation-page.html` | **Bajo** | Glosario: dominio público distinto; no rediseñar folio |
| 10 | **Spec cursos: 4 chips vs UI 2** | `admin-courses-frontend` vs `courses-list-page` | **Doc** | MODIFIED lean al alinear copy/chips |

### Affected Areas

- `docs/frontend/04-glosario-ui.md` — **nuevo** (glosario breve)
- `apps/frontend-angular/.../certifications/pages/preview/` — Revocada→Revocado; dt Documento; copy «vigentes»
- `.../certifications/pages/{list,delivery,revoke,new}/` — strings «vigente(s)» visibles; sin lógica
- `.../attendances/pages/list/` — etiquetas estado curso → Activo/Inactivo
- `.../courses/course-editor-page.ts` — opcional: subtítulos Inactivo (*) vs solo Inactivo
- Specs: `frontend-angular-shell` (ADDED lean), `admin-certifications-frontend` (clarificar badge expediente), `admin-courses-frontend` / `admin-attendances-frontend` (si se toca hub)
- **Fuera**: `openspec/changes/archive/2026-07-30-audit-u02-perf-fe/` (lock); backend/API; CSS/layout

### Approaches

1. **Glosario doc + unificaciones quirúrgicas de strings** — Doc canónico + fixes puntuales de labels/mensajes inconsistentes con el glosario.
   - Pros: bajo riesgo; sin lógica; diff chico y reviewable; cierra checklist U3; alinea con U1/U2 «surgical».
   - Cons: no unifica todos los errores/vacíos (correcto: U5).
   - Effort: **Low–Medium**

2. **Helper compartido `etiquetaEstado*` centralizado** — Extraer mapas a `shared/`.
   - Pros: una fuente en runtime.
   - Cons: over-engineering para U3; toca más archivos/tests; no pedido.
   - Effort: **Medium**

3. **Solo documentación (glosario sin tocar UI)** —
   - Pros: mínimo.
   - Cons: no cierra pass de inconsistencias ni checklist U3.
   - Effort: **Low** (insuficiente)

### Recommendation

**Approach 1**: crear `docs/frontend/04-glosario-ui.md` (español argentino formal) con términos PLAN:

| Dominio | API/interno | UI canónica |
|---------|-------------|-------------|
| Certificación | `vigente` / `revocado` | **Válida** / **Revocado** |
| Curso (listados) | `activo` vs resto | **Activo** / **Inactivo** |
| Fecha | `programada` / `realizada` | **Programada** / **Realizada** |
| Pantalla detalle cert | — | **Expediente** |
| Operación Copiar/QR/PDF | — | **Entrega manual** (concepto; no exige CTA en expediente) |

Pass UI acotado a gaps 1–5 (+4 hub). **No** rediseñar pública ni patrones error/vacío.

### Spec targets (lean)

| Spec | Delta | Motivo |
|------|-------|--------|
| `frontend-angular-shell` | **ADDED** (1 req, pocos escenarios) | Contrato transversal: labels visibles siguen glosario `docs/frontend/04-glosario-ui.md`; sin lógica |
| `admin-certifications-frontend` | **MODIFIED** puntual | Badge expediente = misma etiqueta que listado (**Revocado**); label DNI sin «mascarado» |
| `admin-courses-frontend` | **MODIFIED** lean (opcional) | Chips/badges Activo/Inactivo (corregir drift 4 estados) |
| `admin-attendances-frontend` | **ADDED/MODIFIED** lean (si se unifica hub) | Badges curso Activo/Inactivo en listado hub |
| Nueva capability «copy» | **No** | Evitar dominio extra; shell + dominios tocados alcanzan |

### DEFER (no robar alcance)

- **U5**: unificar patrones error + Reintentar, empty states/CTAs, suavizar jerga `public_base_url` / `token_cipher_key`, «No pudimos» vs «No se pudo»
- **U4**: focus/labels a11y/responsive (salvo typo de copy incidental)
- Folio público ceremonial (`ESTADO: VÁLIDO`, ACTA…) — no forzar «Válida»
- Extracción de helpers compartidos de etiquetas
- Cualquier cambio de filtro/API/`estado === 'vigente'` en TS de negocio
- Archive U2 y lógica de performance

### Risks

- Tests que afirman «Revocada» / «vigentes» / «Documento (mascarado)» / chips de asistencia
- Confundir género gramatical con canon PLAN (asimétrico Válida/Revocado es intencional)
- Scope creep hacia U5 si se reescriben todos los errores
- Spec cursos: MODIFIED puede abrir discusión histórica de 4 estados — mantener delta mínimo factual

### Ready for Proposal

**Yes** — alcance claro, evidencia en código, approach lean, DEFER explícito. Siguiente: `sdd-propose` para `audit-u03-copy`.
