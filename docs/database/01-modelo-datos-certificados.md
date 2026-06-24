# Modelo de datos — Certificados QR

Este documento define el esquema MariaDB para la verificación pública de certificados QR. La migración controlada vive en `database/migrations/001_certificados_qr.sql` y no contiene datos reales.

## Decisión principal

| Tema | Decisión |
|---|---|
| Motor | MariaDB 10.6.27, `InnoDB`, `utf8mb4` |
| Prefijo | Todas las tablas nuevas usan `cert_` |
| Token QR | El token público no se guarda en texto plano; se guarda `SHA-256(token + pepper_servidor)` como `BINARY(32)` |
| Pepper | Debe vivir fuera de Git, en configuración real del servidor |
| Datos públicos | Solo autenticidad, estado, código, curso, fecha y documento enmascarado |
| Auditoría | Eventos mínimos sin DNI completo, token completo, SQL ni credenciales |

## Tablas

### `cert_certificados`

Registra el certificado emitido y los datos mínimos necesarios para la respuesta pública.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `codigo_certificado` | `VARCHAR(40)` | Único, visible públicamente |
| `estado` | `ENUM` | `borrador`, `vigente`, `revocado`, `vencido` |
| `alumno_nombre_mostrar` | `VARCHAR(160)` | Nombre de visualización para respuesta pública |
| `documento_hash` | `BINARY(32)` | Huella no reversible para control interno futuro |
| `documento_enmascarado` | `VARCHAR(20)` | Ejemplo: `12******90` |
| `curso_nombre` | `VARCHAR(180)` | Nombre del curso o trayecto |
| `emitido_en` | `DATE` | Fecha de emisión |
| `vence_en` | `DATE NULL` | Vencimiento opcional |
| `revocado_en` | `DATETIME NULL` | Revocación opcional |
| `motivo_revocacion` | `VARCHAR(180) NULL` | Motivo interno breve, sin datos sensibles |
| `created_at`, `updated_at` | `DATETIME` | Timestamps técnicos |

Índices: único por `codigo_certificado`, índice por `estado`, índice por `emitido_en`.

### `cert_tokens_verificacion`

Guarda tokens verificables por QR sin conservar el valor público.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `certificado_id` | `BIGINT UNSIGNED` | FK a `cert_certificados.id` |
| `token_hash` | `BINARY(32)` | Único; hash del token público con pepper |
| `token_prefijo` | `VARCHAR(12)` | Prefijo mínimo para soporte, nunca token completo |
| `estado` | `ENUM` | `activo`, `revocado`, `vencido` |
| `vigente_desde`, `vigente_hasta` | `DATETIME` | Ventana de validez |
| `ultimo_uso_en` | `DATETIME NULL` | Última verificación pública |
| `created_at`, `revocado_en` | `DATETIME` | Timestamps técnicos |

Índices: único por `token_hash`, índice por `certificado_id`, índice por `estado`, índice por `vigente_hasta`.

### `cert_eventos_auditoria`

Registra eventos operativos sin exponer datos personales completos.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `certificado_id` | `BIGINT UNSIGNED NULL` | FK opcional |
| `tipo_evento` | `ENUM` | `emision`, `verificacion`, `revocacion`, `reenvio`, `error` |
| `resultado` | `ENUM` | `ok`, `rechazado`, `error` |
| `request_id` | `VARCHAR(80) NULL` | Correlación segura |
| `token_hash_prefijo` | `VARCHAR(16) NULL` | Huella truncada no reversible |
| `ip_hash_prefijo` | `VARCHAR(16) NULL` | Huella truncada si se registra IP |
| `detalle_seguro` | `VARCHAR(255) NULL` | Mensaje sin valores sensibles |
| `created_at` | `DATETIME` | Fecha del evento |

Índices: `certificado_id`, `tipo_evento`, `resultado`, `created_at`.

## Lookup público

1. Validar formato del token antes de consultar la base.
2. Calcular `SHA-256(token + pepper_servidor)` en backend futuro.
3. Buscar en `cert_tokens_verificacion.token_hash` con prepared statements.
4. Responder `404 CERTIFICATE_NOT_FOUND` para token inexistente, revocado, vencido o certificado no vigente.
5. Devolver solo el DTO definido en `docs/backend/01-contrato-api-certificados.md`.

## Fixtures permitidos

`database/seeds/001_certificados_qr_demo.sql` contiene datos ficticios explícitos. No representa personas reales, DNIs reales ni tokens productivos.

## Rollback

La migración documenta `DROP TABLE` en orden inverso: primero `cert_eventos_auditoria`, luego `cert_tokens_verificacion`, finalmente `cert_certificados`.
