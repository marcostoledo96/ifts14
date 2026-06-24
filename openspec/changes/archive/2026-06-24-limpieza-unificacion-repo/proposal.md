# Proposal: Limpieza y unificación documental del repositorio `ifts14`

## Intent

Cerrar la fase de reorganización segura inicial eliminando carpetas temporales de paquetes aplicados, completando `AGENTS.md` por carpeta, creando los prompts operativos por rol, ajustando el índice y la matriz de `sdd-archive`, y dejando el repositorio navegable y listo para el primer commit seguro. La decisión del usuario trata a `ifts14_post_reorg_auditoria_y_prompts/` como la carpeta temporal real del paquete.

## Scope

### In Scope

- Completar `.gitignore` con `.atl/*.cache.json` y nombres PHP sensibles.
- Completar 8 `AGENTS.md` en carpetas activas.
- Crear en raíz `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- Actualizar `docs/00-indice-general.md` y `docs/07-...md`; refrescar raíz solo si está desactualizado.
- Mover prompts viejos a `docs/opencode/archive/` si los reemplaza el prompt raíz.
- Eliminar las dos carpetas temporales tras promover contenido útil.
- Verificación final: `git status --ignored --short` si hay Git; si no, por path.

### Out of Scope

- Producto (Angular, PHP, MariaDB, deploy), dependencias, commits, pushes, merges, lectura de credenciales/dumps/logs.

## Capabilities

### New Capabilities
- `repo-limpio`: una única fuente vigente de docs raíz, `AGENTS.md` por carpeta, prompts operativos por rol, índice alineado y sin carpetas temporales.

### Modified Capabilities
- `repo-seguro`: el delta deja explícita la etapa siguiente de unificación documental sin debilitar las protecciones de material sensible.

## Approach

SDD híbrido (OpenSpec + Engram), planificación primero y ejecución documental después. Reutilizar el paquete temporal como referencia sin copy/paste literal.

## Affected Areas

| Area | Action |
|---|---|
| `.gitignore` | Modify |
| `MARCOS_PROMPTS_*.md` y `MATIAS_PROMPTS_*.md` raíz | New |
| `*/AGENTS.md` (8) | Modify |
| `docs/00-indice-general.md`, `docs/07-...md` | Modify |
| `docs/opencode/archive/` | New |
| `ifts14_post_reorg_auditoria_y_prompts/` | Delete |
| `ifts14_planificacion_opencode_inicial/` | Delete |
| `README.md`, `GUIA.md`, `AGENTS.md` raíz | Refreshed |

## Risks

| Risk | Mitigation |
|---|---|
| Eliminar carpeta temporal con contenido único no promovido | Listar únicos y bloquear `rm -rf` hasta checklist. |
| Archivar prompts todavía vigentes | Mantenerlos en `archive/` con nota cruzada. |
| Subir credenciales PHP | Validar `.gitignore` con grep y verificar ignorado. |
| Repo no Git | Documentar limitación y usar verificación por path. |
| Índice desalineado | Validar cada ruta con `ls` antes de cerrar. |

## Rollback Plan

Restaurar desde `docs/opencode/archive/`, recuperar carpeta temporal desde backup local y revertir ediciones a índice, matriz, `AGENTS.md` y `.gitignore` desde la última versión válida. Sin estado remoto.

## Dependencies

- Cambio archivado `reorganizacion-segura-inicial` como base.
- `ifts14_post_reorg_auditoria_y_prompts/` como fuente de promoción.
- `openspec/specs/repo-seguro/spec.md` como contrato previo.

## Success Criteria

- [ ] `.gitignore` ignora `.atl/*.cache.json` y los nombres PHP sensibles.
- [ ] Existen 8 `AGENTS.md` con contenido de dominio, no placeholders.
- [ ] Existen los dos prompts raíz por rol.
- [ ] Índice y matriz alineados con archivos reales y con filas para prompts raíz.
- [ ] Las dos carpetas temporales eliminadas tras promoción.
- [ ] Sin producto, sin dependencias, sin commits.
