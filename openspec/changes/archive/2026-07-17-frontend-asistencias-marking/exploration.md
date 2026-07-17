## Exploration: frontend-asistencias-marking (Marcado de asistencias — mejoras UI)

### Current State

**Angular hoy** (`AttendanceMarkingPage` + `ATTENDANCE_SOURCE`):

| Pieza | Estado |
|---|---|
| Ruta `/admin/cursos/:id/fechas/:fechaId/asistencias` | Existe; `fechaId` es input de ruta; `effect()` + `loadGen` anti-stale |
| Selector de fecha inline (dropdown) | **Ausente** — fecha fija vía URL; resumen en `<dl>` |
| Resumen lateral (fecha / presentes / cambios) | Solo `Presentes (N)` en legend + dl de fecha; **sin** “cambios sin guardar” |
| Aviso impacto certificados | **Ausente** |
| Toggle presente | Checkbox nativo (`input[type=checkbox]`) |
| Buscador nombre / `dniMostrar` | Existe |
| Guardar / Descartar | Existen; Guardar **no** se deshabilita sin dirty |
| Demo banner | Existe (mock) |
| Specs marking | Cubren carga, checkboxes, contador, guardar, descartar, route reuse, fecha 404 |

**Contrato `AttendanceService`** (tipos reales):

```ts
listarAlumnos(cursoId) → AsistenciaAlumno[] // id, apellidoNombre, dniMostrar, estado
listarAsistencias(cursoId, fechaId) → Asistencia[]
marcar(cursoId, fechaId, AsistenciaMarcado[]) → Asistencia[]
anular(asistenciaId)
```

Sin flag `certificada`, sin conteo de certificados por fecha.

**`CursoFecha`** (courses.models): `id, cursoId, fecha, descripcion, orden, estado` — **sin** `certificada`.

**HTTP** (`HttpAttendanceService`): GET alumnos activos; GET asistencias por `cursoId` + filtro client `cursoFechaId`; marcar = DELETE existentes + POST presentes. Sin endpoint de impacto.

**v0 / capturas** (`muestra_pagina/`):

- Código: `components/admin/asistencias-editor.tsx` (ruta UI: `/admin/cursos/[id]/asistencias`)
- Capturas: `asist-desktop.png`, `asist-mobile.png`, `asist-mobile2.png`, `asist-impacto.png` — **existen**
- v0: `<select>` fechas en estado local (sin path change); resumen sticky; botones `✓ Presente` / `+ Marcar`; dirty agregados/quitados; aviso impacto si `FechaCurso.certificada && hayCambios` (dato **mock** `certificada: boolean`)
- v0 muestra email + legajo + DNI ficticio — Angular **no debe** portarlos (contrato privacy vigente)

### Certificados emitidos en esta fecha — evidencia real (no inventar)

| Capa | ¿Hay dato usable para el aviso? |
|---|---|
| DB | **Sí**: `cert_certificado_fechas.curso_fecha_id` (snapshot) |
| Backend al mutar asistencia | **Sí**: `recordAttendance` / sync snapshot cuando fecha `realizada` (`AdminMasterDataService`) — efecto de lado, no UI |
| API admin “¿esta fecha tiene certificados?” | **No** — no hay GET por `cursoFechaId` ni flag en DTO de fecha |
| `GET /admin/certificados?cursoId=` | Filtra curso; **no** fecha |
| Detalle certificado `attendedDates` | Backend snapshot: `{fecha, descripcion, orden}` (**sin** `curso_fecha_id` en load de detalle); FE mapea a `string[]` ISO |
| Mock FE certifications / attendance | Sin `certificada` por fecha |

**Conclusión gap**: el aviso de impacto de v0 **no** tiene contrato FE listo. Inferir conteos vía heurística (listar certificados + matchear ISO) sería inventar semántica frágil y costosa. **Omitir** el aviso (o placeholder documental desactivado) en este ciclo; handoff backend si se quiere conteo real.

### Affected Areas

- `attendances/pages/marking/attendance-marking-page.{ts,html,css,spec.ts}` — UI principal
- `app.routes.ts` — solo si se relaja path a `/asistencias` (opcional; no requerido)
- `openspec/specs/admin-attendances-frontend/spec.md` — hoy exige checkboxes; MODIFIED
- Paridad visual vs capturas + `asistencias-editor.tsx`
- **Fuera de alcance salvo handoff**: backend endpoint impacto; `AttendanceService` / tipos

### Approaches

1. **Polish UI in-place (recomendado)** — dropdown de fechas del curso; resumen (fecha, presentes, cambios dirty); botones Presente/Marcar; dirty disable Guardar.
   - Pros: paridad v0 alta; reusa `detalle.fechas` + baseline/seleccion; specs locales; sin inventar certificados
   - Cons: hay que decidir sync URL vs “sin cambiar ruta”
   - Effort: Medium

2. **Incluir aviso impacto inventado/heurístico** — mock `certificada` o matcheo ISO de certificados.
   - Pros: screenshot `asist-impacto` más cerca
   - Cons: incumple “solo si hay API/dato real”; riesgo de mentira visual
   - Effort: Low–Med (pero **rechazado** por política de datos)

3. **Bloquear ciclo esperando API impacto** — endpoint conteo por `cursoFechaId`.
   - Pros: aviso honesto
   - Cons: acopla a backend; este ciclo es frontend polish
   - Effort: High (cross-team)

**Sub-decisión selector vs ruta**

| Opción | Pros | Cons |
|---|---|---|
| **A. Dropdown + `Router.navigate` mismo patrón** (recomendado) | Deep-link; `effect()` ya recarga; UX = selector inline | Cambia `:fechaId` en URL |
| **B. Dropdown solo signal local** | Literal “sin cambiar ruta” | Pierde deep-link; estado dual con input ruta |
| **C. Nueva ruta `/cursos/:id/asistencias`** | Paridad path v0 | Más routing + redirects; presupuesto de líneas |

Interpretación plan usuario: selector inline **sin salir** de la pantalla de marcado → **A**.

### Recommendation

Enfocarse en **Approach 1 + sub-opción A**:

1. Dropdown “Fecha de la clase” alimentado por `detalle().fechas` (excluir/avisar canceladas); al cambiar → navigate a misma ruta con nuevo `fechaId` (component reuse).
2. Panel resumen: fecha formateada, presentes, `cambios sin guardar` (diff baseline↔seleccion: agregados/quitados), Guardar disabled si `!dirty`.
3. Botón toggle `✓ Presente` / `+ Marcar` (`aria-pressed`) en lugar de checkbox.
4. **Aviso impacto: omitir** en UI; documentar gap + handoff. No placeholder engañoso con conteos.
5. Mantener privacy: sin email/legajo; `dniMostrar` enmascarado.
6. Actualizar specs/tests que asumen checkboxes.

### Risks

- Spec vigente `admin-attendances-frontend` habla de checkboxes → delta obligatorio.
- Cambiar URL en select puede descartar edits no guardados (v0 también pierde al cambiar fecha) — confirmar UX (prompt dirty o auto-descartar).
- Layout sticky resumen + mobile (capturas): riesgo de CSS/scope >400 líneas si se copia v0 al pie de la letra.
- No portar columnas email/legajo aunque estén en capturas.
- Texto v0 “reenviar” vs D0 QR permanente: si algún día se agrega aviso, alinear wording (“entrega nuevamente”, QR igual) — fuera de este ciclo.

### Ready for Proposal

**Yes** — alcance UI claro; gap de impacto documentado; sin dependencia bloqueante de backend para el polish principal.
