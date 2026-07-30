# Delta for frontend-angular-shell

## ADDED Requirements

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
