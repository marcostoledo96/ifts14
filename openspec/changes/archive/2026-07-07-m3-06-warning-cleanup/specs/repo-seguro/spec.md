# Delta — repo-seguro

## ADDED Requirements

### Requirement: Contexto Docker y evidencia histórica sin ruido local

El repositorio DEBE excluir metadata local y material no versionable del contexto Docker mediante `.dockerignore`. El cambio DEBE preservar el audit trail: toda discrepancia histórica se reconcilia con una observación o documentación nueva, sin reescribir artefactos previos.

El cambio NO DEBE modificar `.atl/skill-registry.md`, `.gitignore`, material privado, `vendor/`, rutas cPanel/`public_html`, ni comportamiento runtime D0.

#### Scenario: `.codegraph/` fuera del contexto Docker

- Given el build Docker usa la raíz del repositorio como contexto
- When se evalúan exclusiones de build
- Then `.dockerignore` DEBE excluir `.codegraph/` y metadata local equivalente
- And `.gitignore` NO DEBE cambiar por esta corrección

#### Scenario: Límites sensibles preservados

- Given el ciclo es limpieza de advertencias
- When se revisa el diff del cambio
- Then NO DEBE tocar `.atl/skill-registry.md`, `material_privado_no_versionar/`, `vendor/`, cPanel/`public_html` ni invariantes D0

#### Scenario: Reconciliación sin reescritura histórica

- Given Engram `#5074` declara `13/13` y `tasks.md` archivado declara `17/17`
- When se cierre la advertencia
- Then DEBE registrarse una observación o documentación nueva de auditoría
- And NO DEBE modificarse `#5074` ni artefactos archivados
