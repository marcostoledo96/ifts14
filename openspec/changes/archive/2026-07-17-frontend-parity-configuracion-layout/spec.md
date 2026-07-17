# Spec: Paridad layout configuración institucional (P-14)

Delta visual sobre la pantalla ya cubierta por REQ-CFG-001…009 (archive `2026-07-16-frontend-configuracion-institucional`). Contrato HTTP sin cambios.

## Purpose

Alinear layout/copy de `/admin/configuracion` con v0 para campos del DTO, manteniendo honestidad donde no hay API.

## Non-goals

Persistencia de logos, firmas archivo, email SMTP, sello, link QR, mensajes de validación pública. Sin cambios backend.

---

### Requirement: REQ-CFGLAY-001 — Chrome de página v0

La página MUST mostrar kicker «Folio institucional», título «Configuración institucional» y subtítulo que indique que los datos se aplican a certificados emitidos y no se editan en la emisión individual.

#### Scenario: Header

- **Given** `/admin/configuracion` cargada
- **When** se inspecciona el encabezado
- **Then** aparece «Folio institucional» y el subtítulo de impacto global

### Requirement: REQ-CFGLAY-002 — Banner de impacto

MUST mostrar aviso con tres puntos: impacto solo en documentos nuevos; certificados ya compartidos no cambian hasta regenerar PDF; no se editan en emisión individual.

#### Scenario: Tres bullets

- **Given** página visible
- **When** se lee el banner de impacto
- **Then** el texto menciona documentos nuevos, regeneración de PDF y no edición en emisión

### Requirement: REQ-CFGLAY-003 — Nav sticky de secciones

En viewport ancho MUST existir nav «Secciones de configuración» con anclas a `#identidad`, `#certificados`, `#autoridades`, `#contacto`, `#validacion`.

#### Scenario: Anclas

- **Given** form cargado
- **When** se inspecciona el nav
- **Then** existen enlaces a las cinco secciones anteriores

### Requirement: REQ-CFGLAY-004 — Campos DTO editables

MUST editar solo: `institutionName`, `certificateText`, `rectorName`, `rectorRole`, `advisorName`, `advisorRole`. MUST mostrar `updatedAt` como metadata de solo lectura.

#### Scenario: Contrato intacto

- **Given** carga exitosa
- **When** se guardan cambios válidos
- **Then** el PUT envía únicamente campos del contrato (sin logos/email/sello)

### Requirement: REQ-CFGLAY-005 — Sin persistencia fantasma

MUST NOT ofrecer `input[type=file]` funcional. Logos, upload de firmas, email SMTP y toggle de sello MUST omitirse o mostrarse disabled/presentacionales con nota de no disponibilidad. Contacto y Validación MUST NOT tener inputs editables inventados.

#### Scenario: Sin file upload

- **Given** página cargada
- **When** se buscan controles de archivo
- **Then** no hay `input[type=file]`

#### Scenario: Contacto y validación honestos

- **Given** secciones `#contacto` y `#validacion`
- **When** se inspeccionan
- **Then** no hay inputs/textarea/select editables de email ni mensajes públicos

### Requirement: REQ-CFGLAY-006 — Sticky dirty + preview

MUST conservar barra sticky con Guardar/Descartar condicionados a dirty, preview tipográfica de autoridades y estados de carga/error/éxito existentes (REQ-CFG).

#### Scenario: Dirty

- **Given** form ≠ snapshot
- **When** se mira la barra
- **Then** indica cambios sin guardar y habilita Guardar/Descartar
