# Diseño: F2-05 — Asistencias admin

## Enfoque técnico

Implementar una capacidad Angular 20 standalone y mock-only bajo `features/admin/attendances/`, reutilizando `COURSES_SOURCE`, el shell admin, tokens F1-02 y el patrón F2-04 de `effect()` + `loadGen`. No se agrega backend, HTTP, storage, Tailwind ni dependencias.

## Decisiones de arquitectura

| Decisión | Opción elegida | Alternativa descartada | Fundamento |
|---|---|---|---|
| Rutas | Dos entradas: `/admin/asistencias` y `/admin/cursos/:id/fechas/:fechaId/asistencias` | Wizard único o 3+ rutas | Mantiene sidebar activo y deep-link por fecha sin sobredimensionar. |
| Orden seguro | En `children`: `dashboard`, `asistencias`, `cursos/nuevo`, `cursos/:id/fechas/:fechaId/asistencias`, `cursos/:id/editar`, `cursos/:id`, `cursos` | Agregar después de `cursos/:id` | Evita que la ruta profunda caiga en `cursos/:id`; preserva catch-all admin `pathMatch: 'prefix'` antes de `**`. |
| Datos | Servicio en memoria vía `ATTENDANCE_SOURCE` provisto en la ruta admin junto a `COURSES_SOURCE` | `HttpClient`, storage o admin key | F2-05 es UI mock segura; la sustitución HTTP queda para auth real. |
| Route reuse | `effect()` sobre `cursoId()`/`fechaId()` + `loadGen` | Cargar solo en `ngOnInit` | Previene el bug confirmado en F2-04: una carga tardía no debe pisar la URL vigente. |

## Flujo de datos

```txt
Sidebar/Dashboard/Detalle curso
  → Angular Router protegido por adminGuard
  → AttendancesListPage / AttendanceMarkingPage
  → COURSES_SOURCE + ATTENDANCE_SOURCE
  → estado local en signals (baseline, selección, pendientes)
```

`AttendanceMarkingPage` carga curso, fecha, alumnos y asistencias activas. El baseline guardado es `Set<alumnoId>`; los checkboxes editan otro `Set`. Guardar llama `marcar()` con el set completo de alumnos (presente/ausente por fila); descartar restaura baseline.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/app.routes.ts` | Modificar | Importar/proveer `ATTENDANCE_SOURCE`; agregar las dos rutas en el orden definido. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Modificar | Casos de orden, sesión mock, runtime provider e ids inválidos. |
| `apps/frontend-angular/src/app/features/admin/sidebar-admin.*` | Modificar | `Asistencias` enlaza `/admin/asistencias`; `isActive()` acepta prefijo. `Certificaciones` sigue placeholder. |
| `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.*` | Modificar | Tarjeta Asistencias pasa a link real; Certificaciones queda deshabilitada. |
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.*` | Modificar | Link “Tomar asistencia” por fecha. |
| `apps/frontend-angular/src/app/features/admin/attendances/*` | Crear | Modelos, servicio, mock, lista, marcado y checks negativos. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar en archive | Registrar estado F2-05, límites y handoff F2-06. |

## Interfaces / contratos

```ts
export type EstadoAlumno = 'activo' | 'inactivo';
export interface AsistenciaAlumno { id: number; apellidoNombre: string; dniMostrar: string; estado: EstadoAlumno; }
export interface Asistencia { id: number; alumnoId: number; cursoId: number; cursoFechaId: number; fecha: string; fechaEstado: EstadoFecha; registradoEn: string; }
export interface AsistenciaMarcado { alumnoId: number; presente: boolean; }
export interface AttendanceService {
  listarAlumnos(cursoId: number): Promise<readonly AsistenciaAlumno[]>;
  listarAsistencias(cursoId: number, fechaId: number): Promise<readonly Asistencia[]>;
  marcar(cursoId: number, fechaId: number, marcados: readonly AsistenciaMarcado[]): Promise<readonly Asistencia[]>;
  anular(asistenciaId: number): Promise<void>;
}
```

Seed: 12–15 personas demo por curso, `dniMostrar` enmascarado (`XX****XX`), sin email, DNI completo, token, legajo ni matrícula.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Servicio | altas/bajas, duplicados, ids inválidos, reset por test | Jasmine/Karma con `ATTENDANCE_SOURCE`. |
| Componentes | búsqueda, checkboxes nativos, guardar/descartar, contador, errores | `ComponentFixture`, labels asociados y `aria-live` no anidado. |
| Route reuse | cambio de `cursoId/fechaId` y carga fuera de orden | Fake con promises controladas; resolver vieja después de nueva. |
| Routing | orden seguro, guard, provider real, ids inválidos | `RouterTestingHarness` + `withComponentInputBinding()`. |
| Negativos | sin red/storage/secretos/datos reales | `__checks__` y revisión de bundle en verify. |

## Accesibilidad y responsive

Usar landmarks existentes del admin, `<input type="search">`, `<fieldset>/<legend>` cuando agrupe alumnos, checkboxes nativos con label, `<output aria-live="polite">` para guardado y `<p role="alert">` para carga/error. Layout mobile: lista apilada; desktop: tabla o grid legible sin scroll horizontal obligatorio.

## Migración / rollout

Sin migración. Rollback: quitar `attendances/`, rutas, links y devolver Asistencias a placeholder.

## Forecast de revisión

Estimado producto+tests+docs: 1.250–1.450 líneas. Si `sdd-tasks` proyecta >1.500, dividir antes de apply: PR1 modelos/servicio/rutas/nav/checks; PR2 páginas/tests/docs. Riesgo: medio por margen estrecho y antecedente F2-04.

## Preguntas abiertas

- Ninguna bloqueante.
