```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:533d7a5d69a53bc5c6f08deda2cde99708cbc79722de23ddfa23c18581672689
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 11/11
scenarios: 29/41
test_command: "docker run --rm -v $PWD:/app -w /app ifts14-php84 php apps/backend-php/tests/InstitutionalSignature{Validation,Security,Pdf,Http}Test.php ; docker run … AdminAuthorizationMatrixTest.php ; cd apps/frontend-angular && npx ng test --no-watch --browsers=ChromeHeadlessNoSandbox --include='**/institutional-config/**/*.spec.ts'"
test_exit_code: 0
test_output_hash: sha256:fb6ac0c3c4cb8a28e69c1465d867e17f1f9e2f694e3c25a8ad71890bffa0e907
build_command: "cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json ; docker run --rm -v $PWD:/app -w /app ifts14-php84 php -l apps/backend-php/src/{AdminInstitutionalConfigService,CertificatePdfService,Config,InstitutionalConfig}.php apps/backend-php/index.php apps/backend-php/tests/InstitutionalSignatureHttp{Test,Router}.php"
build_exit_code: 0
build_output_hash: sha256:641b21b18064e733a7bbe38a226dbc36e6a47ad87f13295eb10b28ad5a266116
```

## Verification Report

**Change**: frontend-backend-config-firmas-autoridades
**Branch**: feat/config-upload-firmas-autoridades (`cd8939e`)
**Version**: N/A (change specs)
**Mode**: Standard (re-verify post-remediation Phase 6)
**Idioma**: español argentino formal

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 21 |
| Tasks complete | 21 |
| Tasks incomplete | 0 |

Phase 6 remediation (6.1–6.3) marcada `[x]`; código de producto no tocado en la remediación.

### Build & Tests Execution

**Build**: ✅ Passed
```text
npx tsc --noEmit -p tsconfig.app.json → exit 0
  hash=ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
php -l (Docker ifts14-php84): AdminInstitutionalConfigService, CertificatePdfService,
  Config, InstitutionalConfig, index.php, InstitutionalSignatureHttpTest,
  InstitutionalSignatureHttpRouter → sin errores de sintaxis
  phpl hash=3579c55c2c0af24f26756d6b6bba5f75512e2ce9b8528f07d5f9bf279b88f18c
```

**Tests**: ✅ todos verdes
```text
InstitutionalSignatureValidationTest: PASS (exit 0)
  hash=f18aea4a21445660215ab56b207de3fea93ed3226ed1e3c59d7e137dbc114e33
InstitutionalSignatureSecurityTest: PASS (exit 0) — incluye DELETE flags/file/NULL
  hash=235882ec229ae7673ef5aa9167b2209785fa04372991f06b129150a60bfecac8
InstitutionalSignaturePdfTest: PASS (exit 0)
  hash=b77327b84422bbff61d3461250e55706edcc7dfb48c47bd786346a37ce3eeb34
InstitutionalSignatureHttpTest: PASS (exit 0) — NEW: auth 401/403, preview headers, DELETE HTTP
  hash=31c548eba6b0f21941180cead9749861d0641f5d220b190ed5c9a094d892ff1e
AdminAuthorizationMatrixTest: PASS — 24 sitios (incluye +3 firmas)
  hash=728c484ae954a24b422cd1f989976b675c4d630dceaa0889cbd21b764feed3c4
ng test institutional-config: TOTAL 38 SUCCESS (exit 0)
  hash=f16f47ea453b82e57f89d7c4171802017d38653d5e7b26aa8e7f23d3b07ca68f
combined test output hash=fb6ac0c3c4cb8a28e69c1465d867e17f1f9e2f694e3c25a8ad71890bffa0e907
```

**Coverage**: ➖ Not available (sin umbral de cobertura configurado para este slice)

### Remediation gate (previos CRITICAL → COMPLIANT)

| CRITICAL previo | Evidencia runtime | Estado |
|-----------------|-------------------|--------|
| Auth HTTP `POST\|DELETE\|GET …/firmas/{rol}` → 401/403 | `InstitutionalSignatureHttpTest` (sin sesión 401; CSRF 403) + `AdminAuthorizationMatrixTest` 24 sitios | ✅ COMPLIANT |
| Preview autenticado nosniff + no-store + MIME | `InstitutionalSignatureHttpTest` GET con assert headers + `image/png` + bytes | ✅ COMPLIANT |
| DELETE BE → flags false + unlink + NULL | `InstitutionalSignatureSecurityTest` `deleteSignature` + DELETE HTTP en HttpTest | ✅ COMPLIANT |

### Locked rules

| Regla locked | Evidencia | Estado |
|--------------|-----------|--------|
| Opción A endpoints `…/firmas/{rector\|asesor}` | HttpTest + AuthMatrix + FE service | ✅ COMPLIANT |
| 1 MB; 1200×400; PNG/JPEG sin SVG | ValidationTest PASS | ✅ COMPLIANT |
| Flags en GET | ValidationTest + SecurityTest DELETE flags | ✅ COMPLIANT |
| Replace atómico | SecurityTest conserva previa | ✅ COMPLIANT |
| Preview headers nosniff+no-store | HttpTest assert runtime | ✅ COMPLIANT |
| `signature_storage_path` | example + Config + docs deploy | ✅ Implementado |
| Migración 014 | SQL + database/docs | ✅ Artefacto presente |
| PDF Image/fallback | PdfTest PASS | ✅ COMPLIANT |
| FE upload UI real | page.spec 38/38 | ✅ COMPLIANT |
| Docs | contrato API, frontend, deploy | ✅ Presentes |

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Persistencia Opción A | Upload exitoso independiente de Guardar | `InstitutionalSignatureValidationTest` PNG/JPEG | ✅ COMPLIANT |
| Persistencia Opción A | DELETE exitoso (API) | `SecurityTest` + `HttpTest` DELETE | ✅ COMPLIANT |
| Persistencia Opción A | Rol inválido | `InstitutionalSignatureSecurityTest` | ✅ COMPLIANT |
| Persistencia Opción A | Preview autenticado (bytes+headers) | `InstitutionalSignatureHttpTest` | ✅ COMPLIANT |
| Persistencia Opción A | Preview/POST/DELETE sin auth | `InstitutionalSignatureHttpTest` 401/403 | ✅ COMPLIANT |
| Validación imagen | Rechazo SVG / >1MB / dims | ValidationTest | ✅ COMPLIANT |
| Storage + replace | Traversal bloqueado | SecurityTest | ✅ COMPLIANT |
| Storage + replace | Replace atómico (falla conserva) | SecurityTest | ✅ COMPLIANT |
| Storage + replace | Storage no público | config/docs (sin probe URL) | ⚠️ PARTIAL |
| UI Autoridades | Subir/quitar sin Guardar | `institutional-config-page.spec.ts` | ✅ COMPLIANT |
| HttpInstitutionalConfigService | Fetch/Save/errors + flags | `institutional-config.service.spec.ts` | ✅ COMPLIANT |
| Métodos HTTP firmas | Upload/Delete/Preview + HttpTestingController | service.spec | ✅ COMPLIANT |
| Config institucional | Lectura flags presentes | ValidationTest `get()` flags | ✅ COMPLIANT |
| Config institucional | Lectura fallback flags false | sin HTTP empty-row dedicado | ⚠️ PARTIAL |
| Config institucional | PUT no toca firmas / params tipados / validaciones previas | no re-ejecutados en este re-verify | ⚠️ PARTIAL |
| Rutas firmas auth | Rutas bajo admin-auth | AuthMatrix + HttpTest | ✅ COMPLIANT |
| Rutas firmas auth | Firmas sin auth 401/403 | HttpTest | ✅ COMPLIANT |
| PDF QR generation | Imagen / tipografía / PDF viejo intacto | `InstitutionalSignaturePdfTest` | ✅ COMPLIANT |
| PDF QR generation | Emisión completa / config ausente / falla / regeneración / token | suite previa (fuera del slice) | ⚠️ PARTIAL |
| Migración 014 | Aditiva / sin path libre / rollback doc | SQL+docs; basename SecurityTest | ✅ / ⚠️ PARTIAL apply CI |
| Deploy | placeholder / fuera webroot / rollback | docs + example.php | ✅ COMPLIANT |

**Compliance summary**: **29/41** escenarios ✅ COMPLIANT; **12/41** ⚠️ PARTIAL (ningún ❌ UNTESTED/FAILING del gate de remediación); **0 CRITICAL**.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Opción A multipart por rol | ✅ Implemented | Independiente de PUT textos |
| Validación MIME/size/dims | ✅ Implemented | finfo + getimagesize |
| Storage basename+sha256 | ✅ Implemented | `rector\|asesor.(png\|jpg)` |
| Flags GET | ✅ Implemented | camelCase DTO |
| Preview headers | ✅ Implemented + tested | nosniff + Cache-Control no-store |
| Auth firmas HTTP | ✅ Implemented + tested | 401 sin sesión; 403 sin CSRF |
| DELETE BE | ✅ Implemented + tested | flags/file/NULL |
| PDF Image/fallback | ✅ Implemented | try Image; Line+MultiCell fallback |
| FE UI + HTTP seam | ✅ Implemented | input file real; FormData POST |
| Docs + migración 014 | ✅ Implemented | tres docs + SQL + database/docs |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Opción A endpoints | ✅ Yes | |
| Storage fuera webroot | ✅ Yes | espejo certificate_storage_path |
| Replace tmp→rename→DB→unlink | ✅ Yes | |
| Validación 1 MB / 1200×400 | ✅ Yes | |
| Preview GET admin + headers | ✅ Yes | ahora con assert runtime |
| DELETE flags/unlink/NULL | ✅ Yes | service + HTTP |
| PDF Image si existe | ✅ Yes | open Q GD: comentado OK (QR ya usa GD) |
| size:exception single PR | ✅ Yes | aceptado por Marcos |
| Remediation solo tests | ✅ Yes | producto intacto en Phase 6 |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Storage «no público» sin probe HTTP de URL directa (cobertura por config/docs).
2. Escenarios GET/PUT de consulta institucional previos (fallback empty-row, PUT no altera archivos, params tipados/validaciones) no re-ejecutados en HTTP suite de firmas.
3. Escenarios PDF/QR previos del delta (emisión completa, config ausente, falla, regeneración, token) no re-ejecutados; solo `InstitutionalSignaturePdfTest`.
4. Migración 014 sin apply automático en CI (artefacto SQL+doc; típico del repo).

**SUGGESTION**:
1. Cerrar open question de design (GD) como resuelta en archive.
2. Opcional: extender `AdminCertificadosConsultaHttpTest` con flags de firma en GET y assert de PUT sin side-effect en archivos.

### Verdict

**PASS WITH WARNINGS**

Los 3 CRITICAL del verify anterior quedan **COMPLIANT** con evidencia runtime (`InstitutionalSignatureHttpTest`, extensión `SecurityTest`, `AdminAuthorizationMatrixTest` 24 sitios). Tasks 21/21; PHP×5 + ng 38/38 + tsc/php -l exit 0. Quedan solo WARNING/PARTIAL fuera del gate de remediación — apto para `sdd-archive`.
