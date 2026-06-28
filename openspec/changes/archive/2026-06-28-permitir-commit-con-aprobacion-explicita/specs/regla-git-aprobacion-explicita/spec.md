# Delta para regla-git-aprobacion-explicita

## Purpose

Esta capacidad define la autoridad limitada de OpenCode para ejecutar `git add` + `git commit` en el flujo de trabajo de Matías, únicamente bajo aprobación explícita humana en el mismo turno de chat, preservando la prohibición absoluta sobre `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` (salvo lectura) y cualquier operación remota. El flujo de Marcos permanece inalterado.

## ADDED Requirements

### Requirement: Regla en AGENTS.md con alcance

OpenCode DEBE reemplazar la prohibición absoluta de línea 21 de `AGENTS.md` por una regla con alcance: OpenCode PUEDE ejecutar `git add` y `git commit` únicamente cuando Matías aprueba explícitamente el comando exacto en el mismo turno de chat, dentro de un ciclo SDD activo que haya pasado `sdd-verify`. Quedan PROHIBIDOS `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` (salvo lectura de rama activa) y cualquier operación que afecte el remoto o `main`. Marcos mantiene autoridad total sobre su propio flujo; esta regla no lo afecta.

#### Scenario: Commit tras aprobación explícita

- GIVEN un ciclo SDD activo con `sdd-verify` PASS
- WHEN Matías aprueba explícitamente el comando exacto de `git commit` en el mismo turno (p. ej. "dale, commiteá con este mensaje: `docs(matias): verificar entorno windows`")
- THEN OpenCode PUEDE ejecutar `git add` y `git commit` con el mensaje aprobado
- AND OpenCode DEBE registrar el hash del commit y la confirmación textual de Matías en el reporte final del ciclo

#### Scenario: Rechazo sin aprobación explícita

- GIVEN un ciclo SDD activo
- WHEN Matías no escribe una frase explícita que autorice el comando exacto de `git commit` en el turno actual
- THEN OpenCode DEBE rechazar la ejecución de `git add` + `git commit`

#### Scenario: Rechazo de operaciones remotas o de rama

- GIVEN cualquier situación
- WHEN Matías solicita ejecutar `git push`, `git merge`, `git rebase`, `git switch` o `git checkout` (salvo lectura)
- THEN OpenCode DEBE rechazar la ejecución e informar que permanecen prohibidas

### Requirement: GUIA.md §9 Git

OpenCode DEBE actualizar `GUIA.md` línea 153 para reflejar que OpenCode puede ejecutar `git add` + `git commit` solo cuando Matías lo aprueba explícitamente en el mismo turno. Push, merge, rebase y cambio de rama siguen siendo manuales. Marcos decide por separado para su flujo.

#### Scenario: GUIA.md refleja la nueva regla

- GIVEN `GUIA.md` antes del cambio
- WHEN se aplica la modificación
- THEN la sección §9 Git DEBE indicar que `git add` + `git commit` requieren aprobación explícita de Matías por turno
- AND DEBE mantener la prohibición de push, merge, rebase y cambio de rama

### Requirement: Protocolo de aprobación explícita

OpenCode DEBE exigir que la aprobación de Matías cumpla con:
1. Aprobación por turno: frase explícita con mensaje exacto en el mismo turno.
2. Rechazo de aprobaciones genéricas: "commiteá todo", "dale, subí" o similares DEBEN ser rechazadas.
3. Solo rama activa: no cambiar de rama, pushear ni mergear.

#### Scenario: Aprobación expirada en otro turno

- GIVEN que Matías aprobó un commit en el turno T1
- WHEN OpenCode intenta ejecutar `git commit` en el turno T2 sin nueva aprobación
- THEN OpenCode DEBE rechazar la ejecución y solicitar nueva aprobación en T2

### Requirement: Pre-commit safety

Antes de ejecutar `git add` + `git commit`, OpenCode DEBE ejecutar `git status --short` y `git diff --name-only` (o `--staged`), presentar el resultado a Matías y esperar su confirmación de que el diff es correcto.

#### Scenario: Presentación de diff antes de git add

- GIVEN cambios pendientes en el repo
- WHEN Matías aprueba explícitamente un commit
- THEN OpenCode DEBE mostrar `git status --short` y `git diff --name-only` (o staged)
- AND DEBE esperar confirmación de Matías antes de ejecutar `git add` + `git commit`

### Requirement: Conservación del alcance de Marcos

Marcos DEBE mantener su flujo, prompts y prohibiciones intactos. Solo las aprobaciones explícitas de Matías desbloquean `git add` + `git commit` para el flujo de Matías.

#### Scenario: Reglas de Marcos inalteradas

- GIVEN `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y las reglas de Marcos en `AGENTS.md`
- WHEN se aplica el cambio
- THEN las reglas de Marcos DEBEN permanecer inalteradas
- AND `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` DEBE incluir una nota aclaratoria de que la relajación aplica solo a Matías

### Requirement: Consistencia en MATIAS_PROMPTS

Cada bloque "Prompt exacto para OpenCode" en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` que contenga la prohibición absoluta DEBE actualizarse a: prohibir `git push`, `git merge`, `git rebase` y cambio de rama; permitir `git add` + `git commit` solo con aprobación explícita de Matías en el mismo turno.

#### Scenario: Bloques de prompt actualizados

- GIVEN bloques "Prompt exacto" de F0-01 a F3-06
- WHEN se aplica el cambio
- THEN ningún bloque DEBE contener "No ejecutes commit, push, merge ni rebase" sin la excepción
- AND cada bloque DEBE indicar explícitamente la excepción de aprobación

### Requirement: Nota en MARCOS_PROMPTS

`MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` DEBE incluir una nota en la tabla "Rol y límites" (fila Git) indicando que la relajación aplica solo al flujo de Matías y que Marcos mantiene la prohibición absoluta.

#### Scenario: Nota aclaratoria presente

- GIVEN `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` sin nota
- WHEN se aplica el cambio
- THEN la fila Git DEBE incluir la nota aclaratoria

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.
