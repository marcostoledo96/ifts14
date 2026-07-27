-- Limpieza de datos de negocio en STAGING (no tocar producción).
-- Conserva: configuración institucional, parámetros de sistema, alumnos/cursos.
-- Usa DELETE (no TRUNCATE): en MariaDB/cPanel TRUNCATE falla con #1701
-- aunque FOREIGN_KEY_CHECKS=0.
--
-- ANTES: backup de la DB de staging.
-- DESPUÉS: emitir certificados nuevos con la token_encryption_key vigente.
-- Ejecutar el bloque completo de una sola vez (no sentencia por sentencia).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM cert_eventos_auditoria;
DELETE FROM cert_certificado_fechas;
DELETE FROM cert_tokens_verificacion;
DELETE FROM cert_asistencias;
DELETE FROM cert_certificados;

ALTER TABLE cert_certificados AUTO_INCREMENT = 1;
ALTER TABLE cert_tokens_verificacion AUTO_INCREMENT = 1;
ALTER TABLE cert_asistencias AUTO_INCREMENT = 1;
ALTER TABLE cert_certificado_fechas AUTO_INCREMENT = 1;
ALTER TABLE cert_eventos_auditoria AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;
