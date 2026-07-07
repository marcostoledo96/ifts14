# Delta — backend-base-php-certificados

## ADDED Requirements

### Requirement: QA smoke local reproducible y contrato HTTP sin ruido

El QA local DEBE ejecutar el smoke M3-06 con PHP del host cuando esté disponible, o con la imagen Docker existente `ifts14-php84` cuando falte PHP CLI. Si no hay PHP usable, Docker disponible, o imagen local construida, DEBE fallar con un mensaje claro y accionable.

`HttpContractTest.php` DEBE dejar de emitir notices no fatales y DEBE conservar las mismas aserciones de contrato HTTP. El cambio NO DEBE alterar endpoints, respuestas públicas, deploy, base de datos ni comportamiento runtime D0.

#### Scenario: Smoke con PHP del host

- Given el host tiene `php` CLI disponible
- When se ejecuta `scripts/m3-06-smoke.sh`
- Then el smoke DEBE usar PHP del host
- And DEBE preservar las verificaciones existentes

#### Scenario: Smoke con fallback Docker

- Given el host no tiene `php` CLI
- When existe Docker y la imagen `ifts14-php84`
- Then el smoke DEBE ejecutarse con esa imagen
- And si la imagen falta, DEBE indicar cómo construirla

#### Scenario: Contrato HTTP sin notices no fatales

- Given `HttpContractTest.php` ejecuta requests locales
- When los contratos siguen cumpliéndose
- Then la salida NO DEBE incluir notices no fatales
- And las aserciones DEBEN seguir fallando ante cambios de contrato
