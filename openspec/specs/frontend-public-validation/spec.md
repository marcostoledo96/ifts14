# Spec — frontend-public-validation

## Purpose

Definir el flujo público de validación por token con estados ficticios, alineado al contrato backend y sin exposición de datos sensibles.

## Requirements

### Requirement: Ruta pública de validación

El sistema DEBE exponer una pantalla pública para `/certificados/validar/:tokenCertificacion` que lea el token desde la ruta y muestre el estado de validación correspondiente.

#### Scenario: Certificado válido ficticio

- **Dado** un token de mock marcado como vigente
- **Cuando** se abre la ruta pública de validación
- **Entonces** la pantalla DEBE mostrar certificado verificable, curso, fecha y documento enmascarado.
- **Y** NO DEBE mostrar DNI completo, token completo ni datos reales.

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
