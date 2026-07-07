# Especificación — admin-foundation

## Propósito

Definir la base navegable del panel administrativo Angular 20 para F2-04..F2-06: rutas admin, login visual, shell administrativo y sesión mock en memoria, sin autenticación real ni integración backend.

## Requirements

### Requirement: Rutas administrativas aisladas

El sistema DEBE exponer `/admin/login`, `/admin` y `/admin/dashboard` como rutas Angular standalone, sin romper ni reemplazar las rutas públicas existentes.

#### Scenario: Navegación admin básica

- **Given** una persona abre `/admin/login` o `/admin/dashboard`
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

#### Scenario: Mensaje visible de simulación

- **Given** una persona ve el login administrativo
- **When** revisa el formulario
- **Then** DEBE ver “Acceso simulado — la autenticación real se define en una fase posterior”.

#### Scenario: Dashboard placeholder

- **Given** existe una sesión mock activa
- **When** se abre `/admin/dashboard`
- **Then** DEBE mostrarse un dashboard sin datos reales.
- **And** DEBE indicar el handoff hacia Cursos, Asistencias y Certificaciones.

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

El sistema DEBE construir `AdminShell`, `SidebarAdmin`, `LoginPage`, `LoginForm` y `AdminDashboardPage` con semántica accesible, foco visible, layout responsive y tokens visuales F1-02.

#### Scenario: Navegación accesible

- **Given** una persona navega con teclado o lector de pantalla
- **When** recorre login, sidebar y dashboard
- **Then** DEBEN existir labels, landmarks, foco visible y estado activo comprensible.

#### Scenario: Sin dependencias visuales nuevas

- **Given** F1-02 dejó tokens CSS y SVG inline como base visual
- **When** se implementa el shell admin
- **Then** DEBE reutilizar esos tokens.
- **And** NO DEBE incorporar Tailwind, shadcn, lucide, CVA ni copia literal React/Next.

### Requirement: Documentación y límites de handoff

El sistema DEBE documentar el alcance F2-03, sus límites y el handoff hacia F2-04..F2-06.

#### Scenario: Límites documentados

- **Given** se cierra el ciclo F2-03
- **When** se actualiza la documentación frontend
- **Then** DEBE constar que quedan excluidos backend, deploy, base, material privado, auth real y datos mock de cursos, alumnos, asistencias o certificaciones.

#### Scenario: Handoff a ciclos siguientes

- **Given** F2-04..F2-06 agregan funcionalidad administrativa
- **When** consultan la documentación F2-03
- **Then** DEBEN encontrar rutas, shell, sesión mock y límites vigentes como base de integración.
