# Exploration: audit-p22-validacion

**Cambio**: `audit-p22-validacion`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p22-validacion`
**Alcance de fase**: `/validar/:token` → `public-validation-page.{ts,html,css,spec.ts}` + cadena `ValidationService` / `result-mapper` / `HttpValidationSource` (lectura)
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P22; `openspec/specs/frontend-public-validation/spec.md`; `openspec/specs/backend-validacion-publica-certificados/spec.md` (contrato «No verificable unificado»); paridad `muestra_pagina/components/validacion/*`; honesty P15–P21 (`mensajeErrorApi` / `errorRecuperable`); hard locks: D0 (token/QR permanente); leave P21 archive alone / no rewrite revoke; prefer front-only; DNI completo UI; no PII en logs/errors; no stack traces en UI

## Exploration: Validación pública (P22)

### Current State

`PublicValidationPage` es la pantalla pública de confianza: ruta `validar/:tokenCertificacion` (app bajo `/certificados/`); `resource()` + `ValidationService.verify` → `ValidationViewState` (`valid` | `not-verifiable` | `technical-error`).

UI por estado: folio válido (D0: DNI completo + fechas asistidas + sidebar sello); chrome REVOCADO si `reason === CERTIFICATE_REVOKED`; chrome no-encontrada (SIN REGISTRO) para resto de no verificable; error técnico documental con «Reintentar validación». Branding: `HeaderInstitucional` (shell) + franja logos + pie IFTS. Sin QR decorativo. Tests de página ya cubren D0, revocada, expirado→no-encontrada, no-encontrada, técnico sin stack/rutas, a11y `aria-live`, tabla SEQ, logos.

| Checklist P22 | Estado hoy | Evidencia |
|---|---|---|
| Válida vs revocada | **Parcial (por contrato)** | Mock/`CERTIFICATE_REVOKED` → chrome REVOCADO OK. PHP real: SQL exige `c.estado='vigente'` → revocado cae en `404 CERTIFICATE_NOT_FOUND` (spec backend «No verificable unificado»). Staging muestra SIN REGISTRO, no REVOCADO |
| Sin datos de más; DNI política pública | **OK** | `documentNumber` / legado `documentMasked`; sin token en DOM (tests); revocada no inventa alumno/curso |
| Token inválido / no encontrado | **OK** | `VALIDATION_ERROR` / `CERTIFICATE_NOT_FOUND` → not-verifiable; copy PORTAL + sugerencias |
| Responsive, trust/branding | **OK / polish menor** | Grid 2 col ≥768px; `--layout-page-max`; marca-strip + HeaderInstitucional. Fechas `issuedAt`/`attendedDates` se muestran crudas (ISO/YYYY-MM-DD) vs muestra `dd/mm/yyyy` |
| No filtrar stack traces | **OK** | Copy fijo técnico; mapper sin propagar `Error.message`; tests anti-stack/`/api/` |

**Carga / honesty (vs P15–P21 admin)**

```text
resource(params.token) → ValidationService.verify
  source.fetch → mapResponseToViewState / catch → { kind: 'technical-error' }
  UI: isTechnicalError → folio-error fijo (NUNCA verification.error() / raw message)
  reintentar() → resource.reload()  (técnico + no-encontrada; no signal errorRecuperable)
```

A diferencia de P18–P21 admin, **no hay** raw `(e as Error).message` en la página pública. La honesty ya está en el mapper + servicio. No hace falta portar `mensajeErrorApi` P15-strict salvo polish de códigos (p. ej. `RATE_LIMITED` → hoy cae a technical genérico).

**Qué ya está bien (no reabrir)**

- Layout folio/sidebar, membretes ACTA/PORTAL, sellos, PieControl, banda de estado, sin QR decorativo.
- D0 UI: DNI completo en válida; legado masked; revocada sin PII inventada.
- Token no se pinta en el cuerpo; códigos crudos (`CERTIFICATE_*`) no se revelan.
- Backend audit: `token_hash_prefijo` + `detalle_seguro` sin DNI/token completo.
- Spec canónica `frontend-public-validation` ya documenta D0, chrome revocada, técnico, responsive.

**Residuos / gaps (top)**

1. **«Válida vs revocada» en staging** — producto/backend unifica revocado→404. Chrome REVOCADO es mock/admin-bridge. Cerrar checklist **documentando** el gate (no «arreglar» PHP en P22 salvo overturn explícito). Tensión con copy P21 («QR mostrará revocada») — **fuera de alcance** (leave P21 alone).
2. **Formato fechas** — `issuedAt` / `attendedDates` sin formateo es-AR (paridad muestra / trust visual).
3. **`RATE_LIMITED` (429)** — envelope llega; mapper → technical genérico (OK seguridad; opcional copy más suave).
4. **Sin gap honesty raw Error.message** — no es el mismo defecto que P21; apply debería ser lean (verify + polish opcional), no retrofit masivo.
5. **Spec** — primary `frontend-public-validation`; **no** primary-target `backend-validacion-publica-certificados` (el unificado es intencional y hard-lock front-only).
6. **Fuera de alcance** — no tocar archive P21 / revoke page; no rotar token/QR (D0); no reescribir backend verify salvo gate PII (hoy no).

### Affected Areas

- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.{ts,html,css,spec.ts}` — polish fechas / copy rate-limit si se acepta; tests anti-regresión checklist.
- `apps/frontend-angular/src/app/shared/certificates/result-mapper.ts` — solo si propose mapea `RATE_LIMITED` (opcional).
- `openspec/specs/frontend-public-validation/spec.md` — **primary delta**: ADDED/MODIFIED liviano (cierre auditoría: staging unificado; fechas; anti-leak ya cubierto).
- `docs/qa/PLAN-…` — checkboxes P22 en apply/archive (no en explore).
- **No tocar**: `openspec/changes/archive/*p21*`; `certification-revoke-page.*`; `CertificateValidator.php` (salvo overturn); rotación de tokens.

### Approaches

1. **Auditoría quirúrgica front-only (recomendada)** — Cerrar P22 con evidencia de tests + note de contrato unificado; polish opcional fechas es-AR; opcional copy `RATE_LIMITED`; delta liviano `frontend-public-validation`.
   - Pros: respeta locks; checklist honest; blast radius chico; página ya sana en honesty.
   - Cons: staging nunca verá chrome REVOCADO (por diseño backend).
   - Effort: Low

2. **Solo documentar hallazgo** — PLAN + nota; cero código.
   - Pros: diff mínimo.
   - Cons: deja polish fechas; no produce delta verificable.
   - Effort: Low (**incompleto** si se quiere verify SDD)

3. **Backend emite `CERTIFICATE_REVOKED`** — romper «No verificable unificado».
   - Pros: alinea muestra + copy P21 + checklist «revocada» en staging.
   - Cons: viola prefer front-only + spec backend; decisión de producto/seguridad (enumera existencia de cert revocado).
   - Effort: Medium (**bloqueado** salvo overturn explícito en propose)

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Checklist** — Tratar «válida vs revocada» como: (a) chrome válida OK en HTTP/mock; (b) chrome REVOCADO OK cuando llega el código; (c) staging revocado≡no-encontrada **locked** por backend — documentar, no «fix» PHP.
2. **Honesty** — Conservar mapper/servicio (sin raw `Error.message`); no forzar patrón admin `errorRecuperable` salvo que se quiera ocultar Reintentar en not-found (hoy alineado a muestra — **conservar**).
3. **Polish opcional** — formatear fechas de folio a es-AR; mapear o copy de `RATE_LIMITED` (recomendado defer o slice mínimo).
4. **Spec target** — **`frontend-public-validation`**. **No** primary-target `backend-validacion-publica-certificados`.
5. **Hard locks** — D0; leave P21 archive / no rewrite revoke; front-only; DNI completo UI; no PII/stack en UI.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (page/shared polish mínimo + tests + delta frontend-public-validation) — **sí**.
2. Spec target = **`frontend-public-validation`** — **sí**.
3. **No** primary-target `backend-validacion-publica-certificados` / no emitir `CERTIFICATE_REVOKED` desde PHP — **sí (hard lock)**.
4. Staging revocado→404 unificado = **aceptado / documentado** (no bug P22) — **sí**.
5. Honesty: sin raw `Error.message` / sin stack en UI (ya OK; regresión-test) — **sí**.
6. Conservar Reintentar en no-encontrada + técnico (paridad muestra) — **sí**.
7. DNI completo en válida (D0); sin token completo en DOM — **sí**.
8. Formato fechas es-AR — **opcional / recomendado en propose**.
9. Copy/`RATE_LIMITED` — **opcional / defer**.
10. No P21 archive / no rewrite revoke / no D0 rotate / no backend salvo PII — **sí (hard lock)**.

### Questions (para propose)

1. Confirmar defaults 1–7 y 10 (recomendado: aceptar; 8 sí polish; 9 defer).
2. ¿Checklist «revocada» se cierra con mock + doc de unificado staging, sin PHP? (**sí — recomendado**).
3. ¿Incluir formateo fechas en este ciclo? (**recomendado: sí, low blast**).
4. ¿Overturn backend para chrome REVOCADO en staging? (**no — salvo producto explícito**).

### Risks

- Expectativa humana (copy P21 / muestra) de ver REVOCADO en QR real choca con gate backend — comunicar en propose/PLAN.
- Formatear fechas puede romper asserts de strings ISO en specs existentes (`2025-03-10`).
- Tocar `result-mapper` por `RATE_LIMITED` aumenta blast a shared — prefer defer.

### Ready for Proposal

**Yes** — orchestrator puede lanzar `sdd-propose` con defaults locked 1–7+10; polish fechas = sí recomendado; backend revoked chrome = no.
