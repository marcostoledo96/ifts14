```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:eb6e643dd3daacf4163a7faea2a4057909a138fef57f5b2dc96fbafbc781b5d8
verdict: pass
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 9/9
test_command: rtk npm run test:ci
test_exit_code: 0
test_output_hash: sha256:dc7fad83a200e2099b50f75f114ddfe36e4d83ed0708aabe5c07d0f677e080d0
build_command: rtk npm run build
build_exit_code: 0
build_output_hash: sha256:9d3fe216386ab4ad441dbea5ef3cc7d9b662488ef3890fb3c45d3a35e81b8664
```

## Verification Report

**Change**: `f4-03-courses-list`
**Version**: N/A
**Mode**: Standard (`strict_tdd: false`)
**Review authority**: `review-fc99c946d72cec8e`, receipt v2 físico con `terminal_state: approved` y `evidence_hash: sha256:a7049ee17ba6ff89f1ec724a07978e98fc03084dcd843ca2128af99719ccd129`.

### Completeness

| Metric | Value |
|---|---:|
| Tasks del alcance apply + verify | 20 |
| Tasks completas | 20 |
| Tasks incompletas del alcance | 0 |
| Tasks posteriores de archive | 3, fuera de este gate |

`4.5` queda completada por este informe. `5.1`–`5.3` permanecen pendientes porque pertenecen a la fase posterior `sdd-archive`, expresamente no ejecutada.

### Build & Tests Execution

| Check | Command | Result | Output hash |
|---|---|---|---|
| Focused page | `npm test -- --watch=false --browsers=ChromeHeadless --include='**/courses-list-page.spec.ts'` | ✅ 13/13, exit 0 | `sha256:de3fdaffe7cde8ac19e60c266922a684e607c54b313a55699313ac8cfc911afa` |
| Focused service | `npm test -- --watch=false --browsers=ChromeHeadless --include='**/courses.service.spec.ts'` | ✅ 24/24, exit 0 | `sha256:b7f9bf14b5977e0dc81571f939f8adecfaadae9aea33a7657a82e0b5d206dc8b` |
| Full suite | `rtk npm run test:ci` | ✅ 485/485, exit 0 | `sha256:dc7fad83a200e2099b50f75f114ddfe36e4d83ed0708aabe5c07d0f677e080d0` |
| Build | `rtk npm run build` | ✅ exit 0 | `sha256:9d3fe216386ab4ad441dbea5ef3cc7d9b662488ef3890fb3c45d3a35e81b8664` |
| Diff hygiene | `git diff --check --ws-error-highlight=all origin/main...HEAD` | ✅ exit 0 | `sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` |

**Coverage**: ➖ No hay comando ni umbral de cobertura configurado para este cambio.

El build conserva dos warnings de presupuesto CSS preexistentes en preview/PDF de certificaciones; no pertenecen a `courses-list` y no impiden el build.

### Runtime Evidence

- La regresión de promesas invertidas pasó en Chrome Headless: la respuesta vieja no reemplaza resultado, error ni loading de la generación vigente.
- Runtime real con `ng serve`: desktop 1280×800 mostró tabla visible con 6 filas y cards ocultas; mobile 390×844 mostró 6 cards y tabla oculta.
- El filtro sin coincidencias mostró mensaje diferenciado y acción `Limpiar filtros`; la limpieza restauró los 6 cursos.
- La inspección runtime no encontró DNI, email, token ni UUID en la vista.
- Se inspeccionaron las evidencias `desktop-1280.png`, `mobile-390.png`, `loading.png`, `error.png`, `empty-total.png` y `no-results.png`; los estados son distinguibles y mantienen la jerarquía visual documentada.

### Spec Compliance Matrix

| Requirement | Scenario | Runtime/test evidence | Result |
|---|---|---|---|
| Paridad verificable y frontera F4-03 | Evidencia de paridad y privacidad | Playwright 1280×800/390×844 + evidencias de estados + `no-real-data.spec.ts` + `no-secrets.spec.ts` dentro de 485/485 | ✅ COMPLIANT |
| UI contract-ready | Listado y detalle navegables | `courses-list-page.spec.ts` enlaces + `courses.service.spec.ts` obtener con fechas | ✅ COMPLIANT |
| UI contract-ready | Edición no persistente de fechas | `course-editor-page.spec.ts` dentro de 485/485 + aviso runtime de demo en memoria | ✅ COMPLIANT |
| UI contract-ready | Tabla accesible en desktop | Focused page 13/13 + Playwright 1280×800 | ✅ COMPLIANT |
| UI contract-ready | Tarjetas de métricas en mobile | Focused page 13/13 + Playwright 390×844 | ✅ COMPLIANT |
| UI contract-ready | Filtros y limpieza | Focused page + interacción runtime sin coincidencias/limpieza | ✅ COMPLIANT |
| UI contract-ready | Carga, error y reintento | Focused page + `loading.png`/`error.png` inspeccionadas | ✅ COMPLIANT |
| UI contract-ready | Vacío y sin resultados diferenciados | Focused page + `empty-total.png`/`no-results.png` + interacción runtime | ✅ COMPLIANT |
| UI contract-ready | Acciones existentes y handoff | Focused page valida nombres/rutas; `parity-notes.md` conserva handoff F4-04 | ✅ COMPLIANT |

**Compliance summary**: 9/9 escenarios conformes.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Latest request owns result/error/loading | ✅ Implemented | `loadGeneration` invalida escrituras de generaciones anteriores en `try`, `catch` y `finally`. |
| Servicio mock y filtros | ✅ Implemented | Cuatrimestre, cantidad derivada, métricas `null` y `conFechas` están cubiertos por 24 tests focused. |
| Privacidad y frontera sin red | ✅ Implemented | Checks runtime y browser niegan DNI/email/token/UUID, HTTP, storage y secretos. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Evolución in-place | ✅ Sí | Sin rutas, componentes o dependencias nuevos. |
| Métricas sin acoplar asistencias/certificaciones | ✅ Sí | Placeholders `null`/`—` con explicación accesible. |
| Filtros delegados al servicio | ✅ Sí | `CursosFiltros` incluye `conFechas`; la página recarga por cambio. |
| Corrección mínima de concurrencia | ✅ Sí | Contador local; sin RxJS, cancelación ni abstracciones nuevas. |

### Authority Note

El receipt físico v2 existe, corresponde al lineage indicado y está aprobado. `gentle-ai review validate --lineage ... --gate post-apply` detectó `scope-changed` porque el árbol actual incluye la corrección posterior al FAIL (`candidate_tree: 44e0be276bd8d7e29cbdac347ad50193de53c23b` frente al candidato del receipt); no se clasificó como autoridad faltante ni se exigieron espejos inexistentes.

### Canonical Verification Evidence Preimage

```text
change=f4-03-courses-list
candidate_tree=44e0be276bd8d7e29cbdac347ad50193de53c23b
review_lineage=review-fc99c946d72cec8e
review_terminal_state=approved
review_evidence_hash=sha256:a7049ee17ba6ff89f1ec724a07978e98fc03084dcd843ca2128af99719ccd129
focused_page_hash=sha256:de3fdaffe7cde8ac19e60c266922a684e607c54b313a55699313ac8cfc911afa
focused_service_hash=sha256:b7f9bf14b5977e0dc81571f939f8adecfaadae9aea33a7657a82e0b5d206dc8b
test_output_hash=sha256:dc7fad83a200e2099b50f75f114ddfe36e4d83ed0708aabe5c07d0f677e080d0
build_output_hash=sha256:9d3fe216386ab4ad441dbea5ef3cc7d9b662488ef3890fb3c45d3a35e81b8664
diff_check_hash=sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b
runtime=desktop-1280-table-6rows;mobile-390-cards-6;no-results-clear;privacy-no-dni-email-token-uuid;state-images-loading-error-empty-no-results-inspected
```

Preimage SHA-256: `sha256:eb6e643dd3daacf4163a7faea2a4057909a138fef57f5b2dc96fbafbc781b5d8`.

### Issues Found

**CRITICAL**: None.
**WARNING**: Dos warnings de presupuesto CSS preexistentes y ajenos a courses-list; el validador de review informa scope cambiado por la corrección post-FAIL, no autoridad ausente.
**SUGGESTION**: None para este gate.

### Verdict

**PASS**

Los 2 requisitos y 9 escenarios tienen evidencia runtime actual; focused, suite 485/485, build y diff hygiene pasan.
