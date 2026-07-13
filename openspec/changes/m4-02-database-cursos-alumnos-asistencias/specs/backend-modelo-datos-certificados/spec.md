# Especificación de Reglas de Negocio y Restricciones (M4-02)

Esta especificación detalla las reglas de negocio y restricciones aplicables al esquema de cursos, alumnos y asistencias, según lo acordado en la propuesta.

## Reglas Generales

1. **Protección del DNI (Regla D0)**
   - El DNI nunca debe almacenarse en texto plano en la base de datos, salvo el enmascarado parcial (si aplica).
   - Se utilizará un hash (`dni_hash` con HMAC-SHA-256) para búsquedas exactas e inserciones seguras, garantizando unicidad.
   - El valor real recuperable se resguardará cifrado (`dni_cifrado` con AES-256-GCM) para uso en la emisión de certificados.

2. **Cursos y Fechas**
   - Cada curso tiene un `codigo` único alfanumérico.
   - Los estados posibles de un curso son `activo`, `inactivo` y `archivado`.
   - Las fechas vinculadas a un curso (`cert_curso_fechas`) están ordenadas (1..65535). No puede haber dos fechas con el mismo orden en el mismo curso, ni dos fechas con el mismo valor calendario en el mismo curso.

3. **Asistencias y Bajas Lógicas (Soft Delete)**
   - Un alumno puede tener como máximo una asistencia activa para una fecha de un curso específico.
   - Para manejar el registro histórico sin perder unicidad, se implementa una columna generada `asistencia_activa` (`STORED`), que vale `1` si no está eliminado (`eliminado_en IS NULL`), de lo contrario `NULL`.
   - Se aplica una restricción de unicidad sobre `(alumno_id, curso_fecha_id, asistencia_activa)`.

4. **Snapshot Histórico de Certificados**
   - Cuando se emite un certificado, las fechas que el alumno asistió se copian a `cert_certificado_fechas`.
   - Esto actúa como un snapshot inmutable. Si el curso original cambia las fechas o descripciones a futuro, el certificado emitido no pierde la información real del momento en que fue generado.

5. **Configuración Institucional Única**
   - La tabla `cert_configuracion_institucional` solo puede contener una única fila (controlado mediante un `CHECK (id = 1)`).
   - Allí se almacenan los nombres de autoridades y textos base.

## Integridad Referencial

- **Restricción de Borrado:** Todas las claves foráneas están configuradas con `ON DELETE RESTRICT`. No se permite eliminar alumnos, cursos o fechas que tengan asistencias o certificados vinculados.
- **Cascada de Actualización:** Las claves foráneas usan `ON UPDATE CASCADE`.
