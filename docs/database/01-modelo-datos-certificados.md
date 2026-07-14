# Modelo de datos — Certificados QR

Este documento define el esquema MariaDB para la verificación pública de certificados QR. Las migraciones controladas viven en `database/migrations/` y no contienen datos reales.

## Decisión principal

| Tema | Decisión |
|---|---|
| Motor | MariaDB 10.6.27, `InnoDB`, `utf8mb4` |
| Prefijo | Todas las tablas nuevas usan `cert_` |
| Token QR | Permanente. El token público no se guarda en texto plano; se guarda `SHA-256(token + pepper_servidor)` como `BINARY(32)` y `token_cifrado` (AES-256-GCM) para recuperación. La entrega manual no rota token; no hay reenvío por email en el MVP. |
| Pepper | Debe vivir fuera de Git, en configuración real del servidor |
| Datos públicos | DNI completo visible por decisión institucional (D0), estado, código, curso, fecha de emisión y fechas asistidas |
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
| `documento_enmascarado` | `VARCHAR(20)` | Ejemplo: `12******90`. Columna legacy presente en la migración `001`. El DTO público usa DNI completo por D0; este campo no alcanza para la validación pública. |
| `curso_nombre` | `VARCHAR(180)` | Nombre del curso o trayecto |
| `emitido_en` | `DATE` | Fecha de emisión |
| `vence_en` | `DATE NULL` | Vencimiento opcional |
| `revocado_en` | `DATETIME NULL` | Revocación opcional |
| `motivo_revocacion` | `VARCHAR(180) NULL` | Motivo interno breve, sin datos sensibles |
| `contenido_revision` | `INT UNSIGNED` | Versión del contenido lógico del certificado (arranca en 1) |
| `contenido_actualizado_en` | `DATETIME NULL` | Cuándo cambió por última vez la revisión de contenido |
| `pdf_estado` | `ENUM` | `vigente`, `desactualizado`, `no_generado`. Estado de frescura del PDF |
| `pdf_generado_revision` | `INT UNSIGNED NULL` | Qué revisión de contenido contiene el PDF actual |
| `created_at`, `updated_at` | `DATETIME` | Timestamps técnicos |

Desde la migración `004_certificados_alumno_curso.sql`, los certificados nuevos pueden guardar también `alumno_id` y `curso_id` nullable con FKs a `cert_alumnos` y `cert_cursos`. Los certificados legacy conservan esos campos en `NULL` y se validan con los datos denormalizados disponibles. La migración `008_certificados_revision_contenido.sql` incorpora control de versiones para rastrear cuándo el contenido lógico de un certificado (fechas, asistencias, datos) cambia después de emitido, de modo que se invalida la frescura del PDF y requiere regeneración antes de descargarlo o entregarlo. La migración `010_backfill_pdf_revision.sql` asegura que los certificados legacy se traten como PDFs vigentes (revisión 1).

La migración `005_prevenir_certificados_duplicados.sql` agrega `certificado_bloqueo_activo` como columna generada `STORED` y el índice único `uq_cert_certificados_alumno_curso_activo (alumno_id, curso_id, certificado_bloqueo_activo)`. La columna vale `1` solo para certificados con `estado='vigente'` y `revocado_en IS NULL`; en los demás casos vale `NULL`. Los legacy sin `alumno_id` o `curso_id` no bloquean porque esos campos nullable son parte del índice único. Por eso revocar o materializar `estado='vencido'` libera el slot, pero una fecha `vence_en` pasada no lo libera mientras el estado siga `vigente`.

> **DNI completo: no migrado todavía.** La migración controlada `001_certificados_qr.sql` solo crea `documento_hash` y `documento_enmascarado`. El DTO público D0 exige DNI completo, pero **no existe columna `documento_completo` migrada**. Cualquier backend que siga el modelo actual no podría satisfacer el DTO D0. La columna `documento_completo` queda como **planificación futura** (ver "Tablas futuras" y el split `backend-contrato-token-permanente-dni-fechas` / `backend-token-permanente-dni-fechas`). No documentar `documento_completo` como columna actual de `cert_certificados` hasta que exista una migración controlada que la cree.

Índices: único por `codigo_certificado`, índice por `estado`, índice por `emitido_en`.

### `cert_tokens_verificacion`

Guarda tokens verificables por QR sin conservar el valor público.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `certificado_id` | `BIGINT UNSIGNED` | FK a `cert_certificados.id` |
| `token_hash` | `BINARY(32)` | Único; hash del token público con pepper. Lookup y verificación pública. No reversible. |
| `token_prefijo` | `VARCHAR(12)` | Prefijo mínimo para soporte, nunca token completo |
| `token_cifrado` | `VARBINARY(512) NULL` | Token completo cifrado con AES-256-GCM, clave externa a Git. Envelope `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`. Habilita entrega manual y regeneración de PDF conservando el QR sin rotar. Hash-only NO permite entrega manual. Migración `002_token_cifrado_entrega_manual.sql`. Certificados previos sin esta columna quedan limitados (`409 TOKEN_NOT_RECOVERABLE`). |
| `estado` | `ENUM` | `activo`, `revocado`, `vencido` |
| `vigente_desde`, `vigente_hasta` | `DATETIME` | Ventana de validez |
| `ultimo_uso_en` | `DATETIME NULL` | Última verificación pública |
| `created_at`, `revocado_en` | `DATETIME` | Timestamps técnicos |

Índices: único por `token_hash`, índice por `certificado_id`, índice por `estado`, índice por `vigente_hasta`.

#### Estado operativo de la migración `002`

La migración `database/migrations/002_token_cifrado_entrega_manual.sql` fue verificada estáticamente: agrega `token_cifrado VARBINARY(512) NULL` y documenta rollback manual. En esta sesión no hubo acceso DB aprobado sin secretos, por lo que la aplicación real queda como gate operativo.

Para cPanel/phpMyAdmin, después de un backup aprobado, usar **Importar** o pegar únicamente el `ALTER TABLE` de la migración; no pegar comandos del cliente CLI. `SOURCE` pertenece al cliente CLI, no a SQL genérico para phpMyAdmin. Para ejecución local por terminal, aplicar el archivo con redirección del cliente MariaDB:

```bash
mariadb NOMBRE_DB < database/migrations/002_token_cifrado_entrega_manual.sql
mariadb NOMBRE_DB -e "SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'token_cifrado';"
```

No dropear `token_cifrado` como rollback sin backup y aprobación: si se revierte el ciclo documental, preferir dejar la columna sin uso.

### M4-02 — Cursos, alumnos, asistencias y snapshot

La migración `database/migrations/003_cursos_alumnos_asistencias.sql` agrega el modelo real para certificados de curso con fechas asistidas. Es aditiva sobre `001` + `002` y no modifica PHP, Angular, API, PDF, auth ni datos reales.

| Tabla | Regla principal |
|---|---|
| `cert_alumnos` | Guarda `dni_hash BINARY(32)` como HMAC-SHA-256 con `dni_cipher_key`, `dni_cifrado VARBINARY(512)` y `dni_mostrar VARCHAR(20) NULL`. La clave de cifrado vive fuera de Git. No hay DNI plano obligatorio. |
| `cert_cursos` | Cursos certificables con `codigo` único, `nombre`, `estado` y timestamps. |
| `cert_curso_fechas` | Fechas normalizadas por curso, con `fecha`, `descripcion`, `orden SMALLINT UNSIGNED` acotado por API a `1..65535` y FK a `cert_cursos`. |
| `cert_asistencias` | La presencia se representa por existencia de fila. No existe booleano `presente`. `eliminado_en` permite correcciones y `asistencia_activa` bloquea duplicados activos. |
| `cert_certificado_fechas` | Snapshot de fechas certificadas: conserva FK a `cert_curso_fechas` y materializa `fecha`, `descripcion` y `orden` para estabilidad histórica. |
| `cert_configuracion_institucional` | Configuración institucional de una sola fila (`CHECK id = 1`) para firmantes y texto del certificado, sin secretos. |

#### Reglas de integridad relevantes

- `cert_asistencias` usa `asistencia_activa TINYINT AS (CASE WHEN eliminado_en IS NULL THEN 1 ELSE NULL END) STORED` y `UNIQUE(alumno_id, curso_fecha_id, asistencia_activa)`; MariaDB permite múltiples `NULL`, por eso se conserva historial eliminado y se impide una sola asistencia activa duplicada.
- `cert_certificado_fechas` es una copia materializada. Las modificaciones realizadas mediante los servicios administrativos reconstruyen el snapshot dentro de la misma transacción e invalidan el PDF. Los cambios directos en base de datos, fuera del servicio, no disparan sincronización automática.
- `cert_configuracion_institucional` es single-row para evitar una tabla KV innecesaria en el MVP.

### M4-04 — Vínculo certificado-alumno-curso

La migración `004_certificados_alumno_curso.sql` agrega `alumno_id` y `curso_id` nullable en `cert_certificados`, con índices y FKs `ON UPDATE CASCADE` / `ON DELETE RESTRICT`. Es aditiva, no modifica `003` y no requiere backfill: los certificados nuevos se emiten desde alumno+curso; los legacy siguen sin vínculos ni snapshot inventado.

### M4-05 — Bloqueo de certificado activo duplicado

La migración `005_prevenir_certificados_duplicados.sql` bloquea en base de datos una segunda fila activa para el mismo `alumno_id` + `curso_id` mediante una columna generada determinística y un índice único. No usa `CURRENT_DATE` ni `vence_en` porque un índice no debe depender de una condición temporal no materializada. La expresión tampoco referencia `alumno_id`/`curso_id`: MariaDB 10.6 rechaza columnas generadas que usan columnas con FK, y la unicidad nullable del índice conserva la semántica legacy. Para liberar el slot se debe revocar el certificado (`revocado_en` no nulo) o cambiar explícitamente `estado` a `vencido`.

#### Verificación local ficticia

El seed `database/seeds/002_cursos_alumnos_asistencias_demo.sql` puede aplicarse después de `001`, `002` y `003` sobre una base temporal. Solo contiene placeholders ficticios y verifica relaciones curso → fecha → alumno → asistencia → snapshot.

### `cert_eventos_auditoria`

Registra eventos operativos sin exponer datos personales completos.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `certificado_id` | `BIGINT UNSIGNED NULL` | FK opcional |
| `tipo_evento` | `ENUM` | `emision`, `verificacion`, `revocacion`, `reenvio`, `error`, `sync_snapshot`. El valor `reenvio` quedó obsoleto: la entrega manual no inserta auditoría operativa (endpoint de solo lectura). El valor `sync_snapshot` registra cuándo un PDF queda desactualizado por cambios en el curso/alumno (migración `009`). |
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

`database/seeds/001_certificados_qr_demo.sql` y `database/seeds/002_cursos_alumnos_asistencias_demo.sql` contienen datos ficticios explícitos. No representan personas reales, DNIs reales ni tokens productivos.

El seed demo usa un token ficticio válido para el contrato público y guarda `token_hash` como binario mediante `UNHEX(SHA2(CONCAT(token_demo, pepper_demo), 256))`, alineado con el cálculo PHP `hash('sha256', $token . $tokenPepper, true)`. La coherencia entre seed y lookup quedó verificada con un MariaDB 10.6 local ficticio durante el ciclo `backend-validacion-publica-certificados`: el token demo `TOKEN_DEMO_FICTICIO_VALIDO_2026_0001` y el pepper de ejemplo `pepper_demo_ficticio_2026_no_usar` resuelven correctamente a un certificado vigente y devuelven `200` con DTO público.

## Rollback

Las migraciones documentan rollback manual en orden inverso de FK. Para `003`, dropear primero `cert_configuracion_institucional`, `cert_certificado_fechas`, `cert_asistencias`, `cert_curso_fechas`, `cert_cursos` y finalmente `cert_alumnos`. No tocar tablas existentes sin backup y aprobación operativa.

## Tablas futuras

Las tablas de cursos, alumnos, fechas, asistencias, snapshot y configuración institucional ya quedan migradas por `003`. Siguen fuera de este ciclo las tablas operativas futuras no necesarias para el MVP actual.

| Tabla | Propósito |
|---|---|
| `cert_entregas_email` | Entregas/reenvíos por email (opcional, futuro). Obsoleto en el MVP: no hay flujo de email. Se reintroduce solo con nuevo ciclo SDD. |
| `cert_admin_usuarios` | Usuarios admin para login real futuro (opcional, fuera de este ciclo). |

Reglas: migraciones controladas, seeds ficticios, compatible MariaDB 10.6 y sin datos reales.
