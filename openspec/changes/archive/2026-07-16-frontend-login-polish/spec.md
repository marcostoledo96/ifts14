# Spec: admin-login-ui + delta admin-foundation

## Capability: `admin-login-ui`

### REQ-LOGIN-001: Iconos en inputs

El formulario de login MUST mostrar iconos decorativos SVG inline (usuario/ID y clave) junto a los campos, con `aria-hidden="true"`. MUST NOT agregar librería de iconos.

#### Scenario: Iconos visibles

- GIVEN una persona abre `/admin/login`
- WHEN ve los campos de ID y clave
- THEN cada campo MUST incluir un icono SVG inline no interactivo

### REQ-LOGIN-002: Toggle mostrar/ocultar clave

El formulario MUST permitir alternar visibilidad de la clave con botón `type="button"`, `aria-pressed` y `aria-label` en español («Mostrar clave» / «Ocultar clave»).

#### Scenario: Toggle password

- GIVEN el campo clave está en modo password
- WHEN la persona activa el toggle
- THEN el input MUST pasar a `type="text"` y el botón MUST reflejar `aria-pressed="true"`

### REQ-LOGIN-003: Loader en submit

Durante la verificación, el submit MUST mostrar «Verificando…», `aria-busy="true"`, y el fieldset MUST quedar deshabilitado. El loading lo controla la página alrededor de `auth.login` sin cambiar el contrato auth.

#### Scenario: Estado verificando

- GIVEN credenciales válidas localmente y login en curso
- WHEN el formulario está en loading
- THEN el botón MUST decir «Verificando…» y el fieldset MUST estar disabled

### REQ-LOGIN-004: Aviso de auditoría

El formulario MUST mostrar un aviso `role="note"` con icono ShieldCheck (SVG) y el texto «Todas las acciones administrativas quedan registradas.» MUST NOT mostrar mensajes de «acceso simulado».

#### Scenario: Aviso visible

- GIVEN una persona ve el login
- WHEN revisa el formulario
- THEN MUST ver el aviso de auditoría citado
- AND MUST NOT ver «Acceso simulado»

### REQ-LOGIN-005: Aside institucional y footer

La página MUST presentar aside con marca IFTS N.° 14 / Bedelía Digital, mensaje institucional, textura de grilla y estado del sistema. MUST incluir footer restringido. En mobile MUST conservar identidad visible (barra de marca), no ocultar toda la marca.

#### Scenario: Copy card y CTA

- GIVEN `/admin/login`
- WHEN se renderiza la card
- THEN el título MUST ser «Panel de certificaciones»
- AND el CTA idle MUST ser «Ingresar»
- AND MUST existir ayuda a Coordinación Académica

### REQ-LOGIN-006: Sin demos ni cambio de auth

El login MUST NOT portar credenciales demo, delays simulados ni placeholders de demo. MUST conservar payload `{ username, password }` y NO modificar `admin-auth.service.ts`.

#### Scenario: Contrato preservado

- GIVEN envío válido
- WHEN se emite el acceso
- THEN el payload MUST usar `username` y `password`
- AND NO MUST existir texto `usuario.demo@example.invalid` ni clave `demo` en UI

---

## Delta for `admin-foundation`

## MODIFIED Requirements

### Requirement: Login y shell explícitamente simulados

El sistema DEBE presentar login y shell administrativos; el dashboard DEBE ser mesa de trabajo (acciones, pendientes, actividad, resumen) según `admin-dashboard-workbench`. NO DEBE usar la grilla legacy de cuatro cards con conteos ficticios. El login DEBE comunicar acceso institucional con auth real (sesión cookie) y aviso de auditoría; NO DEBE presentar copy de «acceso simulado».
(Previously: exigía mensaje «Acceso simulado — la autenticación real se define en una fase posterior».)

#### Scenario: Aviso de auditoría en login

- **Given** una persona ve el login administrativo
- **When** revisa el formulario
- **Then** DEBE ver «Todas las acciones administrativas quedan registradas.»
- **And** NO DEBE ver «Acceso simulado — la autenticación real se define en una fase posterior».

#### Scenario: Dashboard mesa de trabajo

- **Given** existe una sesión admin activa
- **When** se abre `/admin/dashboard`
- **Then** DEBE mostrarse “Panel de certificaciones” con acciones principales navegables.
- **And** el resumen operativo DEBE derivar métricas de seams existentes o mostrar “—” ante fallo.
- **And** bandeja y actividad DEBEN ser honestas (sin conteos/eventos inventados).
