# Exploration: audit-p16-certs-list

**Cambio**: `audit-p16-certs-list`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p16-certs-list`
**Alcance de fase**: listado `/admin/certificaciones` → `certifications-list-page.{ts,html,css,spec.ts}`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P16; `openspec/specs/admin-certifications-frontend/spec.md` (Listado…); paridad honesty de listados admin (cursos/alumnos) y `errorRecuperable` P13–P15 solo si aplica; AGENTS.md (DNI completo UI; sin PII en logs; token/QR permanente); intención visual `muestra_pagina/components/admin/lista-certificaciones.tsx` (no portar React)

## Exploration: Listado de certificaciones (P16)

### Current State

`CertificationsListPage` es el archivo documental admin: carga `CERTIFICATIONS_SOURCE.listar()` (HTTP o in-memory), filtra **client-side** por texto (`q`), estado (`vigente`/`revocado`) y curso (nombre), pagina de a `PAGINA_TAMANO` (20), distingue vacío total / sin coincidencias / carga / error, y enlaza a expediente + PDF. Labels: `vigente` → **Válida**, `revocado` → **Revocado**. `documentMasked` (nombre histórico D0) se muestra y se busca como DNI completo. Catch de carga usa mensaje fijo es-AR + `onReintentar` (sin raw `Error.message`). Harness QA solo en dev/tests.

| Checklist P16 | Estado hoy | Evidencia |
|---|---|---|
| Filtros vigente/revocado + curso + texto | **OK** | Chips `data-estado`, select de cursos derivados del seed/lista, search por alumno/curso/`documentMasked`/número; tests de combinación y limpieza. |
| DNI según política (completo en UI) | **OK** | Template `DNI {{ c.documentMasked }}`; test anti-token + assert `12345678`; sin `console.*` ni PII en catch. |
| Paginación, vacíos, labels Válida/Revocado | **Parcial** | Vacíos + labels OK y testeados. Pager hardcodea `[1..5]` (no `paginasVisibles`); con >5 páginas no se alcanza página 6+. Resumen de conteo visible también durante carga. |

**Comportamiento técnico vigente**

- Ruta: `/admin/certificaciones` (CER-01). CTA «Nueva certificación» → `/admin/certificaciones/nueva` (solo enlace; **no** auditar P17).
- Carga: `loadGeneration` + `recargar()`; descarta respuestas stale; catch → «No se pudo cargar el listado de certificaciones. Reintentá.»; panel con Reintentar (siempre recuperable en listado; no hay not-found de `:id`).
- Filtros: client-side sobre el array cargado; `listar()` sin params desde la página (HTTP acepta `estado`/`cursoId` pero la UI no los usa server-side — fuera de alcance tocar HTTP).
- UI: tabla desktop + cards mobile; badges `validez-badge--{estado}`; sin filtro «Estado de entrega» (tests lo prohiben explícitamente).
- Honesty vs P13–P15: listados hermanos (cursos/alumnos) usan el mismo patrón `error` string + Reintentar, **no** `errorRecuperable`. Ese flag aplica a páginas con not-found vs catch. Aquí no hay camino no recuperable → **no hace falta renombrar**.
- Spec canónica `admin-certifications-frontend`: requisito «Listado mock-only…» aún habla de mocks, `borrador`/`vencido` y filtro por entrega — **desfasado** respecto al código HTTP + `EstadoCertificado = vigente | revocado`.

**Paridad visual (intención, no port)**

`muestra_pagina` conserva chips de **Estado de entrega** y validez `pendiente`. Angular ya eligió no portarlos (modelo real sin `envio`; estados solo vigente/revocado). Mantener divergencia intencional. Copy de kicker/título/subtítulo y labels Válida/Revocado ya alineados.

**Residuos / gaps**

1. **Paginación >5 páginas** — `@for (page of [1, 2, 3, 4, 5])` en desktop y móvil; cursos/alumnos/asistencias usan `paginasVisibles` (ventana + elipsis). Gap real si el archivo crece.
2. **Resumen durante carga** — `results-summary` no está gated por `!cargando()` (hermanos usan `mostrarResumen`); puede mostrar «0 certificaciones…» junto al skeleton.
3. **Copy gramatical** — «1 certificación **coinciden**» (test actual fija el error); conviene «coincide» / «coinciden» según singular/plural.
4. **Spec desfasada** — delta MODIFIED del requisito de listado: HTTP/seam, filtros vigentes (estado+curso+texto), DNI completo, sin entrega/borrador/vencido en listado, honesty de carga, QA harness.
5. **Tests** — cobertura fuerte de filtros/QA/DNI; faltan: `paginasVisibles` con >5 páginas (si se agrega), resumen oculto en carga, grammar; opcional assert de mensaje catch sin raw message (ya implícito).
6. **Fuera de alcance explícito** — no tocar P15 archive uncommitted; no P17–P21; no HTTP/backend; no rotación token/QR; no restaurar filtro de entrega de v0.

### Affected Areas

- `apps/frontend-angular/.../certifications/pages/list/certifications-list-page.ts` — `paginasVisibles`; `mostrarResumen` (o equivalente); copy singular/plural; **sin** `errorRecuperable` salvo decisión en contrario.
- `apps/frontend-angular/.../certifications/pages/list/certifications-list-page.html` — pager con `paginasVisibles`; gate del resumen; texto de conteo.
- `apps/frontend-angular/.../certifications/pages/list/certifications-list-page.spec.ts` — tests de gaps; actualizar assert gramatical; no debilitar anti-token/DNI ni «sin Estado de entrega».
- `apps/frontend-angular/.../certifications/pages/list/certifications-list-page.css` — solo si el pager con elipsis requiere estilo mínimo (evitar rediseño).
- `openspec/specs/admin-certifications-frontend/spec.md` — delta corto MODIFIED del requisito de listado (alineación con realidad HTTP + filtros + honesty).
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — checkboxes P16 en apply/archive (no en explore).
- **No tocar**: archivos P15 archive/`openspec/specs/admin-attendances-frontend` (salvo regresión ajena); `http-certifications.service.ts`; páginas nueva/preview/pdf/entrega/revocar; backend.

### Approaches

1. **Auditoría quirúrgica de página (recomendada)** — Cerrar gaps de paginación (`paginasVisibles`), resumen gated, copy singular/plural; tests mínimos; delta MODIFIED en `admin-certifications-frontend` para el requisito de listado. Conservar filtros/labels/DNI/QA/honesty actuales. Sin HTTP.
   - Pros: cierra checklist P16 y drift de spec; paridad con listados admin; blast radius acotado; presupuesto bajo 400 LOC.
   - Cons: no portar filtro de entrega de v0 (intencional).
   - Effort: Low

2. **Honesty rename a `errorRecuperable`** — Además del enfoque 1, renombrar el patrón de listado al flag P13–P15.
   - Pros: naming uniforme en todo el admin.
   - Cons: cosmético; listados no tienen not-found; ruido en diff y tests; sin ganancia UX.
   - Effort: Low–Medium (ruido innecesario)

3. **Restaurar paridad v0 (filtro entrega + estados borrador/pendiente)** — Ampliar modelo/UI hacia `muestra_pagina`.
   - Pros: paridad visual literal.
   - Cons: modelo/API no exponen `envio` ni borrador en listado; contradice tests actuales; scope creep / posible backend; hard lock «no HTTP».
   - Effort: High

### Recommendation

Adoptar **enfoque 1** por defecto. Alcance propuesto para `sdd-propose`:

1. **Checklist como aceptación (no romper)**
   - Filtros vigente/revocado + curso + texto; DNI completo vía `documentMasked`; vacíos total/sin coincidencias; labels Válida/Revocado; CTA nueva; enlaces detalle/PDF; QA harness solo fuera de prod; sin token/PII en logs/mensajes.
2. **Cierres quirúrgicos**
   - `paginasVisibles` (paridad cursos/alumnos/asistencias).
   - Gate de resumen mientras carga (`mostrarResumen` o `!cargando() && !error()`).
   - Copy singular/plural del conteo.
3. **Honesty**
   - Mantener mensaje fijo + Reintentar en catch (paridad listados). **No** introducir `errorRecuperable` en P16.
4. **Spec**
   - Delta MODIFIED: requisito de listado en `admin-certifications-frontend` (nombre sugerido conservar heading o renombrar a «Listado admin de certificaciones» si propose lo prefiere; contenido = HTTP/seam, filtros reales, DNI, vacíos, pager 20, honesty, QA).
5. **HTTP / backend / otras fases**
   - No modificar `HttpCertificationsService` ni backend; no P17–P21; no tocar artefactos P15 uncommitted.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (página + tests + delta corto) — **sí**.
2. Agregar `paginasVisibles` (máx. 5 botones + elipsis) — **sí**.
3. Gate del resumen de conteo mientras `cargando`/`error` — **sí**.
4. Fix copy «coincide» / «coinciden» + actualizar test — **sí**.
5. **No** renombrar a `errorRecuperable` (paridad listados, no detalle) — **sí (locked)**.
6. **No** restaurar filtro «Estado de entrega» ni estados borrador/vencido/pendiente en listado — **sí (locked)**.
7. Spec target = **`admin-certifications-frontend`** (MODIFIED requisito de listado) — **sí**.
8. Prohibido tocar P15 archive uncommitted, P17–P21, HTTP/backend, token/QR — **sí (hard lock)**.

### Questions (para propose)

1. Confirmar defaults 1–8 (recomendado: aceptar todos).
2. ¿Renombrar el heading del requisito de «Listado mock-only…» a «Listado admin de certificaciones» en el mismo MODIFIED? (**recomendado: sí**, deja de mentir «mock-only»).
3. ¿Algún cambio de copy del empty o del panel de error? (**recomendado: no**, salvo typo).

### Risks

- Restaurar filtros de entrega/v0 sin datos de API → UI muerta o scope HTTP.
- Forzar `errorRecuperable` sin not-found → diff cosmético y confusión con P13–P15.
- Tocar `http-certifications.service` «para optimizar filtros» → viola hard lock y acopla P16 a backend.
- Modificar o revertir archivos P15 uncommitted en esta rama → mezcla de ciclos / PR confuso.
- Ampliar a preview/PDF/nueva (P17–P19) vía «pequeños ajustes de enlace» → scope creep.
- Pager con elipsis mal testeado → regresiones al navegar páginas altas.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `certifications-list-page.*`: checklist mayormente OK; cerrar paginación/resumen/copy; delta MODIFIED en `admin-certifications-frontend`; honesty de listado **as-is**; **sin** HTTP, sin P15/P17–P21, sin filtro de entrega v0.
