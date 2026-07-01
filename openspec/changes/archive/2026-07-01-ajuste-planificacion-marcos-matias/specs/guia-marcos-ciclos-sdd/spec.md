# Delta — guia-marcos-ciclos-sdd

## MODIFIED Requirements

### Requirement: Ciclos M1-01 a M3-06 sin renumerar

La guía DEBE mantener M1-01 a M3-06 y agregar la planificación M4 para sincronización D0: QR/token permanente, DNI completo público, certificado de curso con fechas asistidas, auth temporal `X-Admin-Key`, firmantes PDF, Composer/SMTP como gates, staging `/certificados_staging/` y coordinación con Matías sobre v0 actualizada.
(Previously: la guía llegaba a M3-06 y no codificaba las decisiones D0 nuevas.)

#### Scenario: Trazabilidad preservada

- DADO el archivo actual de Marcos
- CUANDO se compara con la versión ajustada
- ENTONCES los IDs M1-M3 se preservan.
- Y M4 aparece como bloque nuevo sin habilitar implementación fuera de ciclo.

#### Scenario: Decisiones D0 visibles

- DADO que Marcos inicia un ciclo backend/deploy
- CUANDO consulta la guía
- ENTONCES encuentra QR permanente, DNI completo público, fechas asistidas, auth temporal y gates Composer/SMTP.
- Y distingue documentación de implementación runtime.

### Requirement: Rol y límites

La guía DEBE recordar que Marcos lidera backend, MariaDB, integración, deploy, arquitectura, seguridad y desbloqueos frontend técnicos, sin reemplazar el liderazgo UI/UX de Matías sobre Angular y v0.
(Previously: el rol no reflejaba explícitamente la división posterior al audit y v0 actualizada.)

#### Scenario: División operativa

- DADO una tarea con backend y UI
- CUANDO se revisan responsables
- ENTONCES Marcos toma contratos, datos, deploy y seguridad.
- Y Matías toma UI/UX, adaptación visual y QA frontend.
