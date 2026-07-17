# Preview de certificado — Copiar/Compartir y autoridades

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-certificado-preview/`.
Verify: PASS WITH WARNINGS — `test:ci` 742/742, `tsc` exit 0, `build` exit 0 (2026-07-17).

## Alcance implementado

- Carga paralela: detalle + config institucional + `obtenerEntregaManual`.
- Autoridades reales (`rectorName`/`advisorName` + roles); pendiente si GET falla o ambos nombres vacíos.
- **Copiar link** y **Compartir** habilitados con URL canónica de entrega-manual (no la truncada de detalle).
- `AbortError` de Web Share silencioso; sin Web Share → clipboard.
- Revocado o sin URL → CTAs deshabilitados.
- Cierre handoff F6-03 (Copiar ya no queda disabled por diseño).

## Referencias

- Archive: `openspec/changes/archive/2026-07-17-frontend-certificado-preview/`
- Página: `certifications/pages/preview/certification-preview-page.*`
- Paridad visual P-12: `docs/frontend/parity-expediente.md`
