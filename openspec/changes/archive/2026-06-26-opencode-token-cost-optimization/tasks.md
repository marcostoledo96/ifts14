# Tasks: optimización de costo de tokens en OpenCode/Gentle-AI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 380–480 |
| 400-line budget risk | Low |
| 800-line session budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR con work-unit commits |
| Delivery strategy | auto-forecast |
| Chain strategy | none/pending |

> Budget efectivo de la sesión: 800 líneas.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none/pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Seguridad Graphify + guías núcleo | PR 1, commit 1 | `.graphifyignore` + `.gitignore` + `docs/opencode/optimizacion-tokens.md` + `docs/arquitectura/graphify/README.md` |
| 2 | Integración con prompts raíz y AGENTS | PR 1, commit 2 | `AGENTS.md` + `docs/00-indice-general.md` + prompt Marcos + prompts Matías F0-F3 y F4-F6 |
| 3 | Archive matrix + verificación | PR 1, commit 3 | `docs/07-sdd-archive-y-mantenimiento-documentacion.md` + checks de alcance y F0 |

## Phase 1: Seguridad y configuración segura

- [x] 1.1 Crear `.graphifyignore` con exclusiones: `material_privado_no_versionar/`, `backups/`, `backups_originales/`, `db_dumps_originales/`, `servidor_original/`, `*.sql`, `*.sql.gz`, `*.dump`, `*.log`, `.env`, `.env.*`, `graphify-out/`, `node_modules/`, `dist/`, `coverage/`
- [x] 1.2 Agregar `graphify-out/` a `.gitignore` sin duplicar exclusiones existentes
- [x] 1.3 Documentar en la guía: Graphify NO se ejecuta si falta `.graphifyignore` o no excluye material sensible

## Phase 2: Guías operativas núcleo

- [x] 2.1 Crear `docs/opencode/optimizacion-tokens.md`: lectura mínima, RTK, Graphify seguro, perfiles, `Ponytail`, `karpathy-guidelines`, compactación/prune, evidencia, tabla rápida
- [x] 2.2 Crear `docs/arquitectura/graphify/README.md`: alcance, exclusiones, comando, lectura de grafo, prohibición de indexar secretos
- [x] 2.3 Incluir en la guía ejemplo de `rtk gain` y `mem_session_summary` antes de cerrar

## Phase 3: Integración con prompts raíz y AGENTS

- [x] 3.1 Modificar `AGENTS.md` raíz: agregar doc eficiencia a "Lectura mínima" y regla "Graphify solo con `.graphifyignore` válido"
- [x] 3.2 Modificar `docs/00-indice-general.md`: enlazar guía eficiencia y README Graphify
- [x] 3.3 Modificar `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: ruta rápida y prompt base leen solo ciclo activo + doc eficiencia
- [x] 3.4 Modificar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: reemplazar lista monolítica por "ciclo activo + `docs/opencode/optimizacion-tokens.md`" + F0 check
- [x] 3.5 Modificar `MATIAS_PROMPTS_SDD_FASE2.md`: mismo ajuste + F0 check

## Phase 4: Sincronización archive

- [x] 4.1 Modificar `docs/07-sdd-archive-y-mantenimiento-documentacion.md`: agregar fila "Cambio de flujo OpenCode/Graphify" en la matriz
- [x] 4.2 Verificar que las rutas mencionadas en la guía y el README de Graphify existen

## Phase 5: Verificación final

- [x] 5.1 `git diff --name-only` debe tocar solo documentación/configuración segura del ciclo y artefactos OpenSpec de progreso
- [x] 5.2 F0 check: prompt Matías ya no contiene la lista monolítica; sí referencia doc de eficiencia
- [x] 5.3 F0 check: `git status --ignored --short` no lista `graphify-out/`
- [x] 5.4 `docs/opencode/optimizacion-tokens.md` enlazado en `docs/00-indice-general.md` y referenciado en `AGENTS.md` raíz
- [x] 5.5 Ningún cambio en `apps/`, `database/`, `deploy/`, `material_privado_no_versionar/`, `muestra_pagina/`, secretos ni dumps
- [x] 5.6 `.graphifyignore` excluye `material_privado_no_versionar/`, `.env`, `*.sql`, `backups/`, `graphify-out/`
