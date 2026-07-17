# Verify: frontend-parity-configuracion-layout (P-14)

**Date**: 2026-07-17  
**Result**: PASS WITH WARNINGS

## Gates

| Gate | Result |
|------|--------|
| `CHROME_BIN=.../chrome-wrapper.sh` + `npm run test:ci` | **772/772 SUCCESS** |
| `npx tsc --noEmit -p tsconfig.app.json` | **exit 0** |
| `npm run build` | **exit 0** |

## Warnings

- Budget CSS warning: `institutional-config-page.css` 9.99 kB > 8.00 kB (mismo tipo de warning que otras páginas admin; build no falla).
- Otros CSS preexistentes también sobre budget (students, certifications, etc.) — fuera de alcance P-14.

## Spec coverage

| REQ | Evidencia |
|-----|-----------|
| CFGLAY-001 Folio + lede | spec «folio institucional» |
| CFGLAY-002 Impacto 3 bullets | spec banner nuevos documentos / regenerar PDF |
| CFGLAY-003 Nav anclas | spec hrefs `#identidad`…`#validacion` |
| CFGLAY-004 DTO only PUT | spec guardar sin campos fantasma |
| CFGLAY-005 Sin file / sin inputs contacto-validación | specs honest UI |
| CFGLAY-006 Sticky dirty + preview | specs dirty/descartar/preview |
| CFG-001…007 legacy | specs carga/error/validación/guardar |

## Notes

Contrato HTTP y `frontend-http-services` sin cambios. Sin persistencia inventada.
