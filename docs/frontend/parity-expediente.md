# Paridad expediente de certificación (P-12)

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-parity-expediente/`.
Verify: PASS WITH WARNINGS — `test:ci` 772/772, `tsc` exit 0, `build` exit 0 (2026-07-17).

## Alcance

Pulido visual de `/admin/certificaciones/:id` (`certification-preview-page.*`) hacia `muestra_pagina/components/admin/expediente-certificacion.tsx`:

- Kickers mono y ficha densificada
- QR decorativo + note de validación
- CTA PDF primary ink; Entrega secondary
- Firmas con sello institucional (sin afirmar “firma digital verificada”)
- Copiar/Compartir (C12) sin cambios de lógica

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-parity-expediente/`
- Funcional C12: `docs/frontend/certificado-preview.md`
- Siguiente: P-13 `frontend-parity-entrega-revocar-pdf`
