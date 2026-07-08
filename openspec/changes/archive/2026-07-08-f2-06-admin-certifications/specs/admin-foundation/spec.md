# Delta — admin-foundation

## MODIFIED Requirements

### Requirement: Rutas administrativas aisladas

El sistema DEBE exponer `/admin/login`, `/admin`, `/admin/dashboard`, las rutas `/admin/cursos*`, `/admin/asistencias*` y `/admin/certificaciones*` como rutas Angular standalone/hijas sin romper ni reemplazar las rutas públicas existentes.
(Previously: incluía login, dashboard, Cursos y Asistencias; Certificaciones seguía fuera del ruteo activo.)

#### Scenario: Navegación admin básica

- **Given** una persona abre `/admin/login`, `/admin/dashboard`, `/admin/cursos*`, `/admin/asistencias*` o `/admin/certificaciones*`
- **When** Angular resuelve la ruta
- **Then** DEBE cargar la pantalla administrativa correspondiente.
- **And** `/admin` DEBE resolver hacia login o dashboard según la sesión mock.

#### Scenario: Rutas públicas preservadas

- **Given** existen las rutas públicas `''`, `validar/:tokenCertificacion` y `**`
- **When** se agregan rutas bajo `/admin`
- **Then** las rutas públicas DEBEN conservar su comportamiento previo.
- **And** `/admin/*` NO DEBE caer en el wildcard público por error.

### Requirement: Login y shell explícitamente simulados

El sistema DEBE presentar login, shell y dashboard como UI simulada honesta; NO DEBE prometer autenticación real ni acceso administrativo productivo. El dashboard DEBE enlazar Cursos, Asistencias y Certificaciones; Certificaciones DEBE quedar identificada como base mock-only de F2-06.
(Previously: el dashboard enlazaba Cursos y Asistencias; Certificaciones seguía como placeholder deshabilitado.)

#### Scenario: Mensaje visible de simulación

- **Given** una persona ve el login administrativo
- **When** revisa el formulario
- **Then** DEBE ver “Acceso simulado — la autenticación real se define en una fase posterior”.

#### Scenario: Dashboard con Certificaciones navegable

- **Given** existe una sesión mock activa
- **When** se abre `/admin/dashboard`
- **Then** DEBE mostrarse un dashboard sin datos reales.
- **And** DEBE enlazar Cursos, Asistencias y Certificaciones con conteos ficticios o estados de demostración.

### Requirement: Shell accesible, responsive y alineado a F1-02

El sistema DEBE construir el shell admin con semántica accesible, foco visible, layout responsive, tokens visuales F1-02 y estado activo comprensible para `/admin/cursos*`, `/admin/asistencias*` y `/admin/certificaciones*`.
(Previously: el estado activo contemplaba Cursos y Asistencias como navegación real.)

#### Scenario: Navegación accesible

- **Given** una persona navega con teclado o lector de pantalla
- **When** recorre login, sidebar, dashboard, Cursos, Asistencias y Certificaciones
- **Then** DEBEN existir labels, landmarks, foco visible y estado activo comprensible.
- **And** el drawer mobile NO DEBE referenciar con `aria-controls` un elemento ausente.

#### Scenario: Sin dependencias visuales nuevas

- **Given** F1-02 dejó tokens CSS y SVG inline como base visual
- **When** se implementa el shell admin y Certificaciones
- **Then** DEBE reutilizar esos tokens.
- **And** NO DEBE incorporar Tailwind, shadcn, lucide, CVA ni copia literal React/Next.

### Requirement: Documentación y límites de handoff

El sistema DEBE documentar el alcance F2-06, sus límites mock-only y el handoff hacia F4-F6.
(Previously: documentaba el cierre F2-05 y el handoff hacia F2-06.)

#### Scenario: Límites documentados

- **Given** se cierra el ciclo F2-06
- **When** se actualiza la documentación frontend
- **Then** DEBE constar que quedan excluidos backend, deploy, base, material privado, auth real, HTTP/API, storage, datos reales, DNI completo administrativo, tokens completos, Tailwind/deps nuevas y copia React/Next.

#### Scenario: Handoff a fases posteriores

- **Given** F2-06 agrega certificaciones administrativas mock
- **When** se consulta la documentación del ciclo
- **Then** DEBE encontrar Certificaciones activo como ruta navegable mock y las acciones de emisión, PDF, entrega manual, revocación y listado real marcadas como handoff.
