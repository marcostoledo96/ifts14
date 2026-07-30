# Exploration: audit-p21-certs-revocar

**Cambio**: `audit-p21-certs-revocar`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p21-certs-revocar`
**Alcance de fase**: `/admin/certificaciones/:id/revocar` → `certification-revoke-page.{ts,html,css,spec.ts}`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P21; `openspec/specs/admin-certificate-revocation/spec.md` (API backend); `openspec/specs/admin-certifications-frontend/spec.md` (expediente → `…/revocar`); paridad honesty P15/P18/P20 (`mensajeErrorApi`, `errorRecuperable` load-only); hard locks: D0; leave P20 archive alone; no P20 delivery rewrite; no P22 public validation rewrite; prefer front-only

## Exploration: Revocación (P21)

### Current State

`CertificationRevokePage` es el diálogo modal de revocación: carga `obtener(cid)`; ficha (alumno, DNI D0 completo vía `documentMasked`, curso, número); banner de consecuencias (estado público / QR); motivo obligatorio (min 12 / max 400); checkbox de confirmación explícita; sanitiza motivo (DNI/token UUID/email → placeholders) antes de `certs.revocar`; POST body `{ reason }` (HTTP); éxito → navigate expediente `?revocada=1`; Escape + focus trap; deep-link no vigente bloquea form.

| Checklist P21 | Estado hoy | Evidencia |
|---|---|---|
| Confirmación explícita | **OK** | Checkbox + `puedeRevocar` + `confirmError`; tests «debe requerir la confirmación explícita» |
| Copy de consecuencias | **OK** | `#revocar-desc`: validación QR mostrará revocada; ayuda motivo + aviso auditoría |
| Estado posterior expediente + validación pública | **Parcial** | Navigate `?revocada=1` + mock alinea `setMockAdminPublicStatus`; expediente **no** lee `revocada` (sin flash); estado `revocado` aparece tras re-fetch. P22 UI pública **fuera de alcance** |
| Auditoría sin PII completa | **OK backend; front ayuda** | `safeAudit` solo `certificado_id` / sin DNI-token; front sanitiza motivo. `motivo_revocacion` en tabla cert (campo de negocio, truncado 180) |

**Carga / submit y honesty**

```text
effect(id) → cargar()
  obtener(cid)
  catch → error = (e as Error).message     ← raw; sin errorRecuperable / Reintentar

onRevocar()
  sanitize motivo → certs.revocar → navigate ?revocada=1
  catch → error = (e as Error).message     ← raw; reusa signal `error` (overlay full-page
                                              encima del diálogo si detalle sigue vivo)
```

Paridad P20 delivery / P18 preview: load hard usa mensaje fijo es-AR + `errorRecuperable` + Reintentar gated; acciones usan `mensajeErrorApi` P15-strict (envelope o fallback). Revoke **no** adoptó ese patrón.

**Qué ya está bien (no reabrir)**

- Confirmación + motivo + deep-link no vigente; Escape → expediente (REQ-PAR-REV-001 histórico).
- Copy consecuencias público/QR; DNI completo UI (D0); sin token completo en UI.
- Sanitización cliente de motivo; HTTP `reason`; backend invalida tokens + `safeAudit` sin PII.
- Tests: validación motivo/confirm, éxito navigate, deep-link revocado, Escape, panel error 404 id.

**Residuos / gaps (top)**

1. **Honesty load** — raw `(e as Error).message` en `cargar`; sin `errorRecuperable` / Reintentar (404 fijo OK vía mock message; 5xx HTTP crudo).
2. **Honesty submit** — raw en `onRevocar`; fallo pinta overlay `error` global (tapa diálogo) en vez de error inline + `mensajeErrorApi` P15-strict.
3. **Handoff `?revocada=1`** — query no consumida por `certification-preview-page` (sin flash); estado posterior depende solo del re-fetch de `estado`.
4. **MOTIVO_MAX 400 vs backend 180** — truncado silencioso en PHP; copy/`maxlength` desalinea expectativa bedelía.
5. **Spec drift** — `admin-certificate-revocation` es API-only; no hay requirements de UI revoke en `admin-certifications-frontend` (solo enlace expediente). Falta ADDED honesty/confirmación en capability frontend.
6. **Fuera de alcance** — no tocar archive P20; no reescribir delivery; no P22 validación pública; no backend/`admin-certificate-revocation` salvo evidencia de leak PII en audit (hoy no).

### Affected Areas

- `apps/frontend-angular/.../revoke/certification-revoke-page.ts` — `mensajeErrorApi` P15-strict; `errorRecuperable` load-only; separar `error` carga vs `errorAccion` submit; opcional alinear `MOTIVO_MAX`→180.
- `apps/frontend-angular/.../revoke/certification-revoke-page.html` — Reintentar gated en panel carga; error submit inline (no overlay que tumbe el diálogo).
- `apps/frontend-angular/.../revoke/certification-revoke-page.spec.ts` — anti-raw; load recuperable; submit error inline; opcional maxlength 180.
- `openspec/specs/admin-certifications-frontend/spec.md` — **primary delta**: ADDED requisito diálogo revocar (honesty + confirmación ya cubierta por tests / copy).
- Opcional light: `certification-preview-page` flash si `?revocada=1` — **solo si** se acepta en propose (mínimo; no reabrir expediente P18).
- `docs/qa/PLAN-…` — checkboxes P21 en apply/archive (no en explore).
- **No tocar**: `openspec/changes/archive/2026-07-29-audit-p20-certs-entrega/`; delivery page; public-validation (P22); PHP `AdminCertificateService.revocar` / `admin-certificate-revocation` salvo gate PII.

### Approaches

1. **Auditoría quirúrgica front-only (recomendada)** — Honesty P15-strict + `errorRecuperable` load-only + error submit inline + delta `admin-certifications-frontend` (ADDED revoke UI). Opcional: `MOTIVO_MAX=180`; flash mínimo `?revocada=1` en preview.
   - Pros: cierra gaps checklist honesty; paridad P15–P20; blast radius = page + tests + delta; respeta locks.
   - Cons: tests nuevos; flash preview toca archivo fuera del page revoke (si se incluye).
   - Effort: Low

2. **Solo documentar hallazgo** — PLAN + nota; cero código.
   - Pros: diff mínimo.
   - Cons: deja raw Error.message y overlay submit; no cierra honesty.
   - Effort: Low (**incompleto**)

3. **Backend + front** — tocar `admin-certificate-revocation` / PHP audit o truncado motivo.
   - Pros: solo si staging demuestra PII en `cert_eventos_auditoria` o envelope roto.
   - Cons: viola prefer front-only; backend ya cumple safeAudit.
   - Effort: Medium (**bloqueado salvo evidencia**)

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Load** — mensaje fijo es-AR (*«No se pudo cargar la certificación.»* / not-found fijo); **Reintentar** solo si `errorRecuperable` load-only (paridad P18/P20). **Sin** raw `Error.message`.
2. **Submit** — `mensajeErrorApi` P15-strict (envelope o *«No se pudo revocar la certificación.»*); error **inline** en diálogo; **no** reusar overlay de carga ni `errorRecuperable` para fallo de POST.
3. **Confirmación / copy / sanitize** — conservar (ya OK); no reescribir copy de consecuencias salvo typo.
4. **Post-estado** — conservar navigate `?revocada=1` + re-fetch expediente; **no** reescribir P22. Flash preview = **opcional** (recomendado defer o slice mínimo si propose lo pide).
5. **MOTIVO_MAX** — alinear a **180** (paridad backend) en propose defaults.
6. **Spec target** — **`admin-certifications-frontend`** (ADDED requisito diálogo `/revocar`: honesty + gates). **No** primary-target `admin-certificate-revocation` (API backend ya cubierta; front-only).
7. **Hard locks** — D0; leave P20 archive alone; no P20 delivery rewrite; no P22 rewrite; front-only unless audit PII leak proven.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (page + tests + delta admin-certifications-frontend) — **sí**.
2. Spec target = **`admin-certifications-frontend`** — **sí**.
3. **No** primary-target `admin-certificate-revocation` — **sí**.
4. Honesty sin raw `Error.message` en cargar/onRevocar — **sí**.
5. `errorRecuperable` **solo** load hard (no submit) — **sí**.
6. Error submit = inline + `mensajeErrorApi` P15-strict — **sí**.
7. Conservar confirmación + copy consecuencias + sanitize motivo — **sí**.
8. `MOTIVO_MAX` → **180** — **sí** (recomendado).
9. Flash expediente `?revocada=1` — **opcional / defer** (no bloquea checklist si estado `revocado` visible post-navigate).
10. No P20 archive / P20 rewrite / P22 / backend salvo PII — **sí (hard lock)**.

### Questions (para propose)

1. Confirmar defaults 1–10 (recomendado: aceptar 1–8 y 10; defer 9).
2. ¿Load hard fijo? *«No se pudo cargar la certificación.»* + Reintentar si recuperable — **sí**.
3. ¿Submit fallback? *«No se pudo revocar la certificación.»* — **sí**.
4. ¿Incluir flash preview en este ciclo o dejar para polish posterior? (**recomendado: defer**).
5. ¿HTTP/PHP solo si staging muestra DNI/token en `cert_eventos_auditoria`? (**sí — gate explícito**).

### Risks

- Overlay submit actual puede confundir tests de error panel (solo carga) — separar signals.
- Alinear maxlength 180 puede romper test de texto largo si existe (hoy no hay assert 400).
- Incluir flash preview aumenta blast radius → riesgo de tocar P18 expediente; prefer defer.
- Tocar `admin-certificate-revocation` “por completitud” mezcla backend — **bloqueado**.

### Ready for Proposal

**Yes** — orchestrator puede lanzar `sdd-propose` con defaults locked 1–8+10; spec target `admin-certifications-frontend`; gaps top = honesty load/submit + opcional MOTIVO_MAX/flash.
