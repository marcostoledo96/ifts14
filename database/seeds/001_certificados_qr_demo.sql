-- Seed ficticio para demo local. No usar en producción.
-- No contiene personas reales, DNI real ni token productivo.

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
  UNHEX(SHA2('TOKEN_DEMO_FICTICIO_NO_USAR', 256)),
  'TOKEN_DEMO',
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
  'demo_hash_pref',
  NULL,
  'Evento ficticio de emisión para demo local'
);
