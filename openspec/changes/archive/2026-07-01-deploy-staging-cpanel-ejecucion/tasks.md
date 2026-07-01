# Tasks: deploy-staging-cpanel-ejecucion

## Review Workload Forecast

Estimated changed lines: 220–320. 800-line risk: Low. 400-line risk: Low. Chained PRs: No. Delivery: single-pr-default. Chain strategy: single-pr.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low
800-line budget risk: Low

Work units:

| Unit | Goal | PR |
|------|------|----|
| 1 | Local prep + runbook + tests + scans | PR 1 (single) |

## Phase 0: Human Gate — BLOCKING

- [x] 0.1 Confirmar 7 puntos con Marcos: (a) ruta/subdominio final, (b) ventana cPanel + pasos manuales aprobados, (c) `CERTIFICADOS_CONFIG_PATH` externo + `SetEnv`, (d) DB staging (nombre/usuario/esquema/migración/seed), (e) backup previo de `/certificados_staging/`, (f) Composer en hosting o `vendor/` fuera de Git, (g) SMTP stub o prueba. Sin los 7: `sdd-apply` bloqueado, cPanel no se toca.

## Phase 1: Local repo prep (agente, sin cPanel)

- [x] 1.1 `normalizePath()` en `apps/backend-php/index.php`: aceptar `/certificados/api`, `/certificados_staging/api`, `/index.php` (un router, mínimo diff).
- [x] 1.2 Crear `apps/frontend-angular/src/environments/environment.staging.ts` (`useRealApi`, `apiBaseUrl: '/certificados_staging/api'`).
- [x] 1.3 `production-staging` en `apps/frontend-angular/angular.json` (`baseHref: /certificados_staging/`, `fileReplacement` a `environment.staging.ts`).
- [x] 1.4 Crear `deploy/staging/MANIFIESTO.md` (artefactos a copiar + exclusiones: `vendor/`, `.env*`, dumps, logs, `public_html/`, configs reales).
- [x] 1.5 Crear `deploy/staging/.htaccess-root` (SPA, sin capturar `/api/`).
- [x] 1.6 Crear `deploy/staging/.htaccess-api` (bloqueo `src/`/`config/` + `FallbackResource`).
- [x] 1.7 Crear `deploy/staging/CHECKLIST.md` (gates: ruta, config externa, DB, Composer, SMTP, backup, smoke, rollback).
- [x] 1.8 Reescribir `docs/deploy/01-staging-cpanel-certificados.md`: guía futura → runbook gated.

## Phase 2: Tests & build verification (agente, local)

- [x] 2.1 Test procedural en `apps/backend-php/tests/`: invoca `normalizePath()` con 3 prefijos, assertea `/health`.
- [x] 2.2 `php -l apps/backend-php/index.php` (vía `scripts/php-docker-lint.sh`) → lint limpio.
- [x] 2.3 `npm run build -- --configuration production-staging`; verificar `href="/certificados_staging/"` y reemplazo de environment.
- [x] 2.4 `rg` sobre `deploy/staging/`: bloquear si hay `.env`, `password`, `secret`, `BEGIN PRIVATE`, `vendor/`, `*.sql`, `public_html/`, `*.dump`, `*.bak`.
- [x] 2.5 `git status --short` post-Phase 1: sin `dist/`, `vendor/`, `public_html/`, `.env*`.

## Phase 3: Real cPanel execution — MANUAL, EXPLICIT-APPROVAL GATED (NO agente)

- [ ] 3.1 Marcos: backup de `/certificados_staging/` si existe.
- [ ] 3.2 Subir `dist/frontend-angular/` a `public_html/certificados_staging/`.
- [ ] 3.3 Subir backend PHP (sin `vendor/`) a `public_html/certificados_staging/api/`.
- [ ] 3.4 Instalar `.htaccess-root` y `.htaccess-api` desde plantillas.
- [ ] 3.5 `SetEnv CERTIFICADOS_CONFIG_PATH` en `.htaccess-api`.
- [ ] 3.6 Migración + seed en DB staging.
- [ ] 3.7 Composer en hosting o `vendor/` local (nunca commitear).
- [ ] 3.8 SMTP stub; SMTP real solo si gate 0.1.g lo aprobó.
- [ ] 3.9 Smoke: `curl /certificados_staging/api/health` → 200; sin 404.
- [ ] 3.10 Si falla, rollback limitado a `/certificados_staging/`. Nunca tocar `/certificados/`.

## Work-unit commits (en el único PR)

`feat(backend): normalizePath soporta staging` · `feat(frontend): build production-staging` · `chore(deploy): manifiesto+htaccess+checklist` · `docs(deploy): runbook gated` · `test(backend): normalizePath staging` · `chore(deploy): scan guard paquete`.

## Result Contract

Status: success. Artifacts: `tasks.md` + Engram `sdd/deploy-staging-cpanel-ejecucion/tasks`. Blocking: Phase 0.1. Out of scope agentes: Phase 3. Forecast 220–320 líneas, 800-budget Low, single-pr. Next: sdd-apply (gate OK). Risks: mezcla staging/prod si 0.1.a falta; secretos si 2.4 falla; drift router/`.htaccess` si Phase 2 no verde.
