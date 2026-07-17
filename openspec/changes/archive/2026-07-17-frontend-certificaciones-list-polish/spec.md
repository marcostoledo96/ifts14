# Spec: Lista certificaciones — polish honesto

## Purpose

Paridad visual/a11y del listado `/admin/certificaciones` con v0 donde hay dato real: badges de validez, CTA emitir, empty/loading/error con SVG. Sin columna ni filtro de entrega/`envio`.

## Non-goals

Chips/columna Entrega; inventar o derivar `envio`/`pdfStatus` en listado; N+1 a `entrega-manual`; cambios de rutas, paginación, privacidad o backend/DTO.

## Requirements

### REQ-CERTLIST-001: CTA Nueva certificación

El listado MUST mostrar en el header un enlace/botón activo “Nueva certificación” hacia `/admin/certificaciones/nueva`. MUST NOT deshabilitarlo ni marcarlo como pendiente de integración.

#### Scenario: CTA presente

- GIVEN listado cargado (éxito, vacío o con filtros)
- WHEN se inspecciona el header
- THEN MUST existir enlace a `/admin/certificaciones/nueva` con texto “Nueva certificación”

### REQ-CERTLIST-002: Badge validez con punto y borde

Cada fila/tarjeta MUST mostrar un badge de validez derivado solo de `estado` ∈ `{ borrador, vigente, revocado, vencido }`, con punto (dot) y borde semántico. Label UI: `vigente` → “Válida”; los demás con etiqueta legible equivalente. MUST NOT mezclar validez con entrega.

#### Scenario: Cuatro estados semánticos

- GIVEN certificaciones de los cuatro `estado`
- WHEN se renderizan resultados
- THEN cada una MUST mostrar badge con dot+borde y label correcto (Válida para vigente)

### REQ-CERTLIST-003: Empty total con Inbox y emitir

Vacío total (cero ítems, sin filtros activos) MUST mostrar icono Inbox SVG (`aria-hidden`), copy orientado a emitir y CTA a `/admin/certificaciones/nueva` (p.ej. “Emitir primera certificación”).

#### Scenario: Empty accionable

- GIVEN cero certificaciones y filtros en default
- WHEN se muestra vacío
- THEN MUST haber SVG Inbox + enlace/botón a `/admin/certificaciones/nueva`

### REQ-CERTLIST-004: Loading y error con SVG

Loading MUST mostrar indicador con SVG inline. Error MUST mostrar SVG, mensaje claro y acción Reintentar. Sin coincidencias (filtros activos, cero matches) MUST permitir limpiar filtros; MUST NOT redirigir a emitir como única acción.

#### Scenario: Error reintentable

- GIVEN `listar` falla
- WHEN se renderiza error
- THEN MUST haber SVG + control Reintentar

#### Scenario: Sin coincidencias vs vacío total

- GIVEN hay datos pero filtros no coinciden
- WHEN se muestra sin resultados
- THEN MUST ofrecer limpiar filtros
- AND MUST NOT exigir el CTA de empty total como única salida

### REQ-CERTLIST-005: Filtros q, curso y chips de estado

MUST conservar búsqueda `q`, filtro de curso y chips de `estado` (selección única entre borrador/vigente/revocado/vencido, o “todos”). Chips MUST filtrar solo por `estado` del modelo. MUST NOT agregar chip/filtro de entrega.

#### Scenario: Chip estado único

- GIVEN listado con varios estados
- WHEN Bedelía activa el chip vigente/Válida
- THEN MUST verse solo ítems con `estado === 'vigente'`

### REQ-CERTLIST-006: Sin Entrega inventada

La UI del listado MUST NOT mostrar columna, chip, filtro ni etiqueta “Entrega” / “Estado de entrega” / `envio`. MUST NOT consultar `entrega-manual` ni inventar `pdfStatus` para adornar la lista.

#### Scenario: Sin copy de entrega

- GIVEN listado renderizado (tabla o tarjetas)
- WHEN se inspecciona el DOM visible
- THEN MUST NOT contener “Estado de entrega” ni chips de envío

### REQ-CERTLIST-007: Privacidad del listado

MUST seguir mostrando solo `documentMasked` y `tokenPrefix` (nunca DNI/token completos). Búsqueda MUST operar sobre campos seguros ya expuestos (alumno, documento enmascarado, curso, número).

#### Scenario: Sin PII completa

- GIVEN listado con resultados
- WHEN se inspecciona DOM de filas/tarjetas
- THEN MUST NOT aparecer DNI completo ni token completo
