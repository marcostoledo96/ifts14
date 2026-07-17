# Spec: Paridad lista alumnos (P-07)

## Purpose

Paridad visual de `/admin/alumnos` con v0 en densidad; honestidad D0 (sin legajo, sin email literal, documento enmascarado).

### Requirement: REQ-PALU-001 — Densidad header/filtros

Header MUST CTA Nuevo alumno con icono UserPlus.
Filtros MUST search icon, chips con dots (cert) y MailWarning (sin email), resumen in-card.

#### Scenario: Filtros densos

- **Given** listado cargado
- **When** se inspecciona filtros
- **Then** search wrap con SVG; chips con indicadores; CTA con UserPlus

### Requirement: REQ-PALU-002 — Sin legajo ni email literal

MUST NOT renderizar columna/campo `legajo` ni dirección de email.
Contacto MUST badge (`Contacto disponible` / `Sin email` / `Sin dato`) según `tieneEmail`.
Documento MUST `dniMostrar` enmascarado.
Búsqueda MUST NOT por apellido/legajo/email (contratos previos).

#### Scenario: Honestidad

- **Given** listado con datos
- **When** se inspecciona markup y copy
- **Then** no aparece `LEG-` ni `@`
- **And** placeholder/label no mencionan apellido ni legajo

### Requirement: REQ-PALU-003 — Tabla/cards densas

Tabla MUST thead mono, hover, métricas con iconos; cert >0 con badge soft valid.
Cards mobile MUST nombre + documento; badge contacto; métricas; Ver detalle con Eye.
Paginación MUST footer asociado al listado.

#### Scenario: Desktop

- **Given** datos visibles
- **When** se inspecciona tabla
- **Then** 6 columnas (sin Legajo); acciones con SVG Eye + aria-label

### Requirement: REQ-PALU-004 — Empty states

Empty/error/loading/sin coincidencias MUST paneles SVG (polish previo).

#### Scenario: Vacío total

- **Given** lista vacía sin filtros
- **When** se renderiza
- **Then** panel empty + CTA crear primer alumno
