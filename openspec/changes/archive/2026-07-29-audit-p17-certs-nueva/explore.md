# Exploration: audit-p17-certs-nueva

**Cambio**: `audit-p17-certs-nueva`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p17-certs-nueva`
**Alcance de fase**: `/admin/certificaciones/nueva` → `certification-new-page.{ts,html,css,spec.ts}`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P17; `openspec/specs/admin-certifications-frontend/spec.md` (Emisión directa + Emisión desde hub); paridad honesty P13–P15 (`errorRecuperable` / `mensajeErrorApi`); flujo P14 `attendance-marking-page` → P15 `date-certificates-page`; AGENTS.md (DNI completo UI; sin PII en logs; token/QR permanente); guía admin («emisión directa es alternativa»)

## Exploration: Nueva certificación (P17)

### Current State

`CertificationNewPage` es la **emisión manual puntual** (un par alumno+curso): carga catálogos (cursos activos, alumnos activos, config institucional), preselección no bloqueante `?alumno=` / `?curso=`, evalúa elegibilidad (`listarFechas` + `listarAsistenciasPorPar` + `listar({ estado:'vigente', cursoId, alumnoId })`), muestra preview tipográfica (sin folio/QR inventados) y hace `POST`-equivalente vía `CERTIFICATIONS_SOURCE.emitir({ alumnoId, cursoId, issuedAt, expiresAt:null })` → navega al expediente.

| Checklist P17 | Estado hoy | Evidencia |
|---|---|---|
| Flujo emisión manual vs atajos desde asistencias | **OK (rol claro en código/spec; copy de página débil)** | Camino habitual: hub fecha → «Guardar y generar» (`attendance-marking-page.guardarYGenerar`) → `…/asistencias/certificados`. Nueva: CTA listado/dashboard/ficha alumno (`?alumno=`), casos edge post-revocación / fuera del hub. Spec: «Nueva… permanece para casos edge». Guía admin alineada. **La pantalla NO está obsoleta.** |
| Validaciones y errores | **Parcial** | Client gates: sin fechas `realizada`, sin presentes, duplicado vigente (`avisoDuplicado` bloquea `puedeEmitir`), sin email (warn, no bloquea). Emit: 409/400/500 con mensajes fijos. **Honesty rota**: `(e as Error).message` en `cargarCatalogos`, `cargarPar` y rama else de `onEmitir`. `errorPar` sin Reintentar. |
| ¿Necesaria / copy confuso? | **Necesaria; copy confuso en subtítulo** | Mantener pantalla. «certificado complementario» + «Emisión preliminar» no explican que el flujo habitual sale de Asistencias; dashboard/listado empujan a Nueva sin contexto. Ajuste mínimo de copy (no eliminar). |

**Dos caminos de emisión (mismo seam `emitir`)**

```text
Habitual (P14→P15):
  Curso → Fecha → marcar presentes → «Guardar y generar certificados»
    → emitir|regenerarPdf en serie → /admin/cursos/:id/fechas/:fechaId/asistencias/certificados

Edge / manual (P17):
  /admin/certificaciones/nueva [?alumno=&curso=]
    → elegir par → Emitir → /admin/certificaciones/:id
```

Atajos hacia Nueva (no desde el hub de marcado): listado CTA, dashboard, ficha alumno (`queryParams: { alumno }`), preview revocado (CTAs a nueva). El marcado de asistencias **no** navega a `/nueva`; emite en lote y va a certificados-por-fecha.

**Comportamiento técnico vigente**

- Ruta estática `certificaciones/nueva` **antes** de `:id` (tests de routes).
- Body de emisión canónico de 4 campos; `issuedAt` = `hoyBuenosAires()`; `expiresAt` null.
- Elegibilidad: filas de asistencia en fechas `realizada` (el API solo persiste presentes; no hay flag `presente` en el DTO front).
- DNI completo vía `dniMostrar` en chip/preview; QR decorativo sin datos personales; sin token completo.
- Catálogos: skeleton + panel error con Reintentar (pero mensaje puede ser raw).
- Par: `loadGen` anti-stale; errores en aside; sin botón Reintentar para `errorPar`.
- Tests existentes: no-wizard, activos, preview sin folio, bloqueos sin realizadas/sin presentes, emit+navigate, 409/400, query preselect. **Sin** asserts honesty / `mensajeErrorApi` / Reintentar en par.

**Honesty vs P13–P15**

| Superficie | Hoy | Paridad esperada (P15/P14) |
|---|---|---|
| Carga catálogos | Reintentar sí; `(e as Error).message` | Mensaje fijo es-AR (+ Reintentar). Flag recuperable opcional (solo catch). |
| Carga par (elegibilidad) | Raw message; **sin** Reintentar | Mensaje fijo + Reintentar; `errorRecuperable` solo en catch de load. |
| Emitir (acción) | 409/400/500 fijos; else → raw message | Status map + `mensajeErrorApi` / genérico; **sin** raw `Error.message`; sin Reintentar de load. |

**Hallazgo de necesidad de pantalla**

- **Conservar.** Spec + guía + CTAs de ficha alumno / post-revocación la justifican.
- **No eliminar** sin acuerdo humano (hard lock PLAN).
- Ajuste mínimo: subtítulo (y opcional nota CTA) que diga que es emisión puntual / alternativa al flujo desde Asistencias; suavizar o reemplazar «complementario» si confunde.

**Residuos / gaps (top)**

1. **Honesty** — raw `Error.message` en tres catch paths; `errorPar` sin Reintentar.
2. **Copy de rol** — subtítulo no posiciona vs Asistencias; «complementario» ambiguo.
3. **Spec delgada** — «Emisión directa…» no exige honesty ni copy de rol edge vs hub.
4. **Tests** — faltan honesty (catálogos/par/emit else) y copy/rol si se toca subtítulo.
5. **Fuera de alcance** — no P16 archive uncommitted; no P18–P21; no HTTP/backend; no rotación token; no cambiar flujo P14.

### Affected Areas

- `apps/frontend-angular/.../certifications/pages/new/certification-new-page.ts` — honesty (`mensajeErrorApi` / mensajes fijos; `errorRecuperable` en loads); opcional copy helpers.
- `apps/frontend-angular/.../certifications/pages/new/certification-new-page.html` — subtítulo/nota de rol; Reintentar en error de par; mensajes controlados.
- `apps/frontend-angular/.../certifications/pages/new/certification-new-page.spec.ts` — tests honesty + copy mínimo; no debilitar anti-folio / 409 / query.
- `apps/frontend-angular/.../certifications/pages/new/certification-new-page.css` — solo si el botón Reintentar de par necesita estilo ya existente (reusar `.btn-retry`).
- `openspec/specs/admin-certifications-frontend/spec.md` — delta MODIFIED «Emisión directa de certificación (pantalla nueva)» (+ mención de rol edge si hace falta en el mismo requisito o nota en «Emisión desde hub»).
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — checkboxes P17 en apply/archive (no en explore).
- **No tocar**: listado (P16), preview/PDF/entrega/revocar (P18–P21), `attendance-marking-page` / `date-certificates-page`, `http-*.service`, backend, artefactos uncommitted del archive P16 en esta rama.

### Approaches

1. **Auditoría quirúrgica (recomendada)** — Honesty P15-like en loads/emit + copy mínimo de rol (mantener pantalla) + tests + delta MODIFIED en `admin-certifications-frontend`. Sin HTTP.
   - Pros: cierra checklist P17; paridad honesty; blast radius acotado; presupuesto bajo 400 LOC.
   - Cons: no rediseña preview ni unifica UX con hub.
   - Effort: Low

2. **Solo documentar hallazgo (sin código)** — PLAN + delta docs; cero cambios de página.
   - Pros: diff mínimo.
   - Cons: deja raw `Error.message` (regresión vs P13–P15); copy sigue confuso.
   - Effort: Low (pero incompleto para auditoría)

3. **Deprecar / ocultar CTA Nueva** — Reducir superficie dejando solo flujo Asistencias.
   - Pros: menos caminos.
   - Cons: contradice spec «casos edge», ficha alumno, post-revocación; requiere acuerdo humano; scope creep a listado/dashboard/P18.
   - Effort: Medium–High (bloqueado sin acuerdo)

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Pantalla necesaria** — documentado; **no eliminar**; CTAs existentes se conservan.
2. **Honesty** — mensajes fijos / `mensajeErrorApi` sin raw `Error.message`; Reintentar en catálogos (ya) y en fallo de par; `errorRecuperable` solo para loads recuperables (paridad P15).
3. **Copy mínimo** — subtítulo (y opcional `cta-note`) que aclare emisión puntual vs flujo habitual desde Asistencias; reemplazar o contextualizar «complementario».
4. **Validaciones** — conservar gates actuales (duplicado, sin realizadas, sin presentes, sin email warn); no reabrir semántica backend.
5. **Spec** — delta MODIFIED `admin-certifications-frontend` / «Emisión directa…» (honesty + rol edge). **No** tocar `admin-certificate-emission` (backend) salvo que propose descubra gap HTTP crítico (no hallado).
6. **Hard locks** — no P16 files uncommitted; no P18–P21; no HTTP/backend; no token rotation; DNI completo UI; sin PII en logs.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (página + tests + delta corto) — **sí**.
2. Pantalla **se mantiene**; no deprecar CTAs; no eliminar ruta — **sí (locked)**.
3. Honesty: sin raw `Error.message` en catálogos / par / emit else; Reintentar en error de par — **sí**.
4. Introducir `errorRecuperable` **solo** en catch de loads (catálogos y/o par), no en emit — **sí** (paridad P15).
5. `mensajeErrorApi` (envelope o genérico es-AR) para emit else / no-mapeados — **sí**.
6. Copy mínimo de rol vs Asistencias en subtítulo (y opcional nota CTA); no rediseño visual — **sí**.
7. Spec target = **`admin-certifications-frontend`** (MODIFIED «Emisión directa…») — **sí**.
8. **No** modificar `admin-certificate-emission` ni HTTP/backend en este ciclo — **sí (hard lock)**.
9. **No** tocar P16 archive uncommitted, P14 marking, P15 date-certs, P18–P21 — **sí (hard lock)**.

### Questions (para propose)

1. Confirmar defaults 1–9 (recomendado: aceptar todos).
2. ¿Texto sugerido de subtítulo? Propuesta: *«Emisión puntual de un certificado para un alumno y un curso. El flujo habitual es marcar asistencias en una fecha y generar desde ahí.»* (**recomendado: sí**, o variante equivalente es-AR).
3. ¿Quitar la palabra «complementario» del subtítulo/CTA note? (**recomendado: sí**, o dejarla solo donde el producto institucional lo use de forma consciente).
4. ¿Link inline a `/admin/asistencias` o solo copy? (**recomendado: solo copy** en P17 para no mezclar navegación con P14).

### Risks

- Eliminar o ocultar Nueva sin acuerdo → rompe ficha alumno / edge post-revocación / spec.
- Tocar HTTP «para mensajes mejores» → viola hard lock; honesty es 100% front.
- Introducir `errorRecuperable` en emit → confunde Reintentar de load con reintento de POST.
- Editar o revertir archive P16 uncommitted en esta rama → mezcla de ciclos.
- Ampliar a preview/PDF (P18/P19) por «enlace desde nueva» → scope creep.
- Over-copy que contradiga la guía admin → drift; alinear con la frase ya existente en guide.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `certification-new-page.*`: pantalla **necesaria** (edge); cerrar honesty P15-like + copy mínimo de rol vs Asistencias; delta MODIFIED en `admin-certifications-frontend`; **sin** HTTP, sin P16/P14/P15/P18–P21, sin eliminación de ruta.
