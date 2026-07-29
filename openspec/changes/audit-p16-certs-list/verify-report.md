```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:ecc4005b2f4154ff259d3130ade0e7fbc5d6c05629579621ab7e4e01468ca3ab
verdict: pass
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 9/9
test_command: CHROME_BIN=<chrome --no-sandbox wrapper> npx ng test --include='**/certifications-list-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:3a7d3fabed7770966954038cff9f2280c981d1c78e44d86951311253b3b12d7c
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

## Verification Report

**Change**: audit-p16-certs-list
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**Branch**: `audit/p16-certs-list`
**Base prevista**: `staging1.0`
**PR**: https://github.com/marcostoledo96/ifts14/pull/101

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 15 |
| Tasks complete | 15 |
| Tasks incomplete | 0 |

Fases 1–4 (1.1–1.3, 2.1–2.4, 3.1–3.4, 4.1–4.4) marcadas `[x]`. Sin tareas pendientes de verify.

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
TypeScript: No errors found
EXIT:0
```

**Tests**: 27 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && npx ng test --include='**/certifications-list-page.spec.ts' --no-watch --browsers=ChromeHeadless
# Agent env: ChromeHeadless requiere wrapper --no-sandbox (proceso root).
Chrome Headless: Executed 27 of 27 SUCCESS
TOTAL: 27 SUCCESS
EXIT:0
```

**Coverage**: Not available → umbral N/A

**Trailing whitespace**: 0 matches en `certifications-list-page.{ts,html,css,spec.ts}`.

### Hard locks (inspección + diff)

| Lock | Evidencia | Estado |
|------|-----------|--------|
| Solo page product + delta + PLAN | Diff producto vs `staging1.0`: `certifications-list-page.{ts,html,css,spec.ts}`; sin P17–P21 pages | Intactos |
| Sin HTTP/token/backend | Sin `http-certifications.service.ts` ni `apps/backend` en scope P16; `error` string fijo + Reintentar | Intactos |
| Sin `errorRecuperable` | `rg errorRecuperable` en list page → none | Intactos |
| Sin filtros entrega/borrador/vencido/pendiente | Chips solo `vigente`\|`revocado`; test «sin Estado de entrega» | Intactos |
| P15 solo archive | Commit incluye archive P15 + merge main attendances spec; sin revert de producto P15 | Intactos |
| CSS mínimo | `.pager-ellipsis` bajo `.paginacion`; sin rename a `.pager` | OK |

### Spec Compliance Matrix

Requisito delta: **Listado admin de certificaciones** (`admin-certifications-frontend`; RENAMED desde mock-only + MODIFIED).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Listado admin de certificaciones | Carga vía seam listar | `certifications-list-page.spec.ts` > `no llama fetch`; stale discard; `listar` via `CERTIFICATIONS_SOURCE` | ✅ COMPLIANT |
| Listado admin de certificaciones | Filtro por estado vigente o revocado | `…` > chips validez; `chip Válida filtra solo estado vigente`; badges Válida/Revocado | ✅ COMPLIANT |
| Listado admin de certificaciones | Filtros y búsqueda combinables sin entrega | `…` > combina curso/validez/texto; `not.toContain('Estado de entrega')` | ✅ COMPLIANT |
| Listado admin de certificaciones | DNI completo y anti-token | `…` > `no expone token completo… y muestra DNI completo ficticio` | ✅ COMPLIANT |
| Listado admin de certificaciones | Paginación con paginasVisibles | `…` > `pager >5… ≤5 botones` + `pagina de a 20…` | ✅ COMPLIANT |
| Listado admin de certificaciones | Resumen gated y grammar de coincidencias | `…` > `mostrarResumen oculta… carga/error`; `1 certificación coincide…`; `grammar N>1… coinciden` | ✅ COMPLIANT |
| Listado admin de certificaciones | Vacíos y fallo recuperable de listado | `…` > empty aria-live; QA vacío/error + Reintentar; catch fijo prod | ✅ COMPLIANT |
| Listado admin de certificaciones | Navegación a detalle y PDF | `…` > enlaces detalle/PDF; CTA `/admin/certificaciones/nueva` | ✅ COMPLIANT |
| Listado admin de certificaciones | QA de vistas opcional fuera de prod | `…` > harness oculto con QA off; `ignora onVistaQA`; disponible en tests | ✅ COMPLIANT |

**Compliance summary**: 9/9 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| `paginasVisibles` | ✅ Implemented | Sliding window ≤5 (L69–76); both pagers `@for (page of paginasVisibles())` |
| `mostrarResumen` | ✅ Implemented | `vistaQA==='datos' && !cargando && !error`; HTML `@if (mostrarResumen())` |
| Grammar coincide/coinciden | ✅ Implemented | Ternario solo con `hayFiltrosActivos`; else «en el archivo» |
| Seam `listar()` + filtros client | ✅ Implemented | `certs.listar()`; filter `vigente`\|`revocado` + curso + texto |
| Honesty listado | ✅ Implemented | Mensaje fijo + Reintentar; sin `errorRecuperable` / raw `Error.message` |
| Anti-token / DNI | ✅ Implemented | `documentMasked` en UI; sin token completo |
| Delta OpenSpec | ✅ Present | `openspec/changes/audit-p16-certs-list/specs/…/spec.md` (merge main → archive) |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Copy-paste `paginasVisibles` de siblings | ✅ Yes | Misma lógica students/attendances |
| `mostrarResumen` con `vistaQA==='datos'` | ✅ Yes | Paridad students/courses |
| Grammar solo con filtros activos | ✅ Yes | Template L79 |
| No `errorRecuperable` | ✅ Yes | Locked |
| No entrega / HTTP service edits | ✅ Yes | Locked |
| Mantener `.paginacion` + `.pager-ellipsis` | ✅ Yes | CSS L712 |

### Issues Found

**CRITICAL**: None

**WARNING**: None

**SUGGESTION**:
- CSS residual `.chip-dot--borrador` / `.validez-badge--borrador|vencido` en la hoja (sin chips/filtros expuestos). Limpieza cosmética fuera de P16 si se desea.
- Tracker PLAN fila P16 sigue «en curso / verify en curso» hasta archive (esperado).
- Harness Chrome en este entorno agent necesita `--no-sandbox` (no es defecto de producto).

### Verdict

**PASS**

15/15 tasks complete; 9/9 delta scenarios COMPLIANT con evidencia runtime 27/27 SUCCESS; `tsc --noEmit` exit 0; hard locks intactos. Listo para `sdd-archive`.
