# Delta — admin-certificate-delivery

## MODIFIED Requirements

### Requirement: Reenvío administrativo por email

La API DEBE exponer `POST /certificados/api/admin/certificados/{id}/reenviar` protegido por `X-Admin-Key`. El endpoint DEBE conservar el token/QR permanente del certificado en un reenvío normal, enviar o simular por email el enlace público de validación y responder `200` con DTO de entrega que NO contenga token completo.
(Previously: el reenvío rotaba el token activo.)

#### Scenario: Reenvío exitoso

- DADO un certificado emitido con token activo, email disponible y transporte configurado
- CUANDO se invoca el reenvío con `X-Admin-Key` válido
- ENTONCES la API DEBE conservar el token activo, enviar el enlace público y responder `200` con entrega segura.
- Y NO DEBE incluir token completo en respuesta, logs ni auditoría.

#### Scenario: Reenvío sin autorización

- DADO un request sin `X-Admin-Key` válido
- CUANDO la API procesa la solicitud
- ENTONCES DEBE responder `401 UNAUTHORIZED` con sobre seguro.
- Y NO DEBE enviar email ni auditar entrega real.

#### Scenario: Transporte de prueba

- DADO transporte en modo `stub` o SMTP no confirmado
- CUANDO se invoca el reenvío autorizado
- ENTONCES DEBE quedar claro que no hay envío real.
- Y NO DEBE rotar token ni declarar entrega real exitosa.

### Requirement: Adaptador de transporte configurable

El sistema DEBE mantener transporte de email configurable fuera de Git, con modo `stub` para prueba y modo `smtp` solo cuando Composer/vendor y credenciales externas estén confirmados. El sistema NO DEBE agregar dependencias ni habilitar SMTP real en este ciclo documental.
(Previously: SMTP podía habilitarse al confirmar credenciales, sin explicitar Composer/vendor como gate documental.)

#### Scenario: Gate Composer/SMTP

- DADO que Composer/vendor o SMTP real no están confirmados en hosting
- CUANDO se documenta entrega por email
- ENTONCES el envío real DEBE quedar bloqueado por gate humano.
- Y el modo de prueba DEBE usar datos ficticios.
