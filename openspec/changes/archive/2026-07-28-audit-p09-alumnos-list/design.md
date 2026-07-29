# Design: Auditoría P9 — listado de alumnos admin

## Technical Approach

Auditoría quirúrgica in-place sobre `StudentsListPage` (proposal + explore #1). Checklist P9 ya está mayormente cubierta en código; el trabajo cierra residuos de copy «legajo», alinea el delta de `admin-students-frontend` a HTTP/staging, y deja `HttpStudentsService` intacto salvo evidencia de métricas/mapping rotos (smoke staging o prueba unitaria que demuestre `optionalCount`/`toAlumno` fallando). Sin editor, detalle, backend ni chip «Con email».

## Architecture Decisions

| Decisión | Opciones | Tradeoff | Elección |
|----------|----------|----------|----------|
| Alcance de archivos | Solo list page vs + HTTP/servicio | HTTP ensancha blast radius sin evidencia | **`students-list-page.*` (+ CSS solo si hace falta)** |
| Copy «legajo» | Diferir vs eliminar ahora | Confirmado orquestador | **Eliminar** intro y vacío total |
| Chip «Con email» | Agregar vs set v0 actual | Tipo TS ya tiene `con-email` sin chip | **No chip**; conservar comentario paridad v0 |
| Email en celda | Literal v0 vs badges privacy | Contraría polish/privacidad | **Badges** Contacto disponible / Sin email / Sin dato |
| Métricas `—` | Refactor HTTP preventivo vs gate staging | Código `optionalCount` ya mapea ints; tests HTTP cubren 0/N | **No tocar HTTP** hasta smoke/prueba de mapping roto |
| Fuente de datos | Mock-only (spec vieja) vs `STUDENTS_SOURCE` | Staging usa `useRealApi` → HTTP | **Documentar HTTP + in-memory** en delta spec |
| QA toggles | Visibles staging vs `isDevMode` | Checklist P9 | Conservar **`STUDENTS_QA_ENABLED = isDevMode`** |
| Filtros | Server-side vs client P6 | Patrón cursos/alumnos vigente | Conservar **client-side** (`listar` + `resultadosFiltrados`) |
| DNI | Máscara vs completo UI | Hard rule AGENTS | Conservar **`dniMostrar` completo** en tabla/cards; sin DNI en logs |

## Data Flow

```
STUDENTS_SOURCE.listar()
        │
   Http (staging)     InMemory (dev/tests)
        │                    │
        └────────┬───────────┘
                 ▼
        alumnos signal (+ loadGeneration)
                 │
        resultadosFiltrados (q + cert + sin-email)
                 │
        itemsVisibles (página 20)
                 │
   UI: dniMostrar | etiquetaContacto | formatoMetrica(n|null→—)
```

Gate HTTP (condicional):

```
Smoke staging métricas
   │
   ├─ nums llegan → no tocar http-students.service.ts
   └─ — injustificado / clave ausente → mínimo optionalCount/alias
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend-angular/.../students/pages/list/students-list-page.html` | Modify | Sustituir intro «Legajos…» y vacío «su legajo…» por copy sin legajo inventado (p. ej. registro / ficha) |
| `.../students-list-page.ts` | Modify | Solo si hace falta ajuste mínimo ligado a copy/tests; no cambiar filtros ni badges |
| `.../students-list-page.css` | Modify | Solo ajuste cosmético mínimo si el copy rompe layout (esperable: no) |
| `.../students-list-page.spec.ts` | Modify | Asserts: sin «legajo» en intro/vacío; DNI completo; filtros cert/sin-email; métricas 0≠—; QA solo con token; sin email literal |
| `.../http-students.service.ts` | Conditional | **Solo** si staging/código prueba mapping de métricas roto |
| `.../http-students.service.spec.ts` | Conditional | Solo junto al cambio HTTP mínimo |
| `openspec/changes/.../specs/admin-students-frontend/spec.md` | Create | Delta MODIFIED (fase spec): HTTP/`STUDENTS_SOURCE`, DNI UI, QA, badges, copy sin legajo |

**No modificar**: editor, detalle, backend PHP, token/QR, chip «Con email», email literal.

## Interfaces / Contracts

Sin cambios de API. Contratos de UI vigentes a preservar:

- `formatoMetrica(null|undefined) → '—'`; `0` y `N` → string numérico.
- `etiquetaContacto`: `tieneEmail === true|false|null` → Contacto disponible / Sin email / Sin dato.
- Chips visibles: Con/Sin certificaciones + Sin email. Tipo `Contacto` puede seguir incluyendo `con-email` sin chip.
- `STUDENTS_PAGE_SIZE = 20`; estados carga/error/vacío/sin coincidencias + Reintentar.
- Errores: sin DNI ni token completos en mensajes/logs.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Copy sin legajo; badges; DNI; filtros; pager 20; métricas 0 | `students-list-page.spec.ts` + stub `STUDENTS_SOURCE` |
| Unit | QA invisible sin token / visible en tests | Override `STUDENTS_QA_ENABLED` |
| Unit | Mapping métricas (solo si se toca HTTP) | `http-students.service.spec.ts` |
| Integration | — | Fuera de alcance |
| E2E / smoke | Métricas numéricas en staging | Manual antes de tocar HTTP |

## Migration / Rollout

No migration required. Deploy frontend-only; rollback = revert de `students-list-page.*` (+ HTTP/spec si se tocaron).

## Open Questions

- Ninguna bloqueante: defaults de propuesta confirmados (sin legajo; sin chip Con email; smoke antes de HTTP).
- Pendiente de `sdd-spec`: escenarios Given/When/Then del delta `admin-students-frontend`.
- Pendiente de apply: resultado del smoke staging de métricas decide si entra el cambio condicional de HTTP.
