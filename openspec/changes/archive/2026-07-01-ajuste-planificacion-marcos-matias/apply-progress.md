# Apply Progress — ajuste-planificacion-marcos-matias

**Change**: ajuste-planificacion-marcos-matias
**Mode**: Standard (documentation-only, no TDD)
**Branch**: docs/ajuste-planificacion-marcos-matias
**Date**: 2026-07-01

## Resumen

Cambio documental quirúrgico para sincronizar D0: QR/token permanente, DNI completo público, certificado de curso con fechas asistidas, auth admin simple temporal, firmantes PDF, Composer/SMTP como gates y staging `/certificados_staging/`. Incluye `muestra_pagina/` actualizada como referencia visual v0 (U1) y docs/prompts/specs alineados (U2).

## Unidades de revisión

- **U1 — v0 reference**: `muestra_pagina/` metadata (README, AGENTS, MANIFIESTO_V0, .gitignore).
- **U2 — D0 sync**: docs raíz, docs técnicas, prompts, OpenSpec deltas, audit input relocation, .codegraph ignore.

## Tareas completadas

### Phase 1 — v0 reference (U1)
- [x] 1.1 Clasificar `muestra_pagina/` como referencia visual.
- [x] 1.2 Recrear `muestra_pagina/README.md`, `AGENTS.md`, `MANIFIESTO_V0.md`.
- [x] 1.3 `muestra_pagina/.gitignore` ampliado (`.env*`, `out/`, `dist/`, `coverage/`).
- [x] 1.4 `git status --short -- muestra_pagina/`: solo versionable.

### Phase 2 — Docs raíz (U2)
- [x] 2.1 `README.md`: bloque D0 + roles + staging + `.codegraph/`.
- [x] 2.2 `GUIA.md`: alcance, flujo, decisiones vigentes D0, muestra_pagina.
- [x] 2.3 `AGENTS.md`: token permanente, DNI completo UI pública, logs sin DNI, `.codegraph/`, stack staging.

### Phase 3 — Docs técnicas (U2)
- [x] 3.1 `docs/backend/01-contrato-api-certificados.md`: DTO `documentNumber` + `attendedDates`; reenvío conserva token; seguridad D0.
- [x] 3.2 `docs/backend/00-php84-api.md`: principios D0, pendientes M4, evidencia histórica anotada.
- [x] 3.3 `docs/database/01-modelo-datos-certificados.md`: DNI completo público; tablas futuras `cert_*`.
- [x] 3.4 `docs/database/00-mariadb.md` + `docs/frontend/00-angular20-port-v0.md`: D0 alineado; v0 referencia; sin portar credenciales demo.
- [x] 3.5 `docs/deploy/00-cpanel-certificados.md`: gates D0 tablados (staging, Composer, SMTP, auth, token).

### Phase 4 — Specs OpenSpec (U2)
- [x] 4.1 8 deltas revisados en `openspec/changes/.../specs/*/spec.md` — correctos, trazables, RFC 2119.
- [x] 4.2 `openspec/specs/` principales confirmados listos para `sdd-archive` (la actualización de specs principales ocurre en archive, no en apply).

### Phase 5 — Prompts (U2)
- [x] 5.1 `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: bloque M4 (M4-01..M4-07) + reglas D0; M1-M3 preservados.
- [x] 5.2 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` + `MATIAS_PROMPTS_SDD_FASE2.md`: D0, v0, DNI completo, `attendedDates`, QR permanente, auth simple, sin credenciales demo.

### Phase 6 — `.codegraph/` y material privado
- [x] 6.1 `.gitignore` raíz: entrada `.codegraph/` agregada.
- [x] 6.2 `git check-ignore .codegraph/` → IGNORED OK.
- [x] 6.3 Sin `material_privado_no_versionar/`, `*.sql`, `*.dump`, `*.log`, `.env*` staged.

### Phase 7 — Audit input y root hygiene
- [x] 7.1 `IFTS14_ajuste_documentacion_planificacion_marcos_matias.md` movido a `docs/auditoria/`; `docs/auditoria/INDEX.md` creado.
- [x] 7.2 Raíz limpia: sin clutter de audit input en raíz.

### Phase 8 — Verificación documental
- [x] 8.1 Residual scan: `documentMasked`/`enmascarado público`/`rotación normal` sin matches en docs/prompts vigentes (solo en audit input histórico y artefactos SDD del change).
- [x] 8.2 Cross-links: índice general enlaza auditoria INDEX y muestra_pagina MANIFIESTO.
- [x] 8.3 Sensitive scan: sin `DNI[:=]`, `BEGIN CERTIFICATE`, `password[:=]` en archivos tocados.
- [x] 8.4 Sin contradicciones token/DNI/`attendedDates`/`X-Admin-Key`/staging.
- [x] 8.5 Stage safety: sin `.codegraph/`, privado, dumps, logs, env, node_modules staged.
- [x] 8.6 2 unidades distinguibles (U1 v0 + U2 D0).
- [ ] 8.7 `verify-report.md` → corresponde a `sdd-verify`.

### Phase 9 — Corrección post-verify FAIL (docs-only)

Corrección quirúrgica tras `sdd-verify` FAIL: el verify detectó que `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `docs/frontend/00-angular20-port-v0.md:141` aún guiaban validación pública con DNI enmascarado, contradiciendo D0. Se corrigieron esos archivos y dos adyacentes contradictorios, sin tocar código de producto ni `openspec/specs/` (eso es `sdd-archive`).

- [x] 9.1 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: 9 puntos stale de DNI enmascarado reescritos a D0 (líneas 255, 757, 767, 808, 1108, 1203, 1388, 1400 + adyacente 718). D0: DNI completo en validación pública como respuesta de autenticidad; logs/auditoría/errores/respuestas administrativas sin DNI completo; mocks solo ficticios.
- [x] 9.2 `docs/frontend/00-angular20-port-v0.md:141`: `dto.ts` ahora describe DTOs con `documentNumber` completo + `attendedDates` por D0; sin hash/pepper/tablas internas.
- [x] 9.3 `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (adyacente): líneas 21 y 61 corregidas — v0 puede enmascarar pero prevalece D0.
- [x] 9.4 Re-scan residual: cero matches de `DNI enmascarado`/`sin DNI completo`/`No se expone DNI completo` en docs/prompts vivos.
- [x] 9.5 Sin código de producto tocado (`apps/`, migrations, seeds, deploy, `public_html`, `vendor/`).
- [x] 9.6 Sensitive scan limpio en archivos cambiados.
- [x] 9.7 `MATIAS_PROMPTS_SDD_FASE2.md:127` revisado: ya correcto (D0 prevalece); sin cambios.

## Archivos cambiados

| Archivo | Acción | Descripción |
|---|---|---|
| `.gitignore` | Modificado | Agrega `.codegraph/`. |
| `README.md` | Modificado | Bloque D0, roles, staging, `.codegraph/`. |
| `GUIA.md` | Modificado | Stack staging, decisiones D0, muestra_pagina referencia. |
| `AGENTS.md` | Modificado | Reglas D0 (token permanente, DNI completo, logs, `.codegraph/`), stack staging, muestra_pagina, backend. |
| `docs/00-indice-general.md` | Modificado | Cross-links auditoria INDEX + muestra_pagina MANIFIESTO. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | DTO `documentNumber`+`attendedDates`, reenvío conserva token, seguridad D0. |
| `docs/backend/00-php84-api.md` | Modificado | Principios D0, pendientes M4, evidencia histórica anotada. |
| `docs/database/01-modelo-datos-certificados.md` | Modificado | DNI completo público, `documento_completo`, tablas futuras `cert_*`. |
| `docs/database/00-mariadb.md` | Modificado | Reglas D0, tablas futuras planificadas. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado | Reglas de portado D0 (DNI completo, QR permanente, fechas asistidas). |
| `docs/deploy/00-cpanel-certificados.md` | Modificado | Gates D0 tablados. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificado | Bloque M4 (M4-01..M4-07) + rol D0. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificado | Misión D0, fuente visual v0, decisiones D0. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Modificado | Reglas D0 (DNI completo, QR permanente, fechas asistidas, auth simple). |
| `muestra_pagina/README.md` | Creado | Referencia visual v0, prohibiciones, D0. |
| `muestra_pagina/AGENTS.md` | Creado | Reglas muestra_pagina, D0, login-form mock. |
| `muestra_pagina/MANIFIESTO_V0.md` | Creado | Inventario pantallas 4-17, capturas, rutas, alineación D0. |
| `muestra_pagina/.gitignore` | Modificado | Ampliado `.env*`, `out/`, `dist/`, `coverage/`. |
| `docs/auditoria/INDEX.md` | Creado | Índice de auditoría + audit input. |
| `docs/auditoria/IFTS14_ajuste_documentacion_planificacion_marcos_matias.md` | Movido | De raíz a `docs/auditoria/` (audit input versionado). |
| `openspec/changes/ajuste-planificacion-marcos-matias/tasks.md` | Modificado | Tasks marcadas [x]; agregada Phase 9 (corrección post-verify FAIL). |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificado (Phase 9) | 9 puntos stale de DNI enmascarado reescritos a D0. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado (Phase 9) | `dto.ts` corregido: DTOs con `documentNumber` completo + `attendedDates` por D0. |
| `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | Modificado (Phase 9) | Líneas 21 y 61: v0 puede enmascarar, prevalece D0. |
| `openspec/changes/ajuste-planificacion-marcos-matias/apply-progress.md` | Modificado (Phase 9) | Agregada Phase 9 y archivos cambiados. |

## Verificación ejecutada

| Check | Resultado |
|---|---|
| Residual scan `documentMasked`/`rotación normal` en docs/prompts vigentes | PASS — sin matches fuente de verdad |
| Sensitive scan `DNI[:=]`/`BEGIN CERTIFICATE`/`password[:=]` | PASS — sin hits |
| `.codegraph/` ignored | PASS — `git check-ignore` OK |
| `material_privado_no_versionar/` staged | PASS — none |
| `*.sql`/`*.dump`/`*.log`/`.env*` staged | PASS — none |
| `node_modules/`/`.next/` staged | PASS — none |
| Contradicciones token/DNI/`attendedDates`/staging | PASS — sin contradicciones |
| 8 delta specs trazables | PASS — revisadas |

## Desviaciones del diseño

Ninguna — la implementación sigue el diseño. La task 8.7 (verify-report) se delega a `sdd-verify` como corresponde.

## Riesgos abiertos

- Los `openspec/specs/` principales (fuente de verdad actual) aún mencionan `documentMasked`/rotación; se actualizan en `sdd-archive` al sincronizar deltas. No es riesgo de apply, es flujo SDD normal.
- El código backend/Angular existente no se tocó (constraint respetado); los ajustes de código quedan para ciclos M4-01+.

## Próximo paso

`sdd-verify` para producir `verify-report.md` (task 8.7) y luego `sdd-archive` para sincronizar `openspec/specs/` principales.

---

## Corrección post-archive (pre-commit blocker) — 2026-07-01

**Trigger**: pre-commit blocker detectó que 4 specs canónicas seguían contradiciendo D0 tras el archive. El archive original solo generó deltas para 8 specs, pero 3 de las 4 specs bloqueadas no tenían delta (`backend-validacion-publica-certificados`, `certificate-pdf-qr-generation`, `admin-certificate-emission`) y `backend-modelo-datos-certificados` quedó con el bloque de rotación sin sincronizar (líneas 48-57).

**Correcciones aplicadas** (sin tocar código de producto, sin stage/commit/push):

| Spec | Línea(s) | Cambio | D0 alineado |
|------|----------|--------|-------------|
| `backend-modelo-datos-certificados/spec.md` | 48-57 | Rotación → token permanente: reenvío normal conserva token; revocación explícita invalida; regeneración excepcional auditada. Escenario renombrado `Rotación sobre tabla existente` → `Reenvío conserva token sobre tabla existente`. | QR/token permanente |
| `backend-validacion-publica-certificados/spec.md` | 39-47 | `documento enmascarado` → DNI completo visible por decisión institucional + fechas asistidas; logs/auditoría/errores/admin sin DNI completo ni token completo. | DNI completo público + seguro en logs/audit |
| `certificate-pdf-qr-generation/spec.md` | 79-88 | `DNI enmascarado en el PDF` → `DNI en el PDF del certificado de curso`: PDF es certificado de curso con fechas asistidas; PUEDE mostrar DNI completo como contenido público aprobado; logs/audit/errores/admin sin DNI/token completo. | Certificado de curso + DNI público + seguro en logs |
| `admin-certificate-emission/spec.md` | 5, 11-12, 19 | `oculta DNI completo` / `datos enmascarados` → DTO operativo seguro sin token completo; respuestas operativas/logs/auditoría sin DNI completo salvo DTO explícitamente público; token declarado permanente. | Admin seguro + token permanente |

**Scans residuales** sobre `openspec/specs/`:
- `documento enmascarado|DNI enmascarado|NO DEBE imprimir DNI completo|datos enmascarados` → 2 matches residuales, ambos D0-compliant: (1) marker histórico `(Previously: ...)` en `admin-certificate-emission:12` — preservado como audit trail SDD; (2) `guia-marcos-ciclos-sdd:11` — "no exponer DNI completo en logs/auditoría/errores/respuestas administrativas" — exactamente la regla D0.
- `rotación: token anterior|nuevo token activo|rotar token` → 8 matches, todos negados (`NO rota`, `sin rotar`, `MUST NOT rotar`) en `admin-certificate-delivery`, `backend-contrato-api-certificados`, `backend-modelo-datos-certificados`. D0-compliant.
- `destinatario_enmascarado` → 2 matches en `backend-modelo-datos-certificados`: enmascara email (no DNI), D0-compliant.

**Conclusión**: 0 contradicciones D0 residuales en specs canónicas. Las 4 specs bloqueadas ahora alinean con D0. No se tocó código de producto. No se ejecutó stage/commit/push.