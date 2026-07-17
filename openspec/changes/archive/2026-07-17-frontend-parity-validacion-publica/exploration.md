# Exploration: frontend-parity-validacion-publica (P-15)

## Current State

**Angular** (`public-validation-page.*` + `BandaEstado`):

- Folio vigente: membrete ink, grid 2 col, tabla asistencias, sello VÁLIDO. Banda fuera del article. Eyebrow `"IFTS N.° 14 — Bedelía"`. Sin PieControl. Sin TIPO. SEQ sin pad. Sin variante sello.
- `not-verifiable`: cuerpo corto + ol sugerencias; sin aside/sello; colapsa revocado/expirado/404.
- `technical-error`: membrete ink + nota; sin tabla de evento v0.
- Backend PHP real: revocados → `CERTIFICATE_NOT_FOUND` (query filtra). Mock sí emite `CERTIFICATE_REVOKED`.

**v0** (`muestra_pagina/components/validacion/*`):

- `folio-certificado`: ACTA…, banda interna, TIPO, sello, PieControl, mobile N.°.
- `estado-revocada` / `estado-no-encontrada` / `estado-error`: sellos, bandas, grid+aside, PieControl.
- Sin QR real de datos; QR decorativo en v0 — Angular lock: **sin QR decorativo**.

## Gaps

| # | Elemento v0 | Angular | Decisión |
|---|-------------|---------|----------|
| V1 | Eyebrow ACTA DE VALIDACIÓN | Bedelía | Calcar ACTA (header ya dice IFTS 14) |
| V2 | Banda interna + ESTADO: VÁLIDO | Banda externa | Mover banda dentro del folio |
| V3 | TIPO / SEQ 001 / SÍ | Parcial | Calcar |
| V4 | PieControl monograma 14 | Ausente | Agregar |
| V5 | Sello variantes | Solo válido | valido / revocado / sin-registro |
| N1 | no-encontrada grid+sello | Cuerpo corto | Calcar sin token completo |
| R1 | revocada UI | Colapsada | UI si `reason===CERTIFICATE_REVOKED` (mock); sin inventar alumno/curso |
| E1 | error tabla evento | Membrete ink | Calcar chrome; sin stack/rutas; requestId si hay |
| — | QR decorativo | Ausente | Mantener ausente (lock) |
| M1 | max-w-4xl / mobile 375 | folio 42rem | Usar `--layout-page-max` (56rem) |

## Recommendation

Approach 1: rewrite template/CSS de la página + ajuste BandaEstado (warning vs destructive). Sin cambiar mapper collapse de expirado/404. Unlock visual de revocada solo cuando el código de error es `CERTIFICATE_REVOKED`.

## Ready for Proposal

Yes.
