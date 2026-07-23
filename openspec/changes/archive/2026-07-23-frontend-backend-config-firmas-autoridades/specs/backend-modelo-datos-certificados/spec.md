# Delta for backend-modelo-datos-certificados

## ADDED Requirements

### Requirement: Migración 014 columnas de firma institucional

El sistema DEBE agregar migración aditiva `014` sobre `cert_configuracion_institucional` (fila única) con columnas para filename/hash (o equivalente) de firma de rector y asesor, compatibles con MariaDB 10.6. La migración NO DEBE almacenar path absoluto libre ni bytes de imagen en la tabla. NO DEBE editar migraciones previas ni romper la fila existente.

#### Scenario: Migración aditiva aplicable

- DADO base con `cert_configuracion_institucional` previa
- CUANDO se aplica `014_*.sql`
- ENTONCES la tabla DEBE conservar la fila existente
- Y DEBE exponer columnas de metadatos de firma por rol (filename/hash o equivalente documentado)

#### Scenario: Sin path libre en DB

- DADO firmas persistidas tras `014`
- CUANDO se inspecciona la fila
- ENTONCES solo DEBEN figurar basenames/hash/flags derivados
- Y NO DEBE persistirse path con `..` ni ruta absoluta operable desde la columna

#### Scenario: Rollback controlado

- DADO `014` aplicada en entorno aprobado
- CUANDO se requiere rollback del cambio
- ENTONCES el plan DEBE documentar revertir columnas y vaciar storage de firmas sin tocar PDFs emitidos
