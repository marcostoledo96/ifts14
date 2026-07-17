# Spec: Configuración institucional (frontend)

## Purpose

Pantalla admin Angular para consultar/guardar configuración institucional vía `GET`/`PUT /admin/configuracion-institucional`, sin campos inventados.

## Contrato

Envelope `{ data, meta.requestId }`. `data`: `institutionName` (req., ≤160), `certificateText` (≤255), `rectorName` (≤160), `rectorRole` (≤80), `advisorName` (≤160), `advisorRole` (≤80), `updatedAt` (solo lectura).

## Non-goals

Logos, dirección, email, firmas archivo, numeración, sello, link QR, mensajes de validación pública editables. Contacto/Validación: solo bloque estático informativo, sin inputs fantasma. Sin cambios backend, uploads ni copia React.

## Requirements

### REQ-CFG-001: Carga GET

El sistema MUST cargar con GET al entrar y mapear `data` al formulario.

#### Scenario: Éxito

- GIVEN sesión admin en `/admin/configuracion`
- WHEN GET responde 200
- THEN el formulario MUST poblarse desde `data`
- AND `updatedAt` MUST quedar como metadata de solo lectura

#### Scenario: Fallo

- GIVEN el GET falla
- WHEN termina la carga
- THEN MUST mostrar error y acción de reintentar
- AND MUST NOT tratar datos parciales como guardados

### REQ-CFG-002: Identidad

El sistema MUST editar `institutionName` (obligatorio) y MUST NOT ofrecer logo ni dirección editables.

#### Scenario: Nombre

- GIVEN carga exitosa
- WHEN se edita el nombre
- THEN MUST reflejarse en el form y marcar dirty

#### Scenario: Sin campos inventados

- GIVEN la sección Identidad
- WHEN se inspeccionan controles
- THEN MUST NOT existir logo, upload ni dirección

### REQ-CFG-003: Certificados

El sistema MUST exponer `certificateText`.

#### Scenario: Texto base

- GIVEN carga exitosa
- WHEN se edita `certificateText`
- THEN MUST conservar el valor y marcar dirty

### REQ-CFG-004: Autoridades

El sistema MUST editar `rectorName|Role` y `advisorName|Role`, MUST mostrar preview tipográfica y MUST NOT permitir upload de firmas.

#### Scenario: Edición + preview

- GIVEN carga exitosa
- WHEN cambian nombre/cargo
- THEN form y preview MUST actualizarse

#### Scenario: Sin upload

- GIVEN Autoridades
- WHEN se inspeccionan controles
- THEN MUST NOT existir carga de archivo de firma

### REQ-CFG-005: Guardar PUT

El sistema MUST persistir con PUT y leer `data` de la respuesta.

#### Scenario: Éxito

- GIVEN cambios válidos dirty
- WHEN se guarda
- THEN MUST enviar PUT con campos del contrato
- AND MUST confirmar éxito, actualizar `updatedAt` y limpiar dirty

#### Scenario: Error

- GIVEN el PUT falla
- WHEN termina el intento
- THEN MUST mostrar error y conservar ediciones locales

### REQ-CFG-006: Sticky dirty

El sistema MUST mostrar barra fija con Guardar, Descartar y metadata (`updatedAt`).

#### Scenario: Dirty

- GIVEN form ≠ snapshot
- WHEN se renderiza la barra
- THEN Guardar/Descartar MUST habilitarse e indicar cambios pendientes

#### Scenario: Descartar

- GIVEN dirty
- WHEN se descarta
- THEN MUST restaurar el snapshot y limpiar dirty

### REQ-CFG-007: Validación cliente

El sistema MUST exigir `institutionName` no vacío y límites 160/80/255 alineados a PHP.

#### Scenario: Nombre vacío

- GIVEN nombre vacío/espacios
- WHEN se intenta guardar
- THEN MUST bloquear PUT y mostrar validación

#### Scenario: Longitud

- GIVEN un campo supera su máximo
- WHEN se intenta guardar
- THEN MUST bloquear o truncar de forma explícita
- AND MUST NOT enviar longitudes que el backend rechazaría por límite conocido

### REQ-CFG-008: Ruta y sidebar

El sistema MUST registrar `/admin/configuracion` bajo `AdminShell` e ítem “Configuración” activo.

#### Scenario: Navegación

- GIVEN sesión admin
- WHEN se elige Configuración
- THEN MUST ir a `/admin/configuracion` con ítem activo

### REQ-CFG-009: Banner de impacto

El sistema MUST avisar impacto en documentos nuevos y que emitidos no cambian hasta regenerar PDF.

#### Scenario: Aviso visible

- GIVEN la pantalla cargó
- WHEN se ve el encabezado
- THEN MUST mostrarse ese aviso de impacto

## Deltas de capabilities

### frontend-http-services (MODIFIED)

`InstitutionalConfig` MUST usar el DTO real (sin `direccion`/`logoUrl`), MUST ofrecer `obtener()` (GET) y `guardar()` (PUT) leyendo `envelope.data`.
(Previously: GET parcial con `nombre`/`direccion`/`logoUrl`.)

### admin-foundation (MODIFIED)

El shell MUST exponer ruta e ítem Configuración navegables.
(Previously: no existían.)
