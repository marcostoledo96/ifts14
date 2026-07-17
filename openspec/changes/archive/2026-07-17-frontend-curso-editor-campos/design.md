# Design: Editor de curso — paridad v0 con contrato estricto

## Technical Approach

Rehacer template y CSS de `course-editor-page` con el layout v0 (grid `minmax(0,1fr) + 18rem aside sticky`), manteniendo el componente OnPush/signals existente (incl. guard `loadGen` y route reuse). Extender el estado del componente con `estadoOriginal`, `activo` (derivado) y detección de fechas `realizada` tocadas. `guardar()` en edit orquesta `actualizarEstado` condicional + `reemplazarFechas`.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Estado en create | Sin control; copy "se crea activo" | Toggle fingido; PATCH post-create | Backend ignora `estado` del body; no fingir persistencia |
| Toggle off desde `activo` | `cerrado` | `archivado` | Cierre operativo normal; archivado es decisión explícita del listado |
| Toggle off con original ≠ activo | Conservar estado original | Forzar `cerrado` | No degradar `borrador`→`cerrado` silenciosamente |
| Aviso impacto | Comparar borrador vs fechas originales `realizada` (modificada o ausente) | Flag backend por fecha | No existe endpoint; el detalle ya trae estados |
| Select estado de fecha | Mantener (programada/realizada/cancelada) | Ocultarlo | Es contrato real y las asistencias dependen de `realizada` |
| Íconos | SVG inline | lucide-angular | Convención del repo |
| Demo banner | Mantener (useRealApi=false en dev) | Condicionarlo a environment | Patrón vigente en students/certifications |

## Data Flow

```
recargar(edit) ─► obtener(id) ─► detalle + estadoOriginal + fechasOriginales
       │
toggle activo ─► signal activo (sin HTTP)
fechas drafts ─► signal fechas
       │
impactoRealizadas = computed(originales realizada modificadas/quitadas)
       │
guardar() ─► estadoResultante ≠ estadoOriginal → actualizarEstado(id, estado)
          ─► reemplazarFechas(id, drafts)
          ─► refrescar detalle local + ok()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `course-editor-page.ts` | Modify | `estadoOriginal`, `activo`, `impactoRealizadas`, toggle handler, `guardar()` |
| `course-editor-page.html` | Modify | Grid v0, header con badges, tabla fechas con índice, aviso, aside sticky |
| `course-editor-page.css` | Modify | Grid, switch, tabla, aside, badges |
| `course-editor-page.spec.ts` | Modify | Tests REQ-CEDIT-*; preservar route-reuse/loadGen |

## Interfaces / Contracts

```ts
// Estado derivado en el componente (sin cambios de modelos ni servicios):
readonly estadoOriginal = signal<EstadoCurso>('activo');
readonly activo = signal(false);           // toggle UI
estadoResultante(): EstadoCurso;           // activo? 'activo' : (original==='activo' ? 'cerrado' : original)
readonly impactoRealizadas = computed<boolean>; // fechas originales 'realizada' modificadas o ausentes del draft
```

`CoursesService` no cambia: `crear`, `actualizarEstado`, `reemplazarFechas`, `guardarFecha` ya existen en HTTP e InMemory.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Component | Grid + aside presentes; create sin control de estado | DOM asserts |
| Component | Toggle: off→cerrado, sin cambio→sin PATCH, on→activo | spy sobre `COURSES_SOURCE.actualizarEstado` |
| Component | Índice `01/02/03`; sin `input[type=time]` | DOM asserts |
| Component | Aviso impacto: quitar/modificar realizada vs sin cambios | signals + DOM |
| Component | guardar() edit: orden estado→fechas, persistencia InMemory | tests existentes adaptados |
| Regression | route reuse, loadGen stale, id inválido | tests existentes preservados |

## Migration / Rollout

Sin migración. El cambio es de UI/orquestación; mock y HTTP quedan funcionales de inmediato. Rollback = revertir los 4 archivos.

## Open Questions

- None (locks del orquestador: Approach 1, sin inputs fantasma, default activo documentado).
