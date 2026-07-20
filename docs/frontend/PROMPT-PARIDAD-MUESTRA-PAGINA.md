# PROMPT DE SESIÓN — Paridad visual/funcional Angular ↔ `muestra_pagina`

> **Cómo usar:** pegá este documento completo como primer mensaje de una **nueva sesión**.
> Objetivo: que el frontend Angular 20 quede **calco visual y de interacción** de `muestra_pagina/` (export v0/Next), sin portar React literalmente, respetando contratos backend reales (D0 + honestidad de campos).

**Fecha del audit:** 2026-07-17
**Repo:** `/home/marcos/Escritorio/ifts14`
**Ámbito:** `apps/frontend-angular/` vs `muestra_pagina/`
**Metodología:** Gentle AI SDD — un ciclo por pantalla/sección; verify `test:ci` + `tsc` + `build` por ciclo.

---

## 0. Rol y reglas duras

Sos el agente de implementación frontend del IFTS 14. Tu trabajo es cerrar la **brecha de paridad** entre Angular y la referencia v0.

### Reglas obligatorias (no negociables)

1. **Fuente de verdad visual:** `muestra_pagina/components/**` (código actual) + `muestra_pagina/capturas/**`.
   - Si captura y TSX divergen, priorizá el **TSX actual** y anotá la divergencia en el exploration del ciclo.
2. **NO portar React/Next literalmente.** Portá layout, jerarquía, tipografía, espaciado, iconografía Lucide-equivalente (SVG inline), estados y copy.
3. **Angular 20:** signals, standalone, OnPush, `inject()`, `input()`, sin Zone hacks innecesarios.
4. **Idioma:** UI copy en español argentino formal; identificadores de código en inglés.
5. **Honestidad de datos:** NO inventar campos que el backend no exponga.
   - Si v0 muestra algo sin contrato API (ej. columna Entrega/`envio`, conteos inventados, logos upload, email SMTP), la UI Angular debe:
     - **omitir** el control, o
     - mostrar placeholder honesto (`—` / “no disponible” / disabled con motivo),
     - **nunca** fakear datos reales ni DNI/token completos en admin.
6. **D0:** QR/token permanente; DNI completo en validación pública y UI admin (`documentMasked`/`dniMostrar` con dígitos completos); email opcional al crear alumno.
7. **Auth:** `X-Admin-Key` no va al browser; sesión cookie + CSRF.
8. **Paridad = criterio de aceptación.** Un ciclo no cierra si la captura side-by-side (desktop + mobile) no alcanza paridad igual o mejor que v0 en layout/spacing/botones/iconos.
9. **No commits** salvo pedido explícito del usuario.
10. Leer mínimo: `AGENTS.md`, este prompt, la pantalla v0 + Angular del ciclo activo, capturas relacionadas, `openspec/specs/` afectadas.

### Anti-patrones a evitar

- “Polish genérico” que no calca v0.
- Dejar botones disabled “por handoff histórico” cuando v0 los tiene activos (salvo falta de API → disabled + motivo explícito, no F6-0x residual).
- Iconos path SVG inventados que no se parecen a Lucide del v0 (Home vs LayoutGrid, etc.).
- Copiar campos fantasma de v0 (logos, firmas upload, legajo, email SMTP) sin contrato.

---

## 1. Mapa de pantallas (inventario 1:1)

| # | Ruta Angular | Componente Angular | Referencia v0 | Capturas clave | Estado audit 2026-07-17 |
|---|--------------|--------------------|---------------|----------------|-------------------------|
| 1 | `/admin/login` | `login-page` + `login-form` | `login-form.tsx` | `login-desktop/mobile/error/loading` | **PARCIAL** — estructura 2 columnas existe; detalles (grid bg, placeholders, protocolo SHA-256/SSL, flecha en Ingresar, tipografía) a calibrar |
| 2 | shell | `admin-shell` + `sidebar-admin` | `admin-shell.tsx` + `sidebar-admin.tsx` | `admin-desktop/mobile` | **PARCIAL** — faltan Help + Bell+dot; avatar `AD` vs `MP`; search placeholder truncado; sync sin hora; iconos nav no Lucide-like |
| 3 | `/admin/dashboard` | `admin-dashboard-page` | `acciones-principales` + `bandeja-pendientes` + `actividad-reciente` + `resumen-operativo` | `admin-desktop/mobile` | **DIVERGENTE** — tiles de acción incorrectas; pendientes/actividad/resumen son stubs honestos vs mock rico v0 |
| 4 | `/admin/cursos` | `courses-list-page` | `lista-cursos.tsx` | `cursos-desktop/375` | **PARCIAL** — Angular más corto (~180 vs ~713 líneas v0); badges/estados/métricas Presentes/Certificaciones |
| 5 | `/admin/cursos/nuevo` `/editar` | `course-editor-page` | `curso-editor.tsx` | `curso-nuevo/editar-*` | **PARCIAL** — v0 tiene descripción/carga/firma hash; Angular honestamente omitió fantasmas; layout sticky aside a calibrar |
| 6 | `/admin/cursos/:id` | `course-detail-page` | `curso-detalle.tsx` | (detalle en flujos) | **DIVERGENTE** — Angular muy delgado (~61 líneas HTML) |
| 7 | `/admin/alumnos` | `students-list-page` | `lista-alumnos.tsx` | `alumnos-desktop/375` | **PARCIAL** — v0: legajo/email/paginación densa; Angular: sin legajo (ok D0), badges honestos |
| 8 | `/admin/alumnos/:id` | `student-detail-page` | `alumno-detalle.tsx` | `alumno-desktop/375` | **PARCIAL** — Compartir/Editar disabled en Angular; v0 los muestra activos (mock) |
| 9 | `/admin/alumnos/nuevo` | `student-editor-page` | (implícito en flujo alumnos) | — | **REVISAR** — confirmar paridad formulario |
| 10 | `/admin/asistencias` | `attendances-list-page` | **no hay listado equivalente en v0** (entra por curso) | — | **EXTRA Angular** — decidir si se mantiene como hub o se alinea a deep-link v0 |
| 11 | `/admin/cursos/:id/fechas/:fechaId/asistencias` | `attendance-marking-page` | `asistencias-editor.tsx` | `asist-*` | **PARCIAL** — v0 tiene banner impacto; Angular lo omitió (sin API FE) |
| 12 | `/admin/certificaciones` | `certifications-list-page` | `lista-certificaciones.tsx` | `cert-*` | **PARCIAL** — v0 columna/filtros Entrega (`envio`); Angular omitió (sin campo API) — correcto; visual a subir |
| 13 | `/admin/certificaciones/nueva` | `certification-new-page` | `nueva-certificacion-editor.tsx` | `cert-loading/loaded/check/sinfechas` | **DIVERGENTE** — v0 ~1077 líneas con preview documental inline; Angular ~148 líneas formulario corto |
| 14 | `/admin/certificaciones/:id` | `certification-preview-page` | `expediente-certificacion.tsx` | `exp-*` | **PARCIAL** — Copiar/Compartir ya habilitados (C12); densidad visual/espaciado a calcar |
| 15 | `.../entrega` | `certification-delivery-page` | `entrega-manual.tsx` | `entrega-*` | **PARCIAL** — Angular tiene Descargar QR (plus vs v0); layout modal a calcar |
| 16 | `.../pdf` | `certification-pdf-preview-page` | `vista-previa-pdf.tsx` | `pdf-*` | **PARCIAL** — autoridades demo vs config; print chrome |
| 17 | `.../revocar` | `certification-revoke-page` | `revocar-certificacion.tsx` | `rev-*` | **PARCIAL** — calibrar modal/errores |
| 18 | `/admin/configuracion` | `institutional-config-page` | `configuracion-institucional.tsx` | `cfg-*` | **PARCIAL (P-14)** — nav sticky + 5 secciones + copy v0; DTO editables; logos/firmas/sello honestos (sin SMTP; disabled/omit) |
| 19 | `/validar/:token` | `public-validation-page` | `validacion/*` | `desktop/mobile/error/revocada/noencontrada` | **REVISAR** — folio, sellos, estados |
| 20 | `/` landing + 404 | landing / not-found | `app/page.tsx` + estados | — | **REVISAR** |

---

## 2. Hallazgos críticos del audit (P0)

### P0-1 — Dashboard: tiles de acción incorrectas (bug de producto)

**v0 actual (`acciones-principales.tsx`):**
1. Nueva certificación — Emitir certificado con QR (primary)
2. Nuevo curso — Alta de comisión y fechas
3. **Cargar asistencias** — Registrar presentes por clase
4. **Entrega manual** — Copiar link y descargar PDF
5. Carga masiva — Importar padrón (visualmente activo en v0 mock)

**Angular actual:**
1. Nueva certificación ✅
2. Nuevo curso ✅
3. **Alumnos** ❌ (no existe en v0)
4. **Configuración** ❌ (en v0 está en sidebar footer, no en tiles)
5. Carga masiva disabled ✅ (honesto)

**Nota:** la captura `admin-desktop.png` muestra “Reenviar certificado” (versión stitch vieja). El TSX vigente dice **Entrega manual**. Priorizar TSX.

### P0-2 — Shell topbar incompleta

| Elemento v0 | Angular |
|-------------|---------|
| Search placeholder “Buscar curso, alumno o certificado…” | “Buscar…” |
| Sync “Sincronizado 10:42” | “Sincronizado” sin hora |
| Botón Ayuda (HelpCircle) | **ausente** |
| Botón Notificaciones (Bell + dot warning) | **ausente** |
| Avatar “MP” | “AD” |

### P0-3 — Sidebar iconografía

v0 usa Lucide: `LayoutGrid`, `BookOpen`, `Users`, `CalendarCheck`, `QrCode`, `Settings`, `LogOut`.
Angular usa paths SVG genéricos (Inicio parece “home”, no grid). **Calcar path/stroke Lucide.**

### P0-4 — Nueva certificación: no es calco

v0 es un editor largo con:
- selección alumno/curso,
- preview documental (declaración, asistencia, firmas, trazabilidad),
- CTA “Emitir certificación”,
- estados loading/sin fechas/check.

Angular es un formulario corto de emisión. **Ciclo dedicado de paridad visual** (sin volver al wizard 3 pasos inventado; v0 tampoco es wizard de 3 pasos).

### P0-5 — Configuración institucional: mitad del diseño faltante

v0 secciones: Identidad, Certificados, Autoridades y firmas, Contacto, Validación pública + **logos/sellos upload + firmas digitales upload**.
Backend DTO real solo tiene: `institutionName`, `certificateText`, `rectorName/Role`, `advisorName/Role`, `updatedAt`.

**Decisión de plan:**
- Calcar layout/nav sticky/copy de secciones que mapean al DTO.
- Secciones sin API (logos, uploads, email SMTP, toggles sello): UI **presentacional disabled** o omitidas con nota “requiere contrato”, **no inventar persistencia**.

### P0-6 — Course detail demasiado flaco

v0 `curso-detalle.tsx` (~344 líneas) vs Angular (~61). Faltan paneles, tablas de fechas, CTAs densos.

### P0-7 — Tipografía / tokens

Angular `styles.css` usa `system-ui`/Roboto stack. v0/Stitch apunta a tipografía más intencional + Tailwind tokens (`tracking-[0.16em]`, `rounded-sm`, grid paper).
Plan: alinear tokens CSS variables a `muestra_pagina/app/globals.css` (colores ya cercanos: ink `#0b1f33`, circuit `#00a8c6`).

### P0-8 — Detalle de curso: CTA primario ausente

v0: botón primary **Cargar asistencias** (+ **Editar curso**).
Angular: solo **Editar fechas** / **Agregar fecha**; marcado por fila.
Calcar CTA **Cargar asistencias** hacia la ruta Angular real (`/admin/cursos/:id/fechas/:fechaId/asistencias` o hub `/admin/asistencias` filtrado) y alinear label **Editar curso**.

### P0-9 — PDF preview: falta **Descargar PDF**

v0: **Imprimir** + **Descargar PDF** (primary).
Angular: solo **Imprimir** + volver.
Restaurar CTA si hay seam de descarga; si no, Imprimir + omisión documentada (no fake blob).

### Extra Angular (no borrar sin decisión)

- `/admin/asistencias` list — **no existe en v0** (sidebar v0 es `href="#"`).
- `/admin/alumnos/nuevo` — v0 linkea pero **no tiene page** bajo `muestra_pagina/app/`.
- Expediente **Compartir** y entrega **Descargar QR** — extras útiles; mantener si no rompen calco visual.

Audit paralelo de confirmación: explore subagent de paridad UI (2026-07-17).

---

## 3. Gaps P1 (por pantalla)

### Login
- [ ] Grid pattern fondo left/right
- [ ] Aside footer: “PROTOCOLO / SHA-256 / SSL” (o protocolo real documentado) vs texto Angular distinto
- [ ] Placeholder email institucional estilo v0
- [ ] Botón Ingresar con flecha →
- [ ] Estados error/loading pixel-match capturas
- [ ] Quitar cualquier rastro de credenciales demo visibles (v0 tiene `usuario.demo@example.invalid` en fuente — **NO portar**)

### Listas (cursos / alumnos / certificaciones)
- [ ] Densidad de tabla desktop + cards mobile
- [ ] Chips de filtro con mismo tono/spacing
- [ ] Empty/loading/error SVG states (Inbox, etc.)
- [ ] Paginación y labels de columnas
- [ ] Certificaciones: **NO** agregar columna Entrega sin API; sí igualar badge validez/estado al look v0

### Alumno detalle
- [ ] Header CTAs: Nueva certificación / Compartir / Editar
  - Compartir/Editar: si no hay API → disabled + aria + copy v0 visual (no ocultar)
- [ ] Emisión por curso en tabla
- [ ] Spacing de métricas (válidas/revocadas/cursos)

### Asistencias
- [ ] Banner de impacto (si no hay API: omitir o “impacto no disponible”, no fake counts)
- [ ] Toggle Presente/Marcar look v0
- [ ] Dirty confirm copy/spacing
- [ ] Decidir destino de `/admin/asistencias` list (hub Angular extra)

### Expediente / PDF / Entrega / Revocar
- [ ] Spacing paneles, tipografía mono kickers, QR decorativo
- [ ] PDF: autoridades desde config (ya en preview; PDF puede seguir demo)
- [ ] Entrega: Angular tiene Descargar QR (deseable); asegurar que no rompa paridad visual del footer de acciones v0 (Copiar + PDF + Cancelar)

### Validación pública
- [ ] Side-by-side con `folio-certificado`, sellos, estados revocada/error/no encontrada
- [ ] Mobile 390/375

---

## 4. Bugs / inconsistencias funcionales detectadas

1. **Dashboard tiles wrong** (P0-1) — navegación incorrecta vs v0.
2. **Captura vs TSX dashboard** — “Reenviar” en PNG viejo vs “Entrega manual” en TSX; documentar en exploration.
3. **Hand offs residuales** — buscar textos `F6-0`, `F5-0`, “no disponible aún” que v0 no muestra como handoff técnico.
4. **Icon pack inconsistente** — mezcla de metaphors (home vs grid).
5. **Course editor** — riesgo de reintroducir campos fantasma (descripción/carga) ya rechazados por honestidad; el plan de paridad debe ser **layout**, no campos inventados.
6. **Nueva certificación** — falta preview documental; riesgo de emitir sin feedback visual v0.
7. **Shell footer** Angular muestra footer institucional bajo main; confirmar si v0 lo tiene (admin-shell v0 parece sin footer de página — solo topbar+main).

---

## 5. Plan de ciclos SDD propuesto (orden)

Trabajá **un ciclo por vez** (explore→propose→spec→tasks→apply→verify→archive). Nombre sugerido de change: `frontend-parity-<slug>`.

| Ciclo | Nombre | Objetivo | Prioridad |
|-------|--------|----------|-----------|
| P-01 | `frontend-parity-shell-topbar-sidebar` | Calcar shell: search, sync+hora (mock estático ok), Help, Bell+dot, avatar, iconos Lucide, spacing sidebar | P0 |
| P-02 | `frontend-parity-dashboard-acciones` | Corregir 5 tiles exactas v0 + links; Carga masiva disabled honesto; bandeja/actividad/resumen visual calco con datos honestos/placeholders | P0 |
| P-03 | `frontend-parity-login` | Pixel-match login desktop/mobile/error/loading | P0 |
| P-04 | `frontend-parity-cursos-list` | Tabla/cards/chips/empty = v0 (métricas sin API = `—`) | P1 |
| P-05 | `frontend-parity-curso-detalle` | Expandir detalle + CTA **Cargar asistencias** + label **Editar curso** | P0 |
| P-06 | `frontend-parity-curso-editor-layout` | Layout grid+aside sticky; sin campos fantasma (carga/modalidad/descripcion solo si API) | P1 |
| P-07 | `frontend-parity-alumnos-list` | Densidad + filtros + empty | P1 |
| P-08 | `frontend-parity-alumno-detalle` | CTAs y secciones; disabled honestos | P1 |
| P-09 | `frontend-parity-asistencias-marking` | Look v0 + decisión list hub | P1 |
| P-10 | `frontend-parity-certificaciones-list` | Badges/empty/spacing; sin Entrega inventada | P1 |
| P-11 | `frontend-parity-nueva-certificacion` | Preview documental + flujo visual v0 | P0 |
| P-12 | `frontend-parity-expediente` | Spacing/iconos/paneles expediente | P1 |
| P-13 | `frontend-parity-entrega-revocar-pdf` | Modales + PDF **Descargar PDF**/Imprimir chrome | P0 |
| P-14 | `frontend-parity-configuracion-layout` | Secciones/nav sticky; uploads disabled/omit | **DONE** 2026-07-17 |
| P-15 | `frontend-parity-validacion-publica` | Folio/estados públicos | P1 |
| P-16 | `frontend-parity-tokens-global` | Alinear `styles.css` ↔ `globals.css` + tipografía | P1 |
| P-17 | `frontend-parity-verify-global` | Smoke visual side-by-side de las 20 rutas + test:ci/tsc/build | P0 cierre |

> Si el usuario pide “solo lo que se ve mal primero”, ejecutá P-01 → P-02 → P-03 → P-11 → P-14 antes que listas.

---

## 6. Definition of Done por ciclo

1. Exploration con tabla gap (elemento v0 → estado Angular → decisión).
2. Spec con REQ-PAR-* Given/When/Then + criterio visual.
3. Apply TDD donde haya comportamiento; CSS con tokens existentes.
4. Verify: `CHROME_BIN=... npm run test:ci`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`.
5. Evidencia visual: screenshot desktop + mobile de la ruta (guardar bajo `openspec/changes/.../evidence/` o `docs/frontend/parity/`).
6. Archive + doc corta en `docs/frontend/`.

### Checklist visual mínimo (cada pantalla)

- [ ] Misma jerarquía de encabezado (kicker mono / título / subtítulo)
- [ ] Mismos botones visibles (label exacto) o disabled honesto documentado
- [ ] Mismos iconos (metáfora Lucide)
- [ ] Spacing: gaps de sección ~ v0 (`gap-3`, `px-4 py-3`, `max-w-6xl`)
- [ ] Mobile 375/390: drawer, cards vs tabla
- [ ] Sin textos de handoff técnico residuales
- [ ] Sin DNI/token completos en admin

---

## 7. Cómo comparar en runtime

```bash
# Terminal 1 — API solo login (mock admin data)
# (ver docs recientes / instrucciones local-dev)

# Terminal 2
cd apps/frontend-angular && npm start
# http://127.0.0.1:4200/certificados/admin/login

# Referencia visual: abrir capturas en muestra_pagina/capturas/
# o servir muestra_pagina solo como lectura (NO es producto).
```

Login local de smoke previo: usuario `bedelia` / clave según config PHP temporal (no commitear).

Para cada pantalla: abrir Angular + captura v0 lado a lado (o Playwright screenshot).

---

## 8. Constraints backend / honestidad (lock)

| Feature v0 | ¿API real? | Acción Angular |
|------------|------------|----------------|
| Columna/filtros Entrega (`envio`) | NO en listado | Omitir (ya hecho) |
| Logos/firmas upload config | NO | UI disabled u omitir |
| Email / reenvío SMTP | NO (MVP sin email) | Nunca “Reenviar email”; Entrega manual |
| Conteos Presentes/Certif. en lista cursos | NO | `—` |
| Bandeja pendientes con números | NO agregación | Placeholders honestos o counts solo si derivables |
| Actividad reciente tabla | NO audit feed admin | Placeholder / vacío honesto |
| Compartir alumno externo | NO | Disabled |
| Editar alumno | NO PATCH | Disabled |
| Carga masiva CSV | NO | Disabled |
| Descargar QR | SÍ (`qr.png`) | Mantener (Angular ya lo tiene) |
| Copiar/Compartir URL canónica | SÍ (`entrega-manual`) | Mantener |
| Autoridades config | SÍ | Mantener |

---

## 9. Entregable esperado de la nueva sesión (primera respuesta)

Antes de codear, la nueva sesión debe:

1. Confirmar lectura de este prompt.
2. Proponer **empezar por P-01** (o el ciclo que el usuario priorice).
3. Correr `sdd-explore` de ese ciclo con gaps medibles.
4. No mezclar dos pantallas en un solo change.

---

## 10. Contexto de ciclos ya cerrados (no rehacer de cero)

Los ciclos 1–13 funcionales ya archivados (config, emisión, dashboard mesa, login polish, shell, listas, alumno, curso editor, asistencias, cert list, preview, QR delivery).
**Este plan NO los invalida:** es una **capa de paridad visual/UX** encima, corrigiendo desvíos respecto de `muestra_pagina`.

Docs útiles:
- `docs/frontend/*.md` (ciclos archivados)
- `docs/frontend/verificacion-global-ciclos-1-13.md`
- `openspec/changes/archive/2026-07-16-*` y `2026-07-17-*`
- `muestra_pagina/prompts_stitch_v0_ifts14.md` (intención de diseño original)

---

## 11. Prompt corto de arranque (copiar tal cual)

```text
Leé docs/frontend/PROMPT-PARIDAD-MUESTRA-PAGINA.md completo.
Sos el agente SDD de paridad visual Angular ↔ muestra_pagina.
Objetivo: calco de muestra_pagina (no portar React).
Empezá por el ciclo P-01 (shell topbar + sidebar icons) salvo que yo indique otro.
Respetá locks de honestidad API/D0 del documento.
Antes de aplicar: exploration + proposal + spec del ciclo.
Verify obligatorio: test:ci + tsc + build.
No commits sin pedido explícito.
```

---

## 12. Apéndice — Diff rápido botones dashboard (referencia)

```
v0 tiles:  [Nueva certificación] [Nuevo curso] [Cargar asistencias] [Entrega manual] [Carga masiva]
Angular:   [Nueva certificación] [Nuevo curso] [Alumnos]            [Configuración]  [Carga masiva disabled]
```

Fin del prompt de sesión.
