# Spec: Paridad visual nueva certificación (P-11)

Delta UI sobre emisión existente (`REQ-EMIT-*`). Source of truth visual: `muestra_pagina/components/admin/nueva-certificacion-editor.tsx`. Honest UI: sin APIs inventadas.

## Purpose

Paridad visual/a11y de `/admin/certificaciones/nueva` con el editor documental v0, conservando el contrato de emisión y los locks de honestidad (sin folio/código pre-emisión, `dniMostrar`, firmas tipográficas).

## Non-goals

Wizard 3 pasos; folio/número/QR real pre-emisión; upload logos/firmas; email; cambios backend; dependencia lucide.

---

### Requirement: REQ-P11-001 — Pantalla única documental

MUST ser una sola pantalla (selección + preview + aside), MUST NOT wizard de 3 pasos.

#### Scenario: Sin wizard

- **Given** `/admin/certificaciones/nueva`
- **When** se inspecciona el DOM
- **Then** MUST NOT textos de pasos “Paso 1/2/3” ni stepper multi-paso

### Requirement: REQ-P11-002 — Selección alumno/curso/ciclo

MUST combobox/buscador de alumnos activos (filtro local apellido/nombre/`dniMostrar`) + select de cursos activos + ciclo lectivo de solo lectura desde `curso.cuatrimestre`.

#### Scenario: Solo activos

- **Given** catálogos mixtos
- **When** se abren selectores
- **Then** MUST listar solo alumnos/cursos activos

### Requirement: REQ-P11-003 — Preview documental

Con par seleccionado y datos cargados, MUST mostrar: banda institucional, declaración (nombre + `dniMostrar` + curso), registro de asistencia (tabla o empty), autoridades tipográficas desde config, bloque trazabilidad presentacional.

#### Scenario: Con presentes

- **Given** par con presentes en fechas `realizada`
- **When** termina la carga
- **Then** MUST tabla con fecha, descripción si hay, estado Presente

#### Scenario: Sin fantasma pre-emisión

- **Given** preview antes de emitir
- **When** se inspecciona
- **Then** MUST NOT folio/código definitivo inventado ni email en claro
- **And** MUST usar `dniMostrar`

### Requirement: REQ-P11-004 — Loading / vacíos / check

MUST skeleton o `aria-busy` mientras `cargandoPar`; MUST avisos bloqueantes sin fechas realizadas / sin presentes; MUST deshabilitar Emitir en esos casos y con duplicado confirmado por UI/`emitiendo`.

#### Scenario: Sin fechas

- **Given** curso sin fechas `realizada`
- **Then** aviso bloqueante + Emitir disabled

#### Scenario: Loading

- **Given** consulta del par en vuelo
- **Then** preview `aria-busy` o skeleton visible

### Requirement: REQ-P11-005 — Aside resumen + CTA

MUST panel “Resumen de emisión” (alumno, curso, jornadas, entrega Manual / Sin email si `tieneEmail === false`) + CTA primario “Emitir certificación” + Cancelar.

#### Scenario: CTA

- **Given** elegibilidad OK
- **When** se pulsa Emitir
- **Then** MUST llamar `emitir` con `{ alumnoId, cursoId, issuedAt, expiresAt: null }` y navegar al detalle en éxito

### Requirement: REQ-P11-006 — Firmas y QR honestos

Autoridades MUST venir de `InstitutionalConfig` (tipográficas). QR MUST ser decorativo o placeholder con nota de que el QR permanente se genera al emitir. MUST NOT claim de firma criptográfica ni persistencia de logos.

#### Scenario: Config

- **Given** config cargada
- **Then** preview muestra `rectorName`/`advisorName` (o roles)
- **And** badge o copy indica configuración institucional
