# Diseño: Entrega y reenvío administrativo de certificados

## Enfoque técnico

Agregar `POST /certificados/api/admin/certificados/{id}/reenviar` como slice backend mínimo, protegido por `X-Admin-Key`, con transporte configurable `stub|smtp`. Este ciclo incluye el camino SMTP real con PHPMailer y resuelve la advertencia Composer: versionar `apps/backend-php/composer.lock` para fijar `tcpdf` + `phpmailer/phpmailer`, manteniendo `vendor/` ignorado y credenciales fuera de Git.

## Decisiones de arquitectura

| Punto | Elección | Alternativas descartadas | Fundamento |
|---|---|---|---|
| Transporte | `EmailDeliveryTransport` con `StubEmailDeliveryTransport` y `SmtpEmailDeliveryTransport` PHPMailer. | `mail()`; stub único. | `smtp` satisface entrega real configurada; `stub` sigue siendo modo seguro sin envío. |
| Reproducibilidad | Modificar `composer.json`, versionar `apps/backend-php/composer.lock` y dejar `vendor/` ignorado. | Resolver dependencias en cada deploy. | Cierra el warning vigente sin subir dependencias ni secretos. |
| Configuración | `delivery_transport=stub|smtp`; SMTP exige host, puerto, usuario, pass, seguridad, from y `public_base_url`. | Credenciales versionadas; autodetectar cPanel. | Config externa mantiene secretos fuera del repo y falla cerrada. |
| Auditoría | Reusar `cert_eventos_auditoria.detalle_seguro` con `destinatarioEnmascarado=...`. | Nueva `cert_entregas`. | El campo existente alcanza para trazabilidad segura; no se justifica migración. |
| Token | Token completo solo en el enlace del email; DB guarda hash+prefijo. | JSON, logs, auditoría o texto plano en DB. | Mantiene privacidad del contrato vigente. |

## Flujo de datos

```txt
Admin ─POST id+email──> index.php ─AuthGate─> AdminCertificateService::reenviar()
                                      │
                                      ├─ valida JSON/email
                                      ├─ factory transporte: stub => 503; smtp sin config => 503
                                      ├─ DB tx: lock cert, revoca token, inserta hash nuevo
                                      ├─ SMTP envía /certificados/validar/{token}
                                      ├─ auditoría reenvio ok con destinatarioEnmascarado en detalle_seguro
                                      └─ 200 DTO sin token
```

Si SMTP no está configurado, no se abre transacción ni se rota token. Si PHPMailer falla durante el envío, se revierte la transacción y se audita `reenvio/error` sin token ni credenciales.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/composer.json` | Modificar | Agregar `phpmailer/phpmailer` compatible con PHP 8.4. |
| `apps/backend-php/composer.lock` | Modificar/Versionar | Fijar versiones Composer del backend; `vendor/` sigue ignorado. |
| `.gitignore` | Modificar | Agregar excepción para `apps/backend-php/composer.lock` si el ignore global lo bloquea. |
| `apps/backend-php/index.php` | Modificar | Ruta `POST /admin/certificados/{id}/reenviar`, JSON, auth y errores 401/400/404/503. |
| `apps/backend-php/src/Config.php` | Modificar | `requireDeliveryConfig()` y normalización de modo `stub|smtp`. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificar | `reenviar()` con rotación, envío, DTO seguro y auditoría parametrizable. |
| `apps/backend-php/src/EmailDeliveryTransport.php` | Crear | Contrato `assertConfigured()`/`sendValidationLink()`. |
| `apps/backend-php/src/StubEmailDeliveryTransport.php` | Crear | Modo no enviador: siempre `DELIVERY_NOT_CONFIGURED`. |
| `apps/backend-php/src/SmtpEmailDeliveryTransport.php` | Crear | Implementación PHPMailer SMTP sin logs de credenciales/token. |
| `apps/backend-php/src/EmailDeliveryTransportFactory.php` | Crear | Selecciona `stub` o `smtp` desde config externa. |
| `apps/backend-php/config/certificados-config.example.php` | Modificar | Placeholders ficticios; default `delivery_transport => 'stub'`. |
| `database/migrations/001_certificados_qr.sql` | Sin cambios | `detalle_seguro VARCHAR(255)` persiste el destinatario enmascarado. |

## Interfaces / contratos

```json
POST /certificados/api/admin/certificados/{id}/reenviar
{ "destinatarioEmail": "persona@example.edu.ar" }

200 { "data": { "certificadoId": 10, "enviadoEn": "2026-06-30T19:00:00-03:00", "destinatarioEnmascarado": "p***a@example.edu.ar" }, "meta": { "requestId": "req_..." } }
503 { "error": { "code": "DELIVERY_NOT_CONFIGURED", "message": "El envío real está deshabilitado." } }
```

Config externa mínima: `delivery_transport`, `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password`, `smtp_secure`, `mail_from`, `mail_from_name`, `public_base_url`. El email contiene solo el enlace `/certificados/validar/{token}` y texto institucional mínimo; sin PDF adjunto.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Servicio | Máscara, stub 503 sin rotación, SMTP fake exitoso rota y DTO sin token. | Scripts PHP procedurales con transporte fake/PDO demo. |
| HTTP | 401, 400/415, 404, 503 stub/smtp incompleto, 200 con transporte configurado fake. | Extender `HttpContractTest.php`. |
| Seguridad | Token ausente de JSON/auditoría/logs; `detalle_seguro` solo destinatario enmascarado. | Asserts sobre DTO y evento `reenvio`. |

## Migración / rollout

No requiere migración. Rollout: desplegar con `delivery_transport='stub'`; configurar SMTP externo y recién cambiar a `smtp`. Rollback: volver a `stub` o retirar ruta/factory/config; certificados y tokens vigentes permanecen válidos.

## Preguntas abiertas

- Ninguna bloqueante. Quedan fuera de alcance UI, colas, adjuntos, envíos masivos y operaciones reales sobre cPanel/public_html.
