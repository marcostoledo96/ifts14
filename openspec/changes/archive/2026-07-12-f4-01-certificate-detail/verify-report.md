## Verification Report

**Change**: `f4-01-certificate-detail`
**Version**: N/A
**Mode**: Standard verify — Strict TDD inactivo (`strict_tdd: false`)
**Artifact store**: hybrid — OpenSpec + Engram
**Fecha**: 2026-07-12

### Completeness

| Metric | Value |
|---|---:|
| Tasks total | 19 |
| Tasks complete | 19 |
| Tasks incomplete | 0 |
| Proposal/spec/design/tasks | Presentes |
| Evidencia visual requerida | Presente |
| Review budget | 4000 líneas |
| Diff inspeccionado | 1408 inserciones / 180 eliminaciones |

### Build & Tests Execution

**Tests**: ✅ Passed

```text
Command: npm run test:ci
Cwd: apps/frontend-angular
Result: exit 0
Evidence: Chrome Headless 149.0.0.0 executed 420 of 420 SUCCESS.
```

**Build**: ⚠️ Passed with warning

```text
Command: npm run build
Cwd: apps/frontend-angular
Result: exit 0
Evidence: Application bundle generation complete.
Warning: src/app/features/admin/certifications/pages/preview/certification-preview-page.css exceeded maximum budget.
Budget 8.00 kB was not met by 5.78 kB with a total of 13.78 kB.
```

**Coverage**: ➖ Not available — el comando solicitado no emite reporte de cobertura.

### Visual Evidence

| Artifact | Status | Notes |
|---|---|---|
| `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/cert-detail-angular.png` | ✅ Presente y significativa | Captura desktop 1280×800; muestra expediente, acciones disabled, QR decorativo y documento réplica. |
| `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/cert-detail-angular-mobile.png` | ✅ Presente y significativa | Captura mobile 390×844; confirma layout responsive apilado. |
| `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/parity-notes.md` | ✅ Presente y significativa | Incluye tabla comparativa v0 vs Angular, diferencias intencionales y aceptación visual. |

### Spec Compliance Matrix

| Requirement | Scenario | Runtime / evidence | Result |
|---|---|---|---|
| Paridad visual y evidencia de verificación | Paridad visual del expediente | `certification-preview-page.spec.ts` renderiza secciones v0; `app.routes.spec.ts` valida expediente runtime; capturas desktop/mobile + `parity-notes.md` | ✅ COMPLIANT |
| Paridad visual y evidencia de verificación | Evidencia de checks en verify | Este reporte incluye `npm run test:ci`, `npm run build`, checks de privacidad, id inválido, handoffs y evidencia visual | ✅ COMPLIANT |
| Previsualización segura y handoff explícito | Expediente de una certificación mock | `certification-preview-page.spec.ts` y `app.routes.spec.ts` validan ficha, secciones administrativas, URL truncada y volver al listado | ✅ COMPLIANT |
| Previsualización segura y handoff explícito | Acciones fuera de alcance | `certification-preview-page.spec.ts` valida botones `disabled` + `aria-disabled="true"` y handoffs F4-02/F5-04/F6-03/F6-01 | ✅ COMPLIANT |
| Previsualización segura y handoff explícito | Id inexistente, inválido o ausente | `certification-preview-page.spec.ts` cubre `abc`, `0x1`, `1e0`, `999`; `app.routes.spec.ts` cubre `/admin/certificaciones` y `/admin/certificaciones/abc` | ✅ COMPLIANT |
| Previsualización segura y handoff explícito | Frontera de datos administrativa | `no-real-data.spec.ts`, `no-secrets.spec.ts`, `certification-preview-page.spec.ts` cubren DOM/seed sin DNI completo, token completo, email, legajo, matrícula ni storage/red | ✅ COMPLIANT |

**Compliance summary**: 6/6 scenarios compliant.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Reusar `/admin/certificaciones/:id` | ✅ Implementado | `app.routes.ts` mantiene `path: 'certificaciones/:id'`; no ruta nueva de detalle/PDF. |
| Mantener mock-only | ✅ Implementado | `CertificationPreviewPage` usa `CERTIFICATIONS_SOURCE`; no HTTP/backend/storage/session real. |
| No exponer datos sensibles en admin | ✅ Implementado | UI usa `documentMasked`, `tokenPrefix` y URL truncada; capturas y tests no muestran DNI completo, email, legajo, matrícula, UUID ni token completo. |
| Acciones deshabilitadas | ✅ Implementado | PDF, copiar link, entrega, regenerar y revocar tienen `disabled` + `aria-disabled="true"`. |
| Handoffs explícitos | ✅ Implementado | F4-02, F5-04, F6-03 y F6-01 visibles en UI y cubiertos por tests. |
| Sin scope drift a backend/PDF/QR real/revocación/email/storage | ✅ Implementado | La inspección no encontró integración real; QR es decorativo CSS y las acciones no ejecutan operaciones. |
| Regla de paridad visual en `AGENTS.md` | ✅ Presente | `AGENTS.md` declara paridad visual con `muestra_pagina` como criterio obligatorio de aceptación en specs y verify de UI. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Mantener `CertificationPreviewPage` y `/admin/certificaciones/:id` | ✅ Sí | Menor diff funcional; rutas existentes preservadas. |
| No ampliar contrato salvo necesidad real | ✅ Sí | `CertificacionDetalle` se consume con datos seguros ya existentes; número visual derivado. |
| Acciones 100% deshabilitadas | ✅ Sí | No hay simulación de descarga, clipboard, entrega ni revocación. |
| QR decorativo CSS/HTML local | ✅ Sí | Sin QR real, token embebido ni dependencia nueva. |
| F4-02 diferido | ✅ Sí | No se implementa ruta/vista PDF imprimible; notas presentes en proposal/spec/design/docs. |
| CSS local con tokens globales y sin dependencias nuevas | ⚠️ Parcial | Se cumple la técnica, pero el CSS del componente excede el budget de warning: 13.78 kB vs 8 kB. |
| Build sin warnings | ⚠️ No pleno | `npm run build` pasa, pero emite warning de budget `anyComponentStyle`. |

### Scope Drift Check

| Area prohibida | Resultado |
|---|---|
| PDF real / ruta PDF imprimible | ✅ No implementado |
| QR real con token | ✅ No implementado; QR decorativo CSS |
| Revocación real | ✅ No implementada; CTA disabled |
| Entrega/email real | ✅ No implementado; CTA disabled |
| Backend / HTTP / `X-Admin-Key` | ✅ No implementado en este cambio |
| Sesión/storage/cookies/IndexedDB | ✅ No implementado |
| DNI completo/token completo/email/legajo/matrícula/UUID en admin UI | ✅ No expuesto según tests, capturas e inspección |

### Issues Found

**CRITICAL**: None.

**WARNING**:

- `npm run build` pasa con warning de presupuesto CSS: `certification-preview-page.css` pesa 13.78 kB contra `maximumWarning: 8kB`. Esto contradice el objetivo de build “sin warnings” y debe aceptarse explícitamente o resolverse antes de considerar el ciclo completamente limpio.
- El forecast de tasks estimaba 400–700 líneas, pero el diff inspeccionado es 1588 líneas totales cambiadas. No supera el budget de 4000 líneas, pero la estimación quedó corta.

**SUGGESTION**:

- Antes de archive, documentar si el warning de budget CSS queda aceptado por paridad visual o reducir CSS para volver a build sin warnings.

### Verdict

PASS WITH WARNINGS

La implementación cumple specs, diseño funcional, privacidad, paridad visual y runtime tests (`420 SUCCESS`). El único desvío relevante es el warning de budget CSS durante `npm run build`; no bloquea por exit code, pero impide declarar el ciclo como “sin warnings”.

### Next Recommended

`sdd-archive` si el warning CSS queda aceptado/documentado; si se exige build sin warnings, volver a `sdd-apply` para reducir CSS o ajustar el criterio y luego re-verificar.

### Skill Resolution

`paths-injected` — leídos los skill files indicados: `sdd-verify`, `karpathy-guidelines`, `playwright-best-practices`, `cognitive-doc-design`.
