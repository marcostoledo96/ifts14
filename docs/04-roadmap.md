# Roadmap y recomendaciones futuras

Prioridades acordadas para evolucionar el módulo. No son compromisos de fecha. La **activación de producción** la opera Marcos fuera de este listado.

## Prioridad

| # | Tema | Notas |
|---:|---|---|
| 1 | **Gestor de usuarios y roles** | Reemplazar el admin único de config por usuarios reales (Bedelía, dirección, solo lectura, etc.), con auditoría de acciones. |
| 2 | **Importación masiva** | Carga de alumnos/cursos (CSV/XLS) con validación, dry-run y reporte de errores. Hoy hay placeholder visual; no hay import real. |
| 3 | **Envío automático de emails** | Notificar certificado (link + PDF opcional). **Sin proveedor elegido** todavía (evaluar correo cPanel, SMTP institucional o API). Mantener entrega manual como fallback. |
| 4 | **Colas / jobs** | Si mails o PDF escalan: cola simple (tabla + cron cPanel) para no bloquear requests HTTP. |
| 5 | **Observabilidad** | Logs estructurados sin PII, correlación request-id, alertas básicas de health/login/5xx. |
| 6 | **Hardening de seguridad** | Revisión periódica de rate limits, rotación de peppers/claves con runbook, backups DB, permisos de runtime. |
| 7 | **UX admin residual** | Pulido responsive, vacíos, mensajes de error de negocio, accesibilidad y paridad fina con `muestra_pagina/`. |

## Recomendaciones de diseño (al implementar lo anterior)

### Usuarios y roles

- No reutilizar `X-Admin-Key` en browser.
- Modelar roles mínimos: `admin`, `bedelia`, `consulta`.
- Toda mutación sensible debe quedar en `cert_eventos_auditoria` (sin DNI/token completos).
- Migración desde el usuario único actual con ventana de convivencia.

### Importación masiva

- Idempotencia por DNI hash / código de curso.
- Nunca aceptar dumps reales en el repo; solo plantillas ficticias.
- Límite de filas por request o procesamiento por job (ver #4).

### Emails

- Gate explícito: feature flag + aprobación antes de SMTP real.
- Plantillas con link de validación; el QR/token **no rota** al reenviar.
- No loguear direcciones junto a tokens.

### PDF

- Seguir ofreciendo folio Angular y TCPDF hasta que el instituto fije uno como oficial.
- Cualquier “regenerar PDF” debe preservar el mismo token/QR (D0).

### Datos y privacidad

- Mantener D0: DNI completo solo en UI acordada; logs limpios.
- Seeds solo ficticios; staging puede limpiarse con scripts dedicados (`deploy/staging/LIMPIA-*.sql`) tras backup.

## Deuda técnica consciente

- Auth aún es un único operador en config (aceptable en staging; no para multi-usuario).
- Hosting sin SSH: deploy manual por ZIP; automatizar solo si aparece CI hacia cPanel.
- Envelope API `data/meta`: cualquier cliente nuevo debe respetarlo.
- `token_encryption_key` y `dni_cipher_key` son críticas: perderlas rompe entrega manual / DNI en UI.

## Qué no hacer sin acuerdo

- Rotar QR en cada actualización de certificado.
- Enviar mails reales sin proveedor y flag aprobados.
- Mezclar DB/config de staging con producción.
- Versionar `vendor/`, secretos o dumps.
