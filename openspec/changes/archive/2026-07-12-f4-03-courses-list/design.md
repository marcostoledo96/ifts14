# Diseño: F4-03 — Listado de cursos con paridad v0

## Enfoque técnico

Evolucionar `CoursesListPage` in-place y conservar `/admin/cursos`, `COURSES_SOURCE` e `InMemoryCoursesService`. El servicio seguirá siendo mock-only: enriquecerá cada curso con `cuatrimestre`, cantidad de fechas derivada del arreglo interno y métricas no disponibles como `null`. La página usará signals para búsqueda, estado y disponibilidad de fechas; una única carga por cambio de filtros alimentará tabla desktop y tarjetas mobile con el mismo arreglo.

## Decisiones de arquitectura

| Opción | Trade-off | Decisión y fundamento |
|---|---|---|
| Modificar la página existente vs. crear otra | In-place concentra el diff; una página nueva duplica ruta y comportamiento. | Modificar `courses-list-page.*`: coincide con F4-01, permite rollback por commit y evita componentes/rutas nuevos. |
| Derivar métricas en courses vs. consultar otros features | Consultar asistencias/certificaciones daría cifras demo, pero acoplaría tres dominios. | `InMemoryCoursesService.listar()` deriva `cantidadFechas`; `alumnosPresentes` y `certificaciones` son `number | null`, renderizados como `—` con “Dato disponible con integración real”. |
| Cuatro chips de estado vs. control existente | Los chips imitan v0, pero agregan ruido para cuatro estados reales. | Conservar `<select>` para `borrador|activo|cerrado|archivado`; usar botones `aria-pressed` solo para `todas|con|sin` fechas. |
| Filtrado exclusivamente local vs. contrato existente | Local simplifica render, pero duplicaría reglas del servicio. | Extender `CursosFiltros` con `conFechas?: boolean`; cada signal dispara `recargar()`, manteniendo una frontera reemplazable. |

## Flujo de datos

    controles/signal ──→ recargar() ──→ COURSES_SOURCE.listar(filtros)
          ↑                                  │
      limpiar filtros                seed + conteo fechas
                                             │
                     signals de estado ← resultado/error
                              │
                    tabla desktop + cards mobile

`recargar()` activa loading, limpia error y reemplaza el resultado; el rechazo muestra mensaje seguro y “Reintentar”. Cero resultados sin filtros produce vacío total; con filtros activos produce “sin coincidencias”.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/courses/courses.models.ts` | Modificar | Agregar `cuatrimestre`, `cantidadFechas`, métricas nullable y `conFechas`. |
| `apps/frontend-angular/src/app/features/admin/courses/in-memory-courses.service.ts` | Modificar | Completar seed, derivar fechas/placeholders y filtrar con/sin fechas; altas usan “Sin programar”. |
| `apps/frontend-angular/src/app/features/admin/courses/courses-list-page.ts` | Modificar | Signals, filtros, limpieza, carga/reintento y distinción de vacíos. |
| `apps/frontend-angular/src/app/features/admin/courses/courses-list-page.html` | Modificar | Tabla accesible desktop, cards mobile, métricas, estados y links existentes detalle/editar. |
| `apps/frontend-angular/src/app/features/admin/courses/courses-list-page.css` | Modificar | Responsive y paridad con tokens existentes, sin Tailwind/iconos/dependencias. |
| `apps/frontend-angular/src/app/features/admin/courses/courses-list-page.spec.ts` | Modificar | Estados runtime, filtros, limpieza, semántica, links y placeholders. |
| `apps/frontend-angular/src/app/features/admin/courses/courses.service.spec.ts` | Modificar | Derivación, filtro con/sin fechas, placeholders y alta por defecto. |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/no-secrets.spec.ts` | Modificar | Mantener frontera sin red, storage ni secretos. |
| `apps/frontend-angular/src/app/features/admin/courses/__checks__/no-real-data.spec.ts` | Modificar | Validar cuatrimestres y datos ficticios. |
| `openspec/changes/f4-03-courses-list/evidence/*` | Crear en verify | Capturas desktop/mobile/estados y notas de paridad. |

No se modifican rutas, detalle/editor, backend, F4-04, dependencias ni configuración de build salvo que verify pruebe un warning nuevo.

## Contratos

```ts
interface Curso {
  readonly cuatrimestre: string;
  readonly cantidadFechas: number;
  readonly alumnosPresentes: number | null;
  readonly certificaciones: number | null;
}
interface CursosFiltros { readonly conFechas?: boolean; }
```

## Estrategia de pruebas y evidencia

| Capa | Qué | Enfoque |
|---|---|---|
| Servicio | Conteos, placeholders, filtros y alta | Specs unitarios sobre `InMemoryCoursesService`. |
| Componente | loading/error/retry, ambos vacíos, filtros/limpiar, tabla/cards, `aria-*`, rutas | `TestBed` con providers controlados y DOM en `courses-list-page.spec.ts`. |
| Regresión | Seguridad, datos ficticios, app completa | `npm run test:ci`, `npm run build`, `git diff --check`. |
| Visual | Paridad v0 y responsive | Capturas 1280×800 y 390×844; `parity-notes.md` contra `muestra_pagina/components/admin/lista-cursos.tsx`. |

## Threat Matrix

N/A — no cambia routing, shell, subprocess, automatización VCS/PR, clasificación de ejecutables ni integración de procesos.

## Migración, despliegue y rollback

No hay migración ni rollout: datos solo en memoria. Rollback: revertir el único work unit F4-03 restaura modelo, seed y página F2-04; borrar `openspec/changes/f4-03-courses-list/evidence/`. No hay rutas, persistencia, backend ni lockfiles que revertir.

## Preguntas abiertas

Ninguna.
