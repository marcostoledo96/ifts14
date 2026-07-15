# Diseño: F5-02 — Listado administrativo de alumnos

## Enfoque técnico

Crear `features/admin/students/` siguiendo F5-01: `STUDENTS_SOURCE` entrega un seed ficticio sin red ni storage; signals y `computed()` buscan, filtran, cuentan y paginan de a 5. El DTO y el seed omiten propiedad/valor de email, legajo, DNI completo, token, matrícula y UUID. Solo `dniMostrar` único por alumno (`NN****NN`) y `tieneEmail: boolean` representan documento y contacto. Una generación de carga descarta éxito, error y `finally` obsoletos. `STUDENTS_QA_ENABLED` usa `isDevMode` para habilitar estados forzados únicamente en desarrollo/tests.

## Decisiones de arquitectura

| Opción | Trade-off | Decisión y fundamento |
|---|---|---|
| Reusar datos de Asistencias/Certificaciones | Evita otro seed, pero acopla features y amplía la exposición. | Crear `StudentsService` + `InMemoryStudentsService`, siguiendo los seams existentes y manteniendo una frontera privada independiente. |
| Email mock vs. indicador booleano | Un literal facilitaría la paridad v0, pero viola el contrato corregido. | Persistir solo `tieneEmail`; tabla/cards muestran “Contacto disponible” o “Sin email”, sin reconstruir direcciones. |
| Filtrado en source vs. página | El source simularía prematuramente una API. | `listar()` carga todo; `computed()` busca solo nombre y `dniMostrar`, aplica contacto, clamp y `slice(5)`, como F5-01. |
| Subcomponentes vs. página única | Extraer tabla/cards agrega abstracciones de un uso. | Una página standalone comparte estado y datos; HTML semántico y CSS local reutilizan tokens F1-02. |
| Navegar a detalle vs. diferir | Una ruta inexistente produciría un enlace roto. | Control `disabled`/`aria-disabled` con “Disponible en F5-03”; no registrar `alumnos/:id`. |
| Activación inmediata vs. progresiva | Navegación temprana expone una pantalla incompleta. | Implementar feature y pruebas; luego provider/ruta; finalmente sidebar y dashboard. |

## Flujo de datos

    recargar() → STUDENTS_SOURCE.listar() → alumnos signal
         │              loadGeneration          │
         └─ QA/error              búsqueda + filtros computed
                                                │
                              página segura → tabla + cards

Buscar por nombre o DNI enmascarado, alternar contacto o limpiar reinicia página 1. `con-email`/`sin-email` es un par mutuamente excluyente y se combina por intersección con la búsqueda disponible.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/students/{students.models,students.service,in-memory-students.service}.ts` | Crear | DTO mínimo, token/contrato y seed seguro. |
| `apps/frontend-angular/src/app/features/admin/students/pages/list/students-list-page.{ts,html,css,spec.ts}` | Crear | Carrera, QA, filtros, paginación, tabla/cards y estados. |
| `apps/frontend-angular/src/app/features/admin/students/students.service.spec.ts` | Crear | Contrato, conteo y privacidad del seed. |
| `apps/frontend-angular/src/app/features/admin/students/__checks__/{no-secrets,no-real-data}.spec.ts` | Crear | Ausencia de campos/literales prohibidos, red y storage. |
| `apps/frontend-angular/src/app/app.routes.{ts,spec.ts}` | Modificar | Provider, ruta lazy protegida, orden y runtime. |
| `apps/frontend-angular/src/app/features/admin/sidebar-admin.{ts,spec.ts}` | Modificar | Activar Alumnos y estado por prefijo. |
| `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.{ts,html,spec.ts}` | Modificar | Tarjeta y conteo desde el seam, con fallback `0`. |
| `openspec/changes/f5-02-students-list/evidence/*` | Crear en verify | Paridad desktop/mobile, estados y cero requests. |

## Interfaces / contratos

```ts
interface Alumno {
  readonly id: number;
  readonly apellido: string;
  readonly nombre: string;
  readonly dniMostrar: string;
  readonly tieneEmail: boolean;
  readonly cursosConAsistencia: number;
  readonly certificacionesValidas: number;
}
interface StudentsService {
  listar(): Promise<readonly Alumno[]>;
  contar(): Promise<number>;
}
```

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unidad | Seed/DTO sin email literal, `email` ni legajo; máscara y conteo | Jasmine; RED antes del source. |
| Componente | Búsqueda nombre+DNI masked, contacto booleano, combinaciones, reset/clamp, race, QA producción, estados, tabla/cards y F5-03 bloqueado | `TestBed`, promesas controladas y DOM. |
| Integración/E2E | Guard/provider/ruta, sidebar/dashboard, cero requests y paridad 1280×800/390×844 | `RouterTestingHarness`, suite/build y Playwright. |

## Threat Matrix

| Boundary | Aplicabilidad | Comportamiento seguro/fallo y RED |
|---|---|---|
| Angular routing | Applicable | Con sesión carga lista; sin sesión redirige; `alumnos` precede catch-all. `/admin/alumnos/1` no resuelve detalle. RED en `app.routes.spec.ts`. |
| Documentation-like paths | N/A: no clasifica ni ejecuta archivos | Sin test. |
| Git repository selection | N/A: no ejecuta Git | Sin test. |
| Commit state | N/A: no automatiza commits | Sin test. |
| Push state | N/A: no automatiza push | Sin test. |
| PR commands | N/A: no automatiza PR | Sin test. |

## Migración / rollout

No requiere migración. Activación: modelo/source → página/tests → provider+ruta → sidebar → dashboard. Rollback inverso restaura Alumnos con `route: null`; no hay datos persistidos.

## Preguntas abiertas

Ninguna. La spec corregida elimina la contradicción previa y mantiene F5-03 bloqueado.
