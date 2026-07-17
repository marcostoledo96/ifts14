# Design: Detalle de alumno — habilitar acciones

## Technical Approach

Approach 2 acotado: (1) convertir CTAs de emisión del detalle en `routerLink` con query; (2) leer `ActivatedRoute.queryParamMap` en `CertificationNewPage` tras catálogos; (3) agregar `listarAsistenciasPorAlumno` y sección read-only colapsable en el detalle. Sin rutas anidadas ni backend nuevo.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Destino emisión | Ruta plana `/admin/certificaciones/nueva?alumno=&curso=` | Rutas anidadas v0 | Ya existe emisión Ciclo 2; evita rewrite |
| Curso en query | Solo si `curso.id` match `/^\d+$/` | Siempre enviar string | Lock: id real; HTTP detalle aún sin cursos |
| Query inválida | Ignore + `avisoQuery` no bloqueante | Redirect / hard error | Lock + UX |
| Asistencias UI | Sección inline en detalle (toggle) | Nueva ruta; link a listado global | Sin filtro global = acción falsa |
| Seam | `listarAsistenciasPorAlumno` en `AttendanceService` | Reusar PorPar en loop | Backend ya filtra solo `alumnoId` |
| Compartir/Editar | Disabled + copy actualizado | Habilitar stubs | Sin API útil |

## Data Flow

```
Detalle ──routerLink──► /certificaciones/nueva?alumno&curso
                              │
                     queryParamMap + catálogos
                              │
                     set alumnoId/cursoId si válidos
                              │
                     cargarPar() (presentes / 409)

Detalle ──toggle──► ATTENDANCE.listarAsistenciasPorAlumno(id)
                              │
                     GET /admin/asistencias?alumnoId=
                              │
                     tabla/lista read-only (fecha, curso)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `students/pages/detail/student-detail-page.{html,ts,css,spec.ts}` | Modify | CTAs emisión; toggle asistencias; motivos |
| `certifications/pages/new/certification-new-page.{ts,html,spec.ts}` | Modify | Query preselect + aviso |
| `attendances/models/attendance.types.ts` | Modify | Nuevo método interface |
| `attendances/data/http-attendance.service.ts` (+spec) | Modify | GET `?alumnoId=` |
| `attendances/data/attendance-mock.service.ts` (+spec) | Modify | Filtro por alumno |
| Specs callers mocks (`course-detail`, marking, no-real-data) | Modify | Stub del método nuevo |

## Interfaces / Contracts

```ts
// AttendanceService
listarAsistenciasPorAlumno(alumnoId: number): Promise<readonly Asistencia[]>;

// CertificationNewPage — tras catálogos:
// parseInt query alumno/curso; match en alumnos activos / cursos activos
```

Helper en detalle:

```ts
emitirCertUrl(alumnoId: number, cursoId: string): string[] | { path + query }
// curso numérico → query alumno+curso; si no → solo alumno
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | CTAs href/query; Emitir fila; motivos | `student-detail-page.spec.ts` |
| Unit | Preselect válido/inválido | `certification-new-page.spec.ts` + `RouterTestingHarness` |
| Unit | HTTP/mock `listarAsistenciasPorAlumno` | attendance service specs |
| Component | Toggle asistencias empty/data | detail spec con ATTENDANCE_SOURCE stub |

## Migration / Rollout

No migration. Feature usable de inmediato en mock y HTTP.

## Open Questions

- None (cerrado por locks). HTTP detalle sin cursos: Emitir fila no aparece hasta que exista seam de cursos en detalle — aceptable.
