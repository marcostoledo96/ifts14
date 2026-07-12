```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:aac9dac76c91de318e83d940025da5b7b3d9810ca5035b47c0f53e3dfa55166b
verdict: pass
blockers: 0
critical_findings: 0
requirements: 3/4
scenarios: 10/11
test_command: npm run test:ci
test_exit_code: 0
test_output_hash: sha256:643fe169162ed700508c0f0415ab9a993993929c41315257ff48e7202b9a51ce
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:2a2e755beef04d3605ca728ede8524cbdd47d5b7630410635b44639dddcd1857
```

## Verification Report

**Cambio**: `f4-02-certificate-pdf-preview`  
**Versión**: N/A  
**Modo**: Standard (`strict_tdd=false`)  
**Persistencia**: OpenSpec + Engram  
**Lineage revisado**: corrección aprobada `review-c74662c658bf5781`

### Completitud

| Métrica | Valor |
|---|---:|
| Requisitos reales en delta spec | 4 |
| Escenarios reales en delta spec | 11 |
| Tareas totales | 24 |
| Tareas completas | 23 |
| Tareas pendientes | 1 (`7.2` archive) |

Las tareas de implementación, corrección y verify están completas. `7.2` permanece pendiente por secuencia explícita; no se ejecutó archive.

### Ejecución de build y tests

| Comando | Exit | Resultado | SHA-256 de salida exacta |
|---|---:|---|---|
| `bash openspec/changes/f4-02-certificate-pdf-preview/evidence/print-app-check.sh` | 0 | Angular real + login mock UI + SPA + CDP: normal `id=1` y revocado `id=5`, 1 A4 cada uno | `23daa358000ade216a2c809becefed758f8c85f0495e2ce169d62846cdef028a` |
| `npx ng test --watch=false --browsers=ChromeHeadless --include='**/certification-pdf-preview-page.spec.ts'` | 0 | 35/35 SUCCESS | `eca52b61892e445821b3ecdbbc7b9368d61163ee8dcafba5231b3483cae121ba` |
| `npx ng test --watch=false --browsers=ChromeHeadless --include='**/app.routes.spec.ts'` | 0 | 79/79 SUCCESS | `41d77f17ee9a08263c4a0f5c64dedc4badd4b9bfb506dfadab77f5a426748444` |
| `npx ng test --watch=false --browsers=ChromeHeadless --include='**/features/admin/certifications/__checks__/*.spec.ts'` | 0 | 24/24 SUCCESS | `14db4f750049260529f05405ae22ea01e373cf382047bb6d7b292654f001257f` |
| `npm run test:ci` | 0 | 474/474 SUCCESS | `643fe169162ed700508c0f0415ab9a993993929c41315257ff48e7202b9a51ce` |
| `npm run build` | 0 | Bundle completo; 2 warnings de budget CSS | `2a2e755beef04d3605ca728ede8524cbdd47d5b7630410635b44639dddcd1857` |
| `git diff --check` | 0 | Limpio | N/A |

**Coverage**: no configurada; no se declara porcentaje.

### Matriz escenarios → evidencia

| # | Requisito / escenario | Evidencia ejecutada | Resultado |
|---:|---|---|---|
| 1 | Rutas protegidas — acceso con sesión mock | `app.routes.spec.ts`; checker real completa login mock por UI y carga la ruta PDF | ✅ COMPLIANT |
| 2 | Rutas protegidas — acceso sin sesión mock | Suite de rutas/guard vigente | ✅ COMPLIANT |
| 3 | Rutas protegidas — id inválido | Specs para `abc`, `0`, `0x1`, `1e0`, `999`, vacío y route reuse | ✅ COMPLIANT |
| 4 | Previsualización segura — expediente mock | Suites F4-01/F4-02: datos mock seguros y navegación | ✅ COMPLIANT |
| 5 | Previsualización segura — handoff F4-02 y restantes | Enlaces PDF habilitados; F5-04/F6-03/F6-01 deshabilitados; sin rotación | ✅ COMPLIANT |
| 6 | Previsualización segura — id inexistente/inválido/ausente | Specs de componente, ruta y anti-race | ✅ COMPLIANT |
| 7 | Previsualización segura — frontera de datos | 24/24 checks; PDFs sin DNI/token completos, email, UUID, legajo ni matrícula | ✅ COMPLIANT |
| 8 | Paridad visual — desktop/mobile | Inspección de `pdf-desktop.png` y `pdf-mobile.png`: jerarquía, layout, estados y responsive conservados | ✅ COMPLIANT |
| 9 | Impresión nativa segura | `print-app-check.sh`: CDP `Page.printToPDF`, A4 landscape, una página por caso, controles/shell ausentes, texto completo | ✅ COMPLIANT |
| 10 | Evidencia de checks en verify | Tests focalizados, suite, build, PDFs reales y capturas desktop/mobile/print reproducidos/inspeccionados | ✅ COMPLIANT |
| 11 | Cierre documental | Documento F4-02 preparado; `sdd-archive` no ejecutado por instrucción | ⚠️ PARTIAL — diferido a la fase siguiente |

**Resumen**: 10/10 escenarios aplicables a verify compliant; 1/11 diferido exclusivamente a archive.

### Evidencia runtime independiente

- El checker autoritativo arranca `ng serve`, espera la app, completa el formulario de login mock renderizado y navega por la SPA; no usa una fixture HTML.
- `id=1` normal: PDF Chromium real de 1 página A4 (`841.92 × 594.96 pt`), hash `d5204c6f7524c74b3606c49c6e2b21b0f241827a77b4d8c3fc2a023fdab6b82c`.
- `id=5` revocado: PDF Chromium real de 1 página A4 (`841.92 × 594.96 pt`), hash `0e81b5bb7fc5a8a9ac161c5c426f62151fb9b4d2f4885fd68a316ccff2d7f37d`.
- `pdftotext` confirmó títulos, alumnos, cursos, autoridades, números de certificado, estado revocado y texto institucional completos.
- Ausentes en ambos PDFs: shell admin, controles no imprimibles, DNI/token completos, email, UUID, legajo y matrícula. La URL visible permanece truncada.
- `pdf-print.png` fue regenerada desde el PDF normal real y muestra un folio completo sin chrome ni controles; hash `438fd82f6752513a79b53a269620c7ab981cb7bae9fcf44ed547827c4f48ada9`.

### Corrección estática y coherencia de diseño

| Decisión / frontera | Estado | Evidencia |
|---|---|---|
| Página standalone lazy + provider mock vigente | ✅ Sí | Sin DTO, backend, HTTP ni storage nuevos |
| Validación decimal positiva y anti-race | ✅ Sí | Implementación y 35 specs focalizados |
| QR 8×8 local, decorativo y permanente | ✅ Sí | 64 celdas; ninguna mutación/rotación |
| `window.print()` nativo con feedback previo | ✅ Sí | rAF y guard cubiertos por specs |
| A4 landscape, colores y `.no-print` | ✅ Sí | PDFs CDP reales, 1 página y shell ausente |
| Paridad v0 sin port React literal | ✅ Sí | Desktop, mobile y print inspeccionados |
| Fixture falsa como evidencia autoritativa | ✅ Ausente | `print-pdf-check.sh` se declara explícitamente helper no autoritativo; el gate usa `print-app-check.sh` |

### Integridad y presupuesto

- `git diff --check`: exit 0.
- `package.json`, lockfiles, `angular.json` y `.atl`: sin cambios tracked ni untracked.
- Temporales habituales (`.playwright-mcp/`, `playwright-report/`, `test-results/`, `*.tmp`, `*.temp`): ausentes.
- El directorio ignorado `.app-pdf-check/` contiene únicamente los dos PDFs CDP regenerados por el checker autoritativo.
- Líneas authored actuales: 328 tracked + 3253 untracked textuales = 3581, por debajo del presupuesto 4000; binarios excluidos.
- No se ejecutaron `git add`, commit, push, switch ni archive.

### Issues encontrados

**CRITICAL**: None.

**WARNING**:

1. `requestAnimationFrame` no conserva/cancela su handle al destruir el componente; follow-up previamente aprobado y sin falla runtime observada.
2. Build conserva dos warnings de budget CSS: PDF 12,97 kB y preview 14,31 kB, ambos debajo del límite de error de 16 kB.
3. El escenario documental 11 queda diferido por diseño a `sdd-archive`; no es un defecto del producto verificado.

**SUGGESTION**: None.

### Veredicto

**PASS WITH WARNINGS**

La corrección resuelve el FAIL previo: la app Angular real produce, para los casos normal y revocado, un único A4 apaisado completo y limpio. Tests, privacidad, rutas, build, diff, evidencia visual e integridad pasan. El único escenario pendiente corresponde a archive, que no se ejecutó por instrucción.
