# Verify: frontend-parity-login (P-03)

**Date**: 2026-07-17
**Result**: PASS

## Gates

| Gate | Result |
|------|--------|
| `ng test --include='**/login*.spec.ts'` | **26/26 SUCCESS** (exit 0) |
| `npx tsc --noEmit -p tsconfig.app.json` | exit 0 |

## Spec compliance (REQ-PLOGIN)

| REQ | Estado |
|-----|--------|
| 001 Grid textures | COMPLIANT |
| 002 Protocolo SHA-256 / SSL | COMPLIANT |
| 003 Placeholder institucional | COMPLIANT |
| 004 CTA flecha + loading | COMPLIANT |
| 005 Error arriba + copy captura | COMPLIANT |
| 006 Sin demo credentials | COMPLIANT |

## Warnings

- Durante el test de navegación exitosa, Karma loguea `NG04002` (rutas vacías en `provideRouter([])` + spy de `navigate`). Preexistente / cosmético; los 26 specs pasan.

## Divergencias documentadas

- Label visual `SHA-256 / SSL` en aside (paridad captura); auth real = cookie HttpOnly + CSRF (sin cambio de contrato).
- Placeholder de capturas (`docente.apellido@ifts14.edu.ar`) priorizado sobre demo del TSX v0 (`usuario.demo@…`).
