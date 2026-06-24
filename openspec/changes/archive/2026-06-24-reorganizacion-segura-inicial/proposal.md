# Propuesta — reorganización segura inicial

## Resumen

Reorganizar el repositorio `ifts14` hacia una estructura mínima, segura y documentada antes de implementar producto.

El objetivo es proteger material sensible, ordenar la documentación inicial y dejar bases claras para futuros ciclos SDD/TDD del módulo `/certificados/`.

## Problema

El repositorio contenía artefactos sensibles o no aptos para versionado en la raíz, junto con documentación inicial ubicada en `ifts14_planificacion_opencode_inicial/`.

Antes de cualquier implementación Angular, PHP o de base de datos, el repositorio necesitaba:

- reglas de ignorado para material privado;
- traslado seguro de dumps y material del servidor original sin inspeccionar contenido;
- documentación raíz mínima;
- estructura base para futuras áreas de trabajo;
- registro explícito de que el frontend final queda bloqueado hasta contar con el diseño v0 en `muestra_pagina/`.

## Alcance

### Incluido

- Crear o validar `.gitignore` para material sensible.
- Crear `material_privado_no_versionar/` y subcarpetas necesarias.
- Mover dumps SQL y `well-known/` fuera de la raíz sin abrir contenidos.
- Crear o completar `README.md`, `GUIA.md`, `AGENTS.md` y `docs/00-indice-general.md`.
- Mover documentación inicial a `docs/planificacion-inicial/` y prompts a `docs/opencode/`.
- Crear carpetas base: `openspec/`, `apps/`, `database/`, `deploy/`, `scripts/`, `muestra_pagina/`.
- Documentar mantenimiento de documentación durante `sdd-archive`.

### Excluido

- Implementar frontend Angular.
- Implementar backend PHP.
- Crear esquema, migraciones reales o seeds de base de datos.
- Instalar dependencias.
- Leer o copiar dumps, logs, ZIPs, credenciales o material privado.
- Commit, push o merge.

## Resultado esperado

El repositorio queda listo para planificación e implementación futura, con material sensible fuera del área versionable y con documentación mínima suficiente para orientar a personas y agentes.

## Riesgos

- La verificación de `git status --ignored` depende de ejecutar el chequeo dentro de un repositorio Git válido.
- `ifts14_planificacion_opencode_inicial/` no debe eliminarse automáticamente hasta confirmar que sus plantillas duplicadas ya no son necesarias.
