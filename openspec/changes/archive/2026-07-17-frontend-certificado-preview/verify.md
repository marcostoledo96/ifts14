```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:bdab5cd51e683f6643530c502d0edfa7e67dedb94968d29aeb33fe46c2a17c98
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 7/7
scenarios: 10/10
test_command: CHROME_BIN=.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:bdab5cd51e683f6643530c502d0edfa7e67dedb94968d29aeb33fe46c2a17c98
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:a14f505eb3117788bc9bc78bfc36fbc8f1a5877198240ef26cb0f83b0727d0f5
typecheck_command: npx tsc --noEmit -p tsconfig.app.json
typecheck_exit_code: 0
typecheck_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

# Verify — frontend-certificado-preview (Ciclo 12)

**Fecha:** 2026-07-17
**Change:** `openspec/changes/frontend-certificado-preview/`
**cwd:** `apps/frontend-angular/`
**Veredicto:** **PASS WITH WARNINGS**

## Re-verify tras apply-fix

El verify inicial falló (9 tests + CSS budget +33 B). Se corrigió:

1. Clipboard: `Object.defineProperty` en lugar de `spyOnProperty` (Chrome 149).
2. `no-real-data.spec.ts`: provider `INSTITUTIONAL_CONFIG_SOURCE`.
3. `app.routes.spec.ts`: Copiar/Compartir habilitados, sin F6-03.
4. CSS: recorte (`.btn-disabled` sin uso + transitions) → bajo 16 kB max.

## Gates

| # | Comando | Exit | Resultado |
|---|---------|------|-----------|
| 1 | `npm run test:ci` | **0** | `TOTAL: 742 SUCCESS` |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | Sin errores |
| 3 | `npm run build` | **0** | Bundle OK (warning budget 8 kB warning-only en CSS preview) |

## Spec compliance

| Requirement | Result |
|-------------|--------|
| REQ-CPREV-001…007 (10 escenarios) | ✅ COMPLIANT |

## Warnings

- CSS component warning budget (8 kB) excedido en preview y otras páginas históricas; maxError 16 kB OK.
- `NG04002 Cannot match … admin/dashboard` aparece en logs de tests de navegación previos; no falla la suite.

## Next

`sdd-archive`
