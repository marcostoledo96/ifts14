# Tasks: Limpieza documental final previa al primer commit seguro

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Estimated changed lines | ~80-120 (solo documental) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR (force-chained heredado) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Limpieza documental final completa | PR 1 | Base main; cubre `.gitignore`, archivos, índice y marcadores. |

## Phase 1: Ajuste del `.gitignore`

- [x] 1.1 Editar `.gitignore` y agregar `!database/migrations/**/*.sql` y `!database/seeds/**/*.sql` justo después de la regla global `*.sql` con un comentario corto.
- [x] 1.2 Confirmar que `material_privado_no_versionar/`, `*.sql` en raíz, `*.zip`, `error_log`, `*.log`, `.env` y `**/.git/` siguen ignorados.

## Phase 2: Archivado y soporte de `docs/opencode/`

- [x] 2.1 Mover `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` a `docs/opencode/archive/` (usar `git mv` si hay Git; copia con nota si no).
- [x] 2.2 Crear `docs/opencode/AGENTS.md` con reglas del directorio y enlace al índice.
- [x] 2.3 Crear `docs/opencode/archive/README.md` describiendo el carácter histórico y los criterios de archivo.

## Phase 3: Marcadores históricos y carpetas activas vacías

- [x] 3.1 Crear `docs/planificacion-inicial/AGENTS.md` mínimo declarando el directorio como histórico y enlazando al índice.
- [x] 3.2 Crear `.gitkeep` en `database/migrations/`.
- [x] 3.3 Crear `.gitkeep` en `database/seeds/`.
- [x] 3.4 Crear `.gitkeep` en `database/docs/`.
- [x] 3.5 Crear `.gitkeep` en `deploy/cpanel/`.
- [x] 3.6 Crear `.gitkeep` en `deploy/htaccess/`.

## Phase 4: Índice general

- [x] 4.1 Actualizar `docs/00-indice-general.md` para mencionar `.atl/skill-registry.md` solo cuando se trabaje con skills y validar cada ruta listada con `ls`.
- [x] 4.2 Confirmar que no hay rutas inexistentes y que las áreas siguen el patrón de `AGENTS.md` por carpeta.

## Phase 5: Verificación y notas de cierre

- [x] 5.1 Ejecutar `git status --ignored --short` si hay `.git/`; si no, documentar la limitación y usar `ls` + `grep` sobre `.gitignore`.
- [x] 5.2 Confirmar que ningún archivo de `material_privado_no_versionar/`, ningún dump `*.sql` y ningún `*.zip` está listo para commit.
- [x] 5.3 Registrar en `apply-progress.md` la nota de diferimiento del ciclo futuro de expansión de `MARCOS_PROMPTS_*.md` y `MATIAS_PROMPTS_*.md` (prioridad media).
- [x] 5.4 Verificar que no se creó producto Angular/PHP/MariaDB ni `package.json`/`composer.json` de producto.

## Notas operativas

- No commitear, pushear ni mergear.
- Mantener español argentino formal en todo archivo nuevo.
- Si aparece un nuevo archivo sensible durante el ciclo, agregarlo a `.gitignore` antes de continuar.
