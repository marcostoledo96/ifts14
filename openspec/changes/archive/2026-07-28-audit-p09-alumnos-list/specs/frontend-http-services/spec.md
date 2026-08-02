# Delta for frontend-http-services

## ADDED Requirements

### Requirement: Corrección condicional del mapeo de métricas de alumnos

NO DEBE exigirse cambio de `HttpStudentsService` ni backend por defecto; preferir fixes en la página. SOLO SI smoke o code review demuestran mapeo roto (UI «—» con payload 0/N), DEBE corregirse el mapeo mínimo (`toAlumno`/conteos) sin DNI/token en errores.

#### Scenario: Sin evidencia — no tocar HTTP

- GIVEN métricas correctas en staging
- WHEN cierra P9
- THEN NO DEBE modificarse `HttpStudentsService` ni backend

#### Scenario: Evidencia de mapeo roto — parche mínimo

- GIVEN payload numérico y UI «—» por mapeo
- WHEN se corrige el servicio
- THEN DEBE mapear 0 como número y null si ausente, sin PII ni editor/detalle
