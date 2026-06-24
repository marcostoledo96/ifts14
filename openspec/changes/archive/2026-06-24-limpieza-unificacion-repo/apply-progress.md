# Apply progress — limpieza-unificacion-repo

## Estado

Completado. Cambio documental aplicado en modo `force-chained` con estrategia `stacked-to-main` y sin commits automáticos.

## Slice 1 — Protecciones + AGENTS.md

- [x] `.gitignore` reforzado con `.atl/*.cache.json`; los patrones PHP sensibles ya estaban presentes y se conservaron.
- [x] `AGENTS.md` de `docs/`, `openspec/`, `database/`, `deploy/`, `scripts/`, `muestra_pagina/`, `apps/frontend-angular/` y `apps/backend-php/` reemplazados por reglas accionables.

## Slice 2 — Prompts raíz + índice + matriz

- [x] Creados los prompts raíz vigentes de Marcos y Matías con ciclos semanales, roles y comandos Git base.
- [x] `docs/00-indice-general.md` actualizado con lectura por rol y solo rutas reales.
- [x] `docs/07-sdd-archive-y-mantenimiento-documentacion.md` actualizado con filas explícitas para prompts raíz.
- [x] `README.md`, `GUIA.md` y `AGENTS.md` raíz refrescados solo donde estaban desactualizados.

## Slice 3 — Archivado + borrado + verificación

- [x] `docs/opencode/archive/` creado.
- [x] Prompts viejos de Marcos y Matías movidos a `docs/opencode/archive/` porque los prompts raíz son la guía vigente.
- [x] Carpetas temporales `ifts14_post_reorg_auditoria_y_prompts/` y `ifts14_planificacion_opencode_inicial/` eliminadas tras promoción/verificación.
- [x] Verificación final registrada: el directorio no es un repo Git, por lo que `git status --ignored --short` no pudo ejecutarse; se aplicó verificación por path y `.gitignore`.

## Evidencia de promoción

- `ifts14_post_reorg_auditoria_y_prompts/`: los prompts raíz fueron promovidos de forma resumida; los `AGENTS.md` sugeridos se reemplazaron por versiones accionables; la auditoría y el prompt de limpieza ya estaban cubiertos por los artefactos SDD activos.
- `ifts14_planificacion_opencode_inicial/`: las plantillas ya existen como `README.md`, `GUIA.md`, `AGENTS.md` y `docs/00-indice-general.md` activos.

## Restricciones respetadas

- No se implementó producto.
- No se crearon Angular, backend PHP, migraciones ni dependencias.
- No se hicieron commits, push, merge, rebase ni reset.

## Validación final

- `.gitignore` contiene `material_privado_no_versionar/`, `.atl/*.cache.json`, patrones SQL/ZIP/log, `.env`, `**/.git/` y nombres PHP sensibles.
- Las búsquedas de raíz no encontraron SQL, ZIP, logs ni credenciales fuera de `material_privado_no_versionar/`.
- `material_privado_no_versionar/` conserva `db_dumps_originales/` y `servidor_original/` y sigue ignorado por `.gitignore`.
- `muestra_pagina/` contiene solo `README.md` y `AGENTS.md`; el frontend visual sigue pendiente.
- No existen `apps/*/src`, `package.json` ni `composer.json` de producto.
