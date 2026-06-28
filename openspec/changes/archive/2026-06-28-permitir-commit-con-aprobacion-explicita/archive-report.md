# Archive Report — permitir-commit-con-aprobacion-explicita

**Change**: `permitir-commit-con-aprobacion-explicita`
**Fecha de archive**: 2026-06-28
**Rama**: `docs/matias-onboarding-windows`
**Modo**: both (filesystem + Engram)
**Versión archive**: 1.0 (docs-only, sin código)

---

## Resumen

Relajación de la prohibición absoluta de Git para permitir `git add` + `git commit` por OpenCode bajo aprobación explícita de Matías en el mismo turno del chat, post `sdd-verify` PASS. Workflow de Marcos intacto.

---

## Artefactos

### Artefactos del change (6)

| Archivo | Ubicación en archive | Tamaño | Propósito |
|---|---|---|---|
| `proposal.md` | `openspec/changes/archive/2026-06-28-permitir-commit-con-aprobacion-explicita/proposal.md` | 6.3 KB | Intención, alcance, riesgos, protocolo de aprobación explícita. |
| `specs/regla-git-aprobacion-explicita/spec.md` | `openspec/changes/archive/.../specs/regla-git-aprobacion-explicita/spec.md` | 5.0 KB | Delta con 7 requirements (AGENTS.md, GUIA.md, protocolo, pre-commit safety, alcance de Marcos, MATIAS_PROMPTS, MARCOS_PROMPTS). |
| `design.md` | `openspec/changes/archive/.../design.md` | 5.6 KB | Decisiones de diseño por archivo, estrategia atómica de aplicación, diagrama de flujo de aprobación, validación con `grep`. |
| `tasks.md` | `openspec/changes/archive/.../tasks.md` | 3.4 KB | 17/17 tareas completadas (sin tareas pendientes ni stale checkboxes). |
| `apply-progress.md` | `openspec/changes/archive/.../apply-progress.md` | 6.2 KB | Bitácora de aplicación: baseline, fases 1-7, segunda pasada de fix, delta final 22/21. |
| `verify-report.md` | `openspec/changes/archive/.../verify-report.md` | 13 KB | Verificación completa: 9/9 escenarios PASS, primera pasada con 2 warnings, re-verify con las 2 warnings resueltas. |

### Archivos modificados en el working tree (4)

| Archivo | Cambio | Líneas (ins/del) |
|---|---|---|
| `AGENTS.md` | Línea 21: prohibición absoluta → regla con alcance (post `sdd-verify` PASS, aprobación explícita por turno, push/merge/rebase/switch/checkout siguen prohibidos, workflow de Marcos intacto). | 1 / 1 |
| `GUIA.md` | §9 Git (línea 153): redacción actualizada para admitir `git add` + `git commit` con aprobación explícita de Matías. | 1 / 1 |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | 19 bloques "Prompt exacto para OpenCode" (F0-01 a F3-06) actualizados con la excepción de aprobación explícita; línea 27 (Ruta rápida) y línea 1352 (handoff QA) corregidas en segunda pasada. | 19 / 19 |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Fila aditiva `Git — nota` agregada debajo de la fila `Git` en la tabla "Rol y límites" (línea 36). Fila original intacta. | 1 / 0 |

**Delta total**: 22 inserciones, 21 eliminaciones (dentro del presupuesto de 800 líneas, 2.75%).

---

## Validación final

Recap del `verify-report.md` (versión 1.0):

| Métrica | Valor |
|---|---|
| Escenarios del spec | **9/9 PASS** |
| Warnings al cierre | **0** (las 2 advertencias del primer verify fueron resueltas en la segunda pasada) |
| Regresiones | **0** |
| Working tree | **9 ítems esperados** (5 modificados + 4 untracked), sin deriva de archivos |
| `AGENTS.md` línea 21 | Reemplazada por regla con alcance — `grep` retorna 0 instancias de prohibición absoluta |
| `GUIA.md` línea 153 | Redacción actualizada — `grep` retorna 0 instancias de prohibición absoluta |
| `MATIAS_PROMPTS` — 19 bloques "Prompt exacto" | Todos con excepción de aprobación explícita — `grep -c "no ejecutes commit, push, merge"` → 0; `grep -c "apruebe explícitamente"` → positivo en los 19 |
| `MATIAS_PROMPTS` línea 39 (tabla de Marcos) | Intacta — sin modificar |
| `MARCOS_PROMPTS` línea 36 (nueva nota) | Fila aditiva presente y visible |
| Sin tocar `apps/`, `database/`, `public_html/`, `material_privado_no_versionar/` | Confirmado por `git status --short` + `git diff --name-only` |
| Sin modificar `openspec/specs/` | `git diff --name-only openspec/specs` → sin salida |
| Sin secretos filtrados | `grep` de `password|secret|key|token|credential|api.?key|DNI` en los 4 archivos solo devuelve menciones de política — sin valores reales |

**Verdict final**: PASS (post segunda pasada). Apto para archive.

---

## Segunda pasada

El primer `sdd-verify` (2026-06-28, 17:08) detectó **2 advertencias** en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`:

1. **Línea 27** — "Ruta rápida", punto 8. Decía *"OpenCode no ejecuta commit, push, merge ni rebase."* sin la excepción de aprobación explícita.
2. **Línea 1352** — Checklist de handoff QA. Decía *"OpenCode no ejecutó commit, push, merge, rebase ni deploy."* con redacción ambigua frente a la nueva regla.

Ambas se corrigieron en una **segunda pasada de `sdd-apply`** y se re-verificaron:

- **Línea 27** ahora dice: *"OpenCode puede ejecutar `git add` + `git commit` SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje exacto que indique, tras `sdd-verify` PASS. `git push`, `git merge`, `git rebase`, `git switch` y `git checkout` (salvo lectura) siguen prohibidos."*
- **Línea 1352** ahora dice: *"OpenCode no ejecutó `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` ni deploy. `git add` + `git commit` solo se ejecutan tras aprobación explícita de Matías en el mismo turno, con el mensaje exacto que indique, tras `sdd-verify` PASS."*

**Grep residual post-fix**:
- `"OpenCode no ejecuta commit"` en `MATIAS_PROMPTS` → **0** (antes: 1)
- `"OpenCode no ejecutó commit, push"` en `MATIAS_PROMPTS` → **0** (antes: 1)
- `"No hagas commit.*por tu cuenta"` en `MATIAS_PROMPTS` → **19** (patrón correcto conservado)

El re-verify emitió verdict **PASS** y autorizó el archive.

---

## Sincronización de specs

**No se modificó ninguna spec base en `openspec/specs/`.**

Este es un cambio **delta-only documental**:
- El spec del change (`specs/regla-git-aprobacion-explicita/spec.md`) define una capacidad netamente operativa (política de ejecución de Git) sin escenarios de producto. No se relaciona con ningún `openspec/specs/<dominio>/spec.md` existente, por lo que no hay fusión a `main specs`.
- `git diff --name-only openspec/specs` retorna **vacío**, confirmando que las specs base no fueron tocadas.

Cumplimiento de la regla de `openspec/AGENTS.md`: *"Al cerrar un ciclo, ejecutar `sdd-archive` y actualizar `openspec/specs/` si el contrato cambió."* — el contrato de specs no cambió en este ciclo, por lo que no se requiere fusión.

---

## Actualizaciones de documentación

| Documento | Sección | Cambio |
|---|---|---|
| `AGENTS.md` | Reglas obligatorias (línea 21) | Reemplazada prohibición absoluta de Git por regla con alcance: `git add` + `git commit` permitidos solo con aprobación explícita de Matías en el mismo turno del chat, post `sdd-verify` PASS. Push, merge, rebase, switch, checkout (salvo lectura) y remoto siguen prohibidos. Workflow de Marcos intacto. |
| `GUIA.md` | §9 Git (línea 153) | Redacción actualizada: OpenCode puede ejecutar `git add` + `git commit` SOLO con aprobación explícita de Matías por turno. Push, merge, rebase y cambio de rama siguen manuales. Marcos decide por separado. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | 19 bloques "Prompt exacto" F0-01 a F3-06; Ruta rápida (línea 27); handoff QA (línea 1352) | Todos los lugares que decían "No ejecutes commit, push, merge ni rebase" ahora dicen "No hagas commit, push, merge ni rebase por tu cuenta" + excepción de aprobación explícita. Las dos secciones adicionales (Ruta rápida, handoff) corregidas en segunda pasada. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Tabla "Rol y límites", fila `Git — nota` (línea 36) | Nota aclaratoria aditiva: *"La relajación de commits aprobados aplica solo al flujo de Matías. Los prompts y reglas de Marcos mantienen la prohibición absoluta."* Fila `Git` original (línea 35) intacta. |

No se requirieron actualizaciones a `docs/frontend/`, `docs/backend/`, `docs/deploy/`, `docs/opencode/` ni `database/docs/` — el cambio es puramente de gobernanza de Git, no de producto ni infraestructura.

---

## Comandos Git propuestos

**NO EJECUTAR.** OpenCode no debe correr `git add`, `git commit`, `git push`, `git merge`, `git rebase`, `git switch` ni `git checkout` salvo lectura. Estos comandos quedan a la espera de la aprobación explícita de Matías en el mismo turno del chat, según la nueva regla implementada por este change (pero aún **inactiva**, ver §"Activación de la nueva regla" abajo).

### Opción A — 4 commits atómicos (recomendado por el design)

```bash
git add AGENTS.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en AGENTS"
git add GUIA.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en GUIA"
git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en prompts de matias"
git add MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md && git commit -m "docs(governance): nota para marcos sobre regla de commits"
```

### Opción B — 1 commit combinado

```bash
git add AGENTS.md GUIA.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en flujo de matias"
```

### Decisión del operador

Matías elige entre A (4 commits atómicos) o B (1 commit combinado) al momento de aprobar. Si aprueba la Opción A, OpenCode podrá ejecutar los 4 comandos en orden. Si aprueba la Opción B, OpenCode ejecutará el comando único.

### Pre-commit safety obligatorio

Antes de cualquier `git add` + `git commit`, OpenCode ejecutará y mostrará a Matías:

```bash
git status --short
git diff --staged --stat
git diff --staged
```

Matías confirmará que el diff coincide con lo esperado (los 4 archivos documentales, sin filtrar secretos ni material privado) antes de aprobar el commit. El commit NO se ejecuta sin esa confirmación.

---

## Nota para Marcos

El cambio ya está archivado en el working tree (sin commitear aún, esperando la aprobación de Matías para ejecutar `git add` + `git commit` con la nueva regla). Lo vas a ver de tres formas posibles:

1. **Inspección del working tree** (en tu próxima sesión): los 4 archivos aparecen modificados y el directorio `openspec/changes/archive/2026-06-28-permitir-commit-con-aprobacion-explicita/` aparece como untracked.
2. **PR review** (cuando Matías abra el PR desde `docs/matias-onboarding-windows`): el diff contiene las 4 modificaciones documentales.
3. **Fila aditiva en tu tabla "Rol y límites"** (`MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:36`): una fila `Git — nota` debajo de la fila `Git` original, que dice textualmente:

> *"La relajación de commits aprobados aplica solo al flujo de Matías. Los prompts y reglas de Marcos mantienen la prohibición absoluta."*

Tu workflow, tus prompts y tus prohibiciones **no cambian**. La relajación aplica exclusivamente al flujo de Matías. La fila `Git` original (línea 35) que te describe sigue intacta. Si querés que tu flujo también tenga una relajación equivalente, abrí un change SDD propio y no modifiques este.

---

## Activación de la nueva regla

**Estado de la regla al momento de este archive**: **INACTIVA**.

Este change IMPLEMENTA la nueva regla de aprobación explícita en los 4 archivos documentales, pero la regla **no se vuelve operativa** hasta que Matías ejecute manualmente el commit del change (con su propia aprobación explícita por turno, según el protocolo documentado en `proposal.md` §Approval Protocol). Hasta entonces:

- OpenCode **NO** ejecuta `git add` ni `git commit` (ni siquiera con la nueva regla).
- OpenCode **NO** ejecuta `git push`, `git merge`, `git rebase`, `git switch` ni `git checkout` (salvo lectura de rama activa) — sigue la prohibición absoluta vieja.
- La rama `docs/matias-onboarding-windows` no se commitea, no se pushea, no se mergea.

**Una vez que Matías commitee este change**, la nueva regla se vuelve ACTIVA y OpenCode podrá ejecutar `git add` + `git commit` bajo aprobación explícita por turno en futuros ciclos SDD de Matías, respetando las 5 condiciones del protocolo (ciclo activo, post `sdd-verify` PASS, aprobación por turno con mensaje exacto, rechazo de aprobaciones genéricas, solo rama activa, pre-commit safety con `git status` + `git diff`).

El siguiente paso humano-operado es entonces retomar el flujo SDD original, cuyo próximo ciclo en el orden de Marcos es **F0-02 — Verificar OpenCode/Gentle-AI** (optimización de tokens, lectura del skill-registry, lectura de PONTAJE/PONTAJE_CODEGRAPH si existen).

---

## Auditoría de archive

- [x] Carpeta `openspec/changes/permitir-commit-con-aprobacion-explicita/` movida (no copiada, no borrada) a `openspec/changes/archive/2026-06-28-permitir-commit-con-aprobacion-explicita/`.
- [x] Carpeta activa ya no contiene el change (verificado con `git status --short`: el `??` apunta al nuevo archive path).
- [x] Los 6 artefactos están presentes en el archive (proposal, spec, design, tasks, apply-progress, verify-report).
- [x] `tasks.md` archivado tiene 0 tareas pendientes (17/17 completas; 2 fixes de segunda pasada documentados en `apply-progress.md` §"Apply — segunda pasada").
- [x] Working tree final tiene los 9 ítems esperados (5 modificados + 4 untracked) y nada más.
- [x] Ningún archivo de `material_privado_no_versionar/` fue tocado.
- [x] Ningún archivo de `openspec/specs/` fue modificado.
- [x] No se ejecutaron comandos `git add`, `git commit`, `git push`, `git merge`, `git rebase`, `git switch` ni `git checkout` durante este archive.
- [x] No se imprimieron secretos, credenciales, dumps ni rutas privadas reales.
- [x] Idioma del reporte: español argentino formal.

---

## Estado del ciclo SDD

`permitir-commit-con-aprobacion-explicita` está **cerrado y archivado**. El SDD cycle (proposal → spec → design → tasks → apply → verify → archive) completó las 7 fases. El change queda como evidencia histórica en `openspec/changes/archive/`. Aplica la regla de `openspec/AGENTS.md`: *"No borrar cambios archivados: son evidencia."*
