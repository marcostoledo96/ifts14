# Delta — deploy-cpanel-certificados

## ADDED Requirements

### Requisito: Gate operativo previo a deploy de entrega manual

Antes de declarar listo el deploy de `/certificados/`, la documentación DEBE exigir evidencia real o gate explícito para migración `002`, smoke DB-backed, dependencias Composer/vendor y configuración externa `token_encryption_key`. El gate DEBE ser de preparación operativa para deploy, no expansión funcional.

#### Escenario: Evidencia DB real o gate documentado

- DADO acceso DB/config aprobado para staging o producción
- CUANDO se cierre el gate previo a deploy
- ENTONCES se DEBE verificar migración `002` y smoke DB-backed con evidencia real
- Y NO SE DEBE simular ni reemplazar evidencia DB por supuestos.

#### Escenario: Sin acceso aprobado

- DADO que no hay acceso DB/config aprobado
- CUANDO se cierre el ciclo
- ENTONCES se DEBE documentar el gate exacto pendiente y comandos esperados
- Y NO SE DEBEN leer secretos reales, dumps, logs ni material privado.

#### Escenario: Composer y vendor operativos

- DADO la remoción de PHPMailer del backend
- CUANDO se prepare el deploy
- ENTONCES `composer.lock` DEBE quedar coherente y `vendor/` DEBE tratarse como artefacto operativo no versionado
- Y NO SE DEBE modificar ni versionar `vendor/`; solo documentar/regenerar operativamente si corresponde.

#### Escenario: Clave externa obligatoria

- DADO un entorno destino para entrega manual
- CUANDO se valide readiness
- ENTONCES `token_encryption_key` DEBE estar exigida como configuración externa obligatoria
- Y la spec/guía DEBEN usar placeholders sin revelar valores reales.
