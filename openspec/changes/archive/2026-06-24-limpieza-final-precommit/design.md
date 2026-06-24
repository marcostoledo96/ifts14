# Design: Limpieza documental final previa al primer commit seguro

## Technical Approach

Cambio puramente documental y de configuración `.gitignore`. No se introduce código de producto, no se instalan dependencias, no se ejecuta `git add`, `commit`, `push` ni `merge`. El diseño se centra en asegurar que la superficie versionada quede lista para un futuro `git init` o para el primer commit manual, sin debilitar las garantías de `repo-seguro` ni romper la unificación de `repo-limpio`.

## Architecture Decisions

### Decision: Negation SQL limitada a `database/migrations/` y `database/seeds/`

**Choice**: agregar dos reglas `!database/migrations/**/*.sql` y `!database/seeds/**/*.sql` inmediatamente después de la regla global `*.sql`.
**Alternatives**: (a) ignorar `*.sql` y versionar todo por convención; (b) ignorar `database/**/*.sql` y permitir solo archivos específicos; (c) usar `!*.sql` con filtro por carpeta.
**Rationale**: la negation puntual mantiene `*.sql` global como red de seguridad y abre la excepción solo donde está documentado el uso legítimo (migraciones y seeds). (a) abre la puerta a dumps accidentales; (b) obliga a declarar cada archivo y rompe la regla global; (c) deja abierta la puerta a SQL arbitrario.

### Decision: `.gitkeep` en lugar de README para carpetas activas vacías

**Choice**: archivos `.gitkeep` vacíos o de una línea.
**Alternatives**: README con descripción por carpeta; carpetas sin marcador.
**Rationale**: `.gitkeep` es convención estándar de Git para preservar carpetas sin agregar ruido documental. Un README por carpeta obligaría a mantener texto que se desactualiza; el contenido real ya vive en `AGENTS.md` raíz de cada área y en `docs/`.

### Decision: Marcador histórico mínimo en `docs/planificacion-inicial/`

**Choice**: crear `AGENTS.md` breve declarando el directorio como histórico.
**Alternatives**: mover la carpeta a `archive/`; renombrar a `docs/planificacion-inicial-archive/`; dejar sin marcador.
**Rationale**: el usuario pidió opción A mínima y mantener la ubicación actual. Mover o renombrar introduce churn y referencias rotas en el índice; dejar sin marcador deja ambigua la naturaleza histórica.

### Decision: Archivo del primer prompt dentro de `docs/opencode/archive/`

**Choice**: mover `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` a `docs/opencode/archive/` con `git mv` cuando haya Git; copia local con nota de movimiento cuando no.
**Alternatives**: borrarlo; dejarlo en su ubicación.
**Rationale**: el prompt ya está reemplazado por el ciclo archivado `reorganizacion-segura-inicial`. Conservar como histórico es útil para auditoría sin contaminar el directorio activo.

### Decision: `docs/opencode/AGENTS.md` separado del índice

**Choice**: crear `AGENTS.md` propio del directorio `docs/opencode/`.
**Alternatives**: mergear en `docs/AGENTS.md`.
**Rationale**: la carpeta tiene semántica propia (prompts operativos archivados y vigentes); reglas dedicadas reducen ambigüedad y siguen el patrón de las demás áreas (`apps/`, `database/`, `deploy/`).

## Data Flow

No aplica. Este cambio no introduce flujo de datos. Solo ajusta reglas de versionado y agrega archivos de soporte.

## File Changes

| Archivo | Acción | Descripción |
|---|---|---|
| `.gitignore` | Modify | Agregar `!database/migrations/**/*.sql` y `!database/seeds/**/*.sql`; documentar la regla con comentario corto. |
| `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` | Move | A `docs/opencode/archive/`. |
| `docs/opencode/AGENTS.md` | Create | Reglas de uso del directorio opencode. |
| `docs/opencode/archive/README.md` | Create | Explica el propósito del histórico. |
| `docs/planificacion-inicial/AGENTS.md` | Create | Marcador histórico mínimo. |
| `database/migrations/.gitkeep` | Create | Marcador de carpeta activa vacía. |
| `database/seeds/.gitkeep` | Create | Marcador de carpeta activa vacía. |
| `database/docs/.gitkeep` | Create | Marcador de carpeta activa vacía. |
| `deploy/cpanel/.gitkeep` | Create | Marcador de carpeta activa vacía. |
| `deploy/htaccess/.gitkeep` | Create | Marcador de carpeta activa vacía. |
| `docs/00-indice-general.md` | Modify | Mención condicional de `.atl/skill-registry.md`; validar rutas reales. |
| `openspec/changes/limpieza-final-precommit/specs/repo-precommit/spec.md` | Create | Spec nueva full. |
| `openspec/changes/limpieza-final-precommit/specs/repo-seguro/spec.md` | Create | Delta con negation SQL. |
| `openspec/specs/repo-seguro/spec.md` | Modify (futuro archive) | Aplicar delta SQL. |

## Interfaces / Contracts

No aplica. No se introducen interfaces ni contratos técnicos.

## Testing Strategy

| Capa | Qué verificar | Cómo |
|---|---|---|
| Estática | `.gitignore` cubre los patrones exigidos | `grep` sobre `.gitignore` validando cada regla. |
| Estática | Cada ruta del índice existe | `ls` por cada ruta listada en `docs/00-indice-general.md`. |
| Estática | Marcadores presentes en carpetas vacías | `ls -a` en cada una buscando `.gitkeep`. |
| Estática | Archivo de prompt en lugar correcto | `ls` sobre `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` (debe no existir) y `docs/opencode/archive/PRIMER_PROMPT_REORGANIZACION.md` (debe existir). |
| Git (si disponible) | `git status --ignored --short` | Confirmar ignorado de `material_privado_no_versionar/`, `*.sql` en raíz y versión de `database/migrations/*.sql` y `database/seeds/*.sql` (si hay contenido). |
| Sin Git | Verificación por path | Documentar la limitación y usar `ls` + `grep`. |

## Migration / Rollout

No requiere migración de datos. Cambios solo a nivel de árbol de archivos y `.gitignore`. Sin estado remoto. Sin feature flags.

## Open Questions

- Si `git` queda inicializado durante el ciclo, ¿se prefiere `git mv` para mover el prompt archivado o copia simple con nota? Decisión: preferir `git mv` si hay Git; si no, copia con nota explícita en `tasks.md`.
- Confirmar si `database/docs/` debe tener `.gitkeep` o si conviene un README corto que apunte a `docs/database/00-mariadb.md`. Decisión: `.gitkeep` para mantener uniformidad con el resto de las carpetas activas vacías.
