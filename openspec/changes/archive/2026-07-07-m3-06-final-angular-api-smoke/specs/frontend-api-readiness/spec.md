# Delta — frontend-api-readiness

## ADDED Requirements

### Requirement: Checkpoint final de consumo Angular/API

El frontend DEBE dejar verificable, con evidencia reproducible, que la frontera de validación pública puede consumir la API PHP local con token ficticio y sin datos reales. El checkpoint NO DEBE habilitar deploy, cPanel, datos reales, email, SMTP/PHPMailer ni cambios de producto salvo brechas concretas y mínimas.

#### Scenario: Evidencia reproducible sin datos reales

- **Dado** el checkpoint M3-06 final y un token ficticio documentado
- **Cuando** se registre la evidencia de cierre
- **Entonces** DEBE incluir `npm test --watch=false`, `npm run build`, evidencia backend Docker/MariaDB o CI y smoke/manual Angular→PHP.
- **Y** NO DEBE usar datos reales ni material privado.

#### Scenario: Bloqueo local documentado

- **Dado** que el smoke local no puede ejecutarse por falta de PHP CLI, Docker o MariaDB local
- **Cuando** se cierre el checkpoint
- **Entonces** DEBE documentarse el bloqueo y la fuente alternativa de evidencia reproducible.
