# Exploración — Ciclo M4-02 (Modelo de Cursos, Alumnos y Asistencias)

## Contexto y Arquitectura Actual
Actualmente, el proyecto cuenta con las tablas fundacionales `cert_certificados` y `cert_tokens_verificacion` provenientes de las migraciones `001` y `002`. Estas tablas permiten registrar los certificados emitidos y verificar su validez a través de un token criptográfico. 

Sin embargo, para soportar el caso de uso real definido en las reglas institucionales (D0) de emisión de certificados a partir de las asistencias, necesitamos incorporar la fuente de verdad operativa. Actualmente no existen las entidades para gestionar alumnos, cursos, las fechas de cursada ni el registro de asistencias.

## Necesidades y Objetivos del Ciclo M4-02
El objetivo principal es implementar el esquema MariaDB 10.6 para soportar la operativa de cursos y asistencias. Esto requiere:
1. **`cert_alumnos`**: Registro de alumnos cumpliendo las normativas de seguridad (DNI no guardado en texto plano, uso de hash y cifrado bidireccional mediante `dni_hash` y `dni_cifrado`).
2. **`cert_cursos`** y **`cert_curso_fechas`**: Gestión de los cursos y sus fechas de cursada específicas.
3. **`cert_asistencias`**: Registro de asistencia. La asistencia no debe ser un booleano, sino la existencia de una fila (asistió = fila existe), con soporte para soft-deletes (`eliminado_en`) para correcciones y bloqueo de duplicados activos.
4. **`cert_certificado_fechas`**: Un snapshot histórico de las fechas asistidas en el momento de la emisión del certificado, garantizando inmutabilidad aunque el curso original cambie.
5. **`cert_configuracion_institucional`**: Tabla single-row para guardar la configuración de los firmantes.

Todas las entidades deberán usar el prefijo `cert_` y respetar la versión MariaDB 10.6, sumando la migración como `003_cursos_alumnos_asistencias.sql` de forma aditiva y sin afectar a las estructuras existentes.
