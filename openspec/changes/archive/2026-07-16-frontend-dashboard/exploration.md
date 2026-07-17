## Exploration: frontend-dashboard (reescritura completa)

### Current State

**Angular hoy** (`AdminDashboardPage`): mesa de trabajo **no** implementada. Es un placeholder de **4 tarjetas** (Cursos / Asistencias / Alumnos / Certificaciones) con enlaces reales a módulos existentes.

| Métrica en card | Origen actual |
|---|---|
| Cursos `6` | Constante ficticia (no usa `COURSES_SOURCE`) |
| Asistencias `11` | Constante ficticia (comentario: fechas seed) |
| Alumnos | `STUDENTS_SOURCE.contar()` (mock o `GET /admin/alumnos`.length) |
| Certificaciones | `CERTIFICATIONS_SOURCE.contar()` (mock o `GET /admin/certificados`.length) |

Copy: “Dashboard”, “sesión mock”, “Vista placeholder sin datos reales”. Specs (`admin-dashboard-page.spec.ts`) fijan el contrato de las 4 cards y el fallback a `0` si `contar()` rechaza.

**Shell** (`AdminShell`): sidebar + topbar institucional propios; **sin** buscador global, sync “Sincronizado”, campana ni avatar de v0. El dashboard vive como hijo lazy en `/admin/dashboard`.

**Rutas ya disponibles** (post ciclos 1–2): `/admin/certificaciones/nueva`, `/admin/configuracion`, más cursos/asistencias/alumnos/certificaciones/entrega/revocar/pdf.

**Referencia v0** (`muestra_pagina/app/admin/dashboard/page.tsx`):
1. Encabezado “Panel de certificaciones”
2. **Acciones principales** (protagonistas)
3. **Bandeja de pendientes**
4. **Actividad reciente**
5. **Resumen operativo** (contexto, sin protagonismo)

Componentes: `acciones-principales.tsx`, `bandeja-pendientes.tsx`, `actividad-reciente.tsx`, `resumen-operativo.tsx`. Capturas: `muestra_pagina/capturas/admin-desktop.png`, `admin-mobile.png` (y `desktop.png`/`mobile.png` genéricas). Prompt §6 en `muestra_pagina/prompts_stitch_v0_ifts14.md`.

**Nota captura vs código v0:** capturas antiguas dicen “Reenviar certificado” / badge `REENVÍO`; el TSX y el prompt vigentes usan **Entrega manual** / `nueva-entrega` (alineado a D0: QR permanente, sin email SMTP en MVP). Paridad = **TSX + prompt**, no el wording stale de captura.

**Qué falta vs v0**

| Bloque v0 | En Angular |
|---|---|
| Acciones (5 tiles: Nueva certificación primaria, Nuevo curso, Cargar asistencias, Entrega manual, Carga masiva) | No existe (solo cards de módulos) |
| Pendientes (4 filas + total tareas) | No existe |
| Actividad reciente (tabla eventos) | No existe |
| Resumen operativo (4 métricas al pie) | Parcial: conteos mezclados en cards, no el strip v0 |
| Jerarquía “acciones > pendientes > actividad > métricas” | Invertida / ausente (grid de cards SaaS-like, justamente lo que el prompt prohíbe) |

**Datos reales disponibles vs placeholders**

Backend (`apps/backend-php/index.php`) — endpoints admin reales, **sin** métricas de dashboard:

| Endpoint | Sirve al dashboard |
|---|---|
| `GET /admin/cursos` (+ `…/fechas`) | Conteo cursos; “sin fechas” vía `listar({ conFechas: false })` (costoso: N GETs de fechas) |
| `GET /admin/alumnos` | Conteo alumnos. **No** expone email → “alumnos sin email” **no** se puede medir (HTTP default `tieneEmail: false`) |
| `GET /admin/certificados?estado=` | Total / emitidas (aprox. vigentes+…) / revocadas por filtro client o query |
| `GET /admin/asistencias?cursoId=` | Por curso; **no** feed global ni “asistencias pendientes” |
| `GET /admin/certificados/{id}` → `auditEvents` | Auditoría **por certificado**, no feed global |
| `GET …/entrega-manual` | Solo lectura; **no** escribe auditoría de “entrega” |
| — | **No existen** `GET /admin/actividad`, `/pendientes`, `/metricas`, `/dashboard` |

| UI v0 | ¿Dato real? | Estrategia honesta |
|---|---|---|
| Acciones (navegación) | N/A | Enlaces a rutas existentes; **Carga masiva** deshabilitada o placeholder (F6-02 pendiente, sin ruta) |
| Entrega manual (acción) | Parcial | Sin hub global: link a listado certificaciones o primer expediente; no inventar “bandeja de reenvío” |
| Resumen: cursos / alumnos / emitidas / revocadas | Sí (derivado) | `listar`/`contar` + filtro `estado` |
| Pendiente: cursos sin fechas | Parcial / caro | Derivar de cursos+fechas o placeholder con copy “disponible con integración” |
| Pendiente: alumnos sin email | **No** | Placeholder fijo o ocultar fila hasta que backend exponga email |
| Pendiente: certs sin entrega / re-entrega por mod | **No** | No hay estado “entregado” ni listado de `pdfStatus outdated`; placeholder |
| Actividad reciente | **No** | Placeholder seed UI o omitir tabla hasta API de auditoría global (F6-03) |

`CoursesService` **no** tiene `contar()`; solo `listar`. Asistencias **no** tienen conteo de dashboard.

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.{ts,html,css,spec.ts}` — reescritura UI + hidratación
- `apps/frontend-angular/src/app/app.routes.ts` — título/copy de ruta dashboard (hoy “mock”)
- `openspec/specs/admin-foundation/spec.md` — hoy exige “conteos ficticios” y “sin datos reales”; hay que **actualizar contrato** en proposal/spec
- Seams existentes: `COURSES_SOURCE`, `STUDENTS_SOURCE`, `CERTIFICATIONS_SOURCE` (inyectar cursos también); **no** hace falta `ATTENDANCE_SOURCE` para el strip de resumen
- Shell/topbar v0 (buscador, campana): **fuera de alcance** recomendado de este ciclo (pertenece a shell, no al body del dashboard)
- Backend nuevo: **fuera** de este ciclo frontend

### Approaches

1. **Paridad visual con seed estático v0** — Copiar números/eventos ficticios del export.
   - Pros: paridad visual rápida; tests simples.
   - Cons: deshonesto con `useRealApi`; choca con specs de “no datos reales” vs expectativa de conteos vivos ya parciales.
   - Effort: Low

2. **Mesa de trabajo honesta (recomendado)** — Layout v0 completo; métricas derivadas de listados donde existan; bandeja/actividad con placeholders explícitos o filas omitidas cuando no hay API; acciones = `routerLink` reales (Nueva certificación primaria → `/admin/certificaciones/nueva`, etc.); Carga masiva deshabilitada con handoff.
   - Pros: cumple paridad visual + honestidad API; reusa seams; no inventa backend; alinea D0 (entrega manual, no reenvío).
   - Cons: pendientes/actividad no “vivos”; hay que actualizar `admin-foundation` y specs del dashboard.
   - Effort: Medium

3. **Derivar todo client-side (N× listados)** — Calcular pendientes “inteligentes” (fechas por curso, pdfStatus por cert, etc.).
   - Pros: menos placeholders.
   - Cons: costoso/frágil; varios ítems **siguen siendo imposibles** (email, entrega, feed global); riesgo de latencia y false confidence.
   - Effort: High

4. **Ciclo backend de métricas primero** — Nuevo `GET /admin/dashboard` o `/actividad` + `/pendientes`.
   - Pros: datos canónicos.
   - Cons: bloquea FE; fuera del alcance del ciclo 3 frontend; requiere diseño de auditoría/email/estados de entrega.
   - Effort: High (+ ciclo Marcos)

### Recommendation

**Approach 2 — Mesa de trabajo honesta.**

Reescribir el body del dashboard a la composición v0 (acciones → pendientes → actividad → resumen). Cablear resumen con conteos reales vía seams. Acciones como navegación real hacia rutas ya cerradas (ciclos 1–2). Bandeja y actividad: estructura visual v0 con **placeholders honestos** (copy tipo “Sin fuente de datos aún” / conteo `—` / seed demo claramente marcado), sin fingir API de actividad ni de “pendiente de entrega”. No tocar shell topbar en este ciclo salvo lo mínimo de título de página. Actualizar `admin-foundation` para dejar de exigir “solo conteos ficticios en 4 cards”.

Criterio de aceptación visual: paridad con `admin-desktop.png` / `admin-mobile.png` en layout y jerarquía, wording de **Entrega manual** (no Reenviar).

### Risks

- Spec `admin-foundation` y tests del dashboard **rompen** si no se actualizan en el mismo ciclo.
- `conFechas: false` en HTTP dispara N requests de fechas → no usar en hot path del dashboard sin cache/agregación.
- Confundir captura “Reenviar” con producto: viola D0 / decisión de entrega manual.
- Inventar feed de actividad desde listados parciales → falsa sensación de auditoría.
- Scope creep: buscador/notificaciones del shell, carga masiva real, API de métricas.
- Presupuesto de review (~400 líneas): la reescritura HTML/CSS/spec puede rozar o superar el budget → considerar slice visual + slice datos si hace falta.

### Ready for Proposal

**Yes.** El alcance está claro: reescritura frontend del dashboard a paridad v0 con honestidad de API; sin endpoints nuevos. El orchestrator puede lanzar `sdd-propose` para `frontend-dashboard` con esta frontera: layout + acciones cableadas + resumen derivado + placeholders de bandeja/actividad; actualizar spec foundation; TDD sobre estructura y conteos reales/fallbacks.
