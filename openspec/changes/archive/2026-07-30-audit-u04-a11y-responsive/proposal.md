# Proposal: U4 — accesibilidad y responsive (sin rediseño)

## Intent

Cerrar PLAN §U4: teclado/responsive mínimos en login, pública, shell y diálogos. Tab escapa de entrega/revocar (backdrop fuera del trap); drawer sin Tab trap/`aria-modal`; CTAs públicos solo anillo global. Sin lógica/API ni rediseño.

## Scope

### In Scope
- Login smoke; fix solo si falla
- Pública: foco CTAs; scroll-x tabla si rompe
- Drawer: Tab trap + `aria-modal` (Esc/`inert` intactos)
- Entrega/revocar: trap sin Tab en backdrop; error-dialog usable
- Spot listados: solo roturas mobile
- Contraste token solo si smoke lo exige
- Spec ADDED lean `frontend-angular-shell`; deltas delivery/public

### Out of Scope
- U5 estados; U9 WCAG/axe; `confirm()` custom; unificar breakpoints
- Rediseño; API; archive U3; commits

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-angular-shell`: **ADDED** lean — foco visible; drawer Esc+trap+`aria-modal`+inert; listados críticos sin rotura mobile
- `frontend-public-validation`: **ADDED** lean (opt) — CTAs con foco; tabla scrolleable
- `admin-certificate-delivery-frontend`: **MODIFIED** lean (opt) — REQ-DEL-007 sin Tab en backdrop; Esc cierra; retorno foco soft vía ruta OK

> Revocar: mismo patrón; delta certs solo si no cabe en shell/delivery.

## Approach

**Approach 1 (locked):** (1) login → (2) CTAs públicos → (3) drawer trap+modal → (4) diálogos backdrop → (5) spot listados. Patrones P6-05.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `admin-shell.*` | Modified | Trap + `aria-modal` |
| `login-*` | Si falla | Smoke a11y |
| `public-validation-page.*` | Modified | Foco CTA; scroll |
| `certification-{delivery,revoke}-page.*` | Modified | Backdrop en trap |
| Listados / `styles.css` | Spot/opt | Roturas; token/`.sr-only` |
| Specs shell (+ public/delivery) | Delta | ADDED/MODIFIED lean |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Trap rompe Esc/nav | Med | Preservar listeners |
| Creep breakpoints/U5 | Med | Hard DEFER |
| Diff >400 líneas | Med | Encadenar slices |

## Rollback Plan

Revert FE + deltas de spec. Sin DB/API.

## Dependencies

Explore U4; Approach 1; D0; post-U3. No U5/U9.

## Success Criteria

- [ ] Login usable teclado o deuda nula
- [ ] CTAs públicos con `:focus-visible`
- [ ] Drawer: Tab no escapa; `aria-modal`; Esc/`inert` OK
- [ ] Entrega/revocar: sin Tab en backdrop; Esc cierra
- [ ] Sin rotura mobile en spot-check
- [ ] Sin lógica/API; D0; U3 intacto; sin commit aquí

## Proposal question round

**Locked:** Approach 1 A→E; DEFER U5/U9/confirm/breakpoints/rediseño/API/U3; shell ADDED + public/delivery.

1. ¿Contraste muted/anillo ink ahora o solo si smoke falla?
2. ¿Error-dialog entrega sin trap es MUST U4?
3. ¿REQ-DEL-007 retorno foco: soft (ruta) o SPA?
4. ¿Hoist `.sr-only` ahora o diferido?
5. ¿Revocar necesita delta de spec propio?
