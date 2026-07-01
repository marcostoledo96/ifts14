# Delta — frontend-public-validation

## MODIFIED Requirements

### Requirement: Ruta pública de validación

El sistema DEBE exponer `/certificados/validar/:tokenCertificacion`, leer el token desde la ruta y mostrar el estado público. Para certificado vigente, la pantalla DEBE mostrar certificado verificable, curso, fecha de emisión, DNI completo visible y fechas asistidas del curso usando datos ficticios o contrato real alineado.
(Previously: la pantalla mostraba documento enmascarado y prohibía DNI completo.)

#### Scenario: Certificado válido ficticio

- DADO un token de mock marcado como vigente
- CUANDO se abre la ruta pública de validación
- ENTONCES la pantalla DEBE mostrar certificado verificable, curso, fecha, DNI completo y fechas asistidas.
- Y NO DEBE mostrar token completo ni datos reales.

#### Scenario: Certificado revocado no verificable

- DADO un token de mock marcado como revocado
- CUANDO se valida públicamente
- ENTONCES la pantalla DEBE informar que el certificado no es verificable.
- Y NO DEBE revelar detalles operativos más allá del estado público.

#### Scenario: Error técnico distinguible

- DADO una falla técnica simulada
- CUANDO la validación no puede completarse
- ENTONCES la pantalla DEBE mostrar un error técnico seguro.
- Y NO DEBE exponer stack traces, rutas internas ni infraestructura.
