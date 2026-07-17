# Spec: Paridad shell topbar + sidebar icons (P-01)

Delta sobre `admin-shell-chrome`. Source of truth: TSX v0. Honest UI: sin APIs inventadas.

---

# admin-shell-chrome (MODIFIED)

### Requirement: REQ-SHELL-01 — Search presentación

Topbar MUST input editable `sm+` (40rem+) + Search SVG. MUST NOT filtrar/navegar/API.
Placeholder MUST ser exactamente `Buscar curso, alumno o certificado…` (o `&hellip;`).

#### Scenario: Visible no-op con placeholder v0

- **Given** viewport `sm+`
- **When** se inspecciona topbar
- **Then** input editable + SVG Search
- **And** placeholder MUST contener `Buscar curso, alumno o certificado`
- **And** escribir MUST NOT filtrar/navegar/request

#### Scenario: Oculto mobile

- **Given** viewport `< sm`
- **When** se inspecciona topbar
- **Then** search oculto

### Requirement: REQ-SHELL-02 — Sync estático con hora mock

Topbar MUST `md+` (48rem+) punto valid + texto `Sincronizado 10:42`.
La hora `10:42` MUST ser mock estático de presentación. MUST NOT claim sync backend ni timestamp dinámico.

#### Scenario: Presentación con hora mock

- **Given** viewport `md+`
- **When** se inspecciona topbar
- **Then** texto MUST contener `Sincronizado 10:42` + indicador valid
- **And** MUST NOT invocar API de sync

#### Scenario: Oculto

- **Given** viewport `< md`
- **When** se inspecciona topbar
- **Then** sync oculto

### Requirement: REQ-SHELL-03 — Avatar AD

Topbar MUST monograma `AD`. MUST NOT `MP` ni PII (auth no expone identidad).

#### Scenario: Monograma

- **Given** shell renderizado
- **When** se inspecciona topbar
- **Then** avatar `AD`
- **And** MUST NOT `MP`/PII

### Requirement: REQ-SHELL-04 — Sin chrome legacy topbar

MUST NOT `Sesión activa` ni títulos `IFTS N.° 14 — Admin` / `Panel administrativo` en topbar.

#### Scenario: Sin legacy

- **Given** shell renderizado
- **When** se inspecciona topbar
- **Then** MUST NOT `Sesión activa`
- **And** MUST NOT títulos Admin/Panel previos en topbar

### Requirement: REQ-SHELL-05 — Marca sidebar ink

Sin cambio funcional vs ciclo previo: ink + `IFTS N.° 14` + `Bedelía · Panel`.

### Requirement: REQ-SHELL-06 — Operación + barra activa

Sin cambio vs ciclo previo: heading `Operación`; barra activa 2px circuit.

### Requirement: REQ-SHELL-07 — Config única + logout

Sin cambio vs ciclo previo: 5 ítems operativos; Config en footer; logout funcional.

### Requirement: REQ-SHELL-08 — Help y Bell presentacionales

Topbar MUST botones `aria-label="Ayuda"` y `aria-label="Notificaciones"` con SVG Lucide-like inline (HelpCircle, Bell).
Bell MUST mostrar dot warning visible.
Click MUST NOT abrir panel ni llamar API (no-op presentacional como v0).
MUST NOT instalar dependencia lucide npm.

#### Scenario: Ayuda y notificaciones visibles

- **Given** shell renderizado
- **When** se inspecciona topbar actions
- **Then** existen botones Ayuda y Notificaciones
- **And** Notificaciones muestra indicador (dot)
- **And** click MUST NOT navegar ni request

#### Scenario: Sin deps lucide

- **Given** package.json del frontend
- **When** se inspeccionan dependencias
- **Then** MUST NOT existir `lucide-angular` / `lucide-react` como dependencia del producto Angular

### Requirement: REQ-SHELL-09 — Iconografía Lucide-like sidebar

Ítems MUST usar metáforas Lucide: Inicio=`LayoutGrid`, Cursos=`BookOpen`, Alumnos=`Users`, Asistencias=`CalendarCheck`, Certificaciones=`QrCode`, Configuración=`Settings`, Cerrar sesión=`LogOut`.
SVG MUST ser inline multi-elemento; tamaño nav MUST ser 16×16 (1rem).
MUST NOT usar path “home” para Inicio ni documento genérico para Certificaciones.

#### Scenario: Metáforas correctas

- **Given** sidebar visible
- **When** se inspeccionan SVGs de nav
- **Then** Inicio usa grilla (LayoutGrid), no casa
- **And** Certificaciones usa patrón QR-like
- **And** cada ítem operativo tiene SVG 16×16

### Requirement: REQ-SHELL-10 — Landmarks y límites

MUST landmarks, skip-link, drawer/overlay, print CSS.
MUST NOT cambiar `app.routes.ts` ni contrato auth.
Footer page bajo main MAY permanecer (fuera de paridad P-01).

#### Scenario: Drawer intacto

- **Given** viewport mobile
- **When** abre/cierra drawer
- **Then** overlay/nav funciona sin cambio de contrato
