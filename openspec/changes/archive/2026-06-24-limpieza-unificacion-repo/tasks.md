# Tasks: Limpieza y unificación documental del repositorio `ifts14`

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 250–600 (doc-only) |
| 400-line budget risk | Low |
| Chained PRs recommended | Yes (force-chained) |
| Suggested split | Slice 1 → Slice 2 → Slice 3 (stacked-to-main) |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |
| 800-line review budget | Sufficient |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Protecciones + AGENTS.md | Slice 1 | `.gitignore` reforzado y 8 `AGENTS.md`. Base: main. |
| 2 | Prompts raíz + índice + matriz | Slice 2 | Prompts Marcos/Matías, `00-indice-general.md`, `07-...md`. Base: Slice 1. |
| 3 | Archivado + borrado + verificación | Slice 3 | Mover prompts viejos, eliminar temporales, verificación. Base: Slice 2. |

## Phase 1: Foundation — protecciones y orientación local (Slice 1)

- [x] 1.1 Editar `.gitignore`: agregar `.atl/*.cache.json` y reforzar patrones PHP.
- [x] 1.2 Crear/actualizar `database/AGENTS.md` con reglas de MariaDB y `cert_`.
- [x] 1.3 Crear/actualizar `deploy/AGENTS.md` con reglas de cPanel y base href `/certificados/`.
- [x] 1.4 Crear/actualizar `scripts/AGENTS.md` con reglas de scripts seguros.
- [x] 1.5 Crear/actualizar `muestra_pagina/AGENTS.md` con reglas de referencia visual.
- [x] 1.6 Reemplazar `docs/AGENTS.md` placeholder con reglas de dominio.
- [x] 1.7 Reemplazar `openspec/AGENTS.md` placeholder con reglas de SDD.
- [x] 1.8 Reemplazar `apps/frontend-angular/AGENTS.md` con reglas de Angular 20.
- [x] 1.9 Reemplazar `apps/backend-php/AGENTS.md` con reglas de PHP 8.4.21 y PDO.
- [x] 1.10 Verificar con `ls` que las 8 carpetas tienen `AGENTS.md` accionables.

## Phase 2: Core — prompts raíz, índice y matriz archive (Slice 2)

- [x] 2.1 Crear `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con ciclos semanales.
- [x] 2.2 Crear `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con ciclos semanales.
- [x] 2.3 Actualizar `docs/00-indice-general.md`: lectura por rol y validar cada ruta con `ls`.
- [x] 2.4 Actualizar `docs/07-...md`: filas para prompts raíz.
- [x] 2.5 Refrescar `README.md`, `GUIA.md`, `AGENTS.md` raíz solo donde estén desactualizados.
- [x] 2.6 Verificar con `ls` que los dos prompts raíz existen y que índice y matriz los referencian.

## Phase 3: Integration — archivado, limpieza y verificación (Slice 3)

- [x] 3.1 Crear `docs/opencode/archive/` si no existe.
- [x] 3.2 Mover `docs/opencode/07_PROMPTS_MARCOS_ORDENAMIENTO.md` y `08_PROMPTS_MATIAS_FRONTEND_ANGULAR.md` a `archive/` si los prompts raíz los reemplazan.
- [x] 3.3 Listar contenido único de `ifts14_post_reorg_auditoria_y_prompts/` y `ifts14_planificacion_opencode_inicial/`; promover/confirmar duplicación.
- [x] 3.4 Eliminar ambas carpetas tras checklist firmado.
- [x] 3.5 Verificación final: `git status --ignored --short` si hay `.git/`; si no, `ls` + `grep` y documentar limitación.
- [x] 3.6 Confirmar que no se creó producto, dependencias, ni commits automáticos.
- [x] 3.7 Cerrar el ciclo con resumen: leídos, creados, modificados, movidos, eliminados; sensibles ignorados; estado de `muestra_pagina/`; estado de prompts raíz; riesgos abiertos; comandos Git sugeridos; mensaje de commit sugerido.
