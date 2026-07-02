-- Seed ficticio para verificar relaciones de cursos, alumnos y asistencias.
-- No usar en producción. No contiene personas reales, DNI real ni token productivo.

INSERT INTO cert_cursos (codigo, nombre, estado)
VALUES ('CURSO-DEMO-M4-02', 'Curso Demo de Asistencias', 'activo');

SET @curso_demo_id = LAST_INSERT_ID();

INSERT INTO cert_curso_fechas (curso_id, fecha, descripcion, orden, estado)
VALUES
  (@curso_demo_id, '2026-07-01', 'Encuentro demo 1', 1, 'realizada'),
  (@curso_demo_id, '2026-07-02', 'Encuentro demo 2', 2, 'realizada');

SET @curso_fecha_demo_1_id = LAST_INSERT_ID();
SET @curso_fecha_demo_2_id = @curso_fecha_demo_1_id + 1;

INSERT INTO cert_alumnos (apellido_nombre, dni_hash, dni_cifrado, dni_mostrar, estado)
VALUES
  ('Alumno Demo Uno', UNHEX(SHA2('DNI_FICTICIO_ALUMNO_DEMO_1', 256)), 'dni_demo_cifrado_placeholder_1', 'DNI-FICTICIO-01', 'activo'),
  ('Alumna Demo Dos', UNHEX(SHA2('DNI_FICTICIO_ALUMNA_DEMO_2', 256)), 'dni_demo_cifrado_placeholder_2', 'DNI-FICTICIO-02', 'activo');

SET @alumno_demo_1_id = LAST_INSERT_ID();
SET @alumno_demo_2_id = @alumno_demo_1_id + 1;

INSERT INTO cert_asistencias (alumno_id, curso_fecha_id)
VALUES
  (@alumno_demo_1_id, @curso_fecha_demo_1_id),
  (@alumno_demo_1_id, @curso_fecha_demo_2_id),
  (@alumno_demo_2_id, @curso_fecha_demo_1_id);

INSERT INTO cert_certificados (
  codigo_certificado,
  estado,
  alumno_nombre_mostrar,
  documento_hash,
  documento_enmascarado,
  curso_nombre,
  emitido_en,
  vence_en
) VALUES (
  'CERT-M4-02-DEMO-0001',
  'vigente',
  'Alumno Demo Uno',
  UNHEX(SHA2('DOCUMENTO_FICTICIO_M4_02_DEMO_1', 256)),
  'DEMO******01',
  'Curso Demo de Asistencias',
  '2026-07-02',
  NULL
);

SET @certificado_demo_id = LAST_INSERT_ID();

INSERT INTO cert_certificado_fechas (certificado_id, curso_fecha_id, fecha, descripcion, orden)
SELECT @certificado_demo_id, id, fecha, descripcion, orden
FROM cert_curso_fechas
WHERE curso_id = @curso_demo_id
ORDER BY orden;

INSERT INTO cert_configuracion_institucional (
  id,
  institucion_nombre,
  rector_nombre,
  rector_cargo,
  asesor_nombre,
  asesor_cargo,
  texto_certificado
) VALUES (
  1,
  'Institución Demo',
  'Rector/a Demo',
  'Rector/a',
  'Asesor/a Demo',
  'Asesor/a Pedagógica',
  'Texto institucional ficticio para verificación local.'
) ON DUPLICATE KEY UPDATE
  institucion_nombre = VALUES(institucion_nombre),
  rector_nombre = VALUES(rector_nombre),
  rector_cargo = VALUES(rector_cargo),
  asesor_nombre = VALUES(asesor_nombre),
  asesor_cargo = VALUES(asesor_cargo),
  texto_certificado = VALUES(texto_certificado);
