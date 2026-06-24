# Apply progress — reorganización segura inicial

## Estado

Completado. Este archivo reconcilia en OpenSpec el avance que ya estaba aplicado y persistido en Engram.

## Modo

Standard apply. TDD estricto no aplica porque el cambio fue de documentación y filesystem, sin implementación de producto ni runner de tests.

## Tareas completadas

- [x] Crear o validar `.gitignore` con reglas para material sensible.
- [x] Crear carpetas privadas ignoradas para dumps y servidor original.
- [x] Mover dumps SQL y `well-known/` sin inspeccionar contenidos sensibles.
- [x] Crear archivos raíz mínimos desde plantillas o contenido equivalente.
- [x] Mover documentación inicial a `docs/planificacion-inicial/` y prompts a `docs/opencode/`.
- [x] Crear estructura base del repositorio sin implementar producto.
- [x] Documentar mantenimiento de documentación durante `sdd-archive`.
- [x] Validar estado de material sensible y limitación de Git local.

## Evidencia resumida

- `.gitignore` cubre material privado, SQL, ZIPs, logs, `.env`, configs sensibles y `.git` internos.
- Los dumps SQL fueron movidos a `material_privado_no_versionar/db_dumps_originales/`.
- `well-known/` fue movido a `material_privado_no_versionar/servidor_original/well-known/`.
- Existen documentos raíz y estructura base de `docs/`, `openspec/`, `apps/`, `database/`, `deploy/`, `scripts/` y `muestra_pagina/`.
- No se crearon Angular, PHP, esquema de base de datos ni dependencias.

## Reconciliación OpenSpec

Se crearon los artefactos faltantes del modo híbrido:

- `proposal.md`
- `specs/repo-seguro/spec.md`
- `design.md`
- `apply-progress.md`
- `verify-report.md`

`tasks.md` se mantuvo con todos los checkboxes completados.

## Limitaciones

- `git status --ignored` no pudo validarse en la verificación original porque `/home/marcos/Escritorio/ifts14` no era un repositorio Git.
- La prueba de commit-readiness debe repetirse cuando se trabaje dentro del Git checkout real o se inicialice Git.

## PR boundary

- Strategy: force-chained.
- Slice: documentación y reordenamiento seguro inicial.
- Boundary: seguridad de raíz y estructura documental; sin producto.
