# Spec — cursos, alumnos y asistencias

## Purpose

Definir el modelo MariaDB 10.6 para cursos, alumnos, fechas, asistencias por presencia y snapshot de fechas certificadas, sin datos reales.

## Non-goals

Este cambio MUST NOT modificar PHP, Angular, API, PDF, auth, deploy ni datos reales. La vinculación runtime de `cert_certificados` con alumnos/cursos queda para otro ciclo SDD.

## Requirements

### Requirement: Alumnos con DNI seguro

El sistema MUST crear `cert_alumnos` con campos de identidad seguros: `dni_hash` para búsqueda/control, `dni_cifrado` para recuperación controlada y `dni_mostrar` nullable para la visualización institucional aprobada. La clave de cifrado MUST vivir fuera de Git.

#### Scenario: Persistencia sin DNI plano obligatorio

- DADO un alumno ficticio
- CUANDO se lo persiste
- ENTONCES `dni_hash` y `dni_cifrado` MUST estar presentes.
- Y el DNI completo MUST NOT guardarse como texto plano obligatorio.

### Requirement: Cursos controlados

El sistema MUST crear `cert_cursos` para cursos certificables con código o identificador operativo, nombre, estado y timestamps.

#### Scenario: Curso disponible para fechas

- DADO un curso activo
- CUANDO se cargan fechas
- ENTONCES cada fecha MUST poder referenciar el curso por FK.

### Requirement: Fechas de curso normalizadas

El sistema MUST crear `cert_curso_fechas` con FK a `cert_cursos`, fecha, descripción opcional, orden y estado.

#### Scenario: Orden estable de fechas

- DADO un curso con varias fechas
- CUANDO se consultan para certificación
- ENTONCES el orden MUST ser estable y no depender solo de carga accidental.

### Requirement: Asistencias por existencia de fila

El sistema MUST crear `cert_asistencias` donde una fila representa presencia. MUST NOT existir booleano de ausente/presente. MAY incluir `eliminado_en` nullable para correcciones. MUST impedir duplicados por alumno y fecha de curso activa.

#### Scenario: Presencia registrada

- DADO un alumno y una fecha de curso
- CUANDO existe una fila no eliminada en `cert_asistencias`
- ENTONCES el alumno MUST considerarse presente para esa fecha.

#### Scenario: Ausencia sin fila

- DADO un alumno sin fila de asistencia para una fecha
- CUANDO se calcula la asistencia
- ENTONCES el sistema MUST tratarlo como no presente sin guardar un registro de ausencia.

### Requirement: Snapshot de fechas certificadas

El sistema MUST crear `cert_certificado_fechas` con FK a `cert_certificados` y `cert_curso_fechas`, más campos materializados de fecha, descripción y orden para conservar la evidencia histórica al emitir.

#### Scenario: Fecha viva cambia después de emitir

- DADO un certificado emitido con snapshot de fechas
- CUANDO cambia una fecha viva del curso
- ENTONCES el certificado MUST conservar los valores materializados originales.

### Requirement: Configuración institucional

El sistema MUST crear `cert_configuracion_institucional` para firmantes y textos institucionales configurables, sin secretos ni credenciales.

#### Scenario: Configuración institucional ficticia

- DADO un seed o migración versionable
- CUANDO incluye configuración institucional
- ENTONCES MUST usar datos ficticios o placeholders no sensibles.
