# Tasks: P7-04 Seguridad y Docs CI

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~150 |
| 1000-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |
| Decision needed before apply | No |

---

## Tasks

### Phase 1: New CI job

- [x] **1.1** Crear job `security-docs-gates` en `backend-tests.yml`. REQ-SEC-001 a REQ-SEC-005.
- [x] **1.2** Agregar paso gitleaks (usar `gitleaks/gitleaks-action@v2` o binary). REQ-SEC-001.
- [x] **1.3** Agregar paso `git diff --check`. REQ-SEC-002.
- [x] **1.4** Agregar paso de enlaces internos. REQ-SEC-003.
- [x] **1.5** Agregar paso de términos obsoletos. REQ-SEC-004.
- [x] **1.6** Agregar paso de OpenSpec huérfano. REQ-SEC-005.

### Phase 2: Scripts de soporte

- [x] **2.1** Crear `scripts/ci-link-check.sh` — verifica enlaces en docs/specs. REQ-SEC-003.
- [x] **2.2** Crear `scripts/ci-obsolete-terms.sh` — busca términos obsoletos. REQ-SEC-004.
- [x] **2.3** Crear `scripts/ci-openspec-orphan-check.sh` — detecta carpetas activas sin archivo. REQ-SEC-005.

### Phase 3: Configuración

- [x] **3.1** Crear `.gitleaks.toml` con allowlist para `muestra_pagina/` y tokens de test. REQ-SEC-001.

### Phase 4: Limpieza de huérfanos

- [x] **4.1** Mover `openspec/changes/m4-01a-backend-contrato-token-permanente-dni-fechas/` a `openspec/changes/archive/2026-07-02-m4-01a-backend-contrato/`. REQ-SEC-006.
- [x] **4.2** Mover `openspec/changes/m4-02-database-cursos-alumnos-asistencias/` a `openspec/changes/archive/2026-07-02-m4-02-database/`. REQ-SEC-006.
- [x] **4.3** Mover `openspec/changes/p5-03-environments/` a `openspec/changes/archive/2026-07-15-p5-03-environments/`. REQ-SEC-006.

### Phase 5: Corrección de términos residuales

- [x] **5.1** Corregir `pendiente-entrega` en `openspec/specs/frontend-http-services/spec.md`. REQ-SEC-007.
- [x] **5.2** Corregir "último entregado" en `public-validation-page.html`. REQ-SEC-007.

### Phase 6: Verificación

- [x] **6.1** Ejecutar `git diff --check`.
- [x] **6.2** Ejecutar `scripts/ci-link-check.sh`.
- [x] **6.3** Ejecutar `scripts/ci-obsolete-terms.sh`.
- [x] **6.4** Ejecutar `scripts/ci-openspec-orphan-check.sh`.
