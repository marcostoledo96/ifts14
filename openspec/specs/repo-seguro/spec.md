# Spec — repositorio seguro inicial

## Purpose

Definir la capacidad del repositorio `ifts14` de proteger material sensible,
mantener documentación raíz mínima y exponer estructura base sin producto, como
condición previa al primer ciclo SDD de implementación.

## Requirements

### Requirement: Protección de material sensible antes de versionar

El repositorio MUST impedir que dumps, backups, logs, credenciales, configuraciones reales y carpetas `.git` internas queden listos para commit. La regla global `*.sql` MUST permitir únicamente negation para archivos ubicados bajo `database/migrations/` y `database/seeds/`; todo `*.sql` bajo `material_privado_no_versionar/`, en raíz, o en cualquier otra ubicación MUST permanecer ignorado. El material bajo `material_privado_no_versionar/` MAY consultarse de forma local para auditoría estructural sin exponer valores, manteniendo siempre la prohibición de versionado.

#### Scenario: Reglas de ignorado presentes

- **Given** el repositorio luego de este ciclo
- **When** se inspecciona `.gitignore`
- **Then** MUST incluir reglas para `material_privado_no_versionar/`, `*.sql`, `*.sql.gz`, `*.zip`, `error_log`, `*.log`, `.env`, archivos de configuración sensible y `**/.git/`.
- **And** MUST incluir reglas de negation `!database/migrations/**/*.sql` y `!database/seeds/**/*.sql`.

#### Scenario: Artefactos sensibles fuera de la raíz

- **Given** existían dumps SQL y `well-known/` en la raíz
- **When** finaliza la reorganización
- **Then** esos artefactos MUST estar bajo `material_privado_no_versionar/` sin haber sido inspeccionados ni copiados a documentación.

#### Scenario: SQL controlado versionable

- **Given** un archivo en `database/migrations/` o `database/seeds/`
- **When** se inspecciona `.gitignore`
- **Then** MUST estar cubierto por una regla de negation que permita su versionado.

#### Scenario: SQL sensible sigue ignorado

- **Given** un archivo `*.sql` en raíz o bajo `material_privado_no_versionar/`
- **When** se inspecciona `.gitignore`
- **Then** MUST seguir ignorado por la regla global `*.sql` o por patrones específicos más restrictivos.

#### Scenario: Auditoría local sin staging

- **Given** material privado bajo `material_privado_no_versionar/`
- **When** se realiza una auditoría local autorizada
- **Then** MUST consultarse únicamente con `ls`, `stat` y `grep` sobre DDL.
- **And** MUST NOT quedar ningún archivo del directorio staged ni untracked para commit.
- **And** MUST NOT figurar credenciales, DNI, tokens, filas de dump ni contenido de zips en los documentos resultantes.

#### Scenario: `.gitignore` y validación al cerrar auditoría

- **Given** un ciclo de auditoría finalizado
- **When** se valida el estado del repositorio
- **Then** `.gitignore` MUST seguir cubriendo `material_privado_no_versionar/`, `*.sql` sensible, `*.zip`, `error_log`, `*.log` y `**/.git/`.
- **And** SHOULD ejecutarse `git status --ignored --short` o, si no hay Git, verificación equivalente por path.

### Requirement: Documentación mínima de entrada

El repositorio MUST tener documentación raíz suficiente para explicar objetivo, stack, responsabilidades, límites de seguridad y lectura mínima.

#### Scenario: Archivos raíz disponibles

- **Given** una persona o agente ingresa al proyecto
- **When** busca documentación inicial
- **Then** MUST encontrar `README.md`, `GUIA.md`, `AGENTS.md` y `docs/00-indice-general.md`.

#### Scenario: Documentación inicial ordenada

- **Given** la planificación inicial existía en un paquete separado
- **When** finaliza la reorganización
- **Then** la documentación SHOULD quedar bajo `docs/planificacion-inicial/` y los prompts de OpenCode bajo `docs/opencode/`.

### Requirement: Estructura base sin producto

El repositorio MUST exponer carpetas base para futuras áreas de trabajo sin crear implementación de producto.

#### Scenario: Carpetas base disponibles

- **Given** finaliza la reorganización
- **When** se inspecciona la estructura del repositorio
- **Then** SHOULD existir estructura base para `openspec/`, `apps/frontend-angular/`, `apps/backend-php/`, `database/`, `deploy/`, `scripts/` y `muestra_pagina/`.

#### Scenario: Producto no implementado

- **Given** este cambio es solo de reorganización segura
- **When** finaliza el trabajo
- **Then** MUST NOT crear aplicación Angular final, backend PHP, esquema de base de datos, dependencias ni configuración real de servidor.

### Requirement: Bloqueo explícito del frontend final

La documentación MUST indicar que el frontend final no se implementa hasta que Marcos agregue la referencia v0 en `muestra_pagina/`.

#### Scenario: Diseño v0 pendiente

- **Given** `muestra_pagina/` puede estar vacío o contener solo documentación de bloqueo
- **When** se planifique frontend
- **Then** MUST tratarse como bloqueado hasta contar con la referencia visual indicada por Marcos.

### Requirement: Verificación y mantenimiento SDD

El cambio DEBE dejar evidencia de tareas, aplicación y verificación para que el dispatcher SDD pueda continuar sin blockers de artefactos OpenSpec. Además, un cambio ya archivado DEBE conservarse solo bajo `openspec/changes/archive/` y NO DEBE quedar un directorio activo con el mismo nombre salvo que sea una continuación explícita con artefactos completos. La documentación operativa DEBE alinearse con specs archivadas cuando el archive cierre pendientes previos.

_(Previously: exigía reconciliar artefactos faltantes, pero no prohibía stubs activos de cambios archivados ni drift documental posterior.)_

#### Scenario: Artefactos OpenSpec reconciliados

- **Given** los artefactos existían en Engram
- **When** se reconcilia el modo híbrido
- **Then** MUST existir `proposal.md`, `specs/repo-seguro/spec.md`, `design.md`, `tasks.md`, `apply-progress.md` y `verify-report.md` bajo `openspec/changes/reorganizacion-segura-inicial/`.

#### Scenario: Estado de tareas preservado

- **Given** las tareas ya estaban completadas
- **When** se actualizan artefactos faltantes
- **Then** `tasks.md` MUST conservar sus checkboxes completados.

#### Scenario: Cambio archivado sin stub activo

- **Given** `openspec/changes/archive/YYYY-MM-DD-{change}/` contiene `archive-report.md` y artefactos completos
- **When** se revisan cambios activos
- **Then** NO DEBE existir `openspec/changes/{change}/` con un stub parcial que haga parecer abierto el ciclo archivado.

#### Scenario: Documentación operativa alineada

- **Given** un archive sincronizó specs y cerró un pendiente operativo
- **When** se revisa documentación de deploy o backend relacionada
- **Then** NO DEBE seguir describiendo ese pendiente como ausente o no verificado.

### Requirement: Práctica de auditoría local con reglas reforzadas

Una auditoría local del material privado MUST limitarse a información estructural y nunca incluir valores reales. Los productos de la auditoría (inventarios y hallazgos) viven bajo `docs/auditoria/` y son los únicos documentos que pueden referenciar el material privado; cualquier referencia a contenido del material está prohibida.

#### Scenario: Productos de auditoría aislados

- **Given** un ciclo de auditoría finalizado
- **When** se inspecciona el árbol versionado
- **Then** los documentos de hallazgos MUST estar bajo `docs/auditoria/`.
- **And** MUST NOT existir documentos en otras áreas que peguen contenido del material privado.

#### Scenario: Sin secretos en productos de auditoría

- **Given** los documentos de hallazgos redactados
- **When** se hace `grep` por patrones sensibles
- **Then** MUST NOT encontrarse contraseñas, claves, DNIs, hashes de tokens ni contenido de filas SQL.
