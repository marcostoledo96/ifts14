# Exploration: audit-p15-asist-certs

**Cambio**: `audit-p15-asist-certs`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p15-asist-certs`
**Alcance de fase**: certificados por fecha `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados` → `date-certificates-page.*`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P15; `openspec/specs/admin-attendances-frontend/spec.md` (Página de certificados del curso por fecha); patrón `errorRecuperable` P13/P14; AGENTS.md (DNI completo UI; sin PII en logs; token/QR permanente)

## Exploration: Certificados por fecha de curso (P15)

### Current State

`DateCertificatesPage` es el destino post-«Guardar y generar» del marcado (P14): recibe `state` con `mensajeOk` / `resumenGen`, carga curso + listado de certificaciones por `cursoId`, y ofrece por fila Copiar link, Descargar QR y Descargar PDF. El `:fechaId` alimenta el back-link a asistencias y el meta del header (`fechaActual`); **no** filtra el listado (contrato canónico: filtrado por `cursoId`).

| Checklist P15 | Estado hoy | Evidencia |
|---|---|---|
| Listado coherente con emitidos | **OK con matices** | `certs.listar({ cursoId })` + banner resumen Emitidos/Actualizados/Con error desde nav state. Lista = todos los del curso (no solo de la fecha); coherente con kicker «Certificados del curso» y spec. Sin test de coherencia resumen↔filas. |
| Links a expediente / PDF / entrega | **Parcial** | PDF → `navigate(['/admin/certificaciones', id, 'pdf'], { queryParams: { descargar: '1' } })`. Entrega inline: Copiar link (`obtenerEntregaManual`) + Descargar QR (`descargarQrPng`). **Sin** enlace a expediente `/admin/certificaciones/:id` (sí existe en listado global P16). |
| Vacíos | **OK** | Empty «Todavía no hay certificados para este curso.» + CTA a marcar asistencias. Sin test dedicado de vacío. |

**Comportamiento técnico vigente**

- Ruta: `cursos/:id/fechas/:fechaId/asistencias/certificados` **antes** que `…/asistencias` (`app.routes.spec.ts`).
- Carga: `effect` sobre `id()` + `loadGen`; `Promise.all(courses.obtener, certs.listar({ cursoId }))`. `fechaId` inválido/ausente en detalle → `fechaActual` null (meta sin fecha); no hay panel «fecha no encontrada» (a diferencia del marcado).
- Id de curso inválido: `error = 'Curso no encontrado.'` sin Reintentar (correcto) pero **sin** panel de error estructurado.
- Catch de carga y de acciones: `(e as Error).message` — smell confirmado; sin `errorRecuperable` / `onReintentar` / `mensajeErrorApi`.
- Acciones solo habilitadas si `estado === 'vigente'` (`puedeEntregar`); revocados visibles con botones disabled.
- DNI: `documentMasked` (nombre histórico D0) = DNI completo ficticio 7–8 dígitos; test anti-token y assert `/\d{7,8}/`.
- PII: sin `console.*` en la página; sin token completo en template (test).
- Spec canónica «Página de certificados del curso (por fecha)» exige listado por `cursoId`, volver, orden Copiar/QR/PDF, sin token completo. **No** exige aún Reintentar recuperable ni link a expediente.

**Residuos / gaps**

1. **Honesty de carga** — catch pinta `Error.message` crudo; no hay `errorRecuperable` ni botón Reintentar (paridad P13/P14). Id inválido OK sin Reintentar.
2. **Honesty de acciones** — Copiar link / QR / navigate PDF también usan `(e as Error).message`; conviene `mensajeErrorApi` (o mensaje fijo de acción) **sin** Reintentar de página.
3. **Link a expediente** — checklist P15 pide expediente; la fila solo tiene acciones de entrega/PDF. Gap vs listado global (`routerLink` a `/admin/certificaciones/:id`).
4. **Tests incompletos** — hay lista+acciones+QR+anti-token/DNI; faltan: vacío, Reintentar recuperable vs not-found, expediente (si se agrega), catch sin raw message, opcional banner resumen.
5. **fechaId huérfano** — si la fecha no está en `detalle.fechas`, la UI sigue mostrando el listado del curso sin aviso. Honesty menor; default a confirmar.
6. **Fuera de alcance explícito** — no reabrir marcado P14; no rediseñar listado global P16; no tocar HTTP de certificaciones salvo bug de mapeo (no observado).

### Affected Areas

- `apps/frontend-angular/.../attendances/pages/date-certificates/date-certificates-page.ts` — `errorRecuperable` + mensajes honestos en `cargar`; `mensajeErrorApi` en catches de acciones; opcional link helpers.
- `apps/frontend-angular/.../attendances/pages/date-certificates/date-certificates-page.html` — Reintentar condicional; enlace a expediente por fila; conservar empty/PDF/QR/Copiar.
- `apps/frontend-angular/.../attendances/pages/date-certificates/date-certificates-page.spec.ts` — honesty + vacío + expediente; no debilitar anti-token/DNI.
- `apps/frontend-angular/.../attendances/pages/date-certificates/date-certificates-page.css` — solo si el link a expediente requiere estilo mínimo (evitar rediseño).
- `openspec/specs/admin-attendances-frontend/spec.md` — delta corto: Reintentar solo recuperable; link expediente; honesty sin raw `Error.message`.
- **Fuera de alcance (defaults)**: P14 marcado, P16 listado global, backend emisión/entrega, SMTP, rotación token/QR, rediseño vs `muestra_pagina/`, filtrar listado por `fechaId` (rompe contrato actual).

### Approaches

1. **Auditoría quirúrgica de página (recomendada)** — Cerrar honesty (`errorRecuperable` + Reintentar solo en catch de carga; `mensajeErrorApi` en acciones); agregar link «Expediente» (o nombre equivalente) a `/admin/certificaciones/:id`; tests de vacío/honesty/expediente; delta spec mínimo. Conservar listado por `cursoId` y acciones PDF/QR/Copiar.
   - Pros: cierra checklist P15 y smell conocido; paridad P13/P14; blast radius acotado; dentro de presupuesto ~400 LOC.
   - Cons: no cubre honesty de fecha huérfana salvo default extra.
   - Effort: Low–Medium

2. **Página + filtrar por fecha de emisión/asistencia** — Además del enfoque 1, restringir filas a certificados «de esta fecha».
   - Pros: literaliza «por fecha» en el listado.
   - Cons: contradice spec vigente (filtro `cursoId`); modelo `Certificacion` no tiene `cursoFechaId`; requiere diseño + posible API; scope creep / P16 frontera.
   - Effort: High

3. **Redirección a pantallas P16/P18 para entrega/PDF** — Sustituir acciones inline por deep-links a entrega/expediente/PDF preview.
   - Pros: reutiliza flujos ya auditados en certificaciones.
   - Cons: rompe UX actual (Copiar/QR/PDF en un lugar); más navegación; fuera del espíritu post-marcado; riesgo de presupuesto.
   - Effort: Medium–High

### Recommendation

Adoptar **enfoque 1** por defecto. Alcance propuesto para `sdd-propose`:

1. **Checklist como aceptación (no romper)**
   - Listado por `cursoId` coherente con emisión del curso; empty; Copiar link / QR / PDF; DNI completo vía `documentMasked`; sin token/PII en logs/mensajes; consumir `state` de P14.
2. **Honesty**
   - `errorRecuperable` + Reintentar solo en catch de carga (mensaje fijo tipo «No se pudieron cargar los certificados. Reintentá.»).
   - Curso/id inválido o 404: mensaje controlado **sin** Reintentar.
   - Acciones: `mensajeErrorApi` (o fallback de acción) sin Reintentar de página; **no** pegar raw `Error.message` como única fuente.
3. **Expediente**
   - Link por fila a `/admin/certificaciones/:id` (además de las tres acciones actuales), alineado al listado global.
4. **Tests / verify**
   - Vacío + CTA; Reintentar presente solo si recuperable; id inválido sin Reintentar; link expediente; conservar anti-token/DNI y orden de botones.
5. **HTTP / backend**
   - No modificar `http-certifications` ni backend en este change.

### Defaults a confirmar

1. ¿Alcance = **enfoque 1** (página + tests + delta corto), sin filtrar por `fechaId`? (**recomendado: sí**)
2. ¿Agregar link a expediente `/admin/certificaciones/:id` por fila? (**recomendado: sí**)
3. ¿«Entrega» del checklist = acciones inline Copiar link + QR (status quo), sin navegar a `/…/entrega`? (**recomendado: sí**)
4. ¿`errorRecuperable` + Reintentar solo en catch de carga (paridad P14)? (**recomendado: sí**)
5. ¿Acciones fallidas usan `mensajeErrorApi` sin Reintentar de página? (**recomendado: sí**)
6. ¿Fecha huérfana (`fechaId` no en curso): dejar como está (solo omitir meta) o panel not-found? (**recomendado: dejar en P15; follow-up si hace ruido en QA**)
7. ¿Prohibido tocar P14 marcado, P16 listado global, HTTP certs, token/QR? (**recomendado: sí, hard lock**)

### Questions (para propose)

1. Confirmar defaults 1–7 arriba antes de apply.
2. ¿Copy del link a expediente («Ver expediente» / «Expediente»)? (**recomendado: «Expediente», paridad listado**)
3. ¿Algún cambio de copy del empty o del intro? (**recomendado: no, salvo typo**)

### Risks

- Filtrar por fecha sin contrato de datos → listado vacío tras emitir (falsa incoherencia).
- Mostrar raw `Error.message` / envelope con PII → viola AGENTS.md.
- Reintentar en not-found → UX engañosa (ya corregido en P13/P14).
- Ampliar a P16 o rediseñar cards → scope creep y presupuesto 400 LOC.
- Romper orden Copiar → QR → PDF o deshabilitar vigentes → regresión de tests/spec.
- Tocar `regenerarPdf` / token desde esta página (no aplica hoy; mantener hard rule).

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `date-certificates-page.*`: checklist mayormente OK; cerrar honesty (Reintentar recuperable, sin raw message); agregar link a expediente; tests + delta corto en `admin-attendances-frontend`; **sin** P14/P16 ni filtro por `fechaId`.
