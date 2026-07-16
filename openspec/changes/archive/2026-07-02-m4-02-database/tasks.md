# Checklist de Tareas (M4-02)

- [x] Crear el archivo de migración `database/migrations/003_cursos_alumnos_asistencias.sql`.
- [x] Incorporar la sentencia `CREATE TABLE cert_alumnos` con sus constraints.
- [x] Incorporar la sentencia `CREATE TABLE cert_cursos` con sus constraints.
- [x] Incorporar la sentencia `CREATE TABLE cert_curso_fechas` con sus constraints y FKs.
- [x] Incorporar la sentencia `CREATE TABLE cert_asistencias` con su constraint de unicidad usando `asistencia_activa` (STORED).
- [x] Incorporar la sentencia `CREATE TABLE cert_certificado_fechas` para resguardar los snapshots de las fechas asistidas.
- [x] Incorporar la sentencia `CREATE TABLE cert_configuracion_institucional` garantizando que sea de fila única (CHECK id=1).
- [x] Agregar sentencias `INSERT` para la configuración institucional (fixture inicial si aplica).
- [x] Verificar la correcta ejecución de la migración en el entorno de desarrollo (o generar script down asociado si la política lo exige).
