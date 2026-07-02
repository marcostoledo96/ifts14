# Delta — admin-certificate-delivery

## ADDED Requirements

### Requisito: Validación operativa DB-backed de entrega manual

El endpoint `GET /certificados/api/admin/certificados/{id}/entrega-manual` DEBE tener cierre de deploy-readiness mediante smoke DB-backed para casos `200` recuperable y `409 TOKEN_NOT_RECOVERABLE`, o gate exacto documentado si falta acceso aprobado. Este cambio NO DEBE reintroducir email, SMTP, PHPMailer, `/reenviar` ni rotación de token.

#### Escenario: Smoke recuperable 200

- DADO un certificado emitido con `token_cifrado` recuperable y PDF disponible en una DB aprobada
- CUANDO se ejecuta el smoke autorizado de entrega manual
- ENTONCES la API DEBE responder `200` con link público y datos operativos seguros
- Y NO DEBE enviar email, rotar token ni escribir cambios de entrega.

#### Escenario: Smoke legacy 409

- DADO un certificado legacy sin token recuperable en una DB aprobada
- CUANDO se ejecuta el smoke autorizado de entrega manual
- ENTONCES la API DEBE responder `409 TOKEN_NOT_RECOVERABLE`
- Y NO DEBE inventar, regenerar ni completar evidencia faltante.

#### Escenario: Gate sin DB/config

- DADO que no hay DB o configuración externa aprobada
- CUANDO se verifica readiness del endpoint
- ENTONCES se DEBE registrar el gate pendiente con precondiciones y comando esperado
- Y NO SE DEBEN leer secretos reales ni simular respuestas HTTP como evidencia.

#### Escenario: Sin reintroducción de email

- DADO el cierre operacional de entrega manual
- CUANDO se revisa el alcance del cambio
- ENTONCES NO DEBEN reaparecer SMTP, PHPMailer, `/reenviar` ni envío automático
- Y el gate DEBE limitarse a readiness operacional, no a funcionalidad nueva.
