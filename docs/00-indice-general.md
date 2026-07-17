# Índice general de documentación

No leer todo el repositorio por defecto. Empezar por la ruta mínima del rol y abrir solo lo necesario para el ciclo SDD activo.

## Lectura base

| Para | Leer |
|---|---|
| Humanos | `README.md`, `GUIA.md`, `docs/00-indice-general.md` |
| IA / OpenCode | `AGENTS.md`, `docs/00-indice-general.md`, `docs/opencode/optimizacion-tokens.md`, `openspec/specs/repo-seguro/spec.md` |
| Cierre de ciclo | `docs/07-sdd-archive-y-mantenimiento-documentacion.md` |

## Prompts operativos vigentes

| Rol | Guía vigente |
|---|---|
| Marcos | `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` |
| Matías | `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (guía unificada F0-F6) |

Los prompts anteriores de `docs/opencode/` quedan archivados en `docs/opencode/archive/` como referencia histórica.

## Lectura por área

| Área | Documentos |
|---|---|
| Arquitectura | `docs/01-contexto-decisiones-stack.md`, `docs/02-arquitectura.md` |
| Frontend | `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/frontend/02-sistema-visual-v0-f1-02.md`, `docs/opencode/onboarding-matias-frontend.md` |
| Backend | `apps/backend-php/AGENTS.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/backend/API.md` |
| Base de datos | `database/AGENTS.md`, `docs/database/00-mariadb.md`, `docs/database/01-modelo-datos-certificados.md`, `database/README.md` |
| Deploy | `deploy/AGENTS.md`, `docs/deploy/00-cpanel-certificados.md`, `deploy/README.md` |
| Auditoría | `docs/auditoria/INDEX.md`, `docs/auditoria/00-inventario-material-descargado.md`, `docs/auditoria/01-auditoria-material-original.md`, `docs/auditoria/02-hallazgos-dumps-sql.md`, `docs/auditoria/IFTS14_ajuste_documentacion_planificacion_marcos_matias.md` |
| Scripts | `scripts/AGENTS.md` |
| Specs | `openspec/AGENTS.md`, `openspec/specs/README.md`, `openspec/specs/repo-seguro/spec.md`, `openspec/specs/backend-contrato-api-certificados/spec.md`, `openspec/specs/backend-modelo-datos-certificados/spec.md`, `openspec/specs/frontend-ci-quality-gates/spec.md`, `openspec/specs/backend-ci-quality-gates/spec.md`, `openspec/specs/mariadb-ci-quality-gates/spec.md`, `openspec/specs/security-docs-ci-gates/spec.md` |
| Referencia visual v0 | `muestra_pagina/` (listado seguro), `docs/frontend/00-angular20-port-v0.md` |
| OpenCode / costos | `docs/opencode/optimizacion-tokens.md`, `docs/opencode/verificacion-flujo-opencode-sdd.md`, `docs/arquitectura/graphify/README.md` |

## Referencias condicionales

## Estado documental P5-01

- Autenticación y sesión: `docs/backend/00-php84-api.md`, `docs/backend/API.md`, `openspec/specs/admin-auth/spec.md`.
- Staging/cPanel: `docs/deploy/01-staging-cpanel-certificados.md` y `docs/deploy/00-cpanel-certificados.md`.
- Producción no está activada ni validada; la entrega manual con datos de negocio es seguimiento fuera de P5-01.

- `.atl/skill-registry.md`: leer solo cuando el ciclo trabaje sobre skills, agentes o configuración de OpenCode. No forma parte de la lectura por defecto.
- `graphify-out/`: salida local generada por Graphify; no se versiona ni se lee como documentación fuente.

## Planificación inicial archivada como referencia

- `docs/planificacion-inicial/README_PAQUETE.md`
- `docs/planificacion-inicial/01_GUIA_ARRANQUE_REPO_IFTS14.md`
- `docs/planificacion-inicial/02_ESTRUCTURA_REPO_Y_GITIGNORE.md`
- `docs/planificacion-inicial/03_BACKUP_SANITIZACION_AUDITORIA.md`
- `docs/planificacion-inicial/04_ARQUITECTURA_ANGULAR20_PHP84_MARIADB.md`
- `docs/planificacion-inicial/05_DEPLOY_CPANEL_CERTIFICADOS.md`
- `docs/planificacion-inicial/06_SKILLS_DEPENDENCIAS_OPENCODE.md`
- `docs/planificacion-inicial/09_PRIMER_COMMIT_GITHUB.md`
- `docs/planificacion-inicial/10_DESCARGAR_ESTUDIAR_CODIGO_LOCAL.md`
