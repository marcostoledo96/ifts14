# Spec: Preview de certificado — Copiar/Compartir y autoridades

## Purpose

Completar `/admin/certificaciones/:id` para copiar/compartir la URL pública canónica y mostrar autoridades institucionales reales, sin placeholders demo ni DNI/token completos.

## Non-goals

PDF preview; backend; revocación/emisión; rotación token/QR; fix de `detalle.publicValidationUrl` fuera del preview; auditoría copy/share; bloquear acciones por config pendiente.

## Locks

1. URL canónica SOLO desde `obtenerEntregaManual().publicValidationUrl`.
2. `AbortError` de Web Share = silencio (sin error ni fallback clipboard).
3. Config pendiente = GET falla O (`rectorName` y `advisorName` ambos vacíos tras trim).

## Requirements

### REQ-CPREV-001: Carga paralela

DEBE cargar en paralelo detalle, GET configuración institucional y `obtenerEntregaManual(id)`. Fallo de entrega-manual NO DEBE romper el expediente; DEBE deshabilitar Copiar/Compartir sin URL canónica.

#### Scenario: Entrega-manual falla

- GIVEN detalle OK y entrega-manual falla
- WHEN termina la carga
- THEN el expediente DEBE mostrarse y Copiar/Compartir DEBEN quedar deshabilitados

### REQ-CPREV-002: URL canónica exclusiva

Copiar/Compartir DEBEN usar solo `obtenerEntregaManual(...).publicValidationUrl`. NO DEBEN usar `detalle.publicValidationUrl` ni URL truncada decorativa.

#### Scenario: Fuente canónica

- GIVEN URLs distintas en detalle vs entrega-manual
- WHEN se copia o comparte
- THEN DEBE usarse la de entrega-manual

### REQ-CPREV-003: Copiar link

Con URL canónica y estado ≠ `revocado`, Copiar DEBE habilitarse, copiar esa URL (clipboard + fallback `execCommand`) y mostrar feedback de éxito. Si `revocado` o sin URL, DEBE deshabilitarse. NO DEBE quedar deshabilitado solo por F6-03.

#### Scenario: Vigente copia

- GIVEN no revocado + URL canónica
- WHEN se activa Copiar
- THEN DEBE copiarse la URL canónica con feedback

#### Scenario: Revocado

- GIVEN estado `revocado`
- WHEN se inspecciona Copiar
- THEN DEBE estar deshabilitado

### REQ-CPREV-004: Compartir y AbortError

Compartir DEBE seguir las mismas reglas de habilitación. Si hay `navigator.share`, DEBE compartir URL canónica (+ título). `AbortError` DEBE silenciarse: sin mensaje ruidoso ni fallback clipboard. Sin Web Share u otro fallo → clipboard como Copiar.

#### Scenario: Cancelación

- GIVEN Web Share rechaza con `AbortError`
- WHEN termina Compartir
- THEN NO DEBE haber error ruidoso ni fallback clipboard

#### Scenario: Sin Web Share

- GIVEN `navigator.share` ausente
- WHEN se activa Compartir
- THEN DEBE copiar la URL canónica

### REQ-CPREV-005: Autoridades reales

La réplica DEBE mostrar `rectorName`/`rectorRole` y `advisorName`/`advisorRole` desde config. NO DEBE usar placeholders demo.

#### Scenario: Config completa

- GIVEN GET con nombres/roles no vacíos
- WHEN se renderiza la réplica
- THEN DEBEN verse esas autoridades

### REQ-CPREV-006: Config pendiente

Pendiente si GET falla O ambos nombres vacíos tras trim. DEBE mostrar “Configuración institucional pendiente”. NO DEBE deshabilitar Copiar/Compartir.

#### Scenario: Criterio

- GIVEN GET falla o ambos nombres vacíos tras trim
- WHEN se renderiza autoridades
- THEN DEBE mostrarse “Configuración institucional pendiente”

#### Scenario: No bloquea acciones

- GIVEN config pendiente + URL canónica + no revocado
- WHEN se inspeccionan Copiar/Compartir
- THEN DEBEN permanecer habilitados

### REQ-CPREV-007: Privacidad y cierre F6-03

DEBE mostrar solo `documentMasked`/`tokenPrefix`. Specs/tests NO DEBEN exigir Copiar deshabilitado por F6-03.

#### Scenario: Sin fuga

- GIVEN expediente cargado
- WHEN se inspecciona texto visible
- THEN NO DEBE aparecer DNI completo ni token completo
