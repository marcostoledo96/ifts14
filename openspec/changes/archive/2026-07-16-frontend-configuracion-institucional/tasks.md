# Tasks: Configuración institucional Angular

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 550–850 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 seam → PR2 página → PR3 ruta/sidebar |
| Delivery strategy | single-cycle apply (decisión de orquestador) |
| Chain strategy | resuelto: apply completo; split a PRs opcional post verify/archive |

Decision needed before apply: Resuelta — apply completo del ciclo (orquestador).
Chained PRs recommended: Yes (diferido a post-verify si Marcos lo pide)
Chain strategy: single-cycle apply
400-line budget risk: High (aceptado por decisión de ciclo completo)

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Seam modelo/mock/HTTP | PR 1 | `npx ng test --include=**/institutional-config.service.spec.ts --browsers=ChromeHeadless --watch=false` | N/A (unit only) | Revert `institutional-config/*` service files |
| 2 | Página UI + specs | PR 2 | `npx ng test --include=**/institutional-config-page.spec.ts --browsers=ChromeHeadless --watch=false` | N/A (unit + stub seam) | Revert `pages/institutional-config-page.*` |
| 3 | Ruta + sidebar | PR 3 | `npx ng test --include=**/app.routes.spec.ts --include=**/sidebar-admin.spec.ts --browsers=ChromeHeadless --watch=false` | Manual: open `/admin/configuracion` | Revert `app.routes.ts` + `sidebar-admin.*` |

Base: PR1 → tracker; PR2 → PR1; PR3 → PR2 (feature-branch-chain si se elige).

## Phase 1: Seam (modelo + mock + HTTP)

- [x] 1.1 **RED** — Actualizar `institutional-config.service.spec.ts`: GET mapea DTO 1:1; PUT `guardar` body/URL; 4xx/5xx. Expect falla vs modelo viejo. → REQ seam / CFG-001/005
  Verify: specs RED en GET mapping `nombre`/`direccion`.
- [x] 1.2 **GREEN** — `institutional-config.service.ts`: interface 1:1 + `guardar()`; `http-institutional-config.service.ts` GET/PUT `envelope.data`. → CFG-001/005
  Verify: service specs GREEN.
- [x] 1.3 **RED→GREEN** — Crear `in-memory-institutional-config.service.ts` + tests obtener/guardar seed. → CFG-001/005
  Verify: mock specs GREEN.
- [x] 1.4 Wire `app.routes.ts` provider `useRealApi ? Http : InMemory` (sin ruta aún).
  Verify: `tsc --noEmit` sin errores de tipo en seam.

## Phase 2: Página (TDD)

Path: `.../institutional-config/pages/institutional-config-page.{ts,html,css,spec.ts}`

- [x] 2.1 **RED** — Specs página: load success popula form/`updatedAt`; load fail + retry. → CFG-001
  Verify: RED sin componente.
- [x] 2.2 **GREEN** — Implementar load/`cargando`/`error`/retry vía stub seam. → CFG-001
  Verify: 2.1 GREEN.
- [x] 2.3 **RED→GREEN** — Identidad/certificados/autoridades editables; sin logo/dirección/upload; preview tipográfica; banner impacto; bloque estático contacto. → CFG-002/003/004/009
  Verify: queries DOM + ausencia de inputs fantasma.
- [x] 2.4 **RED→GREEN** — Dirty sticky: Guardar/Descartar/`updatedAt`; discard restaura snapshot. → CFG-006
  Verify: dirty true/false assertions.
- [x] 2.5 **RED→GREEN** — Validación bloquea PUT (nombre vacío; límites 160/80/255); save success limpia dirty + ok; save error conserva edits. → CFG-005/007
  Verify: `guardar` no llamado / llamado 1×; form intacto en error.

## Phase 3: Ruta + sidebar

- [x] 3.1 **RED→GREEN** — Child lazy `configuracion` en `app.routes.ts` + assertion en `app.routes.spec.ts`. → CFG-008
  Verify: ruta resuelve `InstitutionalConfigPage`.
- [x] 3.2 **RED→GREEN** — Ítem “Configuración” + `isActive` en `sidebar-admin.ts|html|spec.ts`. → CFG-008
  Verify: link `/admin/configuracion` y active.

## Phase 4: Tracking + verify

- [x] 4.1 Crear `sdd/frontend-configuracion-institucional/apply-progress.md` (checklist fases 1–3).
  Verify: archivo versionable actualizado al cerrar cada fase.
- [x] 4.2 Verify final: `npm run test:ci` && `npx tsc --noEmit -p tsconfig.app.json` && `npm run build`.
  Verify: exit 0 en los tres.
