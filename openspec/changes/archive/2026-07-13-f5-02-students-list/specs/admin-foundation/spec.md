# Delta for admin-foundation

## MODIFIED Requirements

### Requirement: Rutas administrativas aisladas

El sistema DEBE exponer `/admin/login`, `/admin`, `/admin/dashboard`, `/admin/cursos*`, `/admin/asistencias*`, `/admin/certificaciones*` y `/admin/alumnos` sin romper rutas públicas.
(Previously: no exponía `/admin/alumnos` como ruta administrativa activa.)

#### Scenario: Navegación admin básica

- GIVEN se abre una ruta admin habilitada, incluida `/admin/alumnos`
- WHEN Angular resuelve la ruta
- THEN DEBE cargar la pantalla correspondiente.
- AND `/admin` DEBE resolver hacia login o dashboard según la sesión mock.

#### Scenario: Rutas públicas preservadas

- GIVEN existen rutas públicas
- WHEN se agrega `/admin/alumnos`
- THEN las rutas públicas DEBEN conservar su comportamiento previo.
- AND `/admin/*` NO DEBE caer en el wildcard público por error.

### Requirement: Login y shell explícitamente simulados

El sistema DEBE presentar login, shell y dashboard simulados; NO DEBE prometer auth real. El dashboard DEBE enlazar Cursos, Asistencias, Certificaciones y Alumnos con conteos ficticios.
(Previously: el dashboard no enlazaba Alumnos.)

#### Scenario: Mensaje visible de simulación

- GIVEN se ve el login
- WHEN revisa el formulario
- THEN DEBE ver “Acceso simulado — la autenticación real se define en una fase posterior”.

#### Scenario: Dashboard con Alumnos navegable

- GIVEN existe sesión mock activa
- WHEN se abre `/admin/dashboard`
- THEN DEBE mostrarse un dashboard sin datos reales.
- AND DEBE enlazar Alumnos, Cursos, Asistencias y Certificaciones.

### Requirement: Shell accesible, responsive y alineado a F1-02

El sistema DEBE construir shell accesible/responsive, con foco, tokens F1-02 y estado activo para `/admin/cursos*`, `/admin/asistencias*`, `/admin/certificaciones*` y `/admin/alumnos`.
(Previously: el estado activo no contemplaba Alumnos.)

#### Scenario: Navegación accesible

- GIVEN se navega con teclado/lector
- WHEN recorre login, sidebar, dashboard y módulos
- THEN DEBEN existir labels, landmarks, foco y estado activo de Alumnos.
- AND el drawer mobile NO DEBE referenciar con `aria-controls` un elemento ausente.

#### Scenario: Sin dependencias visuales nuevas

- GIVEN F1-02 dejó tokens CSS y SVG inline
- WHEN se integra Alumnos al shell
- THEN DEBE reutilizar esos tokens.
- AND NO DEBE incorporar dependencias visuales ni copia React/Next.
