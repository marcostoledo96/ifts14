# Tasks: Ajuste de planificación Marcos/Matías

## Review Workload Forecast

- Estimated changed lines: ~9 000–9 500 (v0 ~8 700 + ~400 docs/specs/metadata).
- 400/800-line budget risk: High.
- Chained PRs: No (Marcos ya aceptó `size:exception`).
- Single PR, 2 unidades: U1 v0 + U2 D0.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High
800-line budget risk: High

## Phase 1 — v0 reference (U1)

- [x] 1.1 Clasificar `muestra_pagina/` como referencia visual: NO compilar ni portar a Angular.
- [x] 1.2 Recrear `muestra_pagina/README.md`, `AGENTS.md`, `MANIFIESTO_V0.md` con inventario y prohibición de portar `login-form.tsx`.
- [x] 1.3 `muestra_pagina/.gitignore` ignora `node_modules`, `.next/`, `.env*.local`, runtime v0.
- [x] 1.4 `git status --short -- muestra_pagina/`: solo versionable antes de stage final.

## Phase 2 — Docs raíz (U2)

- [x] 2.1 `README.md`: bloque D0 (QR permanente, DNI completo público, `X-Admin-Key`, staging, gates Composer/SMTP) y roles.
- [x] 2.2 `GUIA.md`: alcance, flujo, staging, reglas QR/DNI/reenvío.
- [x] 2.3 `AGENTS.md`: token permanente, DNI completo UI pública, logs sin DNI completo, no rotar token, `.codegraph/` fuera de stage.

## Phase 3 — Docs técnicas (U2)

- [x] 3.1 `docs/backend/01-contrato-api-certificados.md`: DTO DNI completo + `attendedDates`; reenvío conserva token.
- [x] 3.2 `docs/backend/00-php84-api.md`: endpoints, `X-Admin-Key` temporal, gaps.
- [x] 3.3 `docs/database/01-modelo-datos-certificados.md`: DNI completo público; futuras `cert_cursos/alumnos/asistencias/configuracion`.
- [x] 3.4 `docs/database/00-mariadb.md` + `docs/frontend/00-angular20-port-v0.md`: alinear D0; v0 referencia; sin portar credenciales demo.
- [x] 3.5 Deploy + staging + checklist: gates Composer/vendor, SMTP `stub`, `baseHref` y prefijo API en `/certificados_staging/`.

## Phase 4 — Specs OpenSpec (U2)

- [x] 4.1 Revisar 8 deltas en `openspec/changes/.../specs/*/spec.md` (QR, DNI, `attendedDates`, `X-Admin-Key`, staging); ajustar huecos.
- [x] 4.2 Confirmar `openspec/specs/` principales (8 dominios) listos para `sdd-archive`.

## Phase 5 — Prompts (U2)

- [x] 5.1 `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: bloque M4 con M4-01..M4-07; preserva M1-M3.
- [x] 5.2 Prompts Matías: UI/UX, D0, v0, DNI completo, `attendedDates`, QR permanente, auth simple, sin portar credenciales demo.

## Phase 6 — `.codegraph/` y material privado

- [x] 6.1 `.gitignore` raíz ignora `.codegraph/` (agregar entrada si falta); `.codegraph/.gitignore` interno intacto.
- [x] 6.2 `git status --short -- .codegraph/`: nada staged.
- [x] 6.3 `git status --ignored --short`: no tocar `material_privado_no_versionar/`, `*.sql`, `*.dump`, `*.log`, `.env*`.

## Phase 7 — Audit input y root hygiene

- [x] 7.1 Decidir destino de `IFTS14_ajuste_documentacion_planificacion_marcos_matias.md` (mover a `docs/auditoria/` o raíz); documentar en `docs/auditoria/INDEX.md` si se mueve.
- [x] 7.2 Raíz limpia: solo `README.md`, `GUIA.md`, `AGENTS.md`, audit input (si raíz) y `openspec/`.

## Phase 8 — Verificación documental

- [x] 8.1 Búsqueda residual: `documentMasked`, `enmascarado público`, `rotación normal`, `rotar token`; sin matches en docs/prompts/specs vigentes (matches restantes solo en audit input histórico y artefactos SDD del change).
- [x] 8.2 Cross-links: cada doc raíz enlaza su spec OpenSpec y contraparte técnica.
- [x] 8.3 `rg` patterns sensibles (`DNI\s*[:=]`, `BEGIN CERTIFICATE`, `password\s*[:=]`) sobre staged; sin hits.
- [x] 8.4 Sin contradicciones token/DNI/`attendedDates`/`X-Admin-Key`/staging entre docs, specs.
- [x] 8.5 `git status --short --ignored`: sin `.codegraph/`, `material_privado_no_versionar/`, `*.sql`, `*.log`, `*.env*`, `*.dump`, `node_modules/` staged.
- [x] 8.6 `git diff --cached --stat`: 2 unidades distinguibles; v0 mayor.
- [x] 8.7 `verify-report.md` con PASS/PASS WITH WARNINGS/FAIL por phase y archivos tocados. (Verdict: PASS WITH WARNINGS. Reconciliación mecánica en archive.)

## Phase 9 — Corrección post-verify FAIL (docs-only)

- [x] 9.1 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: eliminar guía stale de DNI enmascarado en validación pública (líneas 255, 757, 767, 808, 1108, 1203, 1388, 1400 y adyacente 718); alinear con D0 (DNI completo público; logs/auditoría/errores/admin sin DNI completo; mocks ficticios).
- [x] 9.2 `docs/frontend/00-angular20-port-v0.md:141`: corregir `dto.ts` — DTOs incluyen `documentNumber` completo + `attendedDates` por D0; sin hash/pepper/tablas internas.
- [x] 9.3 `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (adyacente): corregir líneas 21 y 61 — v0 puede enmascarar pero prevalece D0.
- [x] 9.4 Re-scan residual: sin `DNI enmascarado`/`sin DNI completo`/`No se expone DNI completo` en docs/prompts vigentes vivos.
- [x] 9.5 Sin código de producto tocado (`apps/`, migrations, seeds, deploy, `public_html`, `vendor/`).
- [x] 9.6 Sensitive scan limpio en archivos cambiados.
- [x] 9.7 `MATIAS_PROMPTS_SDD_FASE2.md` revisado: línea 127 ya correcta (D0 prevalece); sin cambios.
