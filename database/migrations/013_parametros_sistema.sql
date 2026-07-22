-- Parámetros de sistema tipados (KV) para textos de Configuración admin.
-- Complementa cert_configuracion_institucional (fila única de firmantes/PDF).
-- MariaDB 10.6+.

CREATE TABLE IF NOT EXISTS cert_parametros_sistema (
  clave VARCHAR(64) NOT NULL COMMENT 'Identificador estable del parámetro',
  valor TEXT NOT NULL COMMENT 'Contenido (string vacío permitido)',
  tipo ENUM('texto', 'textarea', 'url', 'email') NOT NULL DEFAULT 'texto',
  grupo ENUM('identidad', 'certificados', 'contacto', 'validacion') NOT NULL,
  etiqueta VARCHAR(120) NOT NULL COMMENT 'Label visible en admin',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed de las 11 claves (valores = demos previos del frontend). INSERT IGNORE
-- permite reaplicar sin duplicar.
INSERT IGNORE INTO cert_parametros_sistema (clave, valor, tipo, grupo, etiqueta) VALUES
(
  'texto_institucional',
  'El Instituto de Formación Técnica Superior N.° 14 depende de la Dirección de Formación Técnica Superior del Gobierno de la Ciudad de Buenos Aires.',
  'textarea',
  'identidad',
  'Texto institucional base'
),
(
  'titulo_certificado',
  'Certificado de Aprobación',
  'texto',
  'certificados',
  'Título del certificado'
),
(
  'formato_numero',
  'IFTS14-{CURSO}-{AÑO}-{SEC}',
  'texto',
  'certificados',
  'Formato de número'
),
(
  'link_validacion',
  'certificados.ifts14.edu.ar/validar/',
  'url',
  'certificados',
  'Link base de validación'
),
(
  'texto_qr',
  'Escaneá el código para verificar la autenticidad de este certificado en el sitio oficial del IFTS N.° 14.',
  'textarea',
  'certificados',
  'Texto de validación QR'
),
(
  'email_contacto',
  'contacto@example.invalid',
  'email',
  'contacto',
  'Email de contacto institucional'
),
(
  'texto_validacion',
  'Este espacio permite verificar la validez de los certificados emitidos por el IFTS N.° 14.',
  'textarea',
  'contacto',
  'Texto aclaratorio (validación pública)'
),
(
  'sitio_instituto',
  'www.ifts14.edu.ar',
  'url',
  'contacto',
  'Enlace al sitio del instituto'
),
(
  'msg_valido',
  'Certificado válido y vigente, emitido por el IFTS N.° 14.',
  'textarea',
  'validacion',
  'Mensaje — Certificado válido'
),
(
  'msg_revocado',
  'Este certificado fue revocado por la institución y ya no es válido.',
  'textarea',
  'validacion',
  'Mensaje — Certificado revocado'
),
(
  'msg_no_encontrado',
  'No se encontró ningún certificado asociado a este código.',
  'textarea',
  'validacion',
  'Mensaje — Token no encontrado'
);

INSERT IGNORE INTO cert_schema_migrations (version) VALUES ('013');
