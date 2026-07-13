# Diseño: F4-04 — Detalle de curso

## Enfoque técnico

Evolucionar `CourseDetailPage` in-place, sin rutas, servicios ni dependencias nuevas. La página obtiene el curso por `COURSES_SOURCE`, reacciona al `id` mediante `effect()` y descarta respuestas obsoletas con una generación local. Después consulta cada fecha mediante el seam opcional `ATTENDANCE_SOURCE`; `Promise.allSettled` aísla fallos por fecha. `CERTIFICATIONS_SOURCE` queda como seam de integración opcional, pero no se consulta: su contrato real solo expone `cursoNombre`, no `cursoId`, y asociar por nombre inventaría identidad.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión y fundamento |
|---|---|---|
| Evolución in-place vs componente nuevo | El template crece, pero evita duplicar pantalla y ruta | Modificar los cuatro archivos existentes; sigue el patrón F4-01/F4-03 y permite rollback puntual. |
| `effect()` + generación vs `ngOnInit` | Agrega un contador privado | Usar el patrón vigente de `CourseEditorPage` y `AttendanceMarkingPage`; cubre reutilización de ruta y evita commits stale. |
| Seams opcionales vs acoplamiento fuerte | Puede haber métricas no disponibles | `inject(ATTENDANCE_SOURCE, { optional: true })`; ausencia o fallo no bloquea el curso. No modificar providers vecinos. |
| Conteo de asistencia | `listarAsistencias(cursoId, fechaId)` devuelve filas, pero una lista vacía no distingue “pendiente” de “cero presentes” | Mostrar `N presentes` solo si `N > 0`; una lista vacía real muestra `Pendiente`/`Cargar`. Ausencia o fallo muestra `No disponible` y no habilita acción, con texto accesible. |
| Certificaciones | `Certificacion` carece de `cursoId` | No consultar ni mostrar un total supuesto. Reservar `—`/“Disponible cuando exista asociación por cursoId”; nunca filtrar por `cursoNombre`. |
| Responsive | Duplica marcado visual | Tabla desktop y tarjetas mobile con el mismo modelo derivado; garantiza paridad v0 y acciones equivalentes. |
| Anuncios accesibles | Varios `aria-live` o `role="alert"` generan anuncios repetidos | Un solo `<output aria-live="polite" aria-atomic="true">` (rol implícito `status`) resume carga, error, cantidades conocidas y datos no disponibles; el error visual no agrega `role="alert"`. |

## Flujo de datos

```text
route id signal → effect → loadGen++ → COURSES_SOURCE.obtener(cursoId)
                                      └→ fechas → allSettled(listarAsistencias(cursoId, fechaId))
                                                   └→ modelo por fecha → tabla + tarjetas
CERTIFICATIONS_SOURCE ── contrato sin cursoId ──→ fallback explícito, sin consulta
```

Cada recarga limpia curso, métricas, error y resumen. Solo la generación vigente puede publicar resultados o finalizar `cargando`. Un fallo del curso muestra error de página; un fallo/ausencia de asistencia degrada únicamente su métrica.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.ts` | Modificar | `effect`, `untracked`, generación, seam opcional, modelo derivado y resumen único. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.html` | Modificar | Ficha con acento, tabla desktop, tarjetas mobile, fallback honesto, vacío y acciones existentes. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.css` | Modificar | Paridad institucional, breakpoints, estados y foco; mantener budget CSS. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.spec.ts` | Modificar | RED/GREEN de contratos, concurrencia, degradación, accesibilidad y navegación. |

## Interfaces / contratos

Tipo local mínimo, sin ampliar modelos compartidos:

```ts
type AttendanceMetric =
  | { status: 'known'; present: number }
  | { status: 'unavailable'; reason: 'empty' | 'missing-seam' | 'failed' };
```

Rutas reutilizadas: editar/agregar fecha → `/admin/cursos/:id/editar`; cargar/ver → `/admin/cursos/:id/fechas/:fechaId/asistencias`. Fechas canceladas no ofrecen acción.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Componente | Carga, error, vacío, conteo conocido, lista vacía real, seam ausente/rechazado/throw síncrono | Escribir RED con dobles de tokens; resolver promesas fuera de orden para probar generación. |
| Contrato UI | Tabla/caption/headers, lista mobile, acción equivalente, único live region | Consultas DOM y destinos `routerLink`; detectar el `status` implícito de `<output>`, no solo atributos. |
| Integración/evidencia | Ruta real, privacidad, responsive y paridad v0 | Suite Angular completa, build sin warnings y capturas 1280×800/390×844 de éxito, fallback y vacío. |

Trazabilidad mínima: cada escenario del delta debe nombrar su `it(...)`; conservar checks `no-secrets`, `no-real-data` y no-`fetch`.

## Matriz de amenazas

N/A — no se modifican routing, shell, subprocess, automatización VCS/PR, clasificación de ejecutables ni fronteras de integración de procesos; solo se reutilizan rutas Angular existentes.

## Migración / rollout

Sin migración ni feature flag. Rollback: revertir los cuatro archivos de la página; contratos, providers y rutas quedan intactos.

## Preguntas abiertas

Ninguna bloqueante. El total de certificaciones y la distinción “pendiente” frente a “cero presentes” requieren contratos futuros por `cursoId`/estado de carga.
