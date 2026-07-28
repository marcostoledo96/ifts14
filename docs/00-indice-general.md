# Índice general de documentación

Empezar por `README.md` y `GUIA.md`. Abrir solo el área del cambio.

## Lectura base

| Para | Leer |
|---|---|
| Onboarding humano | `README.md`, `GUIA.md`, este índice |
| Desarrollo local | `docs/05-desarrollo-local.md` |
| Qué ya está hecho | `docs/03-changelog.md` |
| Qué viene | `docs/04-roadmap.md` |
| Decisiones / stack | `docs/01-contexto-decisiones-stack.md` |
| Arquitectura | `docs/02-arquitectura.md` |
| Git recomendado | `docs/06-flujo-git-recomendado.md` |
| Cierre documental | `docs/07-sdd-archive-y-mantenimiento-documentacion.md` |
| Agentes IA | `AGENTS.md`, `docs/opencode/` |

## Por área

| Área | Documentos canónicos |
|---|---|
| Frontend | `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/frontend/02-sistema-visual-v0-f1-02.md`, `docs/frontend/03-modulos-admin.md` |
| Backend | `apps/backend-php/AGENTS.md`, `docs/backend/00-php84-api.md`, `docs/backend/API.md`, `docs/backend/01-contrato-api-certificados.md` |
| Base de datos | `database/AGENTS.md`, `docs/database/00-mariadb.md`, `docs/database/01-modelo-datos-certificados.md`, `database/README.md` |
| Deploy | `docs/deploy/00-cpanel-certificados.md`, `docs/deploy/01-staging-cpanel-certificados.md`, `deploy/README.md`, `deploy/staging/CHECKLIST.md` |
| QA | `docs/qa/CHECKLIST-TESTING-MANUAL.md`, `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` |
| Specs | `openspec/AGENTS.md`, `openspec/specs/README.md` |
| OpenCode / IA | `docs/opencode/optimizacion-tokens.md`, prompts `docs/opencode/MARCOS_…` y `docs/opencode/MATIAS_…` |
| Graphify | `docs/arquitectura/graphify/README.md` (solo con `.graphifyignore`) |
| Referencia visual | `muestra_pagina/` (no compilar) |

## Organización deploy

- **Canónico (cómo hacerlo):** `docs/deploy/`
- **Operativo (plantillas, checklist, manifiestos sin secretos):** `deploy/`

## Fuera de alcance documental

- `material_privado_no_versionar/` — no documentar ni versionar contenido sensible.
- `openspec/changes/archive/` — historial de ciclos; no es onboarding.
- `.codegraph/`, `graphify-out/` — metadata local; no es documentación fuente.
