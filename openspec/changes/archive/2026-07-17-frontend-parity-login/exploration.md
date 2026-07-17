# Exploration: frontend-parity-login (P-03)

## Current State

**Angular** (`login-page.*`, `login-form.*`):

- Layout 2 columnas con texturas grid en aside (`44px`) y main (`32px` + mask radial) — ya alineado a v0.
- Aside footer: `Protocolo` → `Sesión HttpOnly + CSRF` (honesto; diverge de captura/TSX).
- Placeholder usuario: `ID institucional` (diverge de capturas).
- CTA `Ingresar` con flecha SVG; falta hover `translate-x` del grupo.
- Error de validación debajo del campo clave; error de auth en página arriba del form.
- Copy auth 401: «Credenciales inválidas…» (diverge de captura).
- Auth real vía `ADMIN_AUTH` + cookie/CSRF; sin credenciales demo.

**v0** (`muestra_pagina/app/admin/login/page.tsx` + `login-form.tsx`; capturas `login-desktop|mobile|error|loading`):

- Protocolo visual: `SHA-256 / SSL`.
- Placeholder en capturas: `docente.apellido@ifts14.edu.ar`.
- Placeholder en TSX: `usuario.demo@example.invalid` — **NO portar** (demo).
- Error arriba del formulario; copy: «Las credenciales no coinciden con un registro autorizado…».
- Loading: spinner + «Verificando…»; fieldset disabled.
- Flecha → con `group-hover:translate-x-0.5`.

### Divergencia captura vs TSX

| Elemento | Captura | TSX v0 | Decisión P-03 |
|----------|---------|--------|---------------|
| Placeholder email | `docente.apellido@ifts14.edu.ar` | `usuario.demo@example.invalid` | **Captura** (institucional; sin demo) |
| Protocolo | `SHA-256 / SSL` | `SHA-256 / SSL` | **Calcar** visual; auth real sigue cookie+CSRF (documentado) |

## Tabla de gaps

| # | Gap | Angular hoy | Acción |
|---|-----|-------------|--------|
| L1 | Grid left/right | Presente | Verificar/mantener |
| L2 | Protocolo aside | HttpOnly+CSRF | Calcar `SHA-256 / SSL` |
| L3 | Placeholder | `ID institucional` | `docente.apellido@ifts14.edu.ar` |
| L4 | Flecha CTA | SVG sin hover | Hover translate |
| L5 | Error/loading | Copy + posición parcial | Error arriba; copy captura; loading intacto |
| L6 | Demo creds | Ausentes | Mantener ausencia |

## Affected Areas

- `apps/frontend-angular/src/app/features/admin/login-page.{html,css,ts,spec.ts}`
- `apps/frontend-angular/src/app/features/admin/login-form.{html,css,ts,spec.ts}`
- Docs: `docs/frontend/login-polish.md`

## Approaches

1. **Quirúrgico HTML/CSS/copy (recomendado)** — Ajustar protocolo, placeholder, posición/copy de error, hover flecha, tests. Sin tocar auth.
2. **Unificar errores en el form vía `@Input`** — Pasar `errorMsg` de página al form. Más limpio; más churn de tests.

## Recommendation

Approach 1 + mover alert de validación al tope del fieldset; alinear copy 401 a captura. Sin portar React ni demo creds.

## OUT OF SCOPE

- Cambiar contrato `{ username, password }` o `admin-auth.service`.
- Portar credenciales demo de v0.
- Shell, dashboard, otras pantallas.

## Ready for Proposal

**Yes**.
