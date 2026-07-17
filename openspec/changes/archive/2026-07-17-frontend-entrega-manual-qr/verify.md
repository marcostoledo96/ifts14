```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:0f43fdceb730bb19e5cf6a3eea4c6d19fc7981563afba3adb7a15f648931c736
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 3/3
scenarios: 4/4
test_command: CHROME_BIN=.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:0f43fdceb730bb19e5cf6a3eea4c6d19fc7981563afba3adb7a15f648931c736
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:f1326779f25e8e869f2ab163c34a4ae1e175f0def121b5caf707578cc085e54c
typecheck_command: npx tsc --noEmit -p tsconfig.app.json
typecheck_exit_code: 0
typecheck_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

# Verify — frontend-entrega-manual-qr (Ciclo 13)

**Fecha:** 2026-07-17  
**Veredicto:** **PASS WITH WARNINGS**

## Gates

| # | Comando | Exit | Resultado |
|---|---------|------|-----------|
| 1 | `npm run test:ci` | **0** | `TOTAL: 747 SUCCESS` |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | Sin errores |
| 3 | `npm run build` | **0** | Bundle OK |

## Spec compliance

| Requirement | Result |
|-------------|--------|
| REQ-QR-001 Botón visible + aria-label | ✅ |
| REQ-QR-002 Blob + `cert-{codigo}-qr.png` + error inline | ✅ |
| REQ-QR-003 Seam HttpClient / mock | ✅ |
| REQ-DEL-002 (spec canónico actualizado) | ✅ |

## Warnings

- `NG04002 admin/dashboard` en logs de tests históricos; no falla la suite.

## Next

`sdd-archive`
