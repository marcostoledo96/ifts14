# Verify: Editor de curso (completar campos)

**Change**: `frontend-curso-editor-campos`
**Fecha**: 2026-07-17
**Veredicto**: **PASS WITH WARNINGS**

## Gates técnicos

| Gate | Exit | Resultado |
|------|------|-----------|
| `CHROME_BIN=…/chrome-wrapper.sh npm run test:ci` | **0** | 726 SUCCESS |
| `npx tsc --noEmit -p tsconfig.app.json` | **0** | sin errores |
| `npm run build` | **0** | OK (CSS budget warnings) |

## Corrección del FAIL previo

El verify anterior marcó FAIL por “Descripción” en la tabla de fechas. Eso es **falso positivo**: `fecha.descripcion` es campo API real (REQ-CEDIT-005). Lo prohibido es descripción/carga/modalidad **de curso**, horario time, badges Emitidos y checkbox de entrega.

## Cobertura REQ-CEDIT

| Req | Estado |
|-----|--------|
| 001 layout grid + aside sticky | COMPLIANT |
| 002 create codigo+nombre + copy activo | COMPLIANT |
| 003 edit identidad read-only + toggle | COMPLIANT |
| 004 toggle estado + conserva borrador/archivado | COMPLIANT (tests archivado + borrador) |
| 005 fechas con `#`; sin time/emitidos | COMPLIANT |
| 006 aviso impacto realizadas | COMPLIANT |
| 007 guardar actualizarEstado + reemplazarFechas | COMPLIANT |
| 008 metadata honesta | COMPLIANT |
| Gate phantoms (curso) | COMPLIANT — spec `sin campos fantasma de curso…` |

## Hallazgos

- **CRITICAL**: ninguno.
- **WARNING**: CSS budget (`course-editor-page.css` y páginas ajenas).
- **SUGGESTION**: paridad visual manual vs capturas (inexistentes en repo).

## Próximo paso

`sdd-archive`.
