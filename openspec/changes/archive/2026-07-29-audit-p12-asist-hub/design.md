# Design: Auditoría P12 — hub de asistencias

## Technical Approach

Cerrar PERF P12 en `AttendancesListPage.cargar` sin cambiar UI ni contrato. Hoy `fechasConPresentes` usa `[...Set].filter` + `hub.fechas.some` → ~O(cursos × ids × fechas). Reemplazo: índices Set/Map lineales. Semántica = «Listado global solo por curso» + ADDED «Agregación lineal». HTTP opcional (un `toAsistencia` en `listarHub`); mock intacto; sin P13/P14/backend.

## Architecture Decisions

| Decisión | Opción | Tradeoff | Decisión |
|----------|--------|----------|----------|
| Índice O(n) | `Map<fechaId, cursoId>` no-`cancelada` + `Map<cursoId, Set<cursoFechaId>>`; M si `asistibleById.get(id) === c.id` | Extra Map vs Set de claves | **Elegido**: Map fecha→curso (O(1) + pertenencia) |
| Índice alt. | Set `cursoId:fechaId` | Similar; string concat | Rechazado: Map numérico más claro |
| Helper puro | `derivarFilas(hub)` | Testable; +LOC | Opcional; inline en `cargar` basta |
| Semántica | Conservar N/M | Drift si se “simplifica” | Invariantes abajo |
| HTTP | Un `toAsistencia` + reusar array | Diff extra; mismo contrato | Incluir si cabe en el PR |
| Mock | Tocar `alumnosActivos` | Ruido; UI no consume | **Fuera** |
| Spec HTTP | Delta `listarHub` | Solo si hay edit | Condicional al apply HTTP |

### Invariantes semánticos

1. `fechasAsistibles` = fechas del curso con `estado !== 'cancelada'`.
2. `fechasConPresentes` = ids distintos con ≥1 presente cuya fecha existe, es del curso y no está `cancelada`.
3. Presentes en `cancelada` o huérfanos no suman a M.
4. `alumnosActivos` nunca es N ni M.
5. Orden por `codigo`; `loadGen`/errores/copy sin cambio.

### Algoritmo lineal (pseudo)

```
asistibleById: Map<fechaId, cursoId>   // solo ≠ cancelada
fechasPorCurso: Map<cursoId, number>
presentesPorCurso: Map<cursoId, Set<fechaId>>

for f in hub.fechas:
  if f.estado === 'cancelada': continue
  asistibleById.set(f.id, f.cursoId)
  fechasPorCurso.inc(f.cursoId)

for a in hub.asistencias:
  presentesPorCurso.getOrCreate(a.cursoId).add(a.cursoFechaId)

for c in hub.cursos:
  N = fechasPorCurso.get(c.id) ?? 0
  M = count id in presentes where asistibleById.get(id) === c.id
```

Complejidad: O(|fechas| + |asistencias| + |cursos| + Σ|ids|) — lineal.

### HTTP opcional

En `listarHub`: acumular mapeadas en el loop de cache; `asistencias: mapped` en el return. Precarga `asistenciasPorCurso` igual. Contrato intacto.

## Data Flow

```
listarHub() → HubAsistencias
       │
       ▼
 cargar: fechas → asistibleById + fechasPorCurso
         asistencias → presentesPorCurso
         cursos → FilaCurso {N,M} → sort codigo → filas
       │
       ▼
 filtradas / pager 20 / textoMetricas (UI intacta)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../list/attendances-list-page.ts` | Modify | Agregación lineal en `cargar` |
| `.../list/attendances-list-page.spec.ts` | Modify | Caso cancelada+presentes; métricas/CUR-005 |
| `.../list/attendances-list-page.html` | Unchanged | UI OK |
| `.../data/http-attendance.service.ts` | Optional | Un `toAsistencia` en `listarHub` |
| `.../data/http-attendance.service.spec.ts` | Optional | Solo si HTTP editado |
| `.../data/attendance-mock.service.ts` | Unchanged | Fuera |
| delta `admin-attendances-frontend` | Exists | ADDED lineal + cancelada |
| delta `frontend-http-services` | Conditional | Merge solo si apply toca HTTP |

## Interfaces / Contracts

Sin tipos públicos nuevos. Solo algoritmo interno (+ mapeo HTTP opcional).

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | N/M seed (CUR-001/005) | Conservar test |
| Unit | Cancelada+presentes no suma N/M | Fixture hub + assert métricas |
| Unit | Huérfano/otro curso | Opcional mismo fixture |
| Unit HTTP | `listarHub` GET+mapeo | Solo si HTTP editado |
| E2E | — | No requerido |

Sin assert big-O: ausencia de `some` anidado + tests semánticos + review del diff.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Rollback = revert PR de list (+ HTTP si entró).

## Open Questions

Ninguna que bloquee tasks. Confirmado: PERF solo en `cargar`; mock intacto; HTTP opcional no bloqueante.
