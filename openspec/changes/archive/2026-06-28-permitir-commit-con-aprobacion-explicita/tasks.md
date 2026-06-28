# Tasks: Permitir commit con aprobación explícita

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~24 (+24 / -18 a -20) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR (4 commits atómicos) |
| Delivery strategy | single-pr (auto-forecast del orchestrator) |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## 1. Preparación

- [x] 1.1 Confirmar rama activa `docs/matias-onboarding-windows` con `git branch --show-current` (NO cambiar de rama).
- [x] 1.2 Confirmar baseline working tree aceptado: `M .atl/skill-registry.md`, `?? docs/opencode/verificacion-entorno-windows.md`, `?? openspec/changes/archive/2026-06-26-f0-01-verificar-entorno-windows/`, `?? openspec/config.yaml`.
- [x] 1.3 Capturar baseline numérico: `git grep -c "no ejecutes commit, push, merge" -- MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` + variante "No hagas".
- [x] 1.4 Confirmar artefactos del change: `proposal.md`, `specs/.../spec.md`, `design.md` presentes.

## 2. Modificación de `AGENTS.md` (raíz)

- [x] 2.1 Reemplazar línea 21 (`- No commitear, pushear ni mergear automáticamente.`) por la regla con alcance de `proposal.md` §"New Rule".

## 3. Modificación de `GUIA.md` §9

- [x] 3.1 Reemplazar línea 153 (`OpenCode puede proponer comandos, pero Marcos/Matías ejecutan commit, push y merge manualmente.`) por la redacción que admite aprobación explícita de Matías.

## 4. Modificación de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`

- [x] 4.1 Identificar las ~19-22 instancias de prohibición absoluta en bloques "Prompt exacto" F0-01 a F3-06 (variantes: `No ejecutes`, `no ejecutes`, `No hagas`).
- [x] 4.2 Reemplazar cada instancia por la versión con excepción de aprobación (ver `design.md` §3, patrón exacto).
- [x] 4.3 NO modificar la fila de tabla línea 39 (describe flujo de Marcos, fuera de alcance).
- [x] 4.4 Verificar que `git grep -c "no ejecutes commit, push, merge"` retorne 0 (y la variante "No hagas" idem).

## 5. Modificación de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`

- [x] 5.1 Agregar fila aditiva debajo de la fila `Git` (línea 35) con la nota aclaratoria de `proposal.md` §"New Rule".
- [x] 5.2 NO modificar la fila Git original ni otras filas; la nota es estrictamente aditiva.

## 6. Validación automática

- [x] 6.1 `git status --short` debe mostrar los 4 archivos modificados sumados al baseline F0-01 + sdd-init.
- [x] 6.2 `git diff --stat` debe mostrar ~24 líneas netas, consistente con el design.
- [x] 6.3 `git grep -n "No commitear, pushear ni mergear" -- AGENTS.md` debe retornar 0.
- [x] 6.4 `git grep -n "ejecutan commit, push y merge manualmente" -- GUIA.md` debe retornar 0.
- [x] 6.5 Confirmar que `apps/`, `database/`, `public_html/`, `material_privado_no_versionar/` no aparecen en status ni diff.
- [x] 6.6 Confirmar que ninguna spec base en `openspec/specs/` fue modificada.

## 7. Cierre (sin ejecutar Git)

- [x] 7.1 Listar archivos tocados y delta final (inserciones/eliminaciones por archivo).
- [x] 7.2 Proponer (NO ejecutar) los 4 commits atómicos con mensajes de `design.md` §5.
- [x] 7.3 Reporte final: validaciones, bloqueos y nota para Marcos sobre la aclaración en su tabla "Rol y límites".
- [x] 7.4 Recordar al usuario: el cambio NO debe commitearse automáticamente; queda esperando aprobación explícita por turno.
