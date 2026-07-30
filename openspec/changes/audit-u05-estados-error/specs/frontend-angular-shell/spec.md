# Delta for frontend-angular-shell

## ADDED Requirements

### Requirement: SHELL-STATE-01 — Listados: loading / error / empty / no-results

Los listados admin críticos (cursos, alumnos, certificaciones, asistencias) DEBEN exponer el patrón P9–P23: skeleton de carga; panel de error recuperable con **Reintentar** en clase canónica `btn-primary` (mayoría vigente; cursos abandona `btn-secondary`); empty-total con CTA útil existente (`btn-primary` + `routerLink` de alta/navegación; DEBE NOT inventar componente EmptyState; empty de certs DEBE alinearse a ese patrón y no depender solo de `cta-nueva` como variante exclusiva); filtro vacío / no-results con acción «Limpiar…». Mensajes DEBEN ser honesty fijos (sin raw HTTP/URL/DNI/token). Dashboard/config solo smoke de paridad salvo regresión.

#### Scenario: Error recuperable con Reintentar primary

- **GIVEN** un listado crítico con fallo recuperable de carga
- **WHEN** se muestra el panel de error
- **THEN** DEBE ofrecer **Reintentar** con clase `btn-primary`
- **AND** DEBE NOT mostrar raw HTTP ni PII

#### Scenario: Empty-total con CTA útil

- **GIVEN** listado crítico sin filas (empty-total)
- **WHEN** se renderiza el estado vacío
- **THEN** DEBE mostrar CTA navegable al patrón existente (`btn-primary` + destino útil)
- **AND** DEBE NOT introducir un componente EmptyState nuevo

#### Scenario: No-results limpia filtros

- **GIVEN** listado con filtros que dejan cero resultados
- **WHEN** se muestra no-results
- **THEN** DEBE ofrecer acción de limpiar filtros/búsqueda

### Requirement: SHELL-STATE-02 — Reintentar gated a carga recuperable

En detalle/editores admin (incl. `course-editor`), **Reintentar** DEBE aparecer solo ante fallo recuperable de carga inicial. Not-found, id inválido y errores de acción/submit DEBEN NOT ofrecer Reintentar de load. `course-editor` DEBE paridad con detalle: carga recuperable con Reintentar; not-found sin retry.

#### Scenario: Course-editor carga recuperable

- **GIVEN** `course-editor` en modo edición con fallo recuperable de `obtener`
- **WHEN** se muestra el error de carga
- **THEN** DEBE ofrecer **Reintentar** que reintente la carga
- **AND** DEBE NOT mostrar raw técnico

#### Scenario: Not-found sin Reintentar

- **GIVEN** id inválido o recurso ausente en editor/detalle
- **WHEN** se muestra not-found
- **THEN** DEBE NOT ofrecer Reintentar de load

#### Scenario: Acción fallida sin retry de load

- **GIVEN** fallo de submit/acción (no carga inicial)
- **WHEN** se muestra el error
- **THEN** DEBE NOT activar Reintentar de carga inicial

### Requirement: SHELL-STATE-03 — QA forced views solo no-prod

Las barras/vistas QA forzadas de listados DEBEN estar disponibles solo cuando `isDevMode` es verdadero. Con token QA/`isDevMode` en falso (staging/prod) DEBEN NOT renderizarse. DEBE NOT romper harness local `ng serve`. Asistencias sin harness QA permanece aceptable (DEFER paridad).

#### Scenario: QA oculto fuera de dev

- **GIVEN** build o inyección con `isDevMode`/token QA en falso
- **WHEN** se carga un listado con harness QA
- **THEN** la barra/controles de vista forzada DEBEN NOT ser visibles

#### Scenario: QA usable en dev

- **GIVEN** `isDevMode` verdadero y token QA habilitado
- **WHEN** se fuerza vista cargando/error/vacío
- **THEN** DEBE poder inspeccionar esos estados sin afectar prod

### Requirement: SHELL-STATE-04 — 401 limpio a login (regresión)

Ante HTTP 401 en requests admin (excepto login), el interceptor DEBE `clearSession` y navegar a `/admin/login` sin propagar error a la página (NEVER + latch). DEBE NOT mostrar panel error+Reintentar espurio. Login 401 DEBE conservar mensaje de credenciales. Este ciclo DEBE NOT cambiar el interceptor salvo bug demostrado; el escenario es de regresión.

#### Scenario: 401 no-login redirige sin panel

- **GIVEN** sesión admin y request (≠ login) que responde 401
- **WHEN** el interceptor procesa el error
- **THEN** DEBE limpiar sesión y navegar a `/admin/login`
- **AND** la página DEBE NOT mostrar panel error+Reintentar por ese 401

#### Scenario: Login 401 no redirige en loop

- **GIVEN** POST de login que responde 401
- **WHEN** el interceptor evalúa la respuesta
- **THEN** DEBE NOT aplicar el redirect de sesión de admin
- **AND** la UI de login DEBE poder mostrar error de credenciales
