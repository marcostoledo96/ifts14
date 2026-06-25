# Tareas: Mejorar la guía operativa de Marcos (ciclos SDD)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 400-600 (ampliación de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`) |
| 400-line budget risk | Low |
| 800-line budget risk (declared) | Low |
| Chained PRs recommended | Yes |
| Suggested split | WU1 estructura → WU2 9 ciclos M1-01..M3-03 |
| Delivery strategy | force-chained (no commit/push/merge) |
| Chain strategy | stacked-to-main (conceptual) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| WU1 | Estructura y secciones base | PR 1 (conceptual) | Ruta rápida, rol/prohibiciones, tabla QA, plantilla, anexo, handoff, comandos Git. |
| WU2 | 9 ciclos M1-01..M3-03 con plantilla | PR 2 (conceptual) | Encima de WU1. Si diff ≤ 400, se fusiona en una sola WU. |

## Phase 1 — WU1: estructura y secciones base

- [x] 1.1 Encabezado + ruta rápida en `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- [x] 1.2 "Rol y prohibiciones": PHP 8.4.21, MariaDB 10.6.27, cPanel; sin Angular salvo coordinación; sin material privado; sin Git automático.
- [x] 1.3 Tabla "Cuándo detenerse para QA manual" con `php -l`, `php -m`, `mysqldump --no-data`, `curl` con token ficticio, `git status --ignored --short`, `.htaccess`.
- [x] 1.4 Plantilla de ciclo compacta (9 campos) en bloque markdown copiable.
- [x] 1.5 Anexo breve de skills/agents desde `opencode.json` y `.atl/skill-registry.md`; solo lo verificable o "pendiente de validar".
- [x] 1.6 "Handoff al cierre" + "Comandos Git propuestos" como ejemplo, no como instrucción automática.

## Phase 2 — WU2: 9 ciclos M1-01..M3-03 con plantilla aplicada

- [x] 2.1 M1-01 limpieza: `git status --ignored --short` antes de cualquier cambio.
- [x] 2.2 M1-02 auditoría: lectura segura de `material_privado_no_versionar/` (solo nombres/riesgos).
- [x] 2.3 M1-03 modelo MariaDB: `mysqldump --no-data` sobre fixture ficticio.
- [x] 2.4 M2-01 contrato API: diff de `openspec/specs/backend-contrato-api-certificados/spec.md` antes/después.
- [x] 2.5 M2-02 base PHP: `php -l` por archivo y `php -m` para extensiones (pdo_mysql, openssl, mbstring).
- [x] 2.6 M2-03 validación pública: `curl` con token ficticio, sin DNI/token en logs.
- [x] 2.7 M3-01 integración Angular: checkpoint de contrato (DTOs y errores) sin acoplar implementaciones.
- [x] 2.8 M3-02 deploy cPanel: `.htaccess`, base href `/certificados/`, script de subida y rollback.
- [x] 2.9 M3-03 hardening: logs sin datos sensibles, backups, `.gitignore`, `docs/` sincronizado, comandos Git propuestos.

## Phase 3 — Cierre y verificación

- [x] 3.1 9 IDs M1-01..M3-03 coinciden con la versión previa (diff de `### Ciclo M...`).
- [x] 3.2 Cada ciclo tiene los 9 campos y al menos un checkpoint QA con comando concreto.
- [x] 3.3 Anexo de skills/agents verificable o "pendiente de validar".
- [x] 3.4 `docs/00-indice-general.md` sin cambios si la ruta/función no cambió.
- [x] 3.5 `git diff --stat` dentro del presupuesto; reporte final con archivos, líneas, WU, cobertura de spec y comandos Git propuestos (no ejecutados).

## Notas

- Documentación pura; no se ejecuta `npm`/`ng`/`php`/`mysql`/`git commit`/`gh pr create`.
- Si diff > 800, mantener WU1 + WU2; si `opencode.json` ya alineado, el anexo puede reducirse o eliminarse.
