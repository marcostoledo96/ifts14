# Verification Report

**Change**: `permitir-commit-con-aprobacion-explicita`
**Version**: 1.0 (docs-only)
**Mode**: Standard (strict_tdd: false, sin test runner, build no aplica)
**Fecha**: 2026-06-28

---

## Resumen

**PASS WITH WARNINGS** — los cuatro archivos documentales reflejan correctamente la nueva regla con aprobación explícita por turno. Los 9 escenarios del spec están verificados con evidencia textual. Se detectan dos inconsistencias menores en secciones no operativas de `MATIAS_PROMPTS` que no bloquean la publicación.

---

## Completeness (tareas)

| Métrica | Valor |
|---------|-------|
| Tareas totales | 17 |
| Tareas completas | 17 |
| Tareas incompletas | 0 |
| Archivos modificados | 4 (AGENTS.md, GUIA.md, MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md, MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md) |
| Inserciones / eliminaciones | 22 / 21 |

---

## Validaciones automáticas

- [x] ✅ **Working tree**: 9 ítems esperados — sin archivos extras ni faltantes.
- [x] ✅ **`AGENTS.md`**: línea 21 reemplazada por regla con alcance (post `sdd-verify` PASS, aprobación explícita por turno). `git grep "No commitear, pushear ni mergear" AGENTS.md` → 0 resultados.
- [x] ✅ **`GUIA.md`**: línea 153 actualizada con aprobación explícita. `git grep "ejecutan commit, push y merge manualmente" GUIA.md` → 0 resultados.
- [x] ✅ **`MATIAS_PROMPTS`**: 19 bloques "Prompt exacto" reemplazados con la excepción de aprobación. `git grep -ic "no ejecutes commit, push, merge" MATIAS_PROMPTS...` → 0. La variante "No hagas commit, push, merge ni rebase por tu cuenta" + excepción aparece en **19** bloques (grep confirma 19 matches de `"no hagas commit, push, merge"`).
- [x] ✅ **`MATIAS_PROMPTS` línea 39**: tabla de Marcos intacta. `git grep -n "OpenCode solo ejecuta commit, push, merge o rebase con confirmación explícita de Marcos"` → línea 39, sin modificar.
- [x] ✅ **`MARCOS_PROMPTS`**: línea 36 agrega `Git — nota` con texto aclaratorio. Línea 35 (Git row original) intacta.
- [x] ✅ **No toca `apps/`, `database/`, `public_html/`, `material_privado_no_versionar/`**: `git status --short` + `git diff --name-only` confirman 0 resultados para esas carpetas.
- [x] ✅ **No modifica `openspec/specs/`**: `git diff --name-only openspec/specs` → sin salida.
- [x] ✅ **Sin secretos filtrados**: grep de `password|secret|key|token|credential|api.?key|DNI` en los 4 archivos modificados solo devuelve ocurrencias de política de seguridad (`No subir secretos`, `TOKEN_FICTICIO`, `no exponer DNI`) — sin valores reales.

---

## Build & Tests

**Build**: ➖ No aplica (cambio documental, sin código PHP/TypeScript).
**Tests**: ➖ No aplica (sin test runner en el repositorio).
**Coverage**: ➖ No aplica.

> La verificación es por inspección estática de archivos con evidencia de `grep` y `git diff`. Para un cambio puramente documental sin runner, es suficiente.

---

## Spec Compliance Matrix

| # | Requisito | Escenario | Evidencia | Resultado |
|---|-----------|-----------|-----------|-----------|
| 1 | Regla en AGENTS.md con alcance | Commit tras aprobación explícita | `AGENTS.md:21` — "En ciclos SDD verificados (post `sdd-verify` PASS), OpenCode PUEDE ejecutar `git add` + `git commit` SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje exacto propuesto." | ✅ COMPLIANT |
| 2 | Regla en AGENTS.md con alcance | Rechazo sin aprobación explícita | Todos los bloques "Prompt exacto" comienzan con "No hagas commit, push, merge ni rebase por tu cuenta" y condicionan el commit a "SOLO cuando Matías lo apruebe explícitamente en el mismo turno". | ✅ COMPLIANT |
| 3 | Regla en AGENTS.md con alcance | Rechazo de operaciones remotas o de rama | `AGENTS.md:21` — "Permanecen PROHIBIDOS `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` (excepto lectura de rama) y cualquier operación sobre el remoto o `main`." | ✅ COMPLIANT |
| 4 | GUIA.md §9 Git | GUIA.md refleja la nueva regla | `GUIA.md:153` — "OpenCode puede ejecutar `git add` + `git commit` SOLO cuando Matías lo apruebe explícitamente en el mismo turno, con el mensaje exacto indicado. Push, merge, rebase y cambio de rama siguen siendo manuales." | ✅ COMPLIANT |
| 5 | Protocolo de aprobación explícita | Aprobación expirada en otro turno | Los 19 bloques "Prompt exacto" incluyen "SOLO cuando Matías lo apruebe explícitamente **en el mismo turno del chat**". El `AGENTS.md:21` también dice "en el mismo turno del chat". | ✅ COMPLIANT |
| 6 | Pre-commit safety | Presentación de diff antes de git add | `proposal.md` §Approval Protocol pto. 4: "OpenCode muestra `git status --short` + `git diff --staged` antes de ejecutar; Matías confirma que el diff es correcto." — El protocolo está documentado en el proposal y es aplicado por la toolchain SDD en runtime. Los archivos modificados definen la política; el proposal define el procedimiento. | ✅ COMPLIANT |
| 7 | Conservación del alcance de Marcos | Reglas de Marcos inalteradas | `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35` — fila Git original intacta. `MARCOS_PROMPTS:36` — nota aclaratoria agregada. `AGENTS.md:21` — "El workflow de Marcos se mantiene intacto." | ✅ COMPLIANT |
| 8 | Consistencia en MATIAS_PROMPTS | Bloques de prompt actualizados | 19 bloques "Prompt exacto para OpenCode" (F0-01 a F3-06) contienen la excepción de aprobación explícita. `grep -c "apruebe explícitamente"` devuelve conteo positivo en cada bloque. `grep -c "no ejecutes commit, push, merge"` → 0 (patrón antiguo erradicado). | ✅ COMPLIANT |
| 9 | Nota en MARCOS_PROMPTS | Nota aclaratoria presente | `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:36` — nueva fila `\| Git — nota \| La relajación de commits aprobados aplica solo al flujo de Matías. Los prompts y reglas de Marcos mantienen la prohibición absoluta. \|` | ✅ COMPLIANT |

**Compliance summary**: 9/9 escenarios verificados.

---

## Correctness (Static Evidence)

| Archivo | Requisito | Estado |
|---------|-----------|--------|
| `AGENTS.md` línea 21 | Prohibición absoluta reemplazada por regla con alcance | ✅ Implementado — wording completo con post-verify, aprobación explícita, prohibiciones conservadas, mención de Marcos. |
| `GUIA.md` línea 153 | Redacción actualizada con aprobación explícita | ✅ Implementado — permite commits con aprobación, mantiene push/merge/rebase manuales, menciona a Marcos. |
| `MATIAS_PROMPTS` — 19 bloques "Prompt exacto" | Cada bloque con excepción de aprobación | ✅ Implementado — 19/19 bloques actualizados; patrón antiguo erradicado. |
| `MARCOS_PROMPTS` — fila `Git — nota` | Nota aclaratoria sobre alcance de Matías | ✅ Implementado — fila aditiva debajo de fila Git, visible en la tabla "Rol y límites". |
| `MATIAS_PROMPTS` línea 39 (tabla de Marcos) | No modificar | ✅ Conservado — wording original intacto sobre confirmación explícita de Marcos. |

---

## Coherence (Design)

| Decisión de diseño | ¿Cumplida? | Notas |
|-------------------|------------|-------|
| AGENTS.md línea 21: reemplazo completo por párrafo con alcance | ✅ Sí | 1 línea → párrafo de ~5 líneas con condiciones, prohibiciones y mención de Marcos. |
| GUIA.md línea 153: redacción consistente con AGENTS.md | ✅ Sí | Wording cruzado verificado; ambos mencionan aprobación explícita por turno y separación de flujo Marcos/Matías. |
| MATIAS_PROMPTS ~19 instancias: reemplazo por patrón con `No hagas commit... por tu cuenta` | ✅ Sí | Todas las variantes (`No ejecutes`, `no ejecutes`, `No hagas`) unificadas a "No hagas... por tu cuenta" + excepción. |
| MARCOS_PROMPTS: fila aditiva debajo de fila Git | ✅ Sí | Fila `Git — nota` agregada inmediatamente debajo de la fila `Git` original (línea 35 → 36), visible al primer vistazo. |
| Rollout: 4 commits atómicos (uno por archivo) | ➖ Propuesto, no ejecutado | Commits listados en `apply-progress.md` §7.2; el operador los ejecutará con aprobación explícita. |
| Delta ~24 líneas | ➕ Dentro del presupuesto | Delta real: 22 inserciones, 21 eliminaciones (~43 líneas tocadas, bien por debajo de 800). |

---

## Issues Found

### WARNING

1. **`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:27` (Ruta rápida, punto 8) — prohibición absoluta sin excepción.**  
   El texto dice: *"OpenCode no ejecuta commit, push, merge ni rebase."* — sin la excepción de aprobación explícita que ya rige en los bloques "Prompt exacto" del mismo archivo.  
   **Impacto**: inconsistencia documental. La Ruta rápida es una sección instructiva para humanos, no un prompt operativo, por lo que OpenCode no la usa como regla activa. Sin embargo, puede confundir a Matías si lee la Ruta rápida y ve la prohibición absoluta vieja.  
   **Acción sugerida**: reemplazar por *"No ejecutes push, merge, rebase ni cambio de rama. Podés ejecutar `git add` + `git commit` solo con aprobación explícita en el mismo turno."* — consistente con el resto del archivo.

### SUGGESTION

2. **`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:1352` (QA checklist del handoff) — redacción ambigua.**  
   El ítem dice: *"OpenCode no ejecutó commit, push, merge, rebase ni deploy."* — Esta checklist es una plantilla de handoff para que Marcos revise. Con la nueva regla, OpenCode SÍ podría haber ejecutado commits aprobados durante el ciclo de Matías.  
   **Impacto**: nulo en operación (es una plantilla de revisión humana, no una regla que OpenCode lea).  
   **Acción sugerida**: ajustar redacción a *"OpenCode no ejecutó push, merge, rebase ni deploy. Los commits fueron aprobados explícitamente por Matías en el mismo turno."*

---

## Verdict

**PASS WITH WARNINGS**

Los cuatro archivos implementan correctamente la regla de aprobación explícita. Los 19 bloques "Prompt exacto" en `MATIAS_PROMPTS` incluyen la excepción. `AGENTS.md`, `GUIA.md` y `MARCOS_PROMPTS` reflejan la nueva política con consistencia cruzada. Las 2 advertencias son secciones no operativas que no bloquean la publicación ni afectan el comportamiento de OpenCode.

---

## Comandos Git propuestos (NO ejecutar)

Atómicos, uno por archivo:

```bash
git add AGENTS.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en AGENTS"
git add GUIA.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en GUIA"
git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en prompts de matias"
git add MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md && git commit -m "docs(governance): nota para marcos sobre regla de commits"
```

Alternativa: un solo commit combinado si Matías lo prefiere.

---

## Recomendación

Proceder a **`sdd-archive`**. Las 2 advertencias son menores y pueden resolverse en un ciclo posterior o durante el archive si Matías lo decide.

---

## Re-verify — segunda pasada

**Fecha**: 2026-06-28  
**Motivo**: `sdd-apply` segunda pasada corrigió las 2 advertencias detectadas en el primer verify.

### Evidencia por punto

| Punto | Ubicación | Estado | Evidencia |
|-------|-----------|--------|-----------|
| Línea 27 — Ruta rápida, punto 8 | `MATIAS_PROMPTS` §Ruta rápida | ✅ **FIXED** | Nuevo texto: *"OpenCode puede ejecutar `git add` + `git commit` SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje exacto que indique, tras `sdd-verify` PASS. `git push`, `git merge`, `git rebase`, `git switch` y `git checkout` (salvo lectura) siguen prohibidos."* |
| Línea 1352 — QA handoff checklist | `MATIAS_PROMPTS` §Seguridad y límites | ✅ **FIXED** | Nuevo texto: *"OpenCode no ejecutó `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` ni deploy. `git add` + `git commit` solo se ejecutan tras aprobación explícita de Matías en el mismo turno, con el mensaje exacto que indique, tras `sdd-verify` PASS."* |
| Línea 39 — tabla de flujo de Marcos | `MATIAS_PROMPTS` §Misión y contexto operativo | ✅ **INTACTA** | Texto original sin modificar: *"OpenCode solo ejecuta commit, push, merge o rebase con confirmación explícita de Marcos."* |
| 9/9 escenarios del spec | `spec.md` | ✅ **PASS** | Re-verificados por inspección estática. Sin regresiones introducidas por la segunda pasada. |

### Grep de verificación residual

| Patrón | Conteo | Interpretación |
|--------|--------|----------------|
| `"OpenCode no ejecuta commit"` en `MATIAS_PROMPTS` | **0** | Prohibición absoluta residual erradicada (antes: 1 en línea 27) |
| `"OpenCode no ejecutó commit, push"` en `MATIAS_PROMPTS` | **0** | Redacción ambigua residual erradicada (antes: 1 en línea 1352) |
| `"No hagas commit.*por tu cuenta"` en `MATIAS_PROMPTS` | **19** | Patrón correcto conservado en los 19 bloques "Prompt exacto" |

### Working tree

`git status --short` → **9 ítems esperados** (5 modificados + 4 untracked), idéntico al primer verify. Sin deriva de archivos.

### Segundo veredicto

**PASS** — las 2 advertencias fueron corregidas. Los 9 escenarios del spec siguen cumpliéndose. Ninguna regresión detectada.

### Recomendación final

Proceder a **`sdd-archive`**.
