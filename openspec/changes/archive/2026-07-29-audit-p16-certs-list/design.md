# Design: Auditoría P16 — listado de certificaciones admin

## Technical Approach

Cierre quirúrgico de gaps en `CertificationsListPage` por paridad con listados admin (`AttendancesListPage` / `StudentsListPage` / `CoursesListPage`): copiar el patrón local de `paginasVisibles` + elipsis, gate `mostrarResumen`, y verbo singular/plural del resumen. Sin HTTP, sin `errorRecuperable`, sin filtros v0 de entrega. Delta MODIFIED de `admin-certifications-frontend` (heading «Listado admin de certificaciones») alinea el contrato con HTTP/`CERTIFICATIONS_SOURCE` + `vigente|revocado`.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Copiar `paginasVisibles` de siblings vs pager genérico compartido | Shared util = scope creep; copy-paste = paridad inmediata | **Copy-paste** del computed de attendances/students (≤5 + sliding window) |
| `mostrarResumen` con `vistaQA === 'datos'` (students/courses) vs solo `!cargando && !error` (attendances) | Certs tiene harness QA como students/courses | **Con `vistaQA === 'datos'`** |
| Verbo `coincide`/`coinciden` solo con filtros activos | Sin filtros el copy es «en el archivo» (invariable) | Ternario: `n===1 ? 'coincide con el filtro' : 'coinciden con el filtro'` |
| Renombrar a `errorRecuperable` | Cosmético; listados no tienen not-found | **No** (locked) |
| Restaurar entrega / borrador / vencido | Modelo/API no lo exponen; tests lo prohíben | **No** (locked) |
| Pasar filtros a `listar()` HTTP | Toca service/backend | **No**; filtros siguen client-side |
| Reescribir CSS pager a clases `.pager` de siblings | Diff visual amplio | **Mantener `.paginacion`**; solo `.pager-ellipsis` mínimo |

## Data Flow

```
CERTIFICATIONS_SOURCE.listar()
        │
        ▼
certificados[] ──► resultadosFiltrados (client: q/estado/curso)
        │                    │
        │                    ├── itemsVisibles (slice PAGINA_TAMANO=20)
        │                    ├── totalPaginas / paginaSegura
        │                    └── paginasVisibles (ventana ≤5)
        │
        ├── cargando/error ──► mostrarResumen = vistaQA==='datos' && !cargando && !error
        └── catch fijo + Reintentar (sin raw Error.message; sin errorRecuperable)
```

Pager desktop/móvil: `@for (page of paginasVisibles())` + elipsis si `totalPaginas() > 5 && paginaSegura() < totalPaginas() - 2` (paridad attendances).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `…/certifications/pages/list/certifications-list-page.ts` | Modify | Add `paginasVisibles`, `mostrarResumen` computeds |
| `…/certifications/pages/list/certifications-list-page.html` | Modify | Gate resumen; verb grammar; both pagers use `paginasVisibles` + elipsis |
| `…/certifications/pages/list/certifications-list-page.css` | Modify | Minimal `.pager-ellipsis` under `.paginacion` |
| `…/certifications/pages/list/certifications-list-page.spec.ts` | Modify | Update grammar assert; add pager >5 + resumen oculto en carga |
| `openspec/changes/audit-p16-certs-list/specs/admin-certifications-frontend/spec.md` | Create | Delta MODIFIED (sdd-spec): rename heading; HTTP/seam; filtros reales; DNI; pager 20; honesty; QA; sin entrega/borrador/vencido |
| Main `openspec/specs/admin-certifications-frontend/spec.md` | Later (archive) | Merge delta; **no** tocar en apply salvo que tasks lo indiquen |

**Do not touch**: `http-certifications.service.ts`, backend, P15 archive uncommitted, P17–P21 pages, token/QR.

## Interfaces / Contracts

No new public types. Internal computeds mirror siblings:

```typescript
readonly paginasVisibles = computed(() => { /* total<=5 | head | tail | window±2 */ });
readonly mostrarResumen = computed(
  () => this.vistaQA() === 'datos' && !this.cargando() && !this.error(),
);
```

Template grammar (solo con filtros):

```html
{{ resultadosFiltrados().length === 1 ? 'coincide con el filtro' : 'coinciden con el filtro' }}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (page spec) | Grammar 1 vs N | Fix assert → `1 certificación coincide…`; add N→`coinciden` |
| Unit | `mostrarResumen` oculto en carga | Force `cargando` / stub lento; `.results-summary` absent |
| Unit | Pager >5 | Seed >100 items (`PAGINA_TAMANO*5+1`); `onPagina(6)`; page 6 button present / items slice |
| Unit | Regressions | Keep anti-token/DNI, «sin Estado de entrega», catch fijo |
| E2E | — | Out of scope |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Frontend-only; revert page+spec delta.

## Open Questions

None — defaults 1–8 locked; heading rename yes; empty/error copy unchanged.
