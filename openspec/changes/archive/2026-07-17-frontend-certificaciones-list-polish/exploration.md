## Exploration: frontend-certificaciones-list-polish (Lista de certificaciones — completar)

### Current State
- **v0** (`muestra_pagina/components/admin/lista-certificaciones.tsx`): CTA → `/admin/certificaciones/nueva`; chips validez + **envio** (`entregado` / `pendiente-entrega` / `requiere-nueva-entrega`); columna Entrega con icono; badge validez con dot+borde; empty Inbox + CTA. Seed mock local — `envio` **no** es contrato API.
- **Capturas** `cert-desktop/mobile/390/375`: desktop sanitizado; mobile/375/390 son **emisión** (nueva), no lista. Paridad lista → código v0.
- **Angular** (`CertificationsListPage`): CTA nueva **ya existe**; filtros q + curso select + chips `estado` (borrador/vigente/revocado/vencido); filtrado **client-side** tras `listar()` sin params; tabla 6 cols **sin** Entrega; badge estado plano; empty texto plano; QA harness. Spec afirma `not.toContain('Estado de entrega')`.
- **Modelo** `Certificacion`: id, numero, nombreAlumno, cursoNombre, estado, documentMasked, tokenPrefix, emitidoEn, venceEn. **Sin `envio`.**
- **HTTP** `listar(filtros?)`: query real `estado` / `cursoId` / `alumnoId`; `q`/`curso` client-side. `CertListDto` = status + student/course + dates + tokenPrefix. **Sin delivery/envio.** Backend `certificateListDto` igual. Entrega = solo `GET …/entrega-manual` (pdfStatus), no listado.
- Spec main `admin-certifications-frontend` aún habla de filtro `envio` mock-only — desalineado con HTTP real y con el test actual.

### Affected Areas
- `pages/list/certifications-list-page.{ts,html,css,spec.ts}` — polish UI
- `certifications.models.ts` — solo si se agregara campo real (hoy: no)
- `http-certifications.service.ts` — sin cambio de contrato salvo filtro server `estado` opcional
- Specs delta: alinear “no inventar envio” vs requirement histórico mock

### Approaches
1. **Polish honesto sin envio** — badges validez (dot+borde, labels legibles: Vigente→Válida, etc.); empty Inbox+CTA; CTA/iconos; omitir chips/columna Entrega (o “—” documentado). Pros: honestidad, bajo riesgo, alinea test. Cons: gap visual vs v0 envio. Effort: Low–Med.
2. **Inventar `envio` mock** en seed/UI. Pros: paridad v0. Cons: mentira vs API; viola “NO inventar campos”. Effort: Low, **rechazado**.
3. **Derivar entrega de N×`entrega-manual`/`pdfStatus`**. Pros: dato real parcial. Cons: N+1, no mapea a 3 chips v0, fuera de alcance list polish. Effort: High.

### Recommendation
**Approach 1.** Completar paridad v0 donde hay dato: validez badges, empty+CTA, tipografía/filtros, CTA nueva (ya cableada). **No** chips/columna Entrega activos. Delta-spec: retirar o marcar `envio` como fuera de alcance hasta contrato API. Mapear estados API (4) a labels UI; no forzar el trío v0 validez si no encaja (`vencido` propio).

### Risks
- Spec histórica pide filtro entrega/`envio` — hay que delta-clarificar.
- Confundir capturas emisión con lista.
- Overfetch si alguien “fakea” entrega vía detalle.

### Ready for Proposal
**Yes** — alcance UI polish + honestidad de contrato claro; sin backend.
