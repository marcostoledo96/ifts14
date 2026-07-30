# Spec — frontend-angular-shell

## Purpose

Definir la base técnica mínima de Angular 20 para el módulo público `/certificados/`, sin fijar diseño visual final ni alcance administrativo.

## Requirements

### Requirement: Shell Angular bajo `/certificados/`

El sistema DEBE proveer una aplicación Angular 20 ejecutable bajo la ruta pública `/certificados/`, con routing standalone y compatibilidad con rutas profundas del módulo.

#### Scenario: Entrada al módulo público

- **Dado** un despliegue servido desde `/certificados/`
- **Cuando** una persona abre la raíz del módulo
- **Entonces** la aplicación DEBE renderizar el shell público sin depender de datos reales.

#### Scenario: Ruta profunda refrescada

- **Dado** la ruta `/certificados/validar/{token}`
- **Cuando** el navegador refresca esa URL
- **Entonces** el shell DEBE conservar la navegación Angular prevista.

### Requirement: Estructura mínima y reemplazable

El shell DEBE usar estructura semántica, accesible y responsive mínima. NO DEBE definir sistema visual final, admin ni componentes de UI definitivos.

#### Scenario: Layout no final

- **Dado** que el diseño final corresponde a Matías
- **Cuando** se revisa este ciclo
- **Entonces** la interfaz DEBE distinguirse como base técnica reemplazable.

#### Scenario: Accesibilidad básica

- **Dado** una persona que navega con teclado
- **Cuando** recorre el shell
- **Entonces** DEBE existir foco visible y orden de lectura coherente.

### Requirement: Límites de seguridad y origen

El shell NO DEBE leer `material_privado_no_versionar/`, copiar React/Next desde `muestra_pagina/` ni incorporar datos reales.

#### Scenario: Sin datos reales ni copia literal

- **Dado** la referencia visual disponible o futura
- **Cuando** se construye la base Angular
- **Entonces** se DEBE portar intención funcional propia de Angular, no código React/Next.

### Requirement: Wildcard público a NotFound clara

El shell Angular DEBE enrutar rutas públicas desconocidas (`**`) a una página `NotFound` con copy fijo en español argentino formal que indique que la dirección no existe. DEBE NOT redirigir el wildcard público a validación (`/validar/…`), demo ni admin. El título de documento de la ruta PUEDE fijarse cuando sea trivial.

#### Scenario: URL pública desconocida muestra NotFound

- **GIVEN** una URL bajo el módulo que no coincide con rutas públicas ni admin conocidas
- **WHEN** el router resuelve la navegación
- **THEN** DEBE renderizar `NotFound` con mensaje ES-AR claro de página inexistente
- **AND** DEBE NOT cargar la pantalla de validación pública

#### Scenario: Wildcard no valida ni usa demo

- **GIVEN** una ruta huérfana pública (p. ej. `/certificados/ruta-inexistente`)
- **WHEN** se muestra `NotFound`
- **THEN** DEBE NOT invocar verify/API con el path como token
- **AND** DEBE NOT mencionar `demo-valido` ni «Certificado verificable»

### Requirement: CTA único hacia acceso administrativo

`NotFound` DEBE ofrecer exactamente un enlace «volver» accionable hacia `/admin/login` (etiqueta ES-AR sensata, p. ej. «Ir al acceso administrativo»). DEBE NOT ofrecer enlace a `/validar/…` ni inventar destinos de validación pública.

#### Scenario: CTA a login admin

- **GIVEN** la página `NotFound` renderizada
- **WHEN** el usuario activa el CTA de volver
- **THEN** DEBE navegar a `/admin/login`

#### Scenario: Sin CTA a validar

- **GIVEN** la página `NotFound` renderizada
- **WHEN** se inspecciona el DOM de la página
- **THEN** DEBE NOT existir enlace hacia `/validar/` ni rutas de validación pública

### Requirement: Aislamiento de huérfanas admin

Rutas bajo el prefijo `admin` que no coincidan con children conocidos DEBEN resolverse por el catch-all admin (`pathMatch: 'prefix'` → `/admin/dashboard`, luego guard) y DEBEN NOT caer en `NotFound` pública ni en validación pública. Este ciclo DEBE NOT introducir `AdminNotFound` ni 404 admin dedicado.

#### Scenario: Typo admin sin sesión

- **GIVEN** sesión admin ausente y URL `/admin/typo` (u otra huérfana bajo `admin`)
- **WHEN** el router resuelve
- **THEN** DEBE aislar vía catch-all admin y terminar en flujo de login admin
- **AND** DEBE NOT renderizar `NotFound` pública ni `PublicValidationPage`

#### Scenario: Typo admin con sesión

- **GIVEN** sesión admin válida y URL `/admin/typo`
- **WHEN** el router resuelve
- **THEN** DEBE terminar en el dashboard admin (o equivalente del catch-all)
- **AND** DEBE NOT mostrar validación pública ni wildcard público

### Requirement: Honesty de NotFound sin filtración

`NotFound` DEBE usar únicamente copy fijo controlado. DEBE NOT mostrar stack traces, `Error.message` crudo, tokens, DNI, rutas internas, `/api/` ni contenido demo. D0 (no rotar token/QR) permanece fuera de este ciclo.

#### Scenario: Copy fijo sin stack ni secretos

- **GIVEN** navegación a `NotFound` (incluso tras error de navegación simulado)
- **WHEN** se renderiza la página
- **THEN** DEBE mostrar solo mensajes fijos ES-AR
- **AND** DEBE NOT incluir stack, token completo, DNI ni texto demo

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
