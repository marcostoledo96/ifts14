# Delta — backend-modelo-datos-certificados

## ADDED Requirements

### Requirement: Migración `004` para vínculo nullable certificado-alumno-curso

El sistema DEBE agregar una migración aditiva `004` que incorpore `alumno_id` y `curso_id` nullable en `cert_certificados`, con FKs a `cert_alumnos` y `cert_cursos`, sin editar `003` ni romper certificados legacy.

#### Scenario: Migración aditiva compatible

- DADO una base con migraciones `001`, `002` y `003`
- CUANDO se aplica `004`
- ENTONCES `cert_certificados` DEBE conservar los certificados existentes.
- Y los nuevos vínculos nullable DEBEN poder referenciar alumno y curso por FK.

#### Scenario: Certificado legacy sin vínculos

- DADO un certificado anterior con `alumno_id` y `curso_id` nulos
- CUANDO se consulta o valida
- ENTONCES el sistema DEBE conservar compatibilidad usando datos denormalizados heredados disponibles.
- Y NO DEBE inventar FKs ni snapshot.

### Requirement: Snapshot certificado inmutable para fechas asistidas

El modelo DEBE tratar `cert_certificado_fechas` como fuente histórica para validación pública y PDF. Solo asistencias activas al momento de emisión DEBEN incorporarse al snapshot.

#### Scenario: Solo asistencias activas

- DADO asistencias activas y eliminadas para un alumno en un curso
- CUANDO se emite el certificado
- ENTONCES el snapshot DEBE incluir solo fechas con asistencia no eliminada.

#### Scenario: Datos vivos cambian luego

- DADO un certificado con snapshot persistido
- CUANDO cambian `cert_curso_fechas` o `cert_asistencias`
- ENTONCES la validación y el PDF DEBEN leer los valores materializados del snapshot.

### Requirement: DNI cifrado recuperable con configuración externa

El sistema DEBE usar `cert_alumnos.dni_cifrado` para recuperar el DNI completo aprobado en validación pública/PDF, con clave externa a Git y error seguro si falta o falla.

#### Scenario: Clave de DNI ausente

- DADO un certificado que requiere DNI completo desde `cert_alumnos`
- CUANDO falta `dni_cipher_key` o el descifrado falla
- ENTONCES la operación DEBE fallar cerrado con error seguro.
- Y NO DEBE exponer DNI cifrado, clave, SQL ni rutas internas.
