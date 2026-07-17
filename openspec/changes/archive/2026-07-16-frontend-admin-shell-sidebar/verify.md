```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:8c5a553cbea355cd06eaf6cf8b4cbcce32c9121491d7d718807bebb1587ff8cb
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 8/8
scenarios: 13/16
test_command: CHROME_BIN=apps/frontend-angular/.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:8c5a553cbea355cd06eaf6cf8b4cbcce32c9121491d7d718807bebb1587ff8cb
build_command: npx tsc --noEmit -p tsconfig.app.json && npm run build
build_exit_code: 0
build_output_hash: sha256:0fdcc79fe3c63281d838d9fa9f322a967d4e86a050308c64ce2e24fa431fb532
```

# Verify — frontend-admin-shell-sidebar (Ciclo 5: Admin shell + sidebar)

**Fecha:** 2026-07-16  
**Change:** `sdd/frontend-admin-shell-sidebar/`  
**cwd:** `apps/frontend-angular/`  
**Modo:** Standard (proposal + spec + design + tasks + apply-progress)  
**Veredicto:** **PASS WITH WARNINGS**

---

## 1. Gates técnicos obligatorios

| # | Comando | Exit code | Resultado |
|---|---------|-----------|-----------|
| 1 | `npm run test:ci` | **0** | Verde — `TOTAL: 695 SUCCESS`, 0 fallas |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | `TypeScript: No errors found` |
| 3 | `npm run build` | **0** | `Application bundle generation complete` |

### Detalle gate 1 (`test:ci`)

`test:ci` = `no-focused-tests.test.mjs` + `no-focused-tests.mjs` + `ng test --watch=false --browsers=ChromeHeadless`.

- Suite Karma/Jasmine: `TOTAL: 695 SUCCESS` (11.45 s / 11.135 s).
- Specs focalizados del ciclo: `admin-shell.spec.ts` + `sidebar-admin.spec.ts` incluidos en la suite global y verdes.

**Nota de entorno (CHROME_BIN wrapper --no-sandbox):** el runner requiere Chrome headless sin sandbox. Se ejecutó con:

```bash
cd apps/frontend-angular
export CHROME_BIN="$(pwd)/.verify-tmp/chrome-wrapper.sh"
# wrapper → /usr/bin/google-chrome --no-sandbox --headless=new --disable-gpu \
#   --user-data-dir=.../.verify-tmp/chrome-home
npm run test:ci
```

`test_output_hash`: `sha256:8c5a553cbea355cd06eaf6cf8b4cbcce32c9121491d7d718807bebb1587ff8cb`

### Detalle gate 2 (`tsc`)

```text
TypeScript: No errors found
TSC_EXIT:0
```

`tsc` log hash: `sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a`

### Detalle gate 3 (`build`)

Build OK. Lazy chunk `admin-shell` generado (`chunk-TUEA647P.js`, 15.38 kB raw).  
Warnings de presupuesto CSS **preexistentes** y ajenos a este ciclo (`student-detail-page.css`, `certification-revoke-page.css`, `certification-pdf-preview-page.css`, `certification-preview-page.css`).

`build_output_hash`: `sha256:0fdcc79fe3c63281d838d9fa9f322a967d4e86a050308c64ce2e24fa431fb532`

---

## 2. Completitud de tareas

| Fase | Tareas | Estado |
|------|--------|--------|
| Phase 1 — RED | 1.1, 1.2, 1.3 | ✅ `[x]` |
| Phase 2 — GREEN sidebar | 2.1, 2.2, 2.3, 2.4 | ✅ `[x]` |
| Phase 3 — GREEN topbar | 3.1, 3.2, 3.3, 3.4 | ✅ `[x]` |
| Phase 4 — Openspec + progress | 4.1, 4.2, 4.3, 4.4 | ✅ `[x]` |

**14/14 tareas completadas.** Sin tareas pendientes que bloqueen archive.

---

## 3. Spec coverage (REQ-SHELL-01…08 + admin-foundation)

Fuente: `sdd/frontend-admin-shell-sidebar/spec.md` + `openspec/specs/admin-shell-chrome/spec.md`.

| REQ | Escenario | Test / evidencia | Resultado |
|-----|-----------|------------------|-----------|
| **REQ-SHELL-01** | Visible no-op | `admin-shell.spec.ts` › search editable + SVG; HTML sin `(input)`/`ngModel`/navigate | ⚠️ **PARTIAL** — no assert de tipeo runtime |
| **REQ-SHELL-01** | Oculto mobile | CSS `@media (min-width: 40rem)` en `admin-shell.css` | ⚠️ **PARTIAL** — sin test viewport |
| **REQ-SHELL-02** | Presentación | `admin-shell.spec.ts` › “Sincronizado” sin `\d:\d` | ✅ **COMPLIANT** |
| **REQ-SHELL-02** | Oculto | CSS `@media (min-width: 48rem)` | ⚠️ **PARTIAL** — sin test viewport |
| **REQ-SHELL-03** | Monograma | `admin-shell.spec.ts` › avatar `AD`, sin `MP` | ✅ **COMPLIANT** |
| **REQ-SHELL-04** | Sin legacy | `admin-shell.spec.ts` › sin “Sesión activa” / títulos Admin/Panel | ✅ **COMPLIANT** |
| **REQ-SHELL-05** | Marca | `sidebar-admin.spec.ts` › “IFTS N.° 14” + “Bedelía · Panel” + SVG; CSS `--color-ink` | ⚠️ **PARTIAL** — ink no assertado en test |
| **REQ-SHELL-06** | Label | `sidebar-admin.spec.ts` › “Operación”, sin “Secciones” | ✅ **COMPLIANT** |
| **REQ-SHELL-06** | Barra 2px | `.active` en tests + CSS `.nav-active-bar` width 2px `--color-circuit` | ⚠️ **PARTIAL** — sin `getComputedStyle` 2px |
| **REQ-SHELL-07** | Config en pie | `sidebar-admin.spec.ts` › Config ×1 footer, ausente en Operación; 5 ítems | ✅ **COMPLIANT** |
| **REQ-SHELL-07** | Logout | sidebar emit + `admin-shell.spec.ts` › logout → `/admin/login` | ✅ **COMPLIANT** |
| **REQ-SHELL-08** | Sin Help/Bell ni deps | search test sin Ayuda/Notificaciones; sin lucide/shadcn en `package.json` | ✅ **COMPLIANT** |
| **REQ-SHELL-08** | Drawer intacto | tests drawer open/close/overlay/`aria-controls` condicional | ✅ **COMPLIANT** |
| **foundation** | Navegación accesible | skip-link, landmarks banner/main/contentinfo, Alumnos activo, drawer `aria-controls` | ✅ **COMPLIANT** |
| **foundation** | Sin deps visuales nuevas | tokens F1-02 + SVG inline; sin Tailwind/lucide en deps | ✅ **COMPLIANT** |
| **foundation** | Chrome v0 sin legacy | shell + sidebar asserts combinados | ✅ **COMPLIANT** |

**Cobertura:** 11/16 escenarios **COMPLIANT**, 5/16 **PARTIAL**, 0 **FAILING**/ **UNTESTED**.  
Requisitos REQ-SHELL-01…08: **8/8** implementados (ninguno ausente).

### Locks / anti-patrones verificados

| Criterio | Evidencia | Estado |
|----------|-----------|--------|
| Search editable no-op | `input type=search` sin handlers de negocio | ✅ |
| Sync “Sincronizado” sin hora | DOM + regex anti-timestamp | ✅ |
| Avatar AD | `.topbar-avatar` = `AD` | ✅ |
| Sin Sesión activa | assert topbar | ✅ |
| Sidebar ink + Operación | CSS ink + heading | ✅ |
| Config única footer | count = 1 | ✅ |
| Logout funcional | `ADMIN_AUTH.logout` + navigate login | ✅ |
| Sin Help/Bell | asserts + markup | ✅ |
| Rutas/auth del ciclo | `apply-progress`: shell/sidebar only; `admin-shell.ts` logout intacto | ✅ (ver W4) |

---

## 4. Coherencia con design

| Decisión | ¿Seguida? | Notas |
|----------|-----------|-------|
| In-place AdminShell + SidebarAdmin | ✅ | Sin componentes nuevos |
| Omitir Help/Bell | ✅ | Lock cerrado |
| Sync “Sincronizado” sin timestamp | ✅ | |
| Avatar AD | ✅ | |
| Search editable no-op | ✅ | |
| Config solo footer | ✅ | `ITEMS`×5 + `CONFIG_ITEM` |
| SVG inline / sin lucide | ✅ | |
| Breakpoints 40rem / 48rem / 64rem | ✅ | CSS presente |
| No tocar `app.routes.ts` / auth en este ciclo | ✅ | Apply no modificó shell auth; ver W4 working tree |

Sin desviaciones que rompan spec.

---

## 5. Issues

### CRITICAL

_Ninguno._

### WARNING

- **W1 — Viewport media queries:** escenarios “search oculto `< sm`” y “sync oculto `< md`” solo están en CSS (`40rem`/`48rem`); no hay test de media query. No bloquea: implementación presente.
- **W2 — Barra activa 2px:** tests cubren clase `.active` y markup `.nav-active-bar`; el ancho 2px/`--color-circuit` es evidencia CSS, no `getComputedStyle`.
- **W3 — Tema ink / no-op tipeo:** marca e ink dependen de CSS; search no-op de escritura no se ejercita con `dispatchEvent`/`type`.
- **W4 — Working tree concurrente:** `app.routes.ts` aparece modificado en el árbol sucio por ciclos hermanos (config institucional, nueva certificación, título dashboard), **no** por el apply de este chrome. El lock del ciclo se respeta en los archivos del change; no mezclar al stagear.
- **W5 — CHROME_BIN --no-sandbox:** mismo workaround de ciclos previos bajo entorno headless/root.

### SUGGESTION

- **S1 — Paridad visual:** screenshot vs `muestra_pagina` no automatizado; review humana opcional en archive.
- **S2 — Karma `ChromeHeadlessNoSandbox`:** documentar/custom launcher en CI para evitar wrapper ad-hoc.

---

## 6. Verdict

**PASS WITH WARNINGS**

Gates 1–3 exit 0; 14/14 tasks; REQ-SHELL-01…08 implementados; 11/16 escenarios COMPLIANT y 5 PARTIAL (CSS/viewport/no-op tipeo sin assert runtime). Sin CRITICAL. Listo para `sdd-archive`.
