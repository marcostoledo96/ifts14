-- Email opcional en alumnos (D0 2026-07-20). MariaDB 10.6+.

ALTER TABLE cert_alumnos
  ADD COLUMN IF NOT EXISTS email VARCHAR(180) NULL
    COMMENT 'Email de contacto opcional'
    AFTER apellido_nombre;
