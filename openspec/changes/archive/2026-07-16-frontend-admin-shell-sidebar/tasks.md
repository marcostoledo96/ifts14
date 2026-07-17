# Tasks: Admin shell + sidebar (UI polish)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~280–380 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Chrome shell+sidebar v0 | PR 1 | `ng test --include='**/admin-shell.spec.ts' --include='**/sidebar-admin.spec.ts'` | N/A (unit only this cycle) | Revert `admin-shell.*` + `sidebar-admin.*` + openspec deltas |

## Phase 1: RED — Specs anclan chrome v0 (TDD)

- [x] 1.1 `admin-shell.spec.ts`: reemplazar “Sesión activa” por asertos REQ-SHELL-01..04/08 (search editable + SVG; sync “Sincronizado”; avatar AD; sin títulos Admin/Panel; sin Help/Bell)
- [x] 1.2 `sidebar-admin.spec.ts`: “Operación” (no “Secciones”); 5 links en nav Operación; Config ×1 en footer; logout ink usable; marca “IFTS N.° 14” / “Bedelía · Panel”; activo con clase que permita barra
- [x] 1.3 Confirmar RED: tests 1.1–1.2 fallan contra código actual

## Phase 2: GREEN — Sidebar ink

- [x] 2.1 `sidebar-admin.ts`: `ITEMS` = 5 operativos; `CONFIG_ITEM` separado; `isActive` cubre Config en footer (mismo prefijo)
- [x] 2.2 `sidebar-admin.html`: header marca + SVG; heading Operación; lista operativa; footer Config + logout (SVG opcional)
- [x] 2.3 `sidebar-admin.css`: fondo ink; texto claro; barra activa 2px `--color-circuit`; focus-visible; logout estilo ink
- [x] 2.4 Tests sidebar verdes

## Phase 3: GREEN — Topbar shell

- [x] 3.1 `admin-shell.html`: quitar monograma/títulos/badge legacy; agregar search `type=search` + SVG; sync estático; avatar AD; menú mobile intacto
- [x] 3.2 `admin-shell.css`: search oculto `<40rem`, sync `<48rem`; estilos topbar; drawer/sidebar desktop `bg-ink`; print CSS intacto
- [x] 3.3 `admin-shell.ts`: sin cambios auth/rutas; solo si hace falta output close-X (opcional)
- [x] 3.4 Tests shell verdes (incl. drawer/logout existentes)

## Phase 4: Openspec + progress

- [x] 4.1 Crear `openspec/specs/admin-shell-chrome/spec.md` (REQ-SHELL-01..08)
- [x] 4.2 Actualizar `openspec/specs/admin-foundation/spec.md` (chrome v0; no anclar Sesión activa / Secciones)
- [x] 4.3 Escribir `sdd/frontend-admin-shell-sidebar/apply-progress.md`
- [x] 4.4 Correr tests focalizados shell+sidebar; marcar tasks `[x]`

## Parallelization

| Parallel? | Tasks | Note |
|-----------|-------|------|
| No | 1.x → 2.x → 3.x → 4.x | TDD sequential; sidebar before/alongside topbar OK after RED |

## Out of scope (do not task)

- `app.routes.ts`, guards, `ADMIN_AUTH`
- Help/Bell, lucide, verify formal, archive
