# Especificación: Guía ejecutable de Matías para Angular en Windows

## Propósito

Definir los requisitos documentales para reescribir `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como una guía operativa, verificable y apta para ejecutar ciclos SDD desde Windows, sin modificar código ni dependencias del producto.

## Requirements

### Requirement: Contexto operativo y misión

La guía DEBE explicar la misión de Matías, el alcance frontend Angular 20, las fuentes de verdad y las prohibiciones: no tocar backend, base, deploy, `material_privado_no_versionar/`, ni dependencias no aprobadas. Sobre la regla de Git: OpenCode PUEDE ejecutar operaciones Git con aprobación explícita de Matías en el mismo turno del chat, comando exacto y evidencia previa. `git add` + `git commit` + `git push` a la rama actual requieren `sdd-verify` PASS, diff-confirmation gate antes de stage y pre-push safety antes de push. La preparación de rama o PR puede ocurrir antes de `sdd-verify` cuando el ciclo lo necesita. La creación/cambio de rama requiere árbol limpio o decisión explícita de stash/commit/abortar, y rama fuente explícita/actualizada. La única prohibición dura para Matías es `git push` directo a `main`. Marcos mantiene autoridad total sobre su propio workflow.

#### Scenario: Inicio correcto
- DADO que Matías abre la guía
- CUANDO lee la primera sección
- ENTONCES entiende objetivo, rol, alcance y restricciones antes de ejecutar comandos

### Requirement: Preparación de entorno Windows

La guía DEBE incluir comandos PowerShell para verificar Node.js, npm, Angular CLI, Git y VS Code, más orientación `winget` y alternativa manual cuando `winget` no esté disponible.

#### Scenario: Herramienta faltante
- DADO que una verificación falla
- CUANDO Matías consulta la guía
- ENTONCES encuentra instalación sugerida y validación posterior

### Requirement: Flujo OpenCode/Gentle-AI y SDD

La guía DEBE describir el flujo OpenCode/Gentle-AI con ciclos pequeños, TDD cuando haya implementación, `sdd-archive` obligatorio y reporte final. Política Git vigente: OpenCode PUEDE ejecutar `git add` + `git commit` + `git push` (a la rama actual, nunca a `main`), abrir PR, crear/cambiar ramas, hacer merge o rebase solo con aprobación explícita de Matías en el mismo turno del chat, con comando exacto y evidencia previa. La única prohibición dura para Matías es `git push` directo a `main`. Marcos decide por separado para su flujo.

#### Scenario: Cierre de ciclo
- DADO un ciclo terminado
- CUANDO Matías sigue la guía
- ENTONCES ejecuta validaciones, QA manual, `sdd-archive` y deja `git add` + `git commit` + `git push`, PR, creación/cambio de rama, merge o rebase bajo aprobación explícita de Matías por turno, con comando exacto, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar cuando corresponda

### Requirement: Uso de `muestra_pagina/`

La guía DEBE tratar `muestra_pagina/` como referencia visual y funcional; si está vacía, DEBE bloquear la implementación del frontend final y limitar el trabajo a estructura, documentación o preparación.

#### Scenario: Carpeta vacía
- DADO que `muestra_pagina/` no contiene diseño utilizable
- CUANDO un ciclo propone UI final
- ENTONCES la guía indica no inventar pantallas y reportar bloqueo

### Requirement: Política frontend, pruebas y QA

La guía DEBE cubrir política de dependencias frontend, pruebas automáticas mínimas y una checklist obligatoria de QA manual: responsive, accesibilidad, navegación, estados de carga/error/vacío, comparación con referencia, consola limpia y no regresión visual.

#### Scenario: Validación completa
- DADO un cambio frontend ejecutable
- CUANDO Matías valida el ciclo
- ENTONCES corre pruebas automáticas disponibles y completa QA manual detallado antes de cerrar

### Requirement: Errores comunes y límites

La guía DEBE listar errores comunes a evitar: trabajar en `main`, saltear SDD, copiar React/Next literalmente, instalar dependencias sin aprobación, inventar contratos API, ignorar `AGENTS.md`, tocar material privado o cerrar sin pruebas.

#### Scenario: Acción riesgosa
- DADO que Matías intenta una acción fuera de alcance
- CUANDO consulta “qué no hacer”
- ENTONCES identifica el riesgo y pide definición a Marcos

### Requirement: Ciclos F0-01 a F3-06

La guía DEBE reorganizar ciclos ejecutables F0-01 a F3-06. Cada ciclo DEBE incluir: objetivo, rama, archivos a leer, comandos, prompt exacto para OpenCode, validaciones automáticas, QA manual, documentación de `sdd-archive`, qué no hacer y mensaje de commit sugerido.

#### Scenario: Ciclo autocontenido
- DADO cualquier ciclo entre F0-01 y F3-06
- CUANDO Matías lo ejecuta sin contexto externo
- ENTONCES puede saber qué leer, qué pedir, cómo validar y cómo reportar

### Requirement: Reporte final y propuestas Git

La guía DEBE exigir un reporte final por ciclo con resumen, archivos tocados, pruebas, QA, bloqueos, documentación actualizada, riesgos y comandos Git ejecutables solo con aprobación explícita de Matías en el mismo turno del chat, con comando exacto y evidencia previa. OpenCode no ejecuta `git add`, `git commit`, `git push`, PR, creación/cambio de rama, merge ni rebase sin esa aprobación. La única prohibición dura para Matías es `git push` directo a `main`.

#### Scenario: Entrega revisable
- DADO un ciclo listo para revisión
- CUANDO Matías prepara la entrega
- ENTONCES Marcos recibe evidencia suficiente para revisar y decidir commit, push o merge

### Requirement: Política Git menos restrictiva para el flujo de Matías

La guía DEBE indicar que, para el flujo de Matías, la única operación Git siempre prohibida es `git push` directo a `main`. El resto de las operaciones Git puede permitirse cuando Matías las aprueba explícitamente en el mismo turno, con comando exacto, evidencia previa y el gate práctico que corresponda. Para `git add` + `git commit` + `git push` a la rama de trabajo, el gate incluye `sdd-verify` PASS, `git status --short`, `git diff --name-only` y pre-push safety. Si existe `origin/<rama>`, el pre-push safety usa `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, la guía DEBE declarar que la ref remota no existe y comparar contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`. Para crear o cambiar ramas, abrir PR, mergear o rebasear, la guía DEBE exigir aprobación explícita, comando exacto, evidencia previa y árbol limpio, o una decisión explícita de stash/commit/abortar. Para leer un archivo histórico sin modificar el working tree, la guía DEBE usar `git show <commit>:<archivo>`; `git checkout <commit> -- <archivo>` no se documenta como lectura read-only y requiere el gate normal si se usa para restaurar un path.

#### Scenario: Preparación de rama antes de `sdd-verify`
- DADO que un ciclo nuevo necesita crear o cambiar rama antes de iniciar implementación
- CUANDO OpenCode propone `git switch`, `git checkout`, `git branch`, `git switch -c` o `git checkout -b`
- ENTONCES presenta rama actual, estado del working tree, base o destino, confirma que el árbol está limpio o pide decisión explícita de stash/commit/abortar, y espera aprobación de Matías antes de ejecutar.

#### Scenario: Primer push de una rama sin ref remota
- DADO que `origin/<rama>` todavía no existe
- CUANDO OpenCode prepara el pre-push safety
- ENTONCES no marca como PASS un `fatal: ambiguous argument`; declara primer push y muestra `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat` contra la base aprobada.

#### Scenario: Lectura histórica de archivo sin tocar el working tree
- DADO que OpenCode necesita consultar un archivo en otro commit
- CUANDO la operación es solo lectura
- ENTONCES usa `git show <commit>:<archivo>`; si propone `git checkout <commit> -- <archivo>`, lo trata como restauración de path y requiere aprobación explícita con el gate normal.

### Requirement: Verificación del flujo OpenCode/Gentle-AI

El ciclo F0-02 DEBE producir evidencia documental de que OpenCode/Gentle-AI respeta, en una corrida real, las reglas operativas ya codificadas en `AGENTS.md` y `GUIA.md`. La evidencia DEBE consistir en un reporte verificable en `docs/opencode/verificacion-flujo-opencode-sdd.md` y un verify-report archivado en `openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/verify-report.md`.

#### Scenario: Identificación correcta del repositorio y la rama
- DADO que OpenCode arranca una sesión de trabajo
- CUANDO Matías formula el prompt del ciclo F0-02
- ENTONCES OpenCode identifica el repositorio `ifts14`, la ruta pública `/certificados/`, la rama activa `docs/matias-onboarding-f0-02-f0-03` y el HEAD esperado, sin confundir el repositorio con el directorio padre.

#### Scenario: Recorrido completo de las 8 fases SDD
- DADO un ciclo F0-02 en ejecución
- CUANDO OpenCode responde al prompt
- ENTONCES enuncia y aplica, en este orden, las fases `explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify` y `archive`, sin saltear a implementación directa.

#### Scenario: Respeto de las prohibiciones y la política Git vigente
- DADO cualquier acción Git propuesta por OpenCode
- CUANDO Matías evalúa la propuesta
- ENTONCES OpenCode nunca propone `git push` directo a `main`; las demás operaciones Git solo se proponen con aprobación explícita de Matías, comando exacto, evidencia previa, diff-confirmation gate o pre-push safety cuando corresponda, y árbol limpio o decisión explícita de stash/commit/abortar.

#### Scenario: Cero modificaciones de producto
- DADO que F0-02 es un ciclo de documentación pura
- CUANDO el ciclo termina
- ENTONCES el diff de producto/runtime NO incluye cambios en `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, ni en archivos de configuración de runtime (Dockerfile, docker-compose, `.htaccess`, etc.).

#### Scenario: Evidencia de cierre
- DADO el ciclo F0-02 cerrado
- CUANDO Matías revisa la entrega
- ENTONCES encuentra un verify-report con PASS, un reporte de evidencia en `docs/opencode/` con secciones fijas (objetivo, comandos ejecutados y resultados, archivos tocados, validaciones, bloqueos, comandos Git solo propuestos), y un mensaje de commit sugerido con la forma `docs(matias): verificar flujo opencode sdd (F0-02)`.

### Requirement: Misión de Matías sintetizada para onboarding frontend

El ciclo F0-03 DEBE producir una síntesis operativa en `docs/opencode/onboarding-matias-frontend.md` que codifique la misión, el alcance permitido, el fuera de alcance, las fuentes de verdad y los límites de Matías antes de iniciar trabajo de producto frontend (ciclos F1+). La síntesis DEBE enlazar (no duplicar) las 8 fuentes vigentes: `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md`. La síntesis DEBE declarar explícitamente el estado real de `muestra_pagina/` (NO vacía: v0 export con 7 pantallas disponibles y 12 pendientes) y respetar el scaffold Angular 20 preexistente de Marcos en `apps/frontend-angular/` (35/35 tests, build verde). El ciclo F0-03 es documental puro: no genera código de producto, no toca `apps/`, no toca `muestra_pagina/` (read-only), no toca `material_privado_no_versionar/`, no toca `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos) y no toca las ramas no mergeadas `docs/matias-onboarding-f0-02-f0-03` ni `docs/policy-git-switch-checkout`.

#### Scenario: Mati puede explicar su misión, alcance y fuera de alcance a partir de la síntesis
- DADO que Mati arrancó un nuevo ciclo de frontend o necesita responder una consulta sobre su rol
- CUANDO consulta la síntesis operativa
- ENTONCES encuentra una sección clara de "Misión", una de "Alcance permitido" (con bullets concretos de lo que SÍ le corresponde: Angular 20, adaptación de `muestra_pagina/`, UI/UX, Tailwind, responsive, accesibilidad) y una de "Fuera de alcance" (con bullets concretos de lo que NO le corresponde: backend PHP, MariaDB, deploy cPanel, `material_privado_no_versionar/`, secretos, dependencias no aprobadas, decisiones que requieren coordinación con Marcos)

#### Scenario: La síntesis cita las 8 fuentes vigentes por nombre y las enlaza
- DADO que la síntesis operativa necesita ser breve y mantenible
- CUANDO Mati o un revisor la lee
- ENTONCES la síntesis NO duplica el contenido de las 8 fuentes; en su lugar, las enlaza explícitamente con su ruta relativa (`README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md`) y cita los puntos clave de cada una (1-3 bullets por fuente) que son relevantes para la misión

#### Scenario: La síntesis declara el estado real de `muestra_pagina/` y del scaffold Angular
- DADO que el estado del proyecto evolucionó desde la redacción original de F0-03
- CUANDO Mati o un revisor lee la sección "Estado del proyecto" de la síntesis
- ENTONCES encuentra una declaración explícita de que `muestra_pagina/` tiene v0 export con 7 pantallas disponibles (prompts 4-10) y 12 pendientes (prompts 11-22), y de que `apps/frontend-angular/` ya tiene el scaffold Angular 20 de Marcos con tests pasando. La síntesis incluye una sección "Qué sigue" que apunta a los ciclos F1+ como el lugar donde se arranca el trabajo de producto

#### Scenario: La síntesis respeta el scaffold preexistente y no propone rehacerlo
- DADO que Marcos ya creó el scaffold Angular 20 con build verde
- CUANDO Mati considera arrancar trabajo de producto
- ENTONCES la síntesis declara explícitamente "respetar el scaffold existente, no rehacerlo" y enlaza al `apps/frontend-angular/AGENTS.md` para los detalles. Cualquier ciclo F1+ que proponga rehacer el scaffold es out-of-scope

#### Scenario: La síntesis declara el ciclo como documental puro y deja evidencia de cierre
- DADO que F0-03 es un ciclo de documentación
- CUANDO Mati o un revisor verifica el cierre del ciclo
- ENTONCES la síntesis NO contiene código de producto, NO contiene secretos, NO contiene dumps y NO contiene referencias al contenido de `material_privado_no_versionar/` (solo nombra la carpeta y la regla). El verify-report de F0-03 reporta PASS con 5/5 Scenarios mapeados a evidencia. El mensaje de commit sugerido es `docs(matias): registrar onboarding frontend`
