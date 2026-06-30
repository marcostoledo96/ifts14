# Especificación delta: Política Git menos restrictiva para Matías

## ADDED Requirements

### Requirement: Operaciones Git con aprobación explícita y evidencia práctica

Para el flujo de Matías, OpenCode DEBE tratar `git push` directo a `main` como la única operación Git siempre prohibida. El resto de las operaciones Git puede ejecutarse si Matías las aprueba explícitamente en el mismo turno del chat, con el comando exacto y evidencia previa suficiente. `git add` + `git commit` + `git push` a la rama de trabajo requieren `sdd-verify` PASS, diff-confirmation gate antes de stage y pre-push safety antes de push. La preparación de rama o PR puede ocurrir antes de `sdd-verify` si el ciclo lo necesita.

#### Scenario: Preparación de rama antes de `sdd-verify`
- DADO que un ciclo nuevo necesita crear o cambiar rama
- CUANDO OpenCode propone `git switch`, `git checkout`, `git branch`, `git switch -c` o `git checkout -b`
- ENTONCES presenta rama actual, estado del working tree, base o destino, exige árbol limpio o una decisión explícita de stash/commit/abortar, y espera aprobación de Matías antes de ejecutar.

#### Scenario: Cierre de rama con commit y push
- DADO que un ciclo pasó `sdd-verify` y `sdd-archive`
- CUANDO OpenCode propone `git add` + `git commit` + `git push` a la rama de trabajo
- ENTONCES ejecuta primero `git status --short` y `git diff --name-only`, presenta el diff a Matías, espera confirmación, y antes del push ejecuta el pre-push safety correspondiente.

#### Scenario: Primer push sin rama remota
- DADO que `origin/<rama>` no existe todavía
- CUANDO OpenCode prepara el pre-push safety
- ENTONCES no marca como PASS un `fatal: ambiguous argument`; declara que es primer push y compara contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`.

#### Scenario: PR, merge y rebase bajo gate normal
- DADO que Matías solicita abrir PR, mergear o rebasear
- CUANDO OpenCode evalúa la operación
- ENTONCES la operación requiere aprobación explícita de Matías, comando exacto, evidencia previa del estado de ramas y árbol limpio o decisión explícita de stash/commit/abortar.

#### Scenario: Lectura histórica sin modificar el working tree
- DADO que OpenCode necesita leer un archivo desde otro commit
- CUANDO la operación es solo lectura
- ENTONCES usa `git show <commit>:<archivo>`. Si propone `git checkout <commit> -- <archivo>`, lo trata como restauración de path y requiere el gate normal.
