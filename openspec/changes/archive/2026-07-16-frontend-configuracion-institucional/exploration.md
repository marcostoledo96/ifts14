## Exploration: Configuración institucional (nueva pantalla Angular)

### Current State

**Backend (contrato real, no inventar campos)**

- Endpoint: `GET` / `PUT` `/admin/configuracion-institucional` (no `/api/admin/configuracion`).
- Auth admin (sesión / `X-Admin-Key` según gate vigente).
- Envelope: `{ data, meta: { requestId } }`.
- `data` (DTO único, fila `cert_configuracion_institucional.id = 1`):

| Campo API | Tipo | Notas |
|-----------|------|--------|
| `institutionName` | string | Obligatorio en PUT; no vacío. Máx. 160. |
| `certificateText` | string \| null→fallback | Máx. 255. |
| `rectorName` | string | Máx. 160; vacío → fallback `''`. |
| `rectorRole` | string | Máx. 80; default `Rector/a`. |
| `advisorName` | string | Máx. 160. |
| `advisorRole` | string | Máx. 80; default `Asesor/a Pedagógica`. |
| `updatedAt` | string \| null | Solo lectura en respuesta. |

- Fuente: `AdminInstitutionalConfigService`, `InstitutionalConfig`, `docs/backend/01-contrato-api-certificados.md`, tests `AdminCertificadosConsultaHttpTest.php`.
- **No existen** en backend: logos, firmas digitales/archivos, email de contacto, título de certificado, formato de número, link QR, sello, textos de validación pública, sitio web.

**Frontend Angular hoy**

- Feature parcial en `apps/frontend-angular/src/app/features/admin/institutional-config/`:
  - `institutional-config.service.ts` — modelo reducido `{ nombre, direccion, logoUrl }` + `obtener()`; token `INSTITUTIONAL_CONFIG_SOURCE`.
  - `http-institutional-config.service.ts` — solo GET; mapea `institutionName→nombre`; fuerza `direccion`/`logoUrl` a `null` (comentario explícito: backend sin esos campos); **descarta** `certificateText`, autoridades y `updatedAt`.
  - Specs solo cubren GET / errores HTTP / token.
- Provider HTTP colgado en `app.routes.ts` (árbol `admin`), **sin** `useRealApi` switch (siempre `HttpInstitutionalConfigService`).
- **No hay** página/componente de UI, **no hay** ruta `admin/configuracion` (ni `configuracion-institucional`).
- Sidebar Angular (`sidebar-admin.ts`): ítems Inicio, Cursos, Alumnos, Asistencias, Certificaciones. **Sin** ítem Configuración.
- El seam no lo consume ninguna pantalla admin (solo está cableado y testeado).

**Referencia visual (`muestra_pagina`)**

- Componente: `muestra_pagina/components/admin/configuracion-institucional.tsx` (ruta conceptual `/admin/configuracion`).
- Sidebar React: ítem “Configuración” → `/admin/configuracion`.
- Prompt §22 en `prompts_stitch_v0_ifts14.md`: 5 secciones + avisos de impacto + barra previa de firmas.
- Capturas `cfg-*.png`: existen pero son **stubs casi monócromos** (~6–7 KiB, ~195 colores, sin UI legible). La fuente UX operativa es el TSX + el prompt, no las PNG.

### Qué falta

| Pieza | Estado |
|-------|--------|
| Página Angular (form + secciones + sticky bar) | Ausente |
| Ruta `/admin/configuracion` bajo shell admin | Ausente |
| Ítem sidebar “Configuración” + `isActive` | Ausente |
| Modelo alineado al DTO backend | Parcial / desalineado |
| Método `guardar` / PUT en el seam | Ausente |
| Mock in-memory opcional (`useRealApi`) | Ausente (otros features sí lo tienen) |
| Tests de página + PUT | Ausentes |

### Discrepancias con la referencia visual

La maqueta React es un mock local amplio. Comparación:

| Sección / campo (v0) | Backend | Angular actual | Para este ciclo |
|----------------------|---------|----------------|-----------------|
| Nombre instituto | `institutionName` | Parcial (`nombre`) | Incluir |
| Logos (5 slots + upload) | No | `logoUrl` stub null | Fuera de scope (no inventar) |
| Texto institucional base | No (solo `certificateText`) | — | No confundir con `certificateText` |
| Título cert / formato nº / link QR / texto QR / sello | No | — | Fuera de scope |
| Texto base certificado | `certificateText` | Descartado en HTTP | Incluir |
| Rector/asesor nombre+cargo | Sí | Descartado | Incluir |
| Firma digital upload + preview SVG | No | — | Preview tipográfica con nombres/cargos reales; upload fuera |
| Email contacto + avisos “sin SMTP” | No persistencia | — | Copy informativo OK; campo editable no |
| Mensajes validación pública | No | — | Fuera de scope |
| Dirty / Descartar / Guardar sticky | UX mock | — | Incluir contra GET/PUT real |
| Nav lateral por anclas `#sección` | UX | — | Incluir si hay ≥2 secciones |

Principio alineado a P6-03: **paridad visual del chrome y de campos sustentados; no portar edición de datos sin persistencia**.

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/institutional-config/*` — ampliar modelo, DTO, GET mapping, agregar PUT; specs.
- `apps/frontend-angular/src/app/app.routes.ts` — child `configuracion` + (opcional) mock/HTTP según `useRealApi`.
- `apps/frontend-angular/src/app/features/admin/sidebar-admin.ts|html|spec.ts` — ítem + active prefix.
- Nueva página: p.ej. `.../institutional-config/pages/institutional-config-page.{ts,html,css,spec.ts}` (inglés en código).
- Tests de rutas (`app.routes.spec.ts`) y shell si asumen lista fija de nav.
- Docs en archive: `docs/frontend/` (no en este explore).

Patrón de página editable existente: `course-editor-page` (signals, guardar, loading/error) — reutilizar estilo, no wizard.

### Approaches

1. **Pantalla sustentada (recomendado)** — Ruta + sidebar + UI con chrome v0 (header “Folio institucional”, banner de impacto, secciones, sticky dirty/save/discard) y **solo campos del DTO**. Preview de firmas con nombre/cargo (sin upload). Secciones no sustentadas: omitir o bloque informativo estático (sin inputs falsos). Ampliar seam a modelo completo + `guardar()`.
   - Pros: honesto con el API; cumple AGENTS/P6-03; valor real para Bedelía; paridad del layout útil.
   - Cons: menos “lleno” que la maqueta v0; hay que comunicar omisiones en verify.
   - Effort: Medium.

2. **Paridad visual completa con estado local** — Portar las 5 secciones editables; solo persistir los 6 campos API.
   - Pros: screenshots cercanos a v0.
   - Cons: campos fantasma (misma clase de deuda que P6-03); confunde a Bedelía; tests engañosos.
   - Effort: High.

3. **Formulario mínimo sin chrome v0** — Una card con 6 inputs y un botón Guardar.
   - Pros: churn bajo.
   - Cons: falla criterio de paridad visual obligatorio del repo.
   - Effort: Low.

### Recommendation

**Approach 1** para PROPOSE/scope del ciclo:

1. Extender `InstitutionalConfig` al DTO real (nombres en inglés en código; copy UI en español).
2. `obtener()` + `guardar(payload)` vía `PUT`; mapear 1:1 con API; eliminar o no exponer `direccion`/`logoUrl` inventados.
3. Página `/admin/configuracion` lazy bajo `AdminShell`.
4. Ítem sidebar “Configuración” (pie o lista principal, como en React).
5. UX: banner de impacto, nav anclas si aplica, sticky bar, validación cliente alineada a límites PHP, estados loading/error/éxito.
6. **Fuera de scope explícito**: upload logos/firmas, email persistido, mensajes de validación pública, formato de numeración, sello, link base QR.
7. Tests: HTTP GET/PUT mapping; página dirty/save/discard; ruta + sidebar active; sin secretos.

Idioma: artefactos SDD en español argentino; código futuro en inglés.

### Risks

- Desalineación modelo actual (`nombre`/`direccion`/`logoUrl`) vs DTO: hay que migrar el seam sin romper specs existentes.
- Capturas `cfg-*.png` no sirven para verify visual; anclar a TSX + prompt §22 + screenshots vivos del Angular.
- Expectativa de “paridad total” con v0 vs backend incompleto — mitigar con scope escrito en proposal.
- Provider siempre-HTTP (sin mock): en `useRealApi=false` la página fallará sin API; valorar mock in-memory o gate explícito.
- Sticky bar + shell (`lg:pl-64` en React) requiere cuidado con layout Angular existente.
- PUT vacío/`institutionName` blank → `400 VALIDATION_ERROR`; UI debe manejarlo.
- Ciclos P6 paralelos tocando sidebar/routes pueden generar conflictos.

### Ready for Proposal

**Yes.** Scope claro, contrato backend documentado, gap de UI/ruta/sidebar confirmado, recomendación de no inventar campos.

Próximo paso orquestador: `sdd-propose` para `frontend-configuracion-institucional`.
