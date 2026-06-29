# Especificación: Guía ejecutable de Matías para Angular en Windows

## Propósito

Definir los requisitos documentales para reescribir `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como una guía operativa, verificable y apta para ejecutar ciclos SDD desde Windows, sin modificar código ni dependencias del producto.

## Requirements

### Requirement: Contexto operativo y misión

La guía DEBE explicar la misión de Matías, el alcance frontend Angular 20, las fuentes de verdad y las prohibiciones: no tocar backend, base, deploy, `material_privado_no_versionar/`, ni dependencias no aprobadas. Sobre la regla de Git: OpenCode PUEDE ejecutar `git add` + `git commit` + `git push` (a la rama actual, nunca a `main`) con aprobación explícita de Matías en el mismo turno del chat, con el mensaje y comando exactos, y siempre con un diff-confirmation gate previo (mostrar `git status --short` y `git diff --name-only` antes de stage, y `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat` antes de push). Permanecen PROHIBIDOS `git merge`, PR, `git rebase`, `git switch`, `git checkout` (salvo lectura) y `git push` a `main`. Marcos mantiene autoridad total sobre su propio workflow.

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

La guía DEBE describir el flujo OpenCode/Gentle-AI con ciclos pequeños, TDD cuando haya implementación, `sdd-archive` obligatorio y reporte final. Política Git vigente (commit `79a72ca`): OpenCode PUEDE ejecutar `git add` + `git commit` + `git push` (a la rama actual, nunca a `main`) con aprobación explícita de Matías en el mismo turno del chat, con el mensaje y comando exactos, y siempre con un diff-confirmation gate previo. `git merge`, PR, `git rebase`, `git switch` y `git checkout` (salvo lectura) siguen prohibidos. Marcos decide por separado para su flujo.

#### Scenario: Cierre de ciclo
- DADO un ciclo terminado
- CUANDO Matías sigue la guía
- ENTONCES ejecuta validaciones, QA manual, `sdd-archive` y deja `git add` + `git commit` + `git push` bajo aprobación explícita de Matías por turno (con diff-confirmation gate); `git merge` y PR siguen siendo manuales de Marcos o de Mati según corresponda

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

La guía DEBE exigir un reporte final por ciclo con resumen, archivos tocados, pruebas, QA, bloqueos, documentación actualizada, riesgos y comandos Git ejecutables solo con aprobación explícita de Matías en el mismo turno del chat (con diff-confirmation gate previo). OpenCode no ejecuta `git add`, `git commit` ni `git push` sin esa aprobación. `git merge` y PR siguen siendo manuales.

#### Scenario: Entrega revisable
- DADO un ciclo listo para revisión
- CUANDO Matías prepara la entrega
- ENTONCES Marcos recibe evidencia suficiente para revisar y decidir commit, push o merge

### Requirement: Verificación del flujo OpenCode/Gentle-AI

El ciclo F0-02 DEBE producir evidencia documental de que OpenCode/Gentle-AI respeta, en una corrida real, las reglas operativas ya codificadas en `AGENTS.md` y `GUIA.md`. La evidencia DEBE consistir en un reporte verificable en `docs/opencode/verificacion-flujo-opencode-sdd.md` y un verify-report en `openspec/changes/f0-02-verificar-opencode-gentle-ai/verify-report.md`.

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
- ENTONCES OpenCode NUNCA propone `git merge`, PR, `git rebase`, `git switch`, `git checkout` (salvo lectura) ni `git push` a `main`; y solo propone `git add` + `git commit` + `git push` (a la rama actual) bajo el diff-confirmation gate y la aprobación explícita de Matías en el mismo turno del chat.

#### Scenario: Cero modificaciones de producto
- DADO que F0-02 es un ciclo de documentación pura
- CUANDO el ciclo termina
- ENTONCES el diff de la rama NO incluye cambios en `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, ni en archivos de configuración de runtime (Dockerfile, docker-compose, `.htaccess`, etc.); solo cambios documentales en `openspec/changes/f0-02-verificar-opencode-gentle-ai/` y `docs/opencode/verificacion-flujo-opencode-sdd.md`.

#### Scenario: Evidencia de cierre
- DADO el ciclo F0-02 cerrado
- CUANDO Matías revisa la entrega
- ENTONCES encuentra un verify-report con PASS, un reporte de evidencia en `docs/opencode/` con secciones fijas (objetivo, comandos ejecutados y resultados, archivos tocados, validaciones, bloqueos, comandos Git solo propuestos), y un mensaje de commit sugerido con la forma `docs(matias): verificar flujo opencode sdd (F0-02)`.
