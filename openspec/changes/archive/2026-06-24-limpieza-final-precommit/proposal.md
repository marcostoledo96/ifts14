# Proposal: Limpieza documental final previa al primer commit seguro

## Intent

Cerrar el último bloque de limpieza documental de `ifts14` antes de habilitar el primer commit seguro. El estado actual deja cuatro fricciones menores: el `.gitignore` ignora `*.sql` de forma global e impide versionar migraciones y seeds controlados; `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` ya no aplica y debe archivarse; `docs/planificacion-inicial/` no tiene marcador histórico explícito; y varias carpetas versionadas activas están vacías sin `.gitkeep`. Este cambio deja todo en orden sin tocar producto, sin commits y sin mover la carpeta `docs/planificacion-inicial/`.

## Scope

### In Scope

- Ajustar `.gitignore` para permitir `*.sql` solo bajo `database/migrations/` y `database/seeds/`; mantener ignorado todo SQL bajo `material_privado_no_versionar/` y en raíz.
- Mover `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` a `docs/opencode/archive/`.
- Crear `docs/opencode/AGENTS.md` con reglas del directorio.
- Crear `docs/opencode/archive/README.md` explicando el propósito del histórico.
- Crear `docs/planificacion-inicial/AGENTS.md` mínimo como marcador histórico.
- Agregar `.gitkeep` en `database/migrations/`, `database/seeds/`, `database/docs/`, `deploy/cpanel/`, `deploy/htaccess/`.
- Actualizar `docs/00-indice-general.md` para mencionar `.atl/skill-registry.md` y referenciar solo archivos reales.

### Out of Scope

- Producto (Angular 20, PHP 8.4.21, MariaDB 10.6.27), dependencias, primer commit, push, merge.
- Expansión de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`; queda como ciclo futuro de prioridad media.
- Reorganización mayor de `docs/` o movimiento de `docs/planificacion-inicial/`.

## Capabilities

### New Capabilities

- `repo-precommit`: estado documental final previo al primer commit seguro, con `.gitignore` afinado, archivos de soporte y marcadores en carpetas vacías.

### Modified Capabilities

- `repo-seguro`: el delta incorpora la regla de negation para SQL controlado sin debilitar la protección de dumps y material privado.

## Approach

SDD híbrido (OpenSpec + Engram). Cuatro artefactos generados en este ciclo, sin apply ni commits. Aplicación futura encadenada con estrategia `stacked-to-main` y presupuesto de revisión 800 líneas; este ciclo es solo documental así que el riesgo de revisión es bajo.

## Affected Areas

| Área | Acción |
|---|---|
| `.gitignore` | Modify |
| `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` | Move → `archive/` |
| `docs/opencode/AGENTS.md` | Create |
| `docs/opencode/archive/README.md` | Create |
| `docs/planificacion-inicial/AGENTS.md` | Create |
| `database/migrations/.gitkeep` | Create |
| `database/seeds/.gitkeep` | Create |
| `database/docs/.gitkeep` | Create |
| `deploy/cpanel/.gitkeep` | Create |
| `deploy/htaccess/.gitkeep` | Create |
| `docs/00-indice-general.md` | Modify |
| `openspec/specs/repo-precommit/spec.md` | Create |
| `openspec/specs/repo-seguro/spec.md` | Modify (delta) |

## Risks

| Riesgo | Mitigación |
|---|---|
| Permitir SQL por descuido fuera de migrations/seeds | Usar negation `!database/migrations/**/*.sql` y `!database/seeds/**/*.sql`; dejar `*.sql` global vigente. |
| Romper archive del repo | Mover archivo a `archive/` con `git mv` cuando haya Git; documentar movimiento en `tasks.md`. |
| Romper índice de docs | Validar cada ruta con `ls` antes de cerrar. |
| Repo sin `.git/` | Documentar limitación; usar `ls` + `grep` sobre `.gitignore` para validar. |

## Rollback Plan

Revertir `.gitignore` desde la versión previa, restaurar `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` desde `archive/`, borrar archivos creados y resetear `docs/00-indice-general.md`. Sin estado remoto.

## Dependencies

- `openspec/specs/repo-seguro/spec.md` como base de protección.
- `openspec/specs/repo-limpio/spec.md` como contrato de unificación ya vigente.

## Success Criteria

- [ ] `.gitignore` permite `*.sql` solo bajo `database/migrations/` y `database/seeds/`.
- [ ] `PRIMER_PROMPT_REORGANIZACION.md` movido a `archive/`.
- [ ] Existen `docs/opencode/AGENTS.md` y `docs/opencode/archive/README.md`.
- [ ] Existe `docs/planificacion-inicial/AGENTS.md` mínimo.
- [ ] Existen `.gitkeep` en las cinco carpetas activas vacías.
- [ ] `docs/00-indice-general.md` menciona `.atl/skill-registry.md` y lista solo archivos reales.
