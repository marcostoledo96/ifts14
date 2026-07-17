# Login administrativo — UI polish + P-03 paridad

## Estado

- Polish base archivado en `openspec/changes/archive/2026-07-16-frontend-login-polish/`.
- **P-03** paridad visual cerrada en `openspec/changes/archive/2026-07-17-frontend-parity-login/`.
- Verify P-03: PASS — login specs **26/26**, `tsc` exit 0 (2026-07-17).

## Alcance P-03

- Grid de fondo aside/main (confirmado).
- Protocolo aside visual: `SHA-256 / SSL` (chrome de paridad; auth real sigue cookie HttpOnly + CSRF).
- Placeholder institucional `docente.apellido@ifts14.edu.ar` (capturas; **sin** demo de v0).
- CTA Ingresar con flecha + hover translate; loading «Verificando…».
- Error de validación arriba del fieldset; copy 401 alineado a capturas.
- Sin cambios en `admin-auth.service.ts` ni contrato `{ username, password }`.

## Referencias

- Archive P-03: `openspec/changes/archive/2026-07-17-frontend-parity-login/`
- Archivos: `login-page.*`, `login-form.*`
- Capturas: `muestra_pagina/capturas/login-*.png`
- Prompt: `docs/frontend/PROMPT-PARIDAD-MUESTRA-PAGINA.md` (sección Login)
