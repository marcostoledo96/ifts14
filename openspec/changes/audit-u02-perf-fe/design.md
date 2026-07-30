# Design: audit-u02-perf-fe — Surgical FE performance (U2)

## Technical Approach

Close PLAN §U2 with four FE-only slices: (1) defer `html2canvas-pro`/`jspdf` until PDF download; (2) coalesce `listarHub` like existing `asistenciasPorCurso`/`fechasPorCurso`; (3) session-memory cache for `previewFirma` (+ `obtener` same pattern); (4) document client-filter list scale. No API/UX/D0 change; leave U1 archive; no commit this phase. Spec deltas: lean ADDED on `frontend-http-services` + `admin-certifications-frontend`.

## Architecture Decisions

| Decision | Options / tradeoff | Choice |
|----------|-------------------|--------|
| PDF heavy deps | Route chunk static vs download `import()` | **Download-only dynamic `import()`** inside `exportarFolioVisibleComoPdf` (covers button + `?descargar=1`) |
| Hub dedupe | In-flight only vs session Promise until mutate | **Session `hubPending` Promise** (same as `fechasPorCurso`); clear on `marcar`/`anular` (+ clear `asistenciasPorCurso` as today) |
| Mock hub | HTTP-only vs HTTP+mock | **Both** `HttpAttendanceService` + `AttendanceMockService` — locked parity |
| Firmas cache | Defer vs include | **INCLUDE** Map `role → Promise<Blob>`; invalidate on `subirFirma`/`quitarFirma`/`guardar` |
| Config `obtener` | Skip vs coalesce | **Include** single `obtenerPending` — same low-risk pattern; invalidate with firmas |
| In-memory config | Add cache | **No-op** — already local blobs/state |
| Hub sync re-index | Shared indexes vs defer | **Defer** — coalesce removes 2× fetch/parse; enough for U2 |
| List scale | Code vs docs | **Docs only** — hundreds OK; thousands → later API (U6) |
| TTL vs invalidate | Short TTL vs mutation invalidate | **Invalidate-only** — matches courses/attendance Maps; no timers |
| Threat / routing | New boundaries | **N/A** |

## Data Flow

### Hub coalesce (list → course-dates)

```text
attendances-list ──listarHub()──┐
                                ├──► hubPending? ──yes──► same Promise
attendance-course-dates ────────┘         │
                                          no
                                          ▼
                                   GET /admin/hub/asistencias
                                          │
                                   fill asistenciasPorCurso
                                          │
marcar / anular ──► hubPending=null + invalidateAsistencias
```

### PDF download

```text
open /pdf  →  load folio (no html2canvas/jspdf)
Descargar / ?descargar=1  →  await import('html2canvas-pro') + import('jspdf')
                           →  capture → save cert-{codigo}.pdf (D0 unchanged)
```

### Firma / config session cache

```text
previewFirma(role) ──► firmaPreviewByRole.get(role) ?? GET blob → store Promise
obtener()          ──► obtenerPending ?? GET config → store Promise
subirFirma / quitarFirma / guardar ──► clear firma map + obtenerPending
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `…/pdf/certification-pdf-preview-page.ts` | Modify | Drop static imports; dynamic import in export path |
| `…/attendances/data/http-attendance.service.ts` | Modify | `hubPending` coalesce + invalidate on mutations |
| `…/attendances/data/attendance-mock.service.ts` | Modify | Same `hubPending` + invalidate on `marcar`/`anular` |
| `…/http-institutional-config.service.ts` | Modify | Session Maps for `previewFirma` / `obtener`; invalidate on mutate |
| `…/http-attendance.service.spec.ts` | Modify | Coalesce + invalidate scenarios |
| `…/institutional-config.service.spec.ts` | Modify | Cache hit + invalidate after upload/remove/save |
| `…/pdf/certification-pdf-preview-page.spec.ts` | Modify | Async download still works (mock dynamic modules if needed) |
| `openspec/changes/…/specs/frontend-http-services/spec.md` | Create | ADDED coalesce hub + firma/obtener session cache |
| `openspec/changes/…/specs/admin-certifications-frontend/spec.md` | Create | ADDED deferred PDF deps until download |
| `docs/qa/PLAN-AUDITORIA-…` §U2 | Modify | Scale note + checkboxes (apply/archive) |
| `docs/frontend/00-angular20-port-v0.md` or `03-modulos-admin.md` | Modify | Short client-filter scale note |

## Interfaces / Contracts

No public API shape change. Private fields only:

```typescript
// HttpAttendanceService / AttendanceMockService
private hubPending: Promise<HubAsistencias> | null = null;

// HttpInstitutionalConfigService
private obtenerPending: Promise<InstitutionalConfig> | null = null;
private firmaPreviewByRole = new Map<SignatureRole, Promise<Blob>>();
```

HTTP URLs, `Cache-Control: no-store`, download filename, and D0 (no token/QR rotation) unchanged.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `listarHub` coalesce | Two parallel/`await` calls → one HTTP GET; after `marcar`/`anular` → second GET |
| Unit | Mock `listarHub` | Same Promise identity until mutate; fresh after `marcar` |
| Unit | `previewFirma` / `obtener` | Second call no new GET; after `subirFirma`/`quitarFirma`/`guardar` refetch |
| Unit | PDF page | `descargarPdf` still produces feedback; no sync top-level html2canvas/jspdf import |
| Typecheck | App | `npx tsc --noEmit -p tsconfig.app.json` |
| E2E | — | Out of scope |

## Threat Matrix

N/A — no routing/auth boundary, shell/subprocess, VCS/PR automation, executable-file classification, or process-integration change.

## Migration / Rollout

No migration. FE deploy only. Rollback = revert FE + delta specs.

## Open Questions

- [x] Firmas cache required? **Yes (locked INCLUDE)**
- [x] List scale threshold? **Hundreds OK / thousands later (locked docs)**
- [x] Hub re-index? **Deferred (locked)**
- [ ] Exact docs file for scale note (`00` vs `03`) — prefer shortest add in `docs/frontend/03-modulos-admin.md` unless apply finds a better anchor
