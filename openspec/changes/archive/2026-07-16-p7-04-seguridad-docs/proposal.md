# Proposal: P7-04 Seguridad y Docs CI

## Intent

Agregar un nuevo job `security-docs-gates` al workflow que ejecute gitleaks, validación de enlaces internos, detección de términos obsoletos, chequeo de carpetas OpenSpec huérfanas y `git diff --check`. Además, corregir los 2 términos obsoletos residuales encontrados en spec y UI copy.

## Scope

### In
- Nuevo job `security-docs-gates` en el workflow con:
  - Gitleaks (con `.gitleaks.toml` de allowlist para tokens de test y `muestra_pagina/`).
  - `git diff --check` (whitespace errors).
  - Script de enlaces internos rotos.
  - Script de términos obsoletos (SMTP, PHPMailer, firma digital verificada, reenvío automático, M4-01B, entregado, pendiente-entrega, requiere-nueva-entrega).
  - Script de carpetas OpenSpec huérfanas en `openspec/changes/`.
- Limpiar 3 carpetas OpenSpec huérfanas: `m4-01a-*`, `m4-02-*`, `p5-03-environments`.
- Corregir `pendiente-entrega` en `openspec/specs/frontend-http-services/spec.md`.
- Corregir `entregado` en `public-validation-page.html`.

### Out
- No se modifica `muestra_pagina/` (referencia v0, no producto).
- No se agregan hooks de pre-commit (solo CI).
- No se escanea `material_privado_no_versionar/`.

## Approach

Crear un nuevo job liviano que corre en paralelo con los existentes. Scripts simples en bash/Node para cada check. Gitleaks usa la acción oficial con allowlist.

## Risks

| Risk | Mitigation |
|------|------------|
| Gitleaks falsos positivos en `muestra_pagina/` | Allowlist en `.gitleaks.toml` |
| Script de términos obsoletos con falsos positivos | Regex precisas, excluir bloques de código y contexto histórico |
| Mover carpetas OpenSpec rompe referencias | Verificar que no hay scripts/CI que las referencien |

## Success Criteria

- [ ] Job `security-docs-gates` pasa todos los checks.
- [ ] Gitleaks no detecta secretos reales.
- [ ] Enlaces internos válidos.
- [ ] 0 términos obsoletos en docs/producto vigentes.
- [ ] 0 carpetas OpenSpec huérfanas en `openspec/changes/`.
- [ ] `git diff --check` limpio.
