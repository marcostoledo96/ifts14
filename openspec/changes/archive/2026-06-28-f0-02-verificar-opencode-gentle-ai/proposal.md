# Propuesta: Verificar OpenCode/Gentle-AI (F0-02)

## Why

F0-02 verifica que Matías puede iniciar un ciclo SDD completo en OpenCode, respetar las prohibiciones Git vigentes y cerrar con evidencia autocontenida, sin delegar Git automático ni saltar a implementación de producto.

El alcance se reduce respecto del original definido en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 399-439) porque:
- La política Git con diff-confirmation gates ya quedó codificada en `AGENTS.md:21` y `GUIA.md:153` (commits `79a72ca` + `e890c3c`, PR #6).
- La spec base `guia-matias-angular-windows` ya cubre 4 de los 6 criterios originales: prohibiciones (Req. "Contexto operativo y misión"), flujo SDD (Req. "Flujo OpenCode/Gentle-AI y SDD"), formato de ciclos (Req. "Ciclos F0-01 a F3-06") y reporte final (Req. "Reporte final y propuestas Git").

F0-02 pasa de "definir reglas" a "verificar empíricamente que la pipeline SDD corre completa, respeta las prohibiciones y deja evidencia".

## What Changes

- Se agrega un nuevo requirement aditivo a la spec base bajo la capacidad `verificacion-flujo-opencode-sdd`, con 5 escenarios Given/When/Then.
- Se crea un archivo de evidencia en `docs/opencode/verificacion-flujo-opencode-sdd.md` que documenta el ciclo corrido, fases ejecutadas, archivos tocados y comandos Git propuestos.
- No se modifica código de producto, `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `.htaccess`, migraciones ni deploy.
- No se toca `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).

## Capabilities

> This section is the CONTRACT between proposal and specs phases.

### New Capabilities
- `verificacion-flujo-opencode-sdd`: Verificación autocontenida de que OpenCode ejecuta las 8 fases SDD sobre `ifts14`, identifica repo y rama, respeta prohibiciones Git y no genera código de producto.

### Modified Capabilities
- None (el delta referencia la spec base `guia-matias-angular-windows` sin modificar requirements existentes).

## Impact

| Área | Impacto | Descripción |
|------|---------|-------------|
| `openspec/specs/guia-matias-angular-windows/spec.md` | Modificado (delta aditivo) | Gana 1 requirement ADDED con 5 scenarios |
| `docs/opencode/verificacion-flujo-opencode-sdd.md` | Nuevo | Archivo de evidencia del ciclo F0-02 |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:402` | Opcional | Rama sugerida `docs/matias-onboarding-windows` vs. rama operativa real `docs/matias-onboarding-f0-02-f0-03` (decidir en sdd-archive) |

## Approach

1. Producir un delta de spec mínimo y aditivo (1 requirement, 4 scenarios) que no duplique la spec base.
2. Ejecutar las 8 fases SDD sobre el change `f0-02-verificar-opencode-gentle-ai`.
3. Dejar evidencia escrita en `docs/opencode/verificacion-flujo-opencode-sdd.md`.
4. Cerrar con `sdd-verify` PASS y proponer a Matías los comandos Git exactos (sin ejecutarlos).

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/` | Nuevo | Proposal, spec delta, design, tasks, verify-report |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Delta aditivo | 1 requirement nuevo (~40 líneas) |
| `docs/opencode/verificacion-flujo-opencode-sdd.md` | Nuevo | Evidencia del ciclo (~80 líneas) |

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Divergencia de rama: `MATIAS_PROMPTS` línea 402 sugiere `docs/matias-onboarding-windows`, pero la rama operativa es `docs/matias-onboarding-f0-02-f0-03` | Media | Declarar la rama real como dato en proposal y verify-report; no tratar como bloqueo |
| Solapamiento con spec base: 4 de 6 criterios ya codificados | Media | Delta estrictamente aditivo; referenciar sin duplicar |
| Trampa de auto-commit: aprobar commit sin revisar diff | Baja | Verify-report insiste en diff-confirmation gate; comandos Git solo como propuesta |

## Rollback Plan

Al ser un ciclo de documentación pura:
1. Eliminar la carpeta `openspec/changes/f0-02-verificar-opencode-gentle-ai/`.
2. Eliminar `docs/opencode/verificacion-flujo-opencode-sdd.md`.
3. Revertir el delta aditivo en `openspec/specs/guia-matias-angular-windows/spec.md`.
4. No hay dependencias, migraciones ni configuración que revertir.

## Dependencies

- Ninguna externa. La spec base `guia-matias-angular-windows` ya existe y está estable.

## Success Criteria

- [ ] El change directory sigue la estructura OpenSpec: `proposal.md`, `design.md`, `tasks.md`, `specs/verificacion-flujo-opencode-sdd/spec.md`, `verify-report.md`.
- [ ] La spec base gana exactamente 1 requirement ADDED con 5 escenarios Given/When/Then: (a) identificación de repo y rama, (b) cobertura de 8 fases SDD, (c) respeto a prohibiciones Git, (d) sin código de producto, (e) evidencia de cierre con verify-report PASS.
- [ ] Existe `verify-report.md` con veredicto PASS y sin hallazgos CRÍTICOS.
- [ ] Existe `docs/opencode/verificacion-flujo-opencode-sdd.md` con evidencia concreta: `git status --short`, nombre de rama, lista de archivos, lista de prohibiciones, confirmación de sin cambios de código.
- [ ] El ciclo cierra proponiendo a Matías el mensaje de commit convencional exacto, sin ejecutar Git por cuenta propia.

## Out of Scope

- F0-03 (leer documentación mínima y entender misión): ciclo separado.
- Scaffold de Angular o cualquier código de producto: corresponde a ciclos F1+.
- Tocar `muestra_pagina/`, `material_privado_no_versionar/`, backend PHP, base de datos, deploy.
- Modificar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Reescribir `AGENTS.md`, `GUIA.md` o `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: la política ya está formalizada.

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas | ~180 (1 spec delta ~40 + 1 evidencia ~80 + 1 verify-report ~60) |
| Riesgo de exceder presupuesto de 400 líneas | **Low** |
| PRs encadenados recomendados | **No** |
| Estrategia de entrega | single-pr |
| Decisión antes de apply | **No** |

## Open Questions

1. ¿Parcheamos el nombre de rama stale en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:402` (`docs/matias-onboarding-windows` → `docs/matias-onboarding-f0-02-f0-03`) durante sdd-archive, o lo dejamos como-is por ahora?
2. ¿El archivo de evidencia va en `docs/opencode/` (recomendado) o en `docs/frontend/`?
