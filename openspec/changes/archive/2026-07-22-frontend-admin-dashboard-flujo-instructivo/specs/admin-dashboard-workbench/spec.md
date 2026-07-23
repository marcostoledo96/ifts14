# Delta — admin-dashboard-workbench

## ADDED Requirements

### Requirement: Panel Flujo de trabajo

El dashboard DEBE mostrar un panel instructivo «Flujo de trabajo» **antes** de «Pendientes de resolución» y **después** de Acciones. DEBE explicar brevemente el orden operativo y mostrar los cinco temas como etiquetas no navegables. DEBE ofrecer un CTA destacado a `/admin/guia`. NO DEBE duplicar la navegación del menú lateral.

#### Scenario: Orden en el dashboard

- **Given** sesión admin activa
- **When** se abre `/admin/dashboard`
- **Then** el panel Flujo de trabajo aparece antes del panel Pendientes de resolución

#### Scenario: Instructivo con CTA a la guía

- **Given** el panel Flujo de trabajo
- **When** se inspecciona el contenido
- **Then** DEBE haber un único enlace destacado a `/admin/guia`
- **And** NO DEBE haber filas clicables hacia los módulos del menú lateral

### Requirement: Guía operativa única

El sistema DEBE exponer `/admin/guia` bajo el shell admin protegido. La página DEBE explicar el flujo operativo de los cinco temas con anclas, botón Volver al dashboard y enlaces a las secciones reales. NO DEBE inventar features no disponibles (p. ej. carga masiva).

#### Scenario: Acceso a la guía

- **Given** sesión admin activa
- **When** se abre `/admin/guia`
- **Then** DEBE renderizarse la guía con las cinco secciones y Volver a `/admin/dashboard`
