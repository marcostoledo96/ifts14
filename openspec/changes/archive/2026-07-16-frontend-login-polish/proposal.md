# Proposal: Login UI polish

## Intent

Alinear el login admin Angular con la referencia `muestra_pagina` (iconos, toggle clave, loader, aviso auditoría, aside institucional) sin alterar autenticación real ni contrato `{ username, password }`.

## Scope

### In Scope
- Iconos SVG inline en inputs (usuario / clave)
- Toggle mostrar/ocultar clave (`aria-pressed` / `aria-label`)
- Loader submit «Verificando…» + `aria-busy` + fieldset disabled
- Aviso auditoría (ShieldCheck + copy institucional)
- Aside: marca Bedelía Digital, mensaje institucional, textura grilla, estado sistema
- Footer restringido + ayuda Coordinación Académica
- Copy card «Panel de certificaciones» / CTA «Ingresar»
- Delta `admin-foundation` (retirar «Acceso simulado»)
- Specs Karma focalizados

### Out of Scope
- Cambios a `admin-auth.service.ts` / guards / interceptors
- Credenciales demo React / delay simulado
- Librería lucide / extracción `login-aside`
- Verify formal / archive

## Capabilities

### New Capabilities
- `admin-login-ui`: paridad visual del login admin (REQ-LOGIN-*)

### Modified Capabilities
- `admin-foundation`: reemplazar escenario «Acceso simulado» por aviso de auditoría / auth real

## Approach

Pulido quirúrgico in-place (Approach 1): `LoginPage` dueña de `loading` alrededor de `await auth.login`; `LoginForm` recibe `[loading]` y aporta UI; SVG inline; signals/OnPush.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `login-form.*` | Modified | Iconos, toggle, auditoría, CTA, loading UI |
| `login-page.*` | Modified | Loading, aside, footer, copy, texturas |
| `admin-foundation/spec.md` | Modified | Quitar copy de simulación |
| `admin-auth.service.ts` | None | Fuera de alcance |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs anclan copy simulación | High | Actualizar tests + foundation juntos |
| Scope creep auth | Low | No tocar servicio auth |
| Inputs vacíos en loading (REQ-AUTH-008) | Low | Aceptado; no revertir clear |

## Rollback Plan

Revertir commits/archivos de `login-form.*`, `login-page.*` y delta `admin-foundation`. Auth intacta.

## Dependencies

- Auth real P5-04 ya operativa
- Tokens F1-02 / patrón SVG inline

## Success Criteria

- [ ] Paridad visual con capturas login (desktop/mobile/error/loading) sin demos
- [ ] Tests `login-form` / `login-page` verdes
- [ ] Sin cambios en contrato auth
- [ ] Copy español institucional; sin «Acceso simulado»
