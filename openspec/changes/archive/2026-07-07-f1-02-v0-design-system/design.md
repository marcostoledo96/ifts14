# Design: F1-02 — Sistema visual v0 para Angular

## Technical Approach

Aplicar Approach A: tokens CSS globales en `styles.css` y primitivos Angular 20 standalone en `shared/ui`, sin Tailwind, shadcn, lucide, fuentes web ni helpers copiados de v0. La validación pública consumirá esos primitivos sin cambiar contrato D0: DNI completo visible, fechas asistidas, token/QR permanente y errores seguros.

## Architecture Decisions

| Decisión | Elección | Alternativas | Fundamento |
|---|---|---|---|
| Tokens | CSS custom properties en `src/styles.css` | Tailwind v4, SCSS | Cero dependencias y migración futura simple a Tailwind si F1-04 lo aprueba. |
| Componentes | Standalone components con `input()` y `ng-content` | Servicios visuales, CVA/classes | Coincide con Angular 20 actual y evita abstracciones no pedidas. |
| Iconografía | SVG inline mínimo decorativo | `lucide-react`/paquete de iconos | Mantiene presupuesto y evita copiar stack React. |
| Tipografía | `system-ui` + `ui-monospace` | Geist vía dependencia | Conserva intención v0 sin sumar fuentes. |

## Data Flow

```txt
muestra_pagina/app/globals.css ──criterio──▶ styles.css tokens
                                      │
                                      ▼
shared/ui primitives ─────────▶ PublicValidationPage
                                      │
                                      ▼
ValidationService existente ───▶ DTO D0 sin cambios
```

## File Changes

| File | Action | Description |
|---|---|---|
| `apps/frontend-angular/src/styles.css` | Modify | `:root` con tokens, base tipográfica, `:focus-visible`, reduced motion. |
| `apps/frontend-angular/src/app/shared/ui/banda-estado.{ts,html,css,spec.ts}` | Create | Banda de estados pública/admin. |
| `apps/frontend-angular/src/app/shared/ui/campo-dato.{ts,html,css,spec.ts}` | Create | Par `dt/dd` etiqueta/valor. |
| `apps/frontend-angular/src/app/shared/ui/header-institucional.{ts,html,css,spec.ts}` | Create | Membrete institucional reutilizable. |
| `apps/frontend-angular/src/app/shared/ui/folio-shell.{ts,html,css,spec.ts}` | Create | Shell compositivo de folio con slots. |
| `apps/frontend-angular/src/app/app.ts` | Modify | Importar `HeaderInstitucional` si se usa en el shell raíz. |
| `apps/frontend-angular/src/app/app.html` / `app.css` | Modify | Aplicar header institucional, fondo y layout con tokens. |
| `apps/frontend-angular/src/app/features/public-validation/public-validation-page.{ts,html,css,spec.ts}` | Modify | Consumir primitivos, conservar ARIA y tests D0. |
| `docs/frontend/02-sistema-visual-v0-f1-02.md` | Create | Fuente de verdad visual. |
| `docs/frontend/00-angular20-port-v0.md`, `docs/00-indice-general.md` | Modify | Resumen y enlace al nuevo documento durante archive. |

## Interfaces / Contracts

```ts
type EstadoBanda = 'valid' | 'revoked' | 'not-verifiable' | 'error' | 'loading';
type VarianteCampo = 'default' | 'mono' | 'highlight';

// app-banda-estado
kind = input.required<EstadoBanda>();
title = input.required<string>();
description = input<string>('');
stateLabel = input<string>('');

// app-campo-dato
label = input.required<string>();
variant = input<VarianteCampo>('default');

// app-header-institucional
subtitle = input('Validación oficial de certificados');
showOnlineBadge = input(true);

// app-folio-shell
title = input.required<string>();
kicker = input('ACTA DE VALIDACIÓN ACADÉMICA');
description = input<string>('');
certificateCode = input<string>('');
// slots: [folio-status], [folio-body], [folio-aside], [folio-footer]
```

Tokens mínimos: `--color-ink`←`--ink`, `--color-tech-blue`←`--tech-blue`, `--color-circuit`←`--circuit`, `--color-valid{,-soft}`←v0 valid, `--color-destructive{,-soft}`←v0 destructive, `--color-warning{,-soft}`←v0 warning, `--color-paper`, `--color-card`, `--color-foreground`, `--color-muted{,-foreground}`, `--color-border`, `--color-ring`, `--font-sans`, `--font-mono`, `--tracking-caps`, `--tracking-caps-membrete`, `--radius-sm`, `--radius-md`, `--space-1..6`, `--focus-ring`, `--motion-fast`.

## Accessibility Requirements

- `BandaEstado`: `role="status"` para carga/válido/no verificable, `role="alert"` solo para error técnico; `aria-live="polite"` y `aria-atomic="true"` preservados.
- SVG decorativos con `aria-hidden="true"`; texto visible contiene el estado.
- Foco global con `:focus-visible` y `--focus-ring`; no quitar `skip-link`.
- `CampoDato` mantiene estructura `dl`/`dt`/`dd`; no exponer token completo.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Inputs, roles, textos y clases/token hooks de cada primitivo | Karma/Jasmine por componente. |
| Integration | Validación pública con DNI completo, fechas asistidas y estados seguros | Ajustar `public-validation-page.spec.ts`. |
| Build | Presupuestos CSS y bundle | `npm run build`. |

Verificación: `cd apps/frontend-angular && npm test -- --watch=false --browsers=ChromeHeadless`; luego `npm run build`.

## Migration / Rollout

No hay migración de datos. Rollback: revertir `styles.css`, `shared/ui/`, `app.*`, `public-validation-page.*` y docs. `sdd-archive` debe actualizar `docs/frontend/`, `docs/00-indice-general.md` y fusionar la spec `frontend-design-system-readiness`.

## Open Questions

None.
