# Reporte de Verificación: M4-02 Database Cursos, Alumnos y Asistencias

## Revisión de Migración SQL

Archivo revisado: `database/migrations/003_cursos_alumnos_asistencias.sql`

### Tablas Revisadas y Criterios de Aceptación:

1. **`cert_alumnos`**:
   - Cumple con especificación D0 para PII: Utiliza `dni_hash` `BINARY(32)` para búsquedas exactas (HMAC-SHA-256) y `dni_cifrado` `VARBINARY(512)` para los datos encriptados (AES-256-GCM).
   - Posee el campo `dni_mostrar` opcional para el enmascarado visual.

2. **`cert_cursos`**:
   - Estructura básica presente con códigos y estados (`'activo'`, `'inactivo'`, `'archivado'`).

3. **`cert_curso_fechas`**:
   - Fechas asignadas a cursos con orden específico, lo que permite dictados modulares.

4. **`cert_asistencias`**:
   - Utiliza una columna virtual almacenada (`asistencia_activa` `TINYINT AS (...) STORED`) en MariaDB 10.6 para garantizar unicidad parcial y habilitar "soft deletes" (`eliminado_en`), protegiendo la integridad de la base.

5. **`cert_certificado_fechas` (Snapshot)**:
   - Cumple el requerimiento de snapshot: persiste la foto histórica de las fechas en las cuales se certificó el alumno (fecha, descripción y orden), aislando los certificados emitidos contra cambios a futuro en el curso.

6. **`cert_configuracion_institucional`**:
   - Incorpora el esquema tipo Singleton con restricción `CHECK (id = 1)`.
   - Dispone de nombre de rector, asesor pedagógico y texto del certificado para un modelo de impresión histórico flexible.
   - Cuenta con el `INSERT IGNORE` inicial de prueba.

### Resultados y Conclusión

La migración estática ha sido verificada con éxito.
* **Compatibilidad de motor:** Sintaxis validada para MariaDB 10.6 (`STORED`, `CHECK`, tipos nativos).
* **Seguridad y privacidad (D0):** Se han abstraído los campos sensibles de identidad para utilizar derivación HMAC y AES-256-GCM nativamente en aplicación.

La migración es **APROBADA** desde el punto de vista estructural y de esquema. No se ejecutó sobre la base de datos viva según los parámetros de validación estática solicitados.
