# Delta — backend-contrato-api-certificados

## ADDED Requirements

### Requirement: Checklist compartido post-merge Angular/API

El contrato backend DEBE registrar el checklist M3-06 final como cierre documental post-merge: DTO público D0, DTO administrativo enmascarado, códigos de error, estados no verificables, privacidad, evidencia CI Docker/MariaDB y restricciones D0. Este checkpoint NO DEBE agregar deploy, cPanel, rotación de token/QR, email, SMTP/PHPMailer ni vendor versionado.

#### Scenario: Privacidad preservada

- **Dado** respuestas públicas y administrativas del contrato de certificados
- **Cuando** se documenta el checkpoint compartido
- **Entonces** DEBE constar que el DNI completo sólo pertenece al DTO/UI pública.
- **Y** las respuestas administrativas DEBEN usar `documentMasked` y no exponer token completo.

#### Scenario: Invariantes D0 preservados

- **Dado** un certificado con QR/token permanente
- **Cuando** se valida, consulta administrativamente o entrega manualmente
- **Entonces** el contrato NO DEBE rotar token/QR ni activar reenvío por email.
- **Y** la autenticación administrativa temporal DEBE seguir limitada a `X-Admin-Key`.
