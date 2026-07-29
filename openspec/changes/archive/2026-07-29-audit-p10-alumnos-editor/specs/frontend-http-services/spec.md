# Delta for frontend-http-services

## ADDED Requirements

### Requirement: Fallback condicional 409 en actualizar alumno

NO DEBE exigirse cambio de `HttpStudentsService.actualizar` ni backend por defecto; preferir manejo en la página del editor. SOLO SI smoke, staging o test demuestran 409 de update sin `existingStudentId` usable para el enlace, PUEDE agregarse fallback mínimo (p. ej. `findIdByDni`) sin incluir DNI/token en mensajes ni logs.
(Nota: sin evidencia, HTTP permanece intacto — capability opcional de P10.)

#### Scenario: Sin evidencia — no tocar HTTP

- GIVEN 409 de update con `existingStudentId` en envelope o sin gap observable
- WHEN cierra P10
- THEN NO DEBE modificarse `HttpStudentsService.actualizar` ni el backend

#### Scenario: Evidencia de 409 sin id — parche mínimo

- GIVEN 409 de update sin id usable y enlace de conflicto ausente
- WHEN se corrige el servicio
- THEN PUEDE resolver id vía fallback mínimo y DEBE mapear a conflicto tipado sin PII
