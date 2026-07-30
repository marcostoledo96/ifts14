# Delta for frontend-angular-shell

## ADDED Requirements

### Requirement: SHELL-HYG-01 — Sin scaffolds de página huérfanos

El frontend Angular DEBE NOT versionar scaffolds de página sin ruta canónica (`loadComponent` / router). Páginas sin consumidor de routing DEBEN eliminarse con sus specs. DEBE NOT reintroducir `LandingPage` sin ruta canónica.

#### Scenario: Features sin página sin ruta

- **GIVEN** el árbol de features del frontend
- **WHEN** se auditan `@Component` de página de producto
- **THEN** cada página DEBE tener ruta canónica vía `loadComponent` (o redirect que la cargue)
- **AND** DEBE NOT existir `LandingPage` sin entrada en el router

#### Scenario: Raíz no carga landing huérfana

- **GIVEN** la ruta pública `''` del shell
- **WHEN** el router resuelve la raíz
- **THEN** DEBE redirigir a `/admin/login`
- **AND** DEBE NOT cargar un scaffold de landing sin ruta

### Requirement: SHELL-HYG-02 — Sin UI compartida sin consumidores

El frontend DEBE NOT versionar UI compartida (`shared/ui`) sin ≥1 consumidor de producto (template/import runtime). Shared huérfanos (p. ej. `FolioShell`) DEBEN eliminarse con sus specs. Restaurar desde git es aceptable si vuelve un consumidor real.

#### Scenario: Shared UI con consumidor

- **GIVEN** un componente bajo UI compartida
- **WHEN** se buscan consumidores fuera de su propio árbol
- **THEN** DEBE existir ≥1 consumidor de producto
- **AND** DEBE NOT permanecer un `FolioShell` sin usos

#### Scenario: Folio público sin shell huérfano

- **GIVEN** la validación pública de folio
- **WHEN** se renderiza la UI de folio
- **THEN** DEBE funcionar sin el shared eliminado
- **AND** DEBE NOT reintroducir el shell solo por reuso hipotético

### Requirement: SHELL-HYG-03 — Sin alias muertos de acciones primarias

Las páginas DEBEN NOT exponer alias de compatibilidad sin callers (templates/specs/módulos). Si UI y tests usan solo el canónico, el alias muerto DEBE eliminarse. En marcado de asistencia el canónico DEBE ser `guardarYGenerar`; un `guardar()` sin callers DEBE NOT permanecer.

#### Scenario: Marking usa solo el canónico

- **GIVEN** la página de marcado de asistencia
- **WHEN** se inspeccionan template y specs
- **THEN** el guardado DEBE invocar `guardarYGenerar`
- **AND** DEBE NOT existir alias `guardar()` sin callers

#### Scenario: Quitar alias no cambia UX

- **GIVEN** un usuario en marcado de asistencia
- **WHEN** ejecuta la acción primaria guardar/generar
- **THEN** el comportamiento DEBE coincidir con `guardarYGenerar` previo
- **AND** DEBE NOT cambiar copy ni UX

### Requirement: SHELL-HYG-04 — OnPush en todos los @Component de app

Todo `@Component` bajo `apps/frontend-angular/src/app` DEBE declarar `ChangeDetectionStrategy.OnPush`. Este ciclo DEBE preservar el invariante (post-cleanup: 30/30) y DEBE NOT introducir componentes sin OnPush.

#### Scenario: Inventario OnPush completo

- **GIVEN** todos los `@Component` bajo `src/app`
- **WHEN** se audita `changeDetection`
- **THEN** cada uno DEBE usar `OnPush`
- **AND** el conteo DEBE ser completo salvo altas/bajas que también cumplan OnPush (baseline post-U1: 30/30 tras baja Landing/FolioShell)

#### Scenario: Cleanup no rompe OnPush

- **GIVEN** eliminación de scaffolds huérfanos y del alias muerto
- **WHEN** se re-audita change detection
- **THEN** los componentes restantes DEBEN seguir en OnPush
- **AND** DEBE NOT agregarse un componente sin OnPush en este ciclo

### Requirement: SHELL-HYG-05 — Helper opcional de ventana de paginación

El frontend PUEDE extraer `paginasVisibles` idéntico de listados admin a un helper puro (p. ej. `paginasVisiblesWindow(total, actual)`). Si se extrae: los 4 listados (estudiantes, cursos, certificaciones, asistencias) DEBEN usarlo; HTML/UX DEBE permanecer equivalente; el helper DEBE ser puro. Si el diff es ajustado, el extract PUEDE diferirse sin bloquear SHELL-HYG-01..04.

#### Scenario: Extract mantiene UX de listados

- **GIVEN** los 4 listados admin con ventana ≤5 / elipsis
- **WHEN** se introduce el helper (si el ciclo lo incluye)
- **THEN** cada listado DEBE delegar al helper
- **AND** las páginas visibles DEBEN ser idénticas a las previas

#### Scenario: Diff ajustado permite defer

- **GIVEN** presupuesto de revisión ajustado
- **WHEN** se omite el extract en este ciclo
- **THEN** SHELL-HYG-01..04 DEBEN cumplirse igual
- **AND** `paginasVisibles` PUEDE quedar diferido explícitamente
