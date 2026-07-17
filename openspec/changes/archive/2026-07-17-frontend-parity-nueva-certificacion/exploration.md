# Exploration: frontend-parity-nueva-certificacion (P-11)

## Current State

- Angular: formulario corto (selects + preview tipográfica plana + CTA).
- v0: editor ~1077 líneas con preview documental inline, aside resumen, avisos, skeleton.
- Emisión real ya existe (`POST /admin/certificados`); elegibilidad por fechas `realizada` + presentes.

## Gaps vs v0 (honestos)

| v0 | Angular hoy | Decisión |
|----|-------------|----------|
| Combobox alumno + select curso + ciclo | 2 selects | Calcar combobox local + ciclo `cuatrimestre` |
| Preview banda navy + secciones I/II + QR | Sheet tipográfica simple | Calcar layout; QR decorativo |
| Folio + N.° certificado mock | Omitidos (correcto) | Mantener omitidos / “Se asigna al emitir” |
| Firma digital verificada mock | Tipografía config | Autoridades tipográficas + badge config; sin claim crypto |
| Entrega sin email | `tieneEmail` | Warning si `tieneEmail === false` |

## Seams

`listar` alumnos/cursos activos, `listarFechas`, `listarAsistenciasPorPar`, `listar` vigentes, `config.obtener`, `emitir`.

## Non-goals confirmados

No wizard; no inventar API; no DNI completo admin; no logos upload.
