## Verification Report

**Change**: f1-02-v0-design-system  
**Version**: N/A  
**Mode**: Standard (`strict_tdd: false`)  
**Branch**: frontend/v0-design-system-f1-02

### Completeness

| Metric | Value |
|---|---:|
| Tasks total (`tasks.md`) | 21 |
| Tasks complete | 21 |
| Tasks incomplete | 0 |

> Cierre: la tarea 5.4 `sdd-archive` se ejecutó el 2026-07-07 (ver `archive-report.md`). Esta copia vive en `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/` como evidencia archivada.

| Gate | Result | Evidence |
|---|---|---|
| W1 landmarks | ✅ PASS | `app.html` mantiene `skip-link`, un `main#contenido`, footer `contentinfo`; `HeaderInstitucional` aporta el único `role="banner"`; `FolioShell` no agrega `banner`, `main` ni `contentinfo`. |
| W2 `dl/dt/dd` válido | ✅ PASS | `public-validation-page.html` usa `<dt>/<dd>` nativos con `[appCampoDato]`; tests verifican ausencia de wrappers custom dentro del `<dl>`. |
| W3 QA manual/static | ✅ PASS con límites | Playwright local en `127.0.0.1:4420/certificados/validar/demo-valido`: anchos 1026px y 390px, foco del skip-link visible, contraste mínimo medido 5.19:1, consola sin warnings/errors. Comparación visual estática contra tokens y membrete de `muestra_pagina/app/globals.css`; no hubo diff visual pixel-perfect. |

### Git Scope

| Check | Result |
|---|---|
| Rama | ✅ `frontend/v0-design-system-f1-02` según preflight y artifacts. |
| Alcance de archivos | ✅ Solo frontend Angular, docs frontend/índice y OpenSpec del cambio. |
| Backend/base/deploy/material privado | ✅ Sin cambios detectados en `apps/backend-php`, `database`, `deploy`, `material_privado_no_versionar`. |
| Dependencias/package | ✅ Sin cambios en `package.json`/`package-lock.json`; no se agregaron Tailwind, shadcn, CVA, lucide ni fuentes web. |
| Presupuesto de revisión | ⚠️ Producto+docs queda dentro del presupuesto; si se incluye todo OpenSpec/verify en el mismo PR, el diff puede superar 1500 líneas. |

### Build & Tests Execution

**Build**: ✅ Passed

```text
cd apps/frontend-angular && npm run build
Resultado: OK. Initial total 263.84 kB / 75.22 kB transfer; lazy public-validation-page 8.96 kB; salida en dist/frontend-angular.
```

**Tests**: ✅ 96 passed / ❌ 0 failed / ⚠️ 0 skipped

```text
cd apps/frontend-angular && npm run test:ci
Resultado: no-focused-tests: ok; Chrome Headless 149; TOTAL: 96 SUCCESS.
```

**Coverage**: ➖ Not available. No hay umbral de cobertura configurado para este ciclo.

### Spec Compliance Matrix

| Requirement | Scenario | Evidence | Result |
|---|---|---|---|
| Tokens visuales v0 en Angular | Tokens disponibles para la app | `styles.css` define color, tipografía, radios, espaciado, foco y motion; `npm run build` pasó. | ✅ COMPLIANT |
| Tokens visuales v0 en Angular | Sin dependencia visual nueva | `git status/diff` y `package.json` sin cambios de dependencias. | ✅ COMPLIANT |
| Primitivos reutilizables y accesibles | Render reutilizable | Specs de `BandaEstado`, `CampoDato`, `HeaderInstitucional`, `FolioShell` pasaron. | ✅ COMPLIANT |
| Primitivos reutilizables y accesibles | Accesibilidad mínima | Specs ARIA/landmarks pasaron; Playwright confirmó foco visible y landmarks. | ✅ COMPLIANT |
| Validación pública alineada sin cambiar D0 | Certificado verificable conserva contrato | `public-validation-page.spec.ts` confirma DNI completo, fechas asistidas y no exposición de token/stack/rutas; Playwright lo confirmó en DOM. | ✅ COMPLIANT |
| Validación pública alineada sin cambiar D0 | Estados no verificables conservados | Specs cubren revocado/expirado/inexistente/error técnico; Playwright confirmó `status` y `alert` según caso. | ✅ COMPLIANT |
| Documentación fuente de verdad | Handoff visual documentado | `docs/frontend/02-sistema-visual-v0-f1-02.md` creado y enlazado desde `docs/frontend/00-angular20-port-v0.md` y `docs/00-indice-general.md`. | ✅ COMPLIANT |
| Documentación fuente de verdad | Límites explícitos del ciclo | Doc F1-02 excluye admin/backend/deploy/base/material privado/Tailwind/React copy; scope git coincide. | ✅ COMPLIANT |

**Compliance summary**: 8/8 scenarios compliant.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Tokens y foco global | ✅ Implemented | `:root`, `:focus-visible`, `prefers-reduced-motion` y clases `.campo-*` están en `styles.css`. |
| Primitivos Angular | ✅ Implemented | Los 4 primitivos existen como standalone; `CampoDato` es directiva sobre `dt/dd`, decisión correcta para W2. |
| Validación pública D0 | ✅ Implemented | Mantiene DNI completo público, fechas asistidas, errores seguros y no expone token completo. |
| Documentación | ✅ Implemented | Fuente visual F1-02 creada y enlaces mínimos actualizados. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| CSS custom properties sin Tailwind | ✅ Yes | No hay nuevas dependencias ni cambios package. |
| Standalone Angular con `input()` | ✅ Yes | Usado en componentes/directiva. |
| SVG inline decorativo | ✅ Yes | Monograma con `aria-hidden="true"`. |
| `system-ui` + `ui-monospace` | ✅ Yes | Tokens tipográficos globales. |
| `CampoDato` como componente | ⚠️ Deviated safely | Se convirtió a directiva `[appCampoDato]` para conservar semántica válida de `<dl>`. Desvío justificado y probado. |
| `FolioShell` integrado en página pública | ⚠️ Deferred | Está creado/testeado, pero no se integra todavía; aceptable por alcance mínimo y ciclos F2/F4. |

### Issues Found

**CRITICAL**: None.

**WARNING**:
- El presupuesto de 1500 líneas puede superarse si se incluye todo OpenSpec/verify en el PR junto con producto y docs.
- QA visual fue liviano: no se conservan capturas ni se hizo comparación pixel-perfect contra `muestra_pagina/`.
- (Resuelto post-verify) 5.4 `sdd-archive` ejecutado el 2026-07-07; carpeta archivada en `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/`.

**SUGGESTION**:
- Si la regla documental “toda pantalla pública usa `BandaEstado` para estado válido” se interpreta de forma literal, alinear el caso válido en un ciclo posterior; no bloquea la spec actual porque el estado verificable sigue siendo visible y testeado.

### Verdict

PASS WITH WARNINGS

La implementación cumple specs, diseño y tareas verificables con tests/build en verde. Quedan advertencias no bloqueantes de archivo, presupuesto de revisión y QA visual no pixel-perfect.
