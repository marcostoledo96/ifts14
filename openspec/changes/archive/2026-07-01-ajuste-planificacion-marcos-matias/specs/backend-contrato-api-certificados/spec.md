# Delta — backend-contrato-api-certificados

## MODIFIED Requirements

### Requirement: Contrato público de verificación

La API DEBE exponer un contrato JSON para validar certificados desde QR o enlace con respuesta pública bajo `/certificados/api/certificados/{token}/verificacion`. El DTO público DEBE incluir `data.valid`, estado, código de certificado, curso, fecha de emisión, DNI completo visible por decisión institucional y fechas asistidas del curso; NO DEBE incluir token completo, hashes ni datos internos.
(Previously: el DTO público usaba documento enmascarado y prohibía DNI completo.)

#### Scenario: Certificado válido

- DADO un token público con formato válido y certificado vigente
- CUANDO se consulta `GET /certificados/api/certificados/{token}/verificacion`
- ENTONCES la respuesta DEBE ser `200` con certificado, curso, fecha de emisión, DNI completo y fechas asistidas.
- Y NO DEBE incluir token completo, hashes ni datos internos.

#### Scenario: Token no verificable

- DADO un token inexistente, revocado, vencido o no actual
- CUANDO se consulta la verificación pública
- ENTONCES la respuesta DEBE usar `404 CERTIFICATE_NOT_FOUND` sin revelar cuál condición ocurrió.

### Requirement: Contrato administrativo mínimo de certificados

La API DEBE documentar endpoints administrativos bajo `/certificados/api/admin/` protegidos por `X-Admin-Key`: emisión, revocación, descarga PDF y reenvío. El reenvío DEBE conservar el QR/token permanente salvo revocación explícita, enviar o simular entrega por transporte configurado y responder con DTO seguro sin token completo. Las respuestas DEBEN evitar secretos, SQL, rutas internas y DNI completo en errores o logs.
(Previously: el reenvío rotaba token en flujo normal.)

#### Scenario: Reenvío documentado sin rotación normal

- DADO un certificado vigente con token permanente y transporte configurado
- CUANDO se invoca `POST /certificados/api/admin/certificados/{id}/reenviar`
- ENTONCES la API DEBE responder `200` con DTO de entrega seguro.
- Y DEBE conservar el token activo salvo revocación explícita.

#### Scenario: Reenvío sin transporte configurado

- DADO un request autorizado al reenvío sin SMTP real confirmado
- CUANDO se invoca el endpoint
- ENTONCES el contrato DEBE indicar modo de prueba/stub o `503 DELIVERY_NOT_CONFIGURED`.
- Y NO DEBE rotar token ni enviar email real.
