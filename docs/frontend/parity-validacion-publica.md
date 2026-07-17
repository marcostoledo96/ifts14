# Paridad validación pública (P-15) — 2026-07-17

Ciclo SDD `frontend-parity-validacion-publica` archivado.

## Qué cambió

- Folio vigente calca v0: eyebrow `ACTA DE VALIDACIÓN ACADÉMICA`, banda interna, campo TIPO, SEQ padded, marca `SÍ`, sello VÁLIDO, PieControl monograma `14`, N.° en mobile.
- Estados:
  - **No encontrada** (`not-verifiable` genérico / 404 / expirado): portal + sello SIN REGISTRO.
  - **Revocada** solo si el error es `CERTIFICATE_REVOKED` (mock/futuro): chrome destructive + sello REVOCADO, sin inventar alumno/curso.
  - **Error técnico**: chrome documental seguro (sin stack ni `/api/`).
- D0: DNI completo solo en folio vigente.
- Sin QR decorativo (lock previo).
- Backend PHP real sigue filtrando revocados como `CERTIFICATE_NOT_FOUND` → UI no encontrada.

## Verify

`test:ci` 772 SUCCESS · `tsc` 0 · `build` 0 (warning budget CSS).

## Archivo

`openspec/changes/archive/2026-07-17-frontend-parity-validacion-publica/`
