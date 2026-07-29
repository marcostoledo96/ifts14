# Delta for admin-attendances-frontend

## ADDED Requirements

### Requirement: Agregación lineal de métricas del hub

En `/admin/asistencias`, al derivar métricas por curso desde el hub, el sistema DEBE agregar en tiempo lineal (sin barridos anidados redundantes sobre fechas). DEBE contar fechas asistibles ≠ `cancelada` y fechas con ≥1 presente solo entre asistibles. NO DEBE usar `alumnosActivos` como total por fila. La semántica de N/M DEBE coincidir con «Listado global solo por curso».

#### Scenario: Agregación en tiempo lineal

- DADO un hub con varios cursos y fechas
- CUANDO se carga `/admin/asistencias` y se calculan métricas
- ENTONCES la agregación DEBE completarse en tiempo lineal respecto del tamaño del hub
- Y NO DEBE realizar barridos anidados redundantes por cada curso sobre todas las fechas

#### Scenario: Cancelada excluida del conteo

- DADO un curso con fechas `cancelada` que tienen presentes registrados
- CUANDO se ve su fila en el listado
- ENTONCES esas fechas NO DEBEN sumar a fechas asistibles ni a fechas con presentes

#### Scenario: Sin alumnosActivos como total

- DADO el hub expone `alumnosActivos` por curso
- CUANDO se renderizan las métricas de la fila
- ENTONCES NO DEBE usarse `alumnosActivos` como total N ni M
