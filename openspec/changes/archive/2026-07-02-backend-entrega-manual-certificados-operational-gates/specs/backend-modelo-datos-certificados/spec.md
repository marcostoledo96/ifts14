# Delta — backend-modelo-datos-certificados

## ADDED Requirements

### Requisito: Migración `002` verificada para token recuperable

El modelo de datos DEBE tratar `database/migrations/002_token_cifrado_entrega_manual.sql` como gate operativo de deploy-readiness: aplicada y verificada contra DB aprobada, o documentada como pendiente exacto. La tabla `cert_tokens_verificacion` DEBE exponer la columna esperada `token_cifrado` para entrega manual recuperable.

#### Escenario: Migración aplicada y verificada

- DADO acceso aprobado a la DB destino
- CUANDO se verifica la migración `002`
- ENTONCES `cert_tokens_verificacion` DEBE contener `token_cifrado`
- Y la evidencia DEBE provenir de la DB real/staging aprobada, no de supuestos.

#### Escenario: Migración pendiente por falta de acceso

- DADO que no hay acceso DB aprobado
- CUANDO se cierre la fase
- ENTONCES se DEBE documentar el gate exacto para aplicar/verificar `002`
- Y NO SE DEBEN leer ni versionar secretos, dumps o configuraciones reales.

#### Escenario: Rollback seguro de datos

- DADO que `002` fue aplicada en entorno aprobado
- CUANDO se requiera rollback del ciclo documental
- ENTONCES NO SE DEBE borrar `token_cifrado` sin backup y aprobación operativa
- Y el rollback DEBE preferir revertir documentación/OpenSpec dejando la columna sin uso si corresponde.
