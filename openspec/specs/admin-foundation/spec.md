# Especificación — admin-foundation

## Propósito

Definir la base navegable del panel administrativo Angular 20 para F2-04..F2-06: rutas admin, login visual, shell administrativo y sesión mock en memoria, sin autenticación real ni integración backend.

## Requirements

### Requirement: Rutas administrativas aisladas

El sistema DEBE exponer `/admin/login`, `/admin`, `/admin/dashboard`, `/admin/cursos*`, `/admin/asistencias*`, `/admin/certificaciones*` y `/admin/alumnos*` sin romper rutas públicas.
(Previously: no exponía `/admin/alumnos/:id` como ruta administrativa activa.)

#### Scenario: Navegación admin básica

- **Given** una persona abre `/admin/login`, `/admin/dashboard`, `/admin/cursos*`, `/admin/asistencias*`, `/admin/certificaciones*` o `/admin/alumnos*`
- **When** Angular resuelve la ruta
- **Then** DEBE cargar la pantalla administrativa correspondiente.
- **And** `/admin` DEBE resolver hacia login o dashboard según la sesión mock.

#### Scenario: Rutas públicas preservadas

- **Given** existen las rutas públicas `''`, `validar/:tokenCertificacion` y `**`
- **When** se agrega `/admin/alumnos*`
- **Then** las rutas públicas DEBEN conservar su comportamiento previo.
- **And** `/admin/*` NO DEBE caer en el wildcard público por error.

### Requirement: Login y shell explícitamente simulados

El sistema DEBE presentar login, shell y dashboard simulados; NO DEBE prometer auth real. El dashboard DEBE enlazar Cursos, Asistencias, Certificaciones y Alumnos con conteos ficticios.
(Previously: el dashboard no enlazaba Alumnos.)

#### Scenario: Mensaje visible de simulación

- **Given** una persona ve el login administrativo
- **When** revisa el formulario
- **Then** DEBE ver “Acceso simulado — la autenticación real se define en una fase posterior”.

#### Scenario: Dashboard con Alumnos navegable

- **Given** existe una sesión mock activa
- **When** se abre `/admin/dashboard`
- **Then** DEBE mostrarse un dashboard sin datos reales.
- **And** DEBE enlazar Alumnos, Cursos, Asistencias y Certificaciones.

### Requirement: Sesión mock solo en memoria

El sistema DEBE usar una sesión mock en memoria para habilitar la navegación visual. NO DEBE usar claves admin reales o temporales embebidas, credenciales reales o demo, `localStorage`, `sessionStorage`, cookies, IndexedDB ni llamadas API.

#### Scenario: Inicio y cierre de sesión mock

- **Given** el login recibe datos formalmente válidos
- **When** se confirma el acceso simulado
- **Then** la sesión mock DEBE activarse solo en memoria.
- **And** cerrar sesión DEBE limpiar solo ese estado en memoria.

#### Scenario: Sin persistencia ni red

- **Given** se usa el flujo admin F2-03
- **When** se inspecciona el comportamiento del login, guard y shell
- **Then** NO DEBE existir escritura en storage, cookies ni llamadas HTTP.
- **And** NO DEBE aparecer ninguna clave admin real o temporal embebida en código Angular ni bundle.

### Requirement: Shell accesible, responsive y alineado a F1-02

El sistema DEBE construir shell accesible/responsive, con foco, tokens F1-02 y estado activo para `/admin/cursos*`, `/admin/asistencias*`, `/admin/certificaciones*` y `/admin/alumnos`.
(Previously: el estado activo no contemplaba Alumnos.)

#### Scenario: Navegación accesible

- **Given** una persona navega con teclado o lector de pantalla
- **When** recorre login, sidebar, dashboard y módulos
- **Then** DEBEN existir labels, landmarks, foco y estado activo de Alumnos.
- **And** el drawer mobile NO DEBE referenciar con `aria-controls` un elemento ausente.

#### Scenario: Sin dependencias visuales nuevas

- **Given** F1-02 dejó tokens CSS y SVG inline como base visual
- **When** se integra Alumnos al shell
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