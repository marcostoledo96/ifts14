# Spec — frontend-public-validation

## Purpose

Definir el flujo público de validación por token con estados ficticios, alineado al contrato backend y sin exposición de datos sensibles. La pantalla pública muestra DNI completo visible y fechas asistidas del curso para certificados vigentes, según decisión institucional documentada.

## Requirements

### Requirement: Ruta pública de validación

El sistema DEBE exponer una pantalla pública para `/certificados/validar/:tokenCertificacion` que lea el token desde la ruta y muestre el estado de validación correspondiente. Para certificados vigentes, la pantalla DEBE mostrar certificado verificable, curso, fecha de emisión, DNI completo visible y fechas asistidas del curso, usando datos ficticios o el contrato real alineado.

#### Scenario: Certificado válido ficticio

- **Dado** un token de mock marcado como vigente
- **Cuando** se abre la ruta pública de validación
- **Entonces** la pantalla DEBE mostrar certificado verificable, curso, fecha, DNI completo y fechas asistidas.
- **Y** NO DEBE mostrar token completo ni datos reales.

#### Scenario: Certificado legado con documentMasked

- **Dado** una respuesta pública legada con `documentMasked` y sin `attendedDates`
- **Cuando** el mapper valida el DTO
- **Entonces** la pantalla DEBE mostrar el documento enmascarado y omitir el bloque de fechas asistidas.
- **Y** NO DEBE colapsar a error técnico por ausencia de `documentNumber`.

#### Scenario: Certificado revocado no verificable

- **Dado** un token de mock marcado como revocado
- **Cuando** se valida públicamente
- **Entonces** la pantalla DEBE informar que el certificado no es verificable.
- **Y** NO DEBE revelar detalles operativos más allá del estado público.

#### Scenario: Certificado no encontrado no verificable

- **Dado** un token de mock inexistente
- **Cuando** se valida públicamente
- **Entonces** la pantalla DEBE informar que el certificado no es verificable, igual que ante un `404 CERTIFICATE_NOT_FOUND`.

#### Scenario: Error técnico distinguible

- **Dado** una falla técnica simulada
- **Cuando** la validación no puede completarse
- **Entonces** la pantalla DEBE mostrar un error técnico seguro, distinto del estado no verificable.
- **Y** NO DEBE exponer stack traces, rutas internas ni detalles de infraestructura.

### Requirement: Flujo público sin credenciales ni datos adicionales

La validación pública NO DEBE pedir DNI completo, login, clave administrativa ni campos adicionales para validar el token recibido.

#### Scenario: Consulta pública mínima

- **Dado** una persona externa que escanea un QR futuro
- **Cuando** llega a la ruta de validación
- **Entonces** el token de la URL DEBE ser suficiente para iniciar la verificación pública.

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
