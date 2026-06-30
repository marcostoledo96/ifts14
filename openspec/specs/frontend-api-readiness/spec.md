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

El frontend DEBE centralizar la obtención de resultados en una frontera de servicio que PUEDA usar mocks ficticios ahora y la API PHP después sin reescribir la pantalla pública. El servicio DEBE soportar conmutación entre mock y API real mediante `environment` y DEBE mantener disponible la fuente real para desarrollo local sin alterar producción.

#### Scenario: Mocks ficticios durante el desbloqueo

- **Dado** que la integración real no es obligatoria en producción
- **Cuando** se ejecuta la validación pública con `useRealApi` inactivo
- **Entonces** el servicio PUEDE responder estados ficticios documentados y seguros.

#### Scenario: Cambio a API PHP real en local

- **Dado** la API disponible en `/certificados/api/certificados/{token}/verificacion` y `useRealApi: true`
- **Cuando** se reemplazan los mocks en local
- **Entonces** la pantalla pública DEBERÍA conservar su contrato de resultado sin reescritura funcional.

#### Scenario: Frontera única para mock y real

- **Dado** el servicio de validación centralizado
- **Cuando** se intercambia la fuente entre mock y API real
- **Entonces** el consumidor de la pantalla DEBE permanecer agnóstico a la fuente activa.

### Requirement: Mapeo seguro de errores HTTP futuros

El frontend DEBE tratar `404 CERTIFICATE_NOT_FOUND` como “no verificable” y DEBE tratar errores `500`, red o respuestas inesperadas como error técnico seguro. El mapeo DEBE aplicarse tanto para la fuente mock como para la API real en local.

#### Scenario: HTTP 404 no verificable

- **Dado** una respuesta `404 CERTIFICATE_NOT_FOUND` de la API real en local
- **Cuando** el servicio la recibe
- **Entonces** DEBE devolver estado público no verificable, no error técnico.

#### Scenario: Falla técnica

- **Dado** una falla de red o `500 INTERNAL_ERROR` de la API real en local
- **Cuando** el servicio la recibe
- **Entonces** DEBE devolver estado de error técnico sin datos internos.

### Requirement: Conmutación local mock/API real

El frontend DEBE poder alternar entre fuente mock ficticia y la API PHP real mediante configuración local de `environment`, sin reescribir la pantalla pública ni el contrato de resultado. El modo real DEBE estar disponible solo en desarrollo local y DEBE quedar desactivado por defecto para producción.

#### Scenario: Modo API real habilitado en local

- **Dado** `environment` local con `useRealApi: true` y `apiBaseUrl` apuntando a la API PHP local
- **Cuando** se ejecuta la validación pública
- **Entonces** el servicio DEBE consumir la API PHP real y devolver el DTO público mapeado.
- **Y** DEBE NO modificar el contrato de resultado visible para la UI.

#### Scenario: Modo mock preservado por defecto

- **Dado** `environment` de producción o sin `useRealApi` activo
- **Cuando** se ejecuta la validación pública
- **Entonces** el servicio DEBE seguir respondiendo con mocks ficticios documentados y seguros.

#### Scenario: Conmutación sin cambio de pantalla

- **Dado** la pantalla pública de validación implementada
- **Cuando** se alterna entre mock y API real
- **Entonces** la pantalla DEBE conservar su contrato de resultado sin reescritura funcional.

### Requirement: Smoke local de integración con datos ficticios

El frontend DEBE ejecutar un smoke mínimo en local que cubra `health` de la API y la verificación pública con tokens ficticios documentados, sin tocar datos reales ni material privado.

#### Scenario: Smoke de health exitoso

- **Dado** la API PHP local levantada y `apiBaseUrl` configurada
- **Cuando** el smoke consulta `/certificados/api/health`
- **Entonces** DEBE recibir respuesta de salud controlada sin exponer secretos.

#### Scenario: Smoke de verificación con token ficticio

- **Dado** un token ficticio documentado en fixtures del ciclo
- **Cuando** el smoke consulta el endpoint de verificación pública
- **Entonces** DEBE recibir `200` o `404` según el fixture y mapearlo al DTO público.
