# Apply progress — limpieza-final-precommit

## Estado

Completado. Cambio documental aplicado en modo híbrido (OpenSpec + Engram), sin implementar producto, sin instalar dependencias y sin ejecutar acciones Git destructivas o de publicación.

## Estrategia de revisión

| Campo | Valor |
|---|---|
| PR strategy | force-chained |
| Chain strategy | stacked-to-main |
| Work unit | Limpieza documental final completa |
| Review budget | 800 líneas |
| Riesgo real | Bajo; cambio documental y de `.gitignore` |

## Tareas completadas

- [x] `.gitignore` mantiene `*.sql` y `*.sql.gz` globales, con negations solo para `database/migrations/**/*.sql` y `database/seeds/**/*.sql`.
- [x] Se conservaron patrones sensibles: `material_privado_no_versionar/`, `*.zip`, `error_log`, `*.log`, `.env`, configuraciones sensibles y `**/.git/`.
- [x] `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` quedó archivado en `docs/opencode/archive/`.
- [x] Se crearon `docs/opencode/AGENTS.md` y `docs/opencode/archive/README.md`.
- [x] Se creó `docs/planificacion-inicial/AGENTS.md` como marcador histórico mínimo, sin mover la carpeta.
- [x] Se agregaron `.gitkeep` en `database/migrations/`, `database/seeds/`, `database/docs/`, `deploy/cpanel/` y `deploy/htaccess/`.
- [x] `docs/00-indice-general.md` menciona `.atl/skill-registry.md` solo como referencia condicional para trabajo con skills.
- [x] Se difiere la expansión de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` a un ciclo futuro de prioridad media.

## Verificación

- `git status --ignored --short`: no ejecutable como validación Git efectiva porque `/home/marcos/Escritorio/ifts14` no tiene `.git/` (`fatal: no es un repositorio git`).
- Validación por paths: carpetas objetivo y archivos nuevos presentes.
- Validación de `.gitignore`: presentes `*.sql`, `*.sql.gz`, `!database/migrations/**/*.sql`, `!database/seeds/**/*.sql`, `material_privado_no_versionar/`, `*.zip`, `error_log`, `*.log`, `.env` y `**/.git/`.
- Validación de índice: rutas mencionadas en `docs/00-indice-general.md` existentes, incluida `.atl/skill-registry.md` como referencia condicional.
- Validación de producto: no se crearon `apps/frontend-angular/src/`, `apps/backend-php/src/`, `package.json` ni `composer.json` de producto.

## Desvíos

Ninguno. La implementación sigue el diseño: cambio mínimo, documental y de configuración.
