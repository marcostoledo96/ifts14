# Spec: Admin shell + sidebar

Chrome admin (`AdminShell` + `SidebarAdmin`) paridad v0. Sin rutas/auth.
**Locks:** no Help/Bell; sync “Sincronizado” sin hora; avatar “AD”; search editable no-op; logout funcional ink.

---

# admin-shell-chrome (NEW)

### REQ-SHELL-01 — Search presentación
Topbar MUST input editable `sm+` + Search SVG. MUST NOT filtrar/navegar/API. Placeholder “Buscar…”; aria presentación si hace falta.

#### Scenario: Visible no-op
- **Given** viewport `sm+`
- **When** se inspecciona topbar
- **Then** input editable + SVG
- **And** escribir MUST NOT filtrar/navegar/request

#### Scenario: Oculto mobile
- **Given** viewport `< sm`
- **When** se inspecciona topbar
- **Then** search oculto

### REQ-SHELL-02 — Sync estático
Topbar MUST `md+` punto valid + “Sincronizado”. MUST NOT timestamp ni claim sync real.

#### Scenario: Presentación
- **Given** viewport `md+`
- **When** se inspecciona topbar
- **Then** “Sincronizado” + indicador
- **And** MUST NOT hora inventada ni sync backend

#### Scenario: Oculto
- **Given** viewport `< md`
- **When** se inspecciona topbar
- **Then** sync oculto

### REQ-SHELL-03 — Avatar AD
Topbar MUST monograma “AD”. MUST NOT “MP” ni PII.

#### Scenario: Monograma
- **Given** shell renderizado
- **When** se inspecciona topbar
- **Then** avatar “AD”
- **And** MUST NOT “MP”/PII

### REQ-SHELL-04 — Sin chrome legacy topbar
MUST NOT “Sesión activa” ni títulos “IFTS N.° 14 — Admin” / “Panel administrativo”. Identidad en sidebar.

#### Scenario: Sin legacy
- **Given** shell renderizado
- **When** se inspecciona topbar
- **Then** MUST NOT “Sesión activa”
- **And** MUST NOT títulos Admin/Panel previos

### REQ-SHELL-05 — Marca sidebar ink
Sidebar MUST ink; “IFTS N.° 14” + “Bedelía · Panel” + SVG; tokens F1-02.

#### Scenario: Marca
- **Given** sidebar visible
- **When** se inspecciona encabezado
- **Then** “IFTS N.° 14” y “Bedelía · Panel”
- **And** tema ink

### REQ-SHELL-06 — Operación + barra activa
Nav MUST “Operación” (MUST NOT “Secciones”). Activo MUST barra 2px `--color-circuit`.

#### Scenario: Label
- **Given** sidebar visible
- **When** se inspecciona heading nav
- **Then** “Operación”
- **And** MUST NOT “Secciones”

#### Scenario: Barra 2px
- **Given** ruta = ítem operativo
- **When** se renderiza el ítem
- **Then** barra activa 2px circuit

### REQ-SHELL-07 — Config única + logout
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

### REQ-SHELL-08 — Landmarks y límites
MUST landmarks, skip-link, drawer/overlay, print CSS; SVG inline. MUST NOT `app.routes.ts`/auth; MUST NOT Help/Bell.

#### Scenario: Sin Help/Bell ni deps
- **Given** shell renderizado
- **When** se inspecciona topbar/deps
- **Then** MUST NOT Help/Bell
- **And** MUST NOT lucide u otras libs icono

#### Scenario: Drawer intacto
- **Given** viewport mobile
- **When** abre/cierra drawer
- **Then** overlay/nav funciona
- **And** nesting rutas sin cambio contrato

---

# admin-foundation (MODIFIED)

### Requirement: Shell accesible, responsive y alineado a F1-02

El sistema DEBE shell accesible/responsive, foco, tokens F1-02 y activo para `/admin/cursos*`, `/admin/asistencias*`, `/admin/certificaciones*` y `/admin/alumnos`. Chrome DEBE seguir `admin-shell-chrome`. NO DEBE anclar “Sesión activa”, “Secciones” ni títulos Admin en topbar.
(Previously: shell accesible/tokens/activo sin chrome v0 ni prohibir badge/heading legacy.)

#### Scenario: Navegación accesible
- **Given** teclado o lector
- **When** recorre login, sidebar, dashboard, módulos
- **Then** labels, landmarks, foco, activo Alumnos
- **And** drawer NO DEBE `aria-controls` a elemento ausente

#### Scenario: Sin deps visuales nuevas
- **Given** tokens F1-02 + SVG inline
- **When** se actualiza el shell
- **Then** reutiliza tokens
- **And** NO DEBE Tailwind/shadcn/lucide/CVA/copia React

#### Scenario: Chrome v0 sin legacy
- **Given** shell renderizado
- **When** se inspeccionan topbar y sidebar
- **Then** cumple `admin-shell-chrome`
- **And** NO DEBE “Sesión activa” ni “Secciones”
