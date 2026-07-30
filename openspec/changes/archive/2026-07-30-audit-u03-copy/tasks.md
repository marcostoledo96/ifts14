# Tasks: audit-u03-copy — Glosario UI + unificación de copy visible (U3)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120–250 (glosario + links + strings certs + specs + PLAN) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception (N/A — under budget) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Glosario + copy quirúrgico admin certs + tests + PLAN §U3 | single PR | `cd apps/frontend-angular && npx ng test --include='**/certification-preview-page.spec.ts' --include='**/certification-revoke-page.spec.ts' --include='**/certification-new-page.spec.ts' --include='**/certifications-list-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit copy assertions; smoke visual expediente opcional en verify | Revert glosario+índice/port + páginas certs + specs + PLAN §U3 |

**TDD note**: `openspec/config.yaml` → `apply.tdd: false`. Actualizar aserciones de copy junto al pass (sin RED estricto). Threat matrix: N/A — sin tareas threat-RED.

**Locks**: Documento (no «mascarado»); badge **Revocado**; copy visible válidas/Válida; hub DEFER; U5 DEFER; sin lógica/API; archive U2 intacto; **no commit** en apply/verify.

## Phase 1: Glosario + descubrimiento — SHELL-COPY-01

- [x] 1.1 Crear `docs/frontend/04-glosario-ui.md` (AR formal): Válida/Revocado, Activo/Inactivo, Programada/Realizada, Expediente, Entrega manual; nota VÁLIDO/REVOCADO público ≠ Válida/Revocado admin; hub DEFER
- [x] 1.2 Enlace liviano en `docs/00-indice-general.md` (fila Frontend) + mención corta en `docs/frontend/00-angular20-port-v0.md`

## Phase 2: Pass quirúrgico copy — CERT-COPY-01

- [x] 2.1 `…/preview/certification-preview-page.ts` — `estadoToLabel` → **Revocado**; mensaje Copiar/QR «válidas»
- [x] 2.2 `…/preview/certification-preview-page.html` — dt **Documento**; copy revocar «válidas»
- [x] 2.3 `…/delivery/certification-delivery-page.ts` — mensaje Copiar/QR «válidas»
- [x] 2.4 `…/revoke/certification-revoke-page.html` — copy visible «válidas» (MAY conservar «vigente» operativo de dominio si aplica)
- [x] 2.5 `…/new/certification-new-page.html` + `.ts` — aviso/errorEmit visibles con **válida** (sin tocar lógica 409/`estado === 'vigente'`)
- [x] 2.6 `…/in-memory-certifications.service.ts` — mensaje Error mock alineado al copy visible (no renombrar maps/`vigente` internos)

## Phase 3: Tests + regresión

- [x] 3.1 `…/preview/certification-preview-page.spec.ts` — assert badge **Revocado** (no Revocada) + label **Documento** (no mascarado) [CERT-COPY-01]
- [x] 3.2 `…/revoke/certification-revoke-page.spec.ts` — aserción «vigentes» → «válidas»
- [x] 3.3 `…/new/certification-new-page.spec.ts` — aserción errorEmit/`certificado vigente` → copy **válida**
- [x] 3.4 Regresión: `…/list/certifications-list-page.spec.ts` sigue Válida/Revocado

## Phase 4: PLAN + prep verify

- [x] 4.1 Marcar checkboxes `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U3
- [x] 4.2 `npx tsc --noEmit -p tsconfig.app.json` limpio desde `apps/frontend-angular`
- [x] 4.3 Correr focused specs de la tabla; confirmar DEFER (hub, U5, pública, archive U2, sin API)
- [x] 4.4 Dejar `verify-report.md` a **sdd-verify**; **no commit**

## Verify (sdd-verify)

- [x] V.1 Focused `ng test` (preview+revoke+new+list) + `tsc` → escribir `openspec/changes/audit-u03-copy/verify-report.md` cubriendo SHELL-COPY-01 + CERT-COPY-01 (5 escenarios) + glosario/PLAN §U3; **no commit**
