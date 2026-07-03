-- Migración controlada: prevenir certificados activos duplicados por alumno y curso.
-- MariaDB 10.6 compatible. No contiene datos reales.
--
-- Pre-requisitos:
-- - database/migrations/001_certificados_qr.sql aplicada.
-- - database/migrations/002_token_cifrado_entrega_manual.sql aplicada.
-- - database/migrations/003_cursos_alumnos_asistencias.sql aplicada.
-- - database/migrations/004_certificados_alumno_curso.sql aplicada.
--
-- Preflight obligatorio antes del ALTER: esta consulta debe devolver 0 filas.
-- Si devuelve filas, resolver manualmente los duplicados vigentes antes de aplicar.
SELECT alumno_id, curso_id, COUNT(*) AS certificados_vigentes
FROM cert_certificados
WHERE alumno_id IS NOT NULL
  AND curso_id IS NOT NULL
  AND estado = 'vigente'
  AND revocado_en IS NULL
GROUP BY alumno_id, curso_id
HAVING COUNT(*) > 1;

ALTER TABLE cert_certificados
  ADD COLUMN certificado_bloqueo_activo TINYINT
    AS (
      CASE
        WHEN estado = 'vigente'
          AND revocado_en IS NULL
        THEN 1
        ELSE NULL
      END
    ) STORED,
  ADD UNIQUE KEY uq_cert_certificados_alumno_curso_activo
    (alumno_id, curso_id, certificado_bloqueo_activo);

-- Rollback manual seguro, solo con backup aprobado:
-- ALTER TABLE cert_certificados
--   DROP INDEX uq_cert_certificados_alumno_curso_activo,
--   DROP COLUMN certificado_bloqueo_activo;
