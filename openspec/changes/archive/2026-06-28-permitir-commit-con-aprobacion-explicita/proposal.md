# Proposal: Permitir commit con aprobación explícita

## Why

La prohibición absoluta "No commitear, pushear ni mergear automáticamente" genera fricción innecesaria en el ciclo SDD de Matías: después de `sdd-verify` PASS y `sdd-archive`, Matías debe copiar manualmente los comandos Git propuestos por OpenCode y ejecutarlos él mismo. Esto no aporta seguridad adicional respecto a un commit explícito aprobado en el mismo turno de chat.

El cambio reduce fricción en el loop SDD de Matías manteniendo un garde de seguridad humano-in-the-loop. La autoridad de Marcos queda intacta: esta relajación no modifica su flujo de trabajo ni sus prompts.

## What Changes

| Archivo | Razonamiento |
|---------|-------------|
| `AGENTS.md` (raíz, línea 21) | Reemplazar la prohibición absoluta por una regla con alcance: OpenCode puede ejecutar `git add` + `git commit` solo con aprobación explícita de Matías en el mismo turno, tras `sdd-verify` PASS. |
| `GUIA.md` §9 Git (línea 153) | Actualizar la frase "Marcos/Matías ejecutan commit, push y merge manualmente" para reflejar que Matías puede aprobar commits explícitos en el chat. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Actualizar todos los bloques "Prompt exacto para OpenCode" (F0-01 a F3-06) que dicen "No ejecutes commit, push, merge ni rebase" para incluir la excepción de aprobación explícita. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Agregar nota aclaratoria: la relajación aplica solo al flujo de Matías; los prompts de Marcos mantienen la prohibición absoluta. |

## New Rule (proposed wording)

### AGENTS.md — Reglas obligatorias (reemplazo de línea 21)

```txt
- Git: OpenCode PUEDE ejecutar `git add` y `git commit` únicamente cuando Matías
  aprueba explícitamente el comando exacto en el mismo turno de chat (p. ej.
  "dale, commiteá con este mensaje"), y solo dentro de un ciclo SDD activo que
  haya pasado `sdd-verify`. Quedan PROHIBIDOS: `git push`, `git merge`,
  `git rebase`, `git switch`, `git checkout` (salvo lectura de rama activa) y
  cualquier operación que afecte el remoto o `main`. Marcos mantiene autoridad
  total sobre su propio flujo; esta regla no lo afecta.
```

### GUIA.md §9 Git (reemplazo de línea 153)

```txt
OpenCode puede proponer comandos y ejecutar `git add` + `git commit` solo cuando
Matías lo aprueba explícitamente en el mismo turno. Push, merge, rebase y
cambio de rama siguen siendo manuales. Marcos decide por separado para su flujo.
```

### MATIAS_PROMPTS_SDD — Bloques "Prompt exacto" (patrón de reemplazo)

Cada instancia de:
```txt
No ejecutes commit, push, merge ni rebase.
```
Se reemplaza por:
```txt
No ejecutes push, merge, rebase ni cambio de rama. Podés ejecutar `git add` y
`git commit` solo cuando yo apruebe el comando exacto en este mismo turno.
```

### MARCOS_PROMPTS_SDD — Nota al pie de §Git (tabla de rol)

Agregar en la fila Git de la tabla "Rol y límites":
```txt
Nota: la relajación de commits aprobados aplica solo al flujo de Matías.
Los prompts y reglas de Marcos mantienen la prohibición absoluta de
commit/push/merge/rebase automáticos.
```

## Capabilities

### New Capabilities
- `git-commit-policy`: Política de ejecución de commits con aprobación explícita

### Modified Capabilities
- None

## Approach

Modificar únicamente texto documental en cuatro archivos. No hay cambio de código, infraestructura ni spec funcional. El cambio es puramente operativo: redefine qué puede ejecutar OpenCode bajo qué condiciones.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `AGENTS.md` | Modified | Línea 21: prohibición absoluta → regla con alcance |
| `GUIA.md` | Modified | §9 Git: redacción actualizada |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | ~22 bloques de prompt con la excepción de aprobación |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | Nota aclaratoria en tabla de rol |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Commit accidental de contenido no deseado | Media | OpenCode DEBE ejecutar `git status` + `git diff` y mostrar el diff antes de commitear; Matías revisa antes de aprobar. |
| Matías aprueba sin leer el diff | Media | El protocolo exige aprobación por turno con frase explícita; no valen aprobaciones genéricas ("commiteá todo"). |
| Marcos desconoce el cambio | Baja | El cambio queda archivado en `openspec/changes/`; se notifica a Marcos en su retorno. |
| Regla interpretada como override de autoridad de Marcos | Baja | El wording de AGENTS.md y la nota en MARCOS_PROMPTS dejan explícito que Marcos mantiene autoridad total. |

## Rollback Plan

Revertir los cuatro archivos a su estado anterior con `git checkout HEAD -- AGENTS.md GUIA.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`. La prohibición absoluta queda restaurada inmediatamente.

## Dependencies

- Ninguna dependencia externa.

## Success Criteria

- [ ] `AGENTS.md` línea 21 refleja la nueva regla con alcance (no prohibición absoluta).
- [ ] `GUIA.md` §9 actualizada con la redacción propuesta.
- [ ] Todos los bloques "Prompt exacto" en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (F0-01 a F3-06) ya no contienen "No ejecutes commit" sin la excepción de aprobación explícita.
- [ ] `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` incluye nota de que la relajación no aplica a Marcos.
- [ ] Ninguna spec base en `openspec/specs/` fue modificada.
- [ ] El cambio queda archivado como evidencia en `openspec/changes/`.

## Approval Protocol

OpenCode solo ejecuta `git add` + `git commit` cuando se cumplen TODAS estas condiciones:

1. **Ciclo SDD activo y verificado**: `sdd-verify` PASS y `sdd-archive` ejecutado.
2. **Aprobación explícita por turno**: Matías escribe una frase que autoriza el commit con mensaje exacto en el mismo turno. Ejemplos válidos:
   - "dale, commiteá con este mensaje: `docs(matias): verificar entorno windows`"
   - "ok, hacé el commit con `docs(repo): actualizar guia git`"
3. **No valen aprobaciones genéricas**: "commiteá todo", "dale, subí", "committeá lo que haya" son rechazados.
4. **Pre-commit obligatorio**: OpenCode muestra `git status --short` + `git diff --staged` antes de ejecutar; Matías confirma que el diff es correcto.
5. **Solo rama activa**: No se cambia de rama, no se pushea, no se mergea.
