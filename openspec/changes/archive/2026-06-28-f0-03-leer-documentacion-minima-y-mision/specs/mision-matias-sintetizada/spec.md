# Especificación delta: Misión de Matías sintetizada para onboarding frontend

## Propósito

F0-03 es el tercer y más importante ciclo del onboarding de Fase 1 de Matías. Produce una síntesis operativa que codifica el rol, alcance, fuentes de verdad y límites de Matías **antes** de iniciar trabajo de producto frontend (ciclos F1+). Sin esta evidencia autocontenida, los ciclos F1+ arrancarían sobre terreno implícito: Matías "habría leído" la documentación, pero no habría evidencia verificable de qué entendió ni hasta dónde llega.

La síntesis **no duplica** las 8 fuentes vigentes — las **enlaza** (per `docs/AGENTS.md:11`: "No duplicar documentación: enlazar la fuente vigente") y agrega únicamente la interpretación operativa que Mati necesita para decidir, en cada ciclo futuro, si una tarea está dentro o fuera de su alcance.

## Cambios respecto a la spec base

Esta spec agrega UNA capacidad nueva a `openspec/specs/guia-matias-angular-windows/spec.md`. No modifica ni elimina Requirements existentes. Es el 10° Requirement de la spec base.

## ADDED Requirements

### Requirement: Misión de Matías sintetizada para onboarding frontend

El ciclo F0-03 DEBE producir una síntesis operativa en `docs/opencode/onboarding-matias-frontend.md` que codifique la misión, el alcance permitido, el fuera de alcance, las fuentes de verdad, y los límites de Matías antes de iniciar trabajo de producto frontend (F1+). La síntesis DEBE enlazar (no duplicar) las 8 fuentes vigentes: `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md`. La síntesis DEBE declarar explícitamente el estado real de `muestra_pagina/` (NO vacía: v0 export con 7 pantallas disponibles y 12 pendientes) y respetar el scaffold Angular 20 preexistente de Marcos en `apps/frontend-angular/` (35/35 tests, build verde). El ciclo F0-03 es documental puro: no genera código de producto, no toca `apps/`, no toca `muestra_pagina/` (read-only), no toca `material_privado_no_versionar/`, no toca `openspec/changes/backend-public-endpoint-hardening/` (Marcos), no toca las ramas no mergeadas `docs/matias-onboarding-f0-02-f0-03` ni `docs/policy-git-switch-checkout`.

#### Scenario: Mati puede explicar su misión, alcance y fuera de alcance a partir de la síntesis

- DADO que Mati arrancó un nuevo ciclo de frontend o necesita responder una consulta sobre su rol
- CUANDO consulta la síntesis operativa
- ENTONCES encuentra una sección clara de "Misión", una de "Alcance permitido" (con bullets concretos de lo que SÍ le corresponde: Angular 20, adaptación de `muestra_pagina/`, UI/UX, Tailwind, responsive, accesibilidad), y una de "Fuera de alcance" (con bullets concretos de lo que NO le corresponde: backend PHP, MariaDB, deploy cPanel, `material_privado_no_versionar/`, secretos, dependencias no aprobadas, decisiones que requieren coordinación con Marcos)

#### Scenario: La síntesis cita las 8 fuentes vigentes por nombre y las enlaza

- DADO que la síntesis operativa necesita ser breve y mantenible
- CUANDO Mati o un revisor la lee
- ENTONCES la síntesis NO duplica el contenido de las 8 fuentes; en su lugar, las enlaza explícitamente con su ruta relativa (`README.md`, `GUIA.md`, `AGENTS.md`, etc.) y cita los puntos clave de cada una (1-3 bullets por fuente) que son relevantes para la misión

#### Scenario: La síntesis declara el estado real de `muestra_pagina/` y del scaffold Angular

- DADO que el estado del proyecto evolucionó desde la redacción original de F0-03
- CUANDO Mati o un revisor lee la sección "Estado del proyecto" de la síntesis
- ENTONCES encuentra una declaración explícita de que `muestra_pagina/` tiene v0 export con 7 pantallas disponibles (prompts 4-10) y 12 pendientes (prompts 11-22), y que `apps/frontend-angular/` ya tiene el scaffold Angular 20 de Marcos con tests pasando. La síntesis incluye una sección "Qué sigue" que apunta a los ciclos F1+ como el lugar donde se arranca el trabajo de producto

#### Scenario: La síntesis respeta el scaffold preexistente y no propone rehacerlo

- DADO que Marcos ya creó el scaffold Angular 20 con build verde
- CUANDO Mati considera arrancar trabajo de producto
- ENTONCES la síntesis declara explícitamente "respetar el scaffold existente, no rehacerlo" y enlaza al `apps/frontend-angular/AGENTS.md` para los detalles. Cualquier ciclo F1+ que proponga rehacer el scaffold es out-of-scope

#### Scenario: La síntesis declara el ciclo como documental puro y deja evidencia de cierre

- DADO que F0-03 es un ciclo de documentación
- CUANDO Mati o un revisor verifica el cierre del ciclo
- ENTONCES la síntesis NO contiene código de producto, NO contiene secretos, NO contiene dumps, NO contiene referencias al contenido de `material_privado_no_versionar/` (solo nombra la carpeta y la regla). El verify-report de F0-03 reporta PASS con 5/5 Scenarios mapeados a evidencia. El mensaje de commit sugerido es `docs(matias): registrar onboarding frontend`

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.

## Aceptación

La spec delta se considera cumplida cuando:

- [ ] El archivo `openspec/changes/f0-03-leer-documentacion-minima-y-mision/specs/mision-matias-sintetizada/spec.md` existe con todos los Requirements y Scenarios ADDED arriba.
- [ ] El Requirement ADDED referencia la spec base `guia-matias-angular-windows` sin duplicar texto de sus Requirements existentes.
- [ ] Los Scenarios usan la forma Given/When/Then (DADO/CUANDO/ENTONCES) en español.
- [ ] El verify-report referenciado en el Requirement existe y reporta PASS al cierre de la fase sdd-verify.
- [ ] El archivo `docs/opencode/onboarding-matias-frontend.md` existe con las secciones fijas: Misión, Alcance permitido, Fuera de alcance, Fuentes de verdad, Estado del proyecto (incluye `muestra_pagina/` y scaffold Angular), Qué sigue (apunta a F1+), Evidencia por ciclo, Prohibiciones, Enlaces a las 8 fuentes.
- [ ] La síntesis NO duplica contenido de las 8 fuentes; solo las enlaza y agrega interpretación operativa.
- [ ] La síntesis NO contiene secretos, dumps, credenciales, ni referencias al contenido de `material_privado_no_versionar/`.
- [ ] El verify-report referencia explícitamente las 6 prohibiciones operativas de `AGENTS.md:21` y confirma que ninguna fue violada durante el ciclo.
