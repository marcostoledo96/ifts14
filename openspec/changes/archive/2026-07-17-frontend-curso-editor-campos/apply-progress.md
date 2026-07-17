# Apply progress: frontend-curso-editor-campos

**Status**: ready for verify (no archive)
**Change**: `frontend-curso-editor-campos`
**Delivery**: single-cycle `size:exception`

## Done

- Materializados `exploration.md`, `proposal.md`, `spec.md` (REQ-CEDIT-001…008), `design.md`, `tasks.md`.
- Reescrito `course-editor-page.{ts,html,css,spec.ts}`:
  - Grid main + aside sticky (paridad v0).
  - Create: solo código+nombre; copy "se crea activo" (POST ignora estado).
  - Edit: identidad read-only; toggle `role="switch"` → `actualizarEstado` condicional.
  - Fechas: índice `#`, date, descripción, estado; sin time ni badges emitidos.
  - Aviso de impacto si se tocan/quitan fechas `realizada`.
  - Metadatos honestos (código, estado, createdAt/updatedAt).
  - `guardar()` edit = `actualizarEstado` (si cambia) + `reemplazarFechas` + refresh.
- Tests: **21/21 SUCCESS** (`CHROME_BIN=.verify-tmp/chrome-wrapper.sh ng test --include='**/course-editor-page.spec.ts'`).

## Out of scope (honrado)

Descripción/carga/modalidad de curso, horario time, badge Emitidos, checkbox entrega, creado_por/firma, editar nombre/código, PATCH post-create.

## Next

`sdd-verify` formal. No archive en este paso.
