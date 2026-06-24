# Design: Limpieza y unificación documental del repositorio `ifts14`

## Technical Approach

SDD híbrido (OpenSpec + Engram) en modo planificación. La ejecución queda acotada a movimientos de archivos, ediciones documentales pequeñas y validaciones de path. No hay código de producto, ni migraciones, ni cambios de runtime. La estrategia de entrega es `force-chained` con `stacked-to-main`; en esta corrida de planificación el trabajo se representa como unidades encadenadas dentro de un único filesystem run, sin commits.

## Architecture Decisions

### Decision: Reutilizar contenido del paquete temporal como fuente, no como copia literal

**Choice**: leer el paquete temporal solo para identificar contenido único y reescribir el destino con foco en reglas.
**Rationale**: copiar literal mantiene el problema de "hay dos versiones y no sé cuál es la buena".

### Decision: Validación por path cuando el repo no es Git

**Choice**: validar ignorado con `ls` + `grep` cuando no exista `.git/`.
**Rationale**: forzar `git init` introduce un cambio no solicitado; la verificación basada en path cumple el requisito sin efectos colaterales.

### Decision: Prompts raíz como guía vigente, prompts viejos archivados

**Choice**: mover prompts viejos a `docs/opencode/archive/` si los reemplaza el prompt raíz.
**Rationale**: dos guías vigentes con la misma intención rompen la regla "una sola fuente de verdad".

### Decision: Stacked-to-main aunque no haya PRs en este ciclo

**Choice**: modelar tareas como unidades encadenadas (slice 1 → slice 2 → slice 3) sin abrir PRs.
**Rationale**: la estrategia deja el plan listo para un futuro `sdd-apply` que sí commitee.

### Decision: Prompts raíz con comandos base repetibles

**Choice**: extraer los prompts del paquete y editarlos con comandos base por ciclo.
**Rationale**: la prosa libre aumenta variabilidad; comandos repetibles reducen improvisación.

## File Changes

| File | Action | Description |
|---|---|---|
| `.gitignore` | Modify | Sumar `.atl/*.cache.json` y reforzar patrones PHP. |
| `MARCOS_PROMPTS_*.md` | New | Prompt operativo raíz de backend, DB, deploy, seguridad. |
| `MATIAS_PROMPTS_*.md` | New | Prompt operativo raíz de frontend Angular 20. |
| `docs/AGENTS.md` | Modify | Reemplazar placeholder con reglas de dominio. |
| `openspec/AGENTS.md` | Modify | Reemplazar placeholder con reglas de SDD. |
| `database/AGENTS.md` | Modify | Reglas de MariaDB y prefijos `cert_`. |
| `deploy/AGENTS.md` | Modify | Reglas de deploy cPanel. |
| `scripts/AGENTS.md` | Modify | Reglas de scripts seguros. |
| `muestra_pagina/AGENTS.md` | Modify | Reglas de referencia visual v0. |
| `apps/frontend-angular/AGENTS.md` | Modify | Reglas de Angular 20 y bloqueo hasta `muestra_pagina/`. |
| `apps/backend-php/AGENTS.md` | Modify | Reglas de PHP 8.4.21 y PDO. |
| `docs/00-indice-general.md` | Modify | Alinear rutas y lectura por rol. |
| `docs/07-...md` | Modify | Matriz con filas para prompts raíz. |
| `docs/opencode/archive/` | New | Carpeta para prompts viejos. |
| `docs/opencode/07_*.md`, `08_*.md` | Move | A `archive/` si los reemplaza el prompt raíz. |
| `ifts14_post_reorg_auditoria_y_prompts/` | Delete | Tras promover y registrar. |
| `ifts14_planificacion_opencode_inicial/` | Delete | Tras confirmar duplicación. |
| `README.md`, `GUIA.md`, `AGENTS.md` raíz | Refreshed | Solo si están desactualizados. |

## Interfaces / Contracts

No hay interfaces de runtime. Contrato SDD:

- Entrada: artefactos vigentes de `reorganizacion-segura-inicial` + paquete temporal `ifts14_post_reorg_auditoria_y_prompts/`.
- Salida: árbol activo con un único set de docs, prompts raíz, `AGENTS.md` por carpeta y `.gitignore` extendido.
- Compatibilidad: `openspec/specs/repo-seguro/spec.md` permanece vigente como base; este delta agrega la capacidad `repo-limpio`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Validación de path | Archivos sensibles no quedan listos para commit | `ls` + `grep` sobre `.gitignore`, `material_privado_no_versionar/`, nombres PHP. |
| Validación de cobertura | 8 `AGENTS.md`, 2 prompts raíz, índice y matriz | `ls` por carpeta y lectura cruzada contra `tasks.md`. |
| Validación de Git (si aplica) | `git status --ignored --short` muestra ignorados los patrones clave | Ejecutar y comparar contra lista esperada. |
| Validación de no-producto | No existe código de Angular/PHP/DB ni dependencias | `ls` y `grep` en `apps/`, `database/migrations/`, ausencia de `package.json`/`composer.json` de producto. |

## Migration / Rollout

Sin migración de datos ni rollout remoto. El rollout es local, paso a paso, dentro de este filesystem run, sin commits automáticos. Cada slice termina con su verificación.

## Open Questions

- ¿Marcos prefiere un `README.md` propio en `muestra_pagina/` además del `AGENTS.md`? El paquete no lo incluye.
- ¿Se mantiene `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` en su lugar o también se archiva?
- ¿Cuándo se quiere correr `git init`? La verificación por path es válida, pero el primer commit seguro depende de esa decisión.
