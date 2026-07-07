# Delta — frontend-public-validation

## ADDED Requirements

### Requirement: Confirmación pública D0 sin cambio visual

La validación pública DEBE confirmar el contrato D0 vigente sin cambiar la UI: certificados vigentes muestran DNI completo sólo en la pantalla pública y fechas asistidas; certificados inexistentes, revocados, vencidos o inválidos por formato se presentan como no verificables cuando corresponda.

#### Scenario: Certificado D0 verificable

- **Dado** una respuesta pública D0 de la API PHP con `documentNumber` y `attendedDates`
- **Cuando** Angular mapea el resultado de validación
- **Entonces** DEBE mostrar certificado verificable, DNI completo público y fechas asistidas.
- **Y** NO DEBE mostrar token completo ni datos administrativos.

#### Scenario: No verificable por 404

- **Dado** una respuesta `404 CERTIFICATE_NOT_FOUND` para un token ficticio
- **Cuando** Angular mapea el error
- **Entonces** DEBE mostrar estado no verificable, no error técnico.
- **Y** NO DEBE revelar si el token no existe, está revocado o está vencido.
