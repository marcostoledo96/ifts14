# Exploration: audit-p18-certs-preview

**Cambio**: `audit-p18-certs-preview`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p18-certs-preview`
**Alcance de fase**: `/admin/certificaciones/:id` → `certification-preview-page.{ts,html,css,spec.ts}`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P18; `openspec/specs/admin-certifications-frontend/spec.md` («Previsualización segura y handoff explícito»); paridad honesty P16 (mensaje fijo + Reintentar, **sin** `errorRecuperable`); soft config/entrega/QR ya patternados; AGENTS.md (DNI completo UI; sin PII/token completo en UI visible / logs); hard locks P17 archive / P19–P21 / HTTP

## Exploration: Expediente / preview (P18)

### Current State

`CertificationPreviewPage` es el **expediente administrativo** de una certificación: carga hard de detalle (`obtener`) + soft de config institucional y entrega-manual (`Promise.allSettled`), muestra ficha + réplica tipográfica con firmas (`previewFirma` → object URL; SVG solo si no hay imagen), panel Acciones (PDF / Copiar link / Descargar QR / Regenerar PDF), Enlace de validación (URL truncada + QR), Zona de riesgo (revocar o reemitir).

| Checklist P18 | Estado hoy | Evidencia |
|---|---|---|
| Datos + firmas preview reales (no SVG si hay imagen) | **OK** | `aplicarConfig` → `loadFirmaPreview` si `*SignaturePresent`; HTML `@if (rectorFirmaUrl())` img else SVG; tests «firmas con imagen» / «SVG de respaldo». Soft: fallo de previewFirma no bloquea. |
| Acciones: PDF, entrega, revocar | **OK (con semántica “entrega” = Copiar/QR)** | `Descargar PDF` → `…/:id/pdf`; Copiar link + Descargar QR en Acciones y panel validación; **sin** CTA «Entrega manual» (spec + tests). Revocar → `…/:id/revocar` si vigente. |
| Estado revocado visible | **OK** | Badge + marca `REVOCADO` en réplica; CTAs copy/QR deshabilitados; zona de riesgo con Emitir nuevamente. |
| URL validación truncada; token no completo | **Parcial — leak D0** | UI principal: `entregaUrlMostrada` vía `truncarUrl` (max 60); ficha muestra `tokenPrefix`. **Gap**: tras `regenerarPdf` ok, HTML pinta `r.publicValidationUrl` **completa** (token en claro). |

**Carga y honesty**

```text
effect(id) → cargar()
  allSettled[ obtener(cid), config.obtener(), obtenerEntregaManual(cid) ]
  detR rejected / catch externo → error = (e as Error).message   ← raw
  cfg soft → configPendiente / autoridades + firmas
  ent soft → entregaUrl | entregaError (mensajes fijos es-AR)
  cargarQr soft (silent)
acciones:
  descargarQr catch → qrError = (e as Error).message             ← raw
  regenerarPdf catch → regeneracionError = (e as Error).message  ← raw
```

- **Sin** `errorRecuperable` (locked P18 — no introducir; soft paths ya distinguen hard vs soft).
- Fallo hard de detalle: mensaje (posible raw) + Volver; **sin** botón Reintentar (a diferencia de listado P16).
- `Regenerar PDF` llama seam `certs.regenerarPdf` (tests P6-02); **no** navega a `/pdf`. Spec canónica aún dice que Regenerar DEBE navegar a `/pdf` → **drift** a corregir en delta.

**Qué ya está bien (no reabrir)**

- Soft config/entrega/QR con mensajes controlados.
- Firmas reales cuando hay blob; SVG solo fallback.
- Sin Entrega manual / Compartir; handoff PDF y revocar por `routerLink`.
- DNI completo en `documentMasked`; tokenPrefix (no token full) en ficha.
- Tests amplios (~980 líneas): truncado, soft entrega, firmas, revocado, regenerar ok/error/pending.

**Residuos / gaps (top)**

1. **Honesty** — raw `(e as Error).message` en `detR` rejected, `cargar` catch, `descargarQr`, `regenerarPdf`.
2. **D0 leak** — `regeneracionResultado.publicValidationUrl` renderizada completa en Acciones.
3. **Spec drift** — «Regenerar PDF DEBE navegar a `/pdf`» vs implementación API; falta exigir honesty + no URL completa post-regen + Reintentar opcional en load hard.
4. **Tests** — faltan asserts anti-raw en load/QR/regen error; anti-leak URL post-regen (hoy el test de regen ok **fija** URL completa en fixture).
5. **Fuera de alcance** — no tocar archive P17 uncommitted; no P19 PDF folio; no P20 delivery rewrite; no P21 revoke; no HTTP/backend; no rotación token.

### Affected Areas

- `apps/frontend-angular/.../preview/certification-preview-page.ts` — mensajes fijos / `mensajeErrorApi` local (sin `errorRecuperable`); no pintar URL canónica full en UI de regen.
- `apps/frontend-angular/.../preview/certification-preview-page.html` — quitar o truncar `r.publicValidationUrl`; opcional Reintentar en bloque `error()` (mismo patrón listado, sin flag).
- `apps/frontend-angular/.../preview/certification-preview-page.spec.ts` — honesty + D0 post-regen; no debilitar firmas/acciones/revocado.
- `openspec/specs/admin-certifications-frontend/spec.md` — delta MODIFIED «Previsualización segura y handoff explícito».
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — checkboxes P18 en apply/archive (no en explore).
- **No tocar**: archive P17 uncommitted (`openspec/changes/archive/2026-07-29-audit-p17-certs-nueva/`, docs/spec ya modificados en working tree); PDF page (P19); delivery (P20); revoke (P21); `http-*.service`; backend.

### Approaches

1. **Auditoría quirúrgica (recomendada)** — Honesty sin `errorRecuperable` + cerrar leak D0 post-regen + alinear spec Regenerar=API + tests + delta MODIFIED. Sin HTTP.
   - Pros: cierra checklist P18; paridad honesty con P16 (mensaje fijo ± Reintentar); blast radius acotado.
   - Cons: no rediseña réplica ni toca folio PDF.
   - Effort: Low

2. **Solo documentar hallazgo** — PLAN + nota en docs; cero código.
   - Pros: diff mínimo.
   - Cons: deja raw `Error.message` y leak de URL canónica post-regen.
   - Effort: Low (incompleto)

3. **Reescribir handoff PDF/entrega** — Unificar Regenerar→navigate `/pdf`, reintroducir Entrega manual, o tocar delivery/revoke.
   - Pros: un solo camino visual.
   - Cons: contradice tests P6-02, spec «sin Entrega manual», hard locks P19–P21.
   - Effort: Medium–High (**bloqueado**)

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Honesty** — mensajes fijos es-AR (o `mensajeErrorApi` envelope/genérico) en load hard detalle, `descargarQr` y `regenerarPdf`; **sin** raw `Error.message`; **sin** introducir `errorRecuperable`.
2. **Reintentar (opcional recomendado)** — botón que llame `cargar()` en fallo hard de detalle (paridad P16, sin flag).
3. **D0** — no mostrar `publicValidationUrl` completa tras regenerar; solo mensaje ok + nota de permanencia QR (clipboard sigue usando canónica fuera de UI truncada).
4. **Conservar** firmas reales, acciones PDF/Copiar/QR/Revocar, soft config/entrega, estado revocado, URL truncada en panel validación.
5. **Spec** — delta MODIFIED `admin-certifications-frontend` / «Previsualización segura…»: Regenerar vía seam (no navegar a `/pdf`); honesty; no URL completa en UI de regen.
6. **Hard locks** — no revertir/tocar P17 archive uncommitted; no P19–P21; no HTTP/backend; no token rotation; DNI full UI; sin PII en logs.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (page + tests + delta) — **sí**.
2. Spec target = **`admin-certifications-frontend`** / MODIFIED «Previsualización segura y handoff explícito» — **sí**.
3. Honesty sin raw `Error.message` en cargar/detR, descargarQr, regenerarPdf — **sí**.
4. **No** introducir `errorRecuperable` — **sí (hard lock)**.
5. Soft config/entrega/QR ya patternados — **no reescribir** — **sí**.
6. Cerrar leak: no renderizar `publicValidationUrl` completa post-regen — **sí**.
7. Regenerar PDF = seam API (no navigate `/pdf`); Descargar PDF = navigate `/pdf` — **sí** (alinear spec).
8. Acciones entrega = Copiar link + Descargar QR; **sin** CTA «Entrega manual» — **sí**.
9. Reintentar en error hard de detalle (sin flag) — **sí (recomendado)**.
10. No P17 archive / P19 / P20 / P21 / HTTP / backend / token rotation — **sí (hard lock)**.

### Questions (para propose)

1. Confirmar defaults 1–10 (recomendado: aceptar todos).
2. ¿Texto fijo load hard? Propuesta: *«No se pudo cargar la certificación.»* (+ fallback id inválido ya existente) — **sí**.
3. ¿Reintentar en panel error? (**recomendado: sí**, patrón listado).
4. Post-regen: ¿ocultar URL por completo o mostrar `truncarUrl(...)`? (**recomendado: ocultar**; basta mensaje ok + nota permanente).

### Risks

- Mostrar URL canónica post-regen → token en UI (falla D0 / checklist P18).
- Introducir `errorRecuperable` → contradice lock P18 y confunde soft vs hard.
- “Arreglar” Regenerar navegando a `/pdf` → rompe tests P6-02 y semántica de regeneración backend.
- Tocar delivery/PDF/revoke pages → viola hard locks P19–P21.
- Editar o revertir archive P17 uncommitted en esta rama → mezcla de ciclos.
- Ampliar honesty a HTTP services → viola no-HTTP.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `certification-preview-page.*`: cerrar honesty (sin `errorRecuperable`) + leak D0 post-regen + delta MODIFIED en `admin-certifications-frontend`; **sin** HTTP, sin P17 archive, sin P19–P21.
