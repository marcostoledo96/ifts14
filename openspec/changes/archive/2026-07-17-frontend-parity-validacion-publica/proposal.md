# Proposal: Paridad validación pública (P-15)

## Intent

Calcar folio y estados públicos Angular a `muestra_pagina/components/validacion/*` (válido, revocada, no encontrada, error), mobile 375/390, sin portar React ni QR decorativo. D0: DNI completo solo en página pública vigente.

## Scope

### In Scope
- Folio vigente: membrete ACTA, banda interna, TIPO, SEQ padded, sello, PieControl, mobile N.°
- Estado no encontrada (not-verifiable genérico): grid+aside, sello sin-registro, sugerencias 01–03, PieControl
- Estado revocada cuando `reason === CERTIFICATE_REVOKED` (mock/futuro): chrome v0 sin inventar alumno/curso
- Estado error técnico: chrome documental v0 (sin stack/rutas/API)
- BandaEstado: warning vs destructive; SVG icons alineados a v0
- Tests + delta `frontend-public-validation`

### Out of Scope
- Admin shell/dashboard
- QR decorativo
- Backend PHP (sigue mapeando revocado→NOT_FOUND)
- Cambiar mapper de EXPIRADO/MISSING/VALIDATION_ERROR

## Approach

Approach 1 (explore): template/CSS quirúrgico + branch UI por `reason` para revocada.

## Risks

| Risk | Mitigation |
|------|------------|
| Spec/tests exigen “no revocado” | Delta REQ + actualizar specs |
| Fake datos en revocada | Solo chrome; sin alumno/curso inventados |
| QR v0 | Mantener lock sin QR |

## Rollback

Revertir `public-validation-page.*`, `banda-estado.*` y delta de spec.

## Ready for Spec

Yes.
