-- Seed ficticio para demo local. No usar en producción.
-- No contiene personas reales, DNI real ni token productivo.

SET @token_demo = 'TOKEN_DEMO_FICTICIO_VALIDO_2026_0001';
SET @token_pepper_demo = 'pepper_demo_ficticio_2026_no_usar';

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
  'CERT-DEMO-2026-0001',
  'vigente',
  'Persona Demo',
  UNHEX(SHA2('DOCUMENTO_FICTICIO_DEMO', 256)),
  '00******00',
  'Curso Demo de Validación QR',
  '2026-06-24',
  NULL
);

SET @certificado_demo_id = LAST_INSERT_ID();

INSERT INTO cert_tokens_verificacion (
  certificado_id,
  token_hash,
  token_prefijo,
  estado,
  vigente_desde,
  vigente_hasta
) VALUES (
  @certificado_demo_id,
  UNHEX(SHA2(CONCAT(@token_demo, @token_pepper_demo), 256)),
  LEFT(@token_demo, 12),
  'activo',
  '2026-06-24 00:00:00',
  NULL
);

INSERT INTO cert_eventos_auditoria (
  certificado_id,
  tipo_evento,
  resultado,
  request_id,
  token_hash_prefijo,
  ip_hash_prefijo,
  detalle_seguro
) VALUES (
  @certificado_demo_id,
  'emision',
  'ok',
  'req_demo_no_sensible',
  LEFT(SHA2(CONCAT(@token_demo, @token_pepper_demo), 256), 16),
  NULL,
  'Evento ficticio de emisión para demo local'
);
