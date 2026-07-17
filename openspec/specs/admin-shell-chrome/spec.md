# admin-shell-chrome

Chrome admin (`AdminShell` + `SidebarAdmin`) paridad v0.
Locks P-01: Help/Bell presentacionales; sync `Sincronizado 10:42` mock; avatar `AD`; search editable no-op con placeholder v0; iconos Lucide-like SVG inline; logout funcional ink; Config única en footer. Sin dependencia lucide npm.

### Requirement: REQ-SHELL-01 — Search presentación

Topbar MUST input editable `sm+` (40rem+) + Search SVG. MUST NOT filtrar/navegar/API.
Placeholder MUST contener `Buscar curso, alumno o certificado`.

#### Scenario: Visible no-op

- **Given** viewport `sm+`
- **When** se inspecciona topbar
- **Then** input editable + SVG + placeholder v0
- **And** escribir MUST NOT filtrar/navegar/request

#### Scenario: Oculto mobile

- **Given** viewport `< sm`
- **When** se inspecciona topbar
- **Then** search oculto

### Requirement: REQ-SHELL-02 — Sync estático con hora mock

Topbar MUST `md+` (48rem+) punto valid + `Sincronizado 10:42`.
La hora MUST ser mock estático. MUST NOT claim sync backend ni timestamp dinámico.

#### Scenario: Presentación

- **Given** viewport `md+`
- **When** se inspecciona topbar
- **Then** `Sincronizado 10:42` + indicador
- **And** MUST NOT invocar API de sync

#### Scenario: Oculto

- **Given** viewport `< md`
- **When** se inspecciona topbar
- **Then** sync oculto

### Requirement: REQ-SHELL-03 — Avatar AD

Topbar MUST monograma `AD`. MUST NOT `MP` ni PII (auth sin identidad).

#### Scenario: Monograma

- **Given** shell renderizado
- **When** se inspecciona topbar
- **Then** avatar `AD`
- **And** MUST NOT `MP`/PII

### Requirement: REQ-SHELL-04 — Sin chrome legacy topbar

MUST NOT `Sesión activa` ni títulos `IFTS N.° 14 — Admin` / `Panel administrativo` en topbar. Identidad en sidebar.

#### Scenario: Sin legacy

- **Given** shell renderizado
- **When** se inspecciona topbar
- **Then** MUST NOT `Sesión activa`
- **And** MUST NOT títulos Admin/Panel previos

### Requirement: REQ-SHELL-05 — Marca sidebar ink

Sidebar MUST ink; `IFTS N.° 14` + `Bedelía · Panel` + SVG; tokens F1-02.

#### Scenario: Marca

- **Given** sidebar visible
- **When** se inspecciona encabezado
- **Then** `IFTS N.° 14` y `Bedelía · Panel`
- **And** tema ink

### Requirement: REQ-SHELL-06 — Operación + barra activa

Nav MUST `Operación` (MUST NOT `Secciones`). Activo MUST barra 2px `--color-circuit`.

#### Scenario: Label

- **Given** sidebar visible
- **When** se inspecciona heading nav
- **Then** `Operación`
- **And** MUST NOT `Secciones`

#### Scenario: Barra 2px

- **Given** ruta = ítem operativo
- **When** se renderiza el ítem
- **Then** barra activa 2px circuit

### Requirement: REQ-SHELL-07 — Config única + logout

Operación: Inicio, Cursos, Alumnos, Asistencias, Certificaciones. Config MUST una vez en pie + Cerrar sesión. Logout MUST comportamiento actual; estilo ink/v0.

#### Scenario: Config en pie

- **Given** sidebar visible
- **When** se cuentan links `/admin/configuracion`
- **Then** exactamente uno en footer
- **And** MUST NOT en Operación

#### Scenario: Logout

- **Given** sesión admin activa
- **When** Cerrar sesión
- **Then** logout existente (sin cambio auth)
- **And** control usable/enfocable

### Requirement: REQ-SHELL-08 — Help y Bell presentacionales

Topbar MUST botones `aria-label="Ayuda"` y `aria-label="Notificaciones"` con SVG Lucide-like inline.
Bell MUST mostrar dot warning. Click MUST NOT abrir panel ni API.
MUST NOT instalar lucide npm.

#### Scenario: Ayuda y notificaciones

- **Given** shell renderizado
- **When** se inspecciona topbar actions
- **Then** existen Ayuda y Notificaciones con dot
- **And** click MUST NOT navegar ni request

#### Scenario: Sin deps lucide

- **Given** dependencias del frontend Angular
- **When** se inspecciona package.json
- **Then** MUST NOT existir lucide como dependencia de producto

### Requirement: REQ-SHELL-09 — Iconografía Lucide-like sidebar

Inicio=`LayoutGrid`, Cursos=`BookOpen`, Alumnos=`Users`, Asistencias=`CalendarCheck`, Certificaciones=`QrCode`, Config=`Settings`, Logout=`LogOut`.
SVG inline multi-elemento 16×16. MUST NOT home para Inicio ni documento genérico para Certificaciones.

#### Scenario: Metáforas

- **Given** sidebar visible
- **When** se inspeccionan SVGs
- **Then** Inicio es grilla (4 rects); Certificaciones es QR-like; tamaño 16×16

### Requirement: REQ-SHELL-10 — Landmarks y límites

MUST landmarks, skip-link, drawer/overlay, print CSS.
MUST NOT cambiar `app.routes.ts`/auth.
Footer page bajo main MAY permanecer (fuera de P-01).

#### Scenario: Drawer intacto

- **Given** viewport mobile
- **When** abre/cierra drawer
- **Then** overlay/nav funciona
- **And** nesting rutas sin cambio contrato
