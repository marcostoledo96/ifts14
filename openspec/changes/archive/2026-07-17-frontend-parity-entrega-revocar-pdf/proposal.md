# Proposal: Paridad entrega / revocar / PDF (P-13)

## Intent

Alinear chrome de entrega, revocación y vista PDF con `muestra_pagina`, restaurando **Descargar PDF** solo porque existe seam API real (`GET …/pdf`), sin inventar blobs.

## Scope

### In Scope
- `CertificationsService.descargarPdf` (HttpClient blob + mock PDF mínimo)
- PDF page: Imprimir + Descargar PDF (primary ink), SVG Lucide-like
- Entrega: footer Copiar + PDF + Cancelar; Descargar QR junto al QR
- Revocar: Escape → expediente; polish errores/modal
- Tests de las tres páginas (+ service)

### Out of Scope
- Autoridades reales en PDF (sigue demo)
- Regeneración PDF completa / backend
- Portar React literalmente

## Risks

| Risk | Mitigation |
|------|------------|
| Mock PDF inválido | Blob `%PDF` mínimo + `application/pdf` |
| Footer 4 botones rompe calco | QR fuera del footer |

## Ready for Spec

Yes.
