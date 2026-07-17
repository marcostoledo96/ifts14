# Spec: Emisión de certificación (frontend)

## Purpose

Pantalla `/admin/certificaciones/nueva`: seleccionar alumno/curso activos, preview sustentada y `POST /admin/certificados` con envelope `{ data, meta }`.

## Contrato

Body: `{ alumnoId, cursoId, issuedAt: "YYYY-MM-DD", expiresAt: string | null }`.
`201` → `data`: `id`, `certificateCode`, `status`, `student`, `course`, `issuedAt`, `expiresAt`, `tokenPrefix`, `publicValidationUrl`, `pdfDownloadUrl`.
Errores: `400 VALIDATION_ERROR`, `409 CERTIFICATE_ALREADY_EXISTS`, `500`/`CONFIGURATION_ERROR`.

## Non-goals

Wizard 3 pasos; borrador; aprobación; fechas en body; email; DNI completo admin; logos/upload; folio pre-emisión; ciclo; horas; endpoint “preparar emisión”; cambios backend/DB.

## Requirements

### REQ-EMIT-001: Ruta estática

MUST registrar `/admin/certificaciones/nueva` **antes** de `certificaciones/:id`, con guard admin, y cargar la página de emisión.

#### Scenario: Con sesión

- GIVEN sesión admin
- WHEN se navega a `/admin/certificaciones/nueva`
- THEN MUST renderizar emisión (no detalle `:id`)

#### Scenario: Sin sesión

- GIVEN sin sesión
- WHEN se navega a esa URL
- THEN MUST aplicar protección admin

### REQ-EMIT-002: Selectores activos

MUST ofrecer selectores de cursos y alumnos **activos** desde listados existentes.

#### Scenario: Solo activos

- GIVEN listados mixtos
- WHEN se abren selectores
- THEN MUST listar solo activos

### REQ-EMIT-003: Presentes elegibles

Al elegir el par, MUST consultar fechas/asistencias, mostrar presentes sobre fechas `realizada` y MUST descartar respuestas stale.

#### Scenario: Presentes

- GIVEN par con asistencias en fechas `realizada`
- WHEN termina la consulta
- THEN MUST mostrar esas jornadas (fecha + descripción si existe)

#### Scenario: Stale

- GIVEN consulta en vuelo
- WHEN cambia alumno/curso
- THEN MUST ignorar el resultado anterior

### REQ-EMIT-004: Vacíos bloqueantes

MUST distinguir curso sin fechas `realizada` vs alumno sin presentes, y MUST bloquear emitir.

#### Scenario: Sin fechas realizadas

- GIVEN curso sin fechas `realizada`
- WHEN se selecciona
- THEN MUST aviso bloqueante y emitir deshabilitado

#### Scenario: Sin presentes

- GIVEN fechas pero sin presentes del alumno
- WHEN se selecciona el par
- THEN MUST aviso bloqueante y emitir deshabilitado

### REQ-EMIT-005: Preview tipográfica

MUST mostrar nombre, `dniMostrar`, curso, fechas presentes y autoridades tipográficas desde config si hay. MUST NOT email, logos/upload, DNI completo ni folio/número definitivo pre-emisión.

#### Scenario: Datos sustentados

- GIVEN par válido con presentes
- WHEN se renderiza preview
- THEN MUST incluir nombre, `dniMostrar`, curso y fechas

#### Scenario: Sin fantasma

- GIVEN la preview
- WHEN se inspecciona
- THEN MUST NOT email, upload ni folio definitivo

### REQ-EMIT-006: Defaults de fecha

MUST defaultar `issuedAt` a hoy `America/Argentina/Buenos_Aires` (`YYYY-MM-DD`) y `expiresAt: null` (sin UI de vencimiento).

#### Scenario: Defaults

- GIVEN emisión habilitada
- WHEN se arma el body
- THEN `issuedAt` = hoy BA y `expiresAt` = `null`

### REQ-EMIT-007: Emitir + handoff

MUST `POST /admin/certificados` con body exacto, MUST bloquear doble submit, y tras `201` MUST navegar a `/admin/certificaciones/:id` con `data.id`.

#### Scenario: Éxito

- GIVEN par elegible
- WHEN responde `201`
- THEN MUST navegar usando `data.id`

#### Scenario: Doble submit

- GIVEN POST en curso
- WHEN se reintenta emitir
- THEN MUST permanecer deshabilitado

### REQ-EMIT-008: Errores

Ante `400`, `409` o `500`, MUST error visible, MUST conservar selección y MUST NOT navegar.

#### Scenario: 409

- GIVEN duplicado
- WHEN POST `409`
- THEN MUST aviso de existente y conservar par

#### Scenario: 400/500

- GIVEN fallo
- WHEN termina
- THEN MUST error seguro y conservar selección

### REQ-EMIT-009: Aviso anticipado

MAY listar vigentes del par para aviso. MUST NOT reemplazar autoridad del `409`.

#### Scenario: Anticipado

- GIVEN aviso anticipado y POST `409`
- THEN MUST tratar `409` como final

### REQ-EMIT-010: Seam emitir

`CertificationsService` MUST exponer `emitir(payload)` en HTTP e InMemory, leyendo `res.data`.

#### Scenario: HTTP

- GIVEN `useRealApi=true`
- WHEN emite
- THEN MUST POST body exacto y mapear `data`

#### Scenario: InMemory

- GIVEN mock
- WHEN emite par elegible
- THEN MUST DTO compatible y permitir handoff
