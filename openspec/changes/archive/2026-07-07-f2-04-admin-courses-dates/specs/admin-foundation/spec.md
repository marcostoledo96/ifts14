# Delta — admin-foundation

## MODIFIED Requirements

### Requirement: Rutas administrativas aisladas

El sistema DEBE exponer `/admin/login`, `/admin`, `/admin/dashboard` y las rutas `/admin/cursos*` como rutas Angular standalone/hijas sin romper ni reemplazar las rutas públicas existentes.
(Previously: solo definía login, dashboard y redirección admin; Cursos era placeholder.)

#### Scenario: Navegación admin básica

- **Given** una persona abre `/admin/login`, `/admin/dashboard` o `/admin/cursos*`
- **When** Angular resuelve la ruta
- **Then** DEBE cargar la pantalla administrativa correspondiente.
- **And** `/admin` DEBE resolver hacia login o dashboard según la sesión mock.

#### Scenario: Rutas públicas preservadas

- **Given** existen las rutas públicas `''`, `validar/:tokenCertificacion` y `**`
- **When** se agregan rutas bajo `/admin`
- **Then** las rutas públicas DEBEN conservar su comportamiento previo.
- **And** `/admin/*` NO DEBE caer en el wildcard público por error.

### Requirement: Login y shell explícitamente simulados

El sistema DEBE presentar login, shell y dashboard como UI placeholder honesta; NO DEBE prometer autenticación real ni acceso administrativo productivo.
(Previously: el dashboard solo indicaba handoff futuro sin navegación real a Cursos.)

#### Scenario: Mensaje visible de simulación

- **Given** una persona ve el login administrativo
- **When** revisa el formulario
- **Then** DEBE ver “Acceso simulado — la autenticación real se define en una fase posterior”.

#### Scenario: Dashboard con handoff F2-04

- **Given** existe una sesión mock activa
- **When** se abre `/admin/dashboard`
- **Then** DEBE mostrarse un dashboard sin datos reales.
- **And** DEBE enlazar Cursos y mantener Asistencias/Certificaciones como placeholders deshabilitados.

### Requirement: Shell accesible, responsive y alineado a F1-02

El sistema DEBE construir el shell admin con semántica accesible, foco visible, layout responsive, tokens visuales F1-02 y estado activo comprensible para `/admin/cursos*`.
(Previously: Cursos, Asistencias y Certificaciones eran solo handoff visual.)

#### Scenario: Navegación accesible

- **Given** una persona navega con teclado o lector de pantalla
- **When** recorre login, sidebar, dashboard y Cursos
- **Then** DEBEN existir labels, landmarks, foco visible y estado activo comprensible.
- **And** el drawer mobile NO DEBE referenciar con `aria-controls` un elemento ausente.

#### Scenario: Sin dependencias visuales nuevas

- **Given** F1-02 dejó tokens CSS y SVG inline como base visual
- **When** se implementa el shell admin y Cursos
- **Then** DEBE reutilizar esos tokens.
- **And** NO DEBE incorporar Tailwind, shadcn, lucide, CVA ni copia literal React/Next.

### Requirement: Documentación y límites de handoff

El sistema DEBE documentar el alcance F2-04, sus límites y el handoff hacia F2-05..F2-06.
(Previously: documentaba el cierre F2-03 y el handoff hacia ciclos posteriores.)

#### Scenario: Límites documentados

- **Given** se cierra el ciclo F2-04
- **When** se actualiza la documentación frontend
- **Then** DEBE constar que quedan excluidos backend, deploy, base, material privado, auth real, HTTP/API, storage, datos reales, DNI, tokens, Tailwind/deps nuevas y copia React/Next.

#### Scenario: Handoff a ciclos siguientes

- **Given** F2-05..F2-06 agregan funcionalidad administrativa
- **When** consultan la documentación F2-04
- **Then** DEBEN encontrar Cursos activo, Asistencias/Certificaciones deshabilitados y límites vigentes como base de integración.
