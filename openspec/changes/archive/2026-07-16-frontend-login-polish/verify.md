```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:28f8d04d91d457d72233a8715b9cb6f0decde7b04ffc1af14c177f039e3d0037
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 6/6
scenarios: 7/8
test_command: CHROME_BIN=.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:c344adb625296596a041db2926dbaffe8731c13ed8ae31efed8a1928cfc72fe5
build_command: npx tsc --noEmit -p tsconfig.app.json && npm run build
build_exit_code: 0
build_output_hash: sha256:e8b6bb91d4b6bedf42048cb3a7b409e6d2f9229ca6aadecd5493fec4975412a8
```

# Verification Report — frontend-login-polish

**Change**: `frontend-login-polish` (Ciclo 4: Login UI polish)
**Version**: N/A (ciclo local `sdd/frontend-login-polish/`)
**Mode**: Standard (`strict_tdd: false`)
**Cwd**: `apps/frontend-angular/`
**Fecha**: 2026-07-16

## Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 9 |
| Tasks complete | 9 |
| Tasks incomplete | 0 |

Todas las tareas 1.1–3.3 marcadas `[x]` en `tasks.md` / `apply-progress.md`.

## Environment / Chrome sandbox

El proceso corre como `uid=0 (root)`. Chrome Headless requiere `--no-sandbox`.

**Workaround usado** (documentado también en apply-progress):

```bash
export CHROME_BIN="$(pwd)/.verify-tmp/chrome-wrapper.sh"
# wrapper: /usr/bin/google-chrome --no-sandbox --headless=new --disable-gpu \
#   --user-data-dir=.../.verify-tmp/chrome-home
npm run test:ci
```

Sin este wrapper, Karma/Chrome falla en este entorno root.

## Build & Tests Execution

### 1. `npm run test:ci`

| Campo | Valor |
|-------|-------|
| Exit code | **0** |
| Resultado | **TOTAL: 691 SUCCESS** |
| Output hash | `sha256:c344adb625296596a041db2926dbaffe8731c13ed8ae31efed8a1928cfc72fe5` |
| Notas | Incluye `no-focused-tests` OK + Karma ChromeHeadless |

### 2. `npx tsc --noEmit -p tsconfig.app.json`

| Campo | Valor |
|-------|-------|
| Exit code | **0** |
| Resultado | TypeScript: No errors found |
| Output hash | `sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a` |

### 3. `npm run build`

| Campo | Valor |
|-------|-------|
| Exit code | **0** |
| Resultado | Bundle OK → `dist/frontend-angular` (~2.9 s) |
| Output hash | `sha256:e8b6bb91d4b6bedf42048cb3a7b409e6d2f9229ca6aadecd5493fec4975412a8` |
| Warnings | CSS budget excedido en páginas **no** tocadas por este ciclo (student-detail, revoke, pdf-preview, preview) — fuera de alcance login |

**Coverage (Karma % threshold)**: ➖ Not available / no exigido en este ciclo.

## Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| REQ-LOGIN-001 | Iconos visibles | `login-form.spec.ts` › incluye iconos SVG decorativos en los inputs | ✅ COMPLIANT |
| REQ-LOGIN-002 | Toggle password | `login-form.spec.ts` › alterna visibilidad de la clave con aria-pressed | ✅ COMPLIANT |
| REQ-LOGIN-003 | Estado verificando | `login-form.spec.ts` › muestra Verificando… y deshabilita el fieldset cuando loading + `login-page.spec.ts` › activa loading durante el login asíncrono | ✅ COMPLIANT |
| REQ-LOGIN-004 | Aviso visible | `login-form.spec.ts` › muestra el aviso de auditoría institucional | ✅ COMPLIANT |
| REQ-LOGIN-005 | Copy card y CTA | `login-page.spec.ts` › Panel de certificaciones; `login-form.spec.ts` › CTA idle es Ingresar; ayuda Coordinación presente en HTML sin assert dedicado | ⚠️ PARTIAL |
| REQ-LOGIN-006 | Contrato preservado | `login-form.spec.ts` › emite accesoSimulado con credenciales (`username`/`password`) + no contiene credenciales demo React | ✅ COMPLIANT |
| Delta admin-foundation | Aviso de auditoría en login | Mismos tests REQ-LOGIN-004 + `openspec/specs/admin-foundation/spec.md` actualizado | ✅ COMPLIANT |
| Delta admin-foundation | Dashboard mesa de trabajo | `admin-dashboard-page.spec.ts` › mesa de trabajo / Panel de certificaciones (suite CI) | ✅ COMPLIANT |

**Compliance summary**: 7/8 escenarios ✅ COMPLIANT; 1/8 ⚠️ PARTIAL (ayuda Coordinación Académica sin assert explícito).

## Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Iconos username/password SVG `aria-hidden` | ✅ Implemented | Inline SVG en `login-form.html`; sin librería de iconos |
| Toggle password | ✅ Implemented | `type="button"`, `aria-pressed`, labels ES |
| Loader Verificando + disabled/aria-busy | ✅ Implemented | `loading` input en form; signal + `finally` en page |
| Aviso auditoría ShieldCheck | ✅ Implemented | `role="note"`; sin «Acceso simulado» |
| Aside institucional + footer | ✅ Implemented | Marca IFTS / Bedelía, grilla, estado; footer restringido; mobile: `aside-brand` visible, mensaje/estado `display:none` |
| Auth intacta / no demo / contrato | ✅ Implemented | `admin-auth.service.ts` sin diff; payload `{ username, password }`; sin `usuario.demo@example.invalid` |

## Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| SVG inline (no lucide) | ✅ Yes | |
| Loading en page → `[loading]` form | ✅ Yes | |
| Aside en template de page | ✅ Yes | |
| Mobile: barra de marca (no hide total) | ✅ Yes | Fuente CSS; sin test de media query |
| Auth sin cambios | ✅ Yes | |

## Issues Found

**CRITICAL**: None

**WARNING**:
1. Escenario REQ-LOGIN-005 PARTIAL: el copy «Coordinación Académica» está en el template pero no hay `expect(...).toContain('Coordinación')` en specs.
2. Barra de marca mobile cubierta por CSS/estructura, no por test automatizado de viewport.
3. `ng build` emite warnings de CSS budget en features ajenas al ciclo (no bloquean exit 0).

**SUGGESTION**:
1. Renombrar el output `accesoSimulado` → nombre neutro (p. ej. `credentialsSubmitted`) en un ciclo de cleanup; no afecta contrato auth ni UI.
2. Agregar assert de ayuda Coordinación en `login-form.spec.ts` para cerrar el PARTIAL.

## Auth / demo gates (REQ-LOGIN-006)

| Check | Result |
|-------|--------|
| Diff `admin-auth.service.ts` | Vacío (no modificado) |
| Payload emit | `{ username, password }` |
| Demo React en UI Angular | Ausente (test + grep) |
| «Acceso simulado» | Ausente (tests form + page) |

## Verdict

**PASS WITH WARNINGS**

Gates obligatorios en verde (test:ci 691, tsc, build); 9/9 tasks; REQ-LOGIN-001..006 implementados con evidencia de runtime salvo un PARTIAL menor en la ayuda a Coordinación. Listo para `sdd-archive` si se aceptan los warnings.
