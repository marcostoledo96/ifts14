-- Migración controlada: vínculo nullable certificado-alumno-curso.
-- MariaDB 10.6 compatible. No contiene datos reales.
--
-- Pre-requisitos:
-- - database/migrations/001_certificados_qr.sql aplicada.
-- - database/migrations/002_token_cifrado_entrega_manual.sql aplicada.
-- - database/migrations/003_cursos_alumnos_asistencias.sql aplicada.
--
-- Alcance: ALTER aditivo sobre cert_certificados. No edita 003 y no requiere backfill.

ALTER TABLE cert_certificados
  ADD COLUMN alumno_id BIGINT UNSIGNED NULL AFTER id,
  ADD COLUMN curso_id BIGINT UNSIGNED NULL AFTER alumno_id,
  ADD KEY idx_cert_certificados_alumno (alumno_id),
  ADD KEY idx_cert_certificados_curso (curso_id),
  ADD CONSTRAINT fk_cert_certificados_alumno
    FOREIGN KEY (alumno_id) REFERENCES cert_alumnos (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  ADD CONSTRAINT fk_cert_certificados_curso
    FOREIGN KEY (curso_id) REFERENCES cert_cursos (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

-- Rollback manual seguro, solo con backup aprobado:
-- ALTER TABLE cert_certificados
--   DROP FOREIGN KEY fk_cert_certificados_curso,
--   DROP FOREIGN KEY fk_cert_certificados_alumno,
--   DROP INDEX idx_cert_certificados_curso,
--   DROP INDEX idx_cert_certificados_alumno,
--   DROP COLUMN curso_id,
--   DROP COLUMN alumno_id;
