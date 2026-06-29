# Spec — frontend-api-readiness

## Purpose

Definir la frontera frontend para consumir la futura API PHP de certificados sin acoplar la UI pública a mocks, tablas internas ni detalles de backend.

## Requirements

### Requirement: Modelos TypeScript del DTO público

El frontend DEBE modelar la respuesta pública de verificación según el contrato JSON de `/certificados/api/`, no según tablas internas ni datos administrativos.

#### Scenario: DTO válido público

- **Dado** una respuesta exitosa del contrato backend
- **Cuando** el frontend la interpreta
- **Entonces** DEBE representar `valid`, `status`, `certificateCode`, estudiante con documento enmascarado, curso, `verifiedAt` y `requestId`.

#### Scenario: Datos internos excluidos

- **Dado** el modelo frontend
- **Cuando** se revisan sus campos públicos
- **Entonces** NO DEBE requerir DNI completo, token completo, hash, pepper ni nombres de tablas.

### Requirement: Servicio reemplazable de validación

El frontend DEBE centralizar la obtención de resultados en una frontera de servicio que PUEDA usar mocks ficticios ahora y la API PHP después sin reescribir la pantalla pública.

#### Scenario: Mocks ficticios durante el desbloqueo

- **Dado** que la integración real no es obligatoria en este ciclo
- **Cuando** se ejecuta la validación pública
- **Entonces** el servicio PUEDE responder estados ficticios documentados y seguros.

#### Scenario: Cambio futuro a API PHP

- **Dado** la API disponible en `/certificados/api/certificados/{token}/verificacion`
- **Cuando** se reemplacen los mocks
- **Entonces** la pantalla pública DEBERÍA conservar su contrato de resultado sin reescritura funcional.

### Requirement: Mapeo seguro de errores HTTP futuros

El frontend DEBE tratar `404 CERTIFICATE_NOT_FOUND` como “no verificable” y DEBE tratar errores `500`, red o respuestas inesperadas como error técnico seguro.

#### Scenario: HTTP 404 no verificable

- **Dado** una respuesta futura `404 CERTIFICATE_NOT_FOUND`
- **Cuando** el servicio la recibe
- **Entonces** DEBE devolver estado público no verificable, no error técnico.

#### Scenario: Falla técnica

- **Dado** una falla de red o `500 INTERNAL_ERROR`
- **Cuando** el servicio la recibe
- **Entonces** DEBE devolver estado de error técnico sin datos internos.
