# Especificación delta: Verificación del flujo OpenCode/Gentle-AI y SDD

## Propósito

F0-02 es un ciclo de documentación pura que verifica, mediante una corrida real, que OpenCode/Gentle-AI respeta las reglas operativas ya codificadas en `AGENTS.md:21` y `GUIA.md:153` (PR #6), ejecuta las ocho fases SDD sin saltear a implementación de producto y deja evidencia autocontenida. Este delta agrega un único requirement aditivo a la spec base `openspec/specs/guia-matias-angular-windows/spec.md` para formalizar esa verificación sin duplicar los requisitos de contexto, prohibiciones y flujo ya definidos en dicha spec base.

## Cambios respecto a la spec base

Esta spec agrega UNA capacidad nueva a `openspec/specs/guia-matias-angular-windows/spec.md`. No modifica ni elimina Requirements existentes.

## ADDED Requirements

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
- ENTONCES OpenCode NUNCA propone `git merge`, PR, `git rebase`, `git switch`, `git checkout` (salvo lectura) ni `git push` a `main`; y solo propone `git add` + `git commit` + `git push` (a la rama actual) bajo el diff-confirmation gate (`git status --short` + `git diff --name-only` antes de stage, `git log origin/<rama>..<rama> --oneline` + `git diff origin/<rama>..<rama> --stat` antes de push) y la aprobación explícita de Matías en el mismo turno del chat.

#### Scenario: Cero modificaciones de producto

- DADO que F0-02 es un ciclo de documentación pura
- CUANDO el ciclo termina
- ENTONCES el diff de la rama NO incluye cambios en `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, ni en archivos de configuración de runtime (Dockerfile, docker-compose, `.htaccess`, etc.); solo cambios documentales en `openspec/changes/f0-02-verificar-opencode-gentle-ai/` y `docs/opencode/verificacion-flujo-opencode-sdd.md`.

#### Scenario: Evidencia de cierre

- DADO el ciclo F0-02 cerrado
- CUANDO Matías revisa la entrega
- ENTONCES encuentra un verify-report con PASS, un reporte de evidencia en `docs/opencode/verificacion-flujo-opencode-sdd.md` con secciones fijas (objetivo, comandos ejecutados y resultados, archivos tocados, validaciones, bloqueos, comandos Git solo propuestos), y un mensaje de commit sugerido con la forma `docs(matias): verificar flujo opencode sdd (F0-02)`.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.

## Aceptación

La spec delta se considera cumplida cuando:

- [ ] El archivo `openspec/changes/f0-02-verificar-opencode-gentle-ai/specs/verificacion-flujo-opencode-sdd/spec.md` existe con todos los Requirements y Scenarios ADDED arriba.
- [ ] El Requirement ADDED referencia la spec base `guia-matias-angular-windows` sin duplicar texto de sus Requirements existentes.
- [ ] Los Scenarios usan la forma Given/When/Then (DADO/CUANDO/ENTONCES) en español.
- [ ] El verify-report referenciado en el Requirement existe y reporta PASS al cierre de la fase sdd-verify.
- [ ] El reporte de evidencia en `docs/opencode/` existe con todas las secciones fijas declaradas.
