```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:79f7ea1fbee452d0ea77473a5c5098a9d2a4ce1b69f4c5ddf5e4330878b4b767
verdict: pass
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 7/7
test_command: ./node_modules/.bin/ng test --include='**/date-certificates-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:4d26ab2fef6419b40b72c90b4e93e55ed61cd6446e7594b51459f72c7761c4be
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:eb5f4d2b35b15209f43e76ab5e3d4c07e304ac110b522810a5af1b4772c0688d
```

## Verification Report

**Change**: audit-p15-asist-certs
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**Branch**: `audit/p15-asist-certs`
**Base prevista**: `staging1.0`
**PR**: https://github.com/marcostoledo96/ifts14/pull/100

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 18 |
| Tasks complete | 18 |
| Tasks incomplete | 0 |

Fases 1–4 (1.1–1.4, 2.1–2.4, 3.1–3.6, 4.1–4.4) marcadas `[x]`. Sin tareas pendientes de verify.

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
TypeScript: No errors found
EXIT:0
```

**Tests**: 10 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && ./node_modules/.bin/ng test --include='**/date-certificates-page.spec.ts' --no-watch --browsers=ChromeHeadless
Chrome Headless: Executed 10 of 10 SUCCESS
TOTAL: 10 SUCCESS
EXIT:0
```

**Coverage**: Not available → umbral N/A

**Trailing whitespace**: 0 matches en `date-certificates-page.{ts,html,css,spec.ts}`.

### Hard locks (inspección + diff)

| Lock | Evidencia | Estado |
|------|-----------|--------|
| Sin P14 marking | `git diff --name-only staging1.0...HEAD -- apps/**`: solo `date-certificates-page.*`; sin `attendance-marking*` | Intactos |
| Sin P16 list global | Sin `certifications-list-page.*` en diff de producto | Intactos |
| Sin HTTP/token/backend | Sin cambios bajo `http-*`, `apps/backend`, rotación token/QR | Intactos |
| `errorRecuperable` solo load catch | `cargar` L102–131; acciones forzan `false` en catch | OK |
| `mensajeErrorApi` sin raw | Helper L145–151; catches Copiar/QR/PDF | OK |
| Expediente fuera de `.cert-acciones` | HTML en `cert-datos`; test assert `closest('.cert-acciones') === null` | OK |
| Listado `{cursoId}` | `listar({ cursoId: cid })` L115 | OK |

### Spec Compliance Matrix

Requisito delta: **Página de certificados del curso (por fecha)** (`admin-attendances-frontend`).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Página de certificados del curso (por fecha) | Entrega desde página dedicada | `date-certificates-page.spec.ts` > lista + acciones orden; descargarQr → `descargarQrPng` | COMPLIANT |
| Página de certificados del curso (por fecha) | Link Expediente por fila | `…` > link Expediente href `/admin/certificaciones/:id` fuera de `.cert-acciones` | COMPLIANT |
| Página de certificados del curso (por fecha) | Vacío con CTA a asistencias | `…` > vacío CTA marcar sin filas/acciones | COMPLIANT |
| Página de certificados del curso (por fecha) | Fallo recuperable de carga con Reintentar | `…` > fallo recuperable Reintentar re-llama sin PII/raw | COMPLIANT |
| Página de certificados del curso (por fecha) | Id inválido o not-found sin Reintentar | `…` > id inválido; API not-found sin Reintentar | COMPLIANT |
| Página de certificados del curso (por fecha) | Error de acción sin Reintentar | `…` > envelope 400 vía helper; genérico sin raw `Error.message` | COMPLIANT |
| Página de certificados del curso (por fecha) | DNI completo y anti-token | `…` > no expone token; DNI `/\d{7,8}/` | COMPLIANT |

**Compliance summary**: 7/7 escenarios COMPLIANT.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| `errorRecuperable` | Implemented | `signal(false)`; true solo catch recuperable de `cargar` |
| Reintentar condicional | Implemented | HTML `@if (errorRecuperable())`; `onReintentar` no-op si false |
| Acciones `mensajeErrorApi` | Implemented | Copiar/QR/PDF catch → helper; flag false |
| Expediente | Implemented | `<a data-testid="cert-expediente" routerLink=['/admin/certificaciones', c.id]>` en `cert-datos` |
| Orden Copiar→QR→PDF | Intact | Solo botones en `.cert-acciones`; test de orden pasa |
| Empty + CTA | Intact | Copy + link a marcar asistencias |
| Listado `cursoId` | Intact | `listar({ cursoId: cid })` |
| DNI / anti-token | Intact | `documentMasked` en UI; test anti-token |
| P14 / P16 / HTTP / backend | Unchanged | Fuera del diff de producto |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Alcance página+tests+delta | Yes | Producto FE acotado a `date-certificates-page.*` |
| `errorRecuperable` solo catch carga | Yes | Paridad P13/P14 |
| Acciones → `mensajeErrorApi`, sin Reintentar | Yes | |
| Expediente en `cert-datos`, no botones | Yes | |
| Entrega inline (no `/entrega`) | Yes | |
| Fecha huérfana diferida | Yes | Sin panel huérfano |
| Sin P14/P16/HTTP/token | Yes | Diff de apps limpio |

### Issues Found

**CRITICAL**: None

**WARNING**: None

**SUGGESTION**:
- El working tree local aún tiene `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` modificado sin stagear respecto a `origin/audit/p15-asist-certs`; confirmar que el PLAN light de la tarea 4.2 ya está en el PR antes de merge.
- El diff vs `staging1.0` también incluye el archive de P14 y docs/openspec canónico (lineage del branch); no afecta locks de producto P15.

### Verdict

**PASS**

Implementación y suite focalizada (10/10) cumplen el delta P15 (1 requisito / 7 escenarios) y los hard locks; build TypeScript limpio; sin blockers.
