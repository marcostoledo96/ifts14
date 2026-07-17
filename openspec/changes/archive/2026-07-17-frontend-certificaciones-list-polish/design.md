# Design: Lista certificaciones — polish honesto

## Technical Approach

UI-only polish of existing `CertificationsListPage` (Angular 20, OnPush). Map REQ-CERTLIST-001…007 onto current client-side filters and `Certificacion.estado` — no DTO/HTTP/`envio` changes. Mirror students/courses list patterns: SVG estado panels, semantic validity badges (dot + border), actionable empty vs no-results.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Scope | In-place list polish | New page / shared badge component | Lowest risk; CTA already wired |
| Entrega | Omit entirely | Fake envio / N+1 entrega-manual | Lock + no list contract |
| Badge source | Only `estado` | Mix with pdfStatus | Honesty; REQ-002/006 |
| Label `vigente` | Display “Válida”; filter `=== 'vigente'` | Rename model value | Spec lock; chips keep model key |
| Chip labels | Display map (Válida/Borrador/…) | Raw `e` strings | a11y + v0 parity |
| Icons | Inline SVG (Inbox, spinner, alert) | lucide / icon lib | Matches alumnos polish; no deps |
| Empty vs filters | Inbox+emit CTA only when `vacioTotal`; clear filters when `sinCoincidencias` | Always emit CTA | REQ-003/004 |
| Services | Untouched | Server-side `estado` param | Filters already client-side after `listar()` |

## Data Flow

```
CERTIFICATIONS_SOURCE.listar()
        │
        ▼
  certificados[] ──► cursos (distinct names)
        │
        ▼
  client filter: q ∩ curso ∩ estado ──► resultadosFiltrados
        │                                    │
        ├─ vacioTotal → Inbox SVG + CTA nueva
        ├─ sinCoincidencias → clear filters
        ├─ loading/error → SVG panels + Reintentar
        └─ page slice → table (6 cols) + cards
              ValidezBadge(estado) only — no Entrega col
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `pages/list/certifications-list-page.ts` | Modify | `ESTADO_LABEL` / `etiquetaEstado()`; optional chip label map |
| `pages/list/certifications-list-page.html` | Modify | Badge markup (dot+borde); chip display labels; SVG loading/error/empty Inbox+CTA; keep CTA header |
| `pages/list/certifications-list-page.css` | Modify | `.validez-badge` variants; estado-panel icons; chip polish |
| `pages/list/certifications-list-page.spec.ts` | Modify | Assert badges, Inbox empty, SVG states, chip filter vigente, no Entrega |
| `certifications.models.ts` / HTTP / in-memory | None | No contract change |
| `openspec/.../specs/admin-certifications-frontend/spec.md` | Keep (delta already) | Archive later |

## Interfaces / Contracts

No new types. Reuse `EstadoCertificado = 'borrador' | 'vigente' | 'revocado' | 'vencido'`.

```ts
const ESTADO_LABEL: Record<EstadoCertificado, string> = {
  borrador: 'Borrador',
  vigente: 'Válida',
  revocado: 'Revocado',
  vencido: 'Vencido',
};
// Template badge:
// <span class="validez-badge" [attr.data-estado]="c.estado">
//   <span class="validez-dot" aria-hidden="true"></span>{{ etiquetaEstado(c.estado) }}
// </span>
```

Filter chips: `aria-pressed` still keyed by `estado === e`; visible text from `ESTADO_LABEL` (chip `vigente` shows “Válida”, click still sets `estado` to `'vigente'`).

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (page) | CTA nueva; 4 badge labels; Inbox empty+CTA; loading/error SVG; chip vigente filters; no “Entrega”; privacy masks | Extend `certifications-list-page.spec.ts` |
| Unit (svc) | Unchanged | Skip unless regression |
| E2E | Out of scope | Manual QA harness |

Focused: `ng test --include='**/certifications/pages/list/**' --watch=false`.

## Migration / Rollout

No migration. Toggle `useRealApi` unchanged.

## Open Questions

None — locks resolve display “Válida” vs filter `vigente`, no Entrega, Inbox empty, SVG states.
