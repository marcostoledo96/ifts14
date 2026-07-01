# Contrato de API — Certificados QR

Este contrato define la API PHP bajo `/certificados/api/` para validar certificados por QR o enlace. Tras el ciclo `backend-admin-certificados`, la API suma endpoints administrativos mínimos para emitir, revocar, descargar PDF y reenviar certificados con `X-Admin-Key`. El reenvío entrega el certificado por email mediante un enlace público de validación conservando el token/QR permanente (no rota token en reenvío normal) y con transporte configurable `stub|smtp`. El certificado es de curso e incluye fechas asistidas; el DTO público muestra DNI completo por decisión institucional aprobada.

## Alcance

| Tema | Decisión |
|---|---|
| Ruta pública | `/certificados/api/` |
| Formato | JSON UTF-8 |
| Persistencia | MariaDB 10.6.27 con PDO y prepared statements cuando se implemente. Modelo documentado en `docs/database/01-modelo-datos-certificados.md`. |
| Exposición pública | Mínima: autenticidad, estado y datos no sensibles del certificado |
| Fuera de alcance | Angular, migraciones nuevas, generación PDF/QR fuera de emisión, envío masivo, adjuntos PDF en email, cola de jobs y operaciones reales sobre cPanel/public_html |

## Endpoints previstos

| Método | Ruta | Uso | Acceso |
|---|---|---|---|
| `GET` | `/certificados/api/health` | Verificar disponibilidad básica de la API. | Público técnico, sin datos sensibles. |
| `GET` | `/certificados/api/certificados/{token}/verificacion` | Validar un token leído desde QR o link. | Público, respuesta mínima. |
| `POST` | `/certificados/api/certificados/consulta` | Consulta alternativa cuando el cliente no pueda usar path param. | Público, respuesta mínima. |
| `POST` | `/certificados/api/admin/certificados` | Emitir certificado y token verificable; genera PDF/QR sincrónico. | Admin con `X-Admin-Key`. |
| `POST` | `/certificados/api/admin/certificados/{id}/revocar` | Revocar certificado e invalidar tokens activos. | Admin con `X-Admin-Key`. |
| `GET` | `/certificados/api/admin/certificados/{id}/pdf` | Descargar el PDF persistido del certificado. | Admin con `X-Admin-Key`. |
| `POST` | `/certificados/api/admin/certificados/{id}/reenviar` | Reenviar certificado por email conservando token/QR permanente y enlace público. | Admin con `X-Admin-Key`. |

El reenvío está cubierto por el contrato `admin-certificate-delivery`: **conserva el token/QR permanente** del certificado en un reenvío normal (no rota token), envía el enlace `/certificados/validar/{token}` por email y responde `200` con DTO de entrega sin token completo. La rotación solo ocurre por revocación explícita o regeneración excepcional auditada. Mientras el transporte esté en modo `stub` o SMTP sin credenciales, responde `503 DELIVERY_NOT_CONFIGURED` sin enviar email.

## DTOs

### `GET /health` — respuesta 200

```json
{
  "status": "ok",
  "service": "certificados-api"
}
```

### `GET /certificados/{token}/verificacion`

Parámetros:

| Campo | Ubicación | Regla |
|---|---|---|
| `token` | path | Requerido. Longitud 32 a 128. Solo alfanumérico, `_` y `-`. |

Respuesta 200 cuando el certificado es válido:

```json
{
  "data": {
    "valid": true,
    "status": "vigente",
    "certificateCode": "CERT-2026-0001",
    "student": {
      "displayName": "Nombre Apellido",
      "documentNumber": "12345678"
    },
    "course": {
      "name": "Nombre del curso",
      "issuedAt": "2026-06-24",
      "attendedDates": ["2026-06-05", "2026-06-12"]
    },
    "verifiedAt": "2026-06-24T18:00:00-03:00"
  },
  "meta": {
    "requestId": "req_publico_no_sensible"
  }
}
```

> **Decisión D0**: el DTO público muestra DNI completo (`documentNumber`) por decisión institucional aprobada. Los logs, auditoría, errores y respuestas administrativas NO deben exponer DNI completo. `attendedDates` lista las fechas del curso a las que asistió el alumno.

### `POST /certificados/consulta`

Request:

```json
{
  "token": "TOKEN_PUBLICO_DEL_QR"
}
```

La respuesta debe reutilizar el mismo DTO de verificación pública.

### `POST /admin/certificados`

Headers:

| Header | Regla |
|---|---|
| `X-Admin-Key` | Requerido. Se compara contra configuración externa con `hash_equals()`. Si la clave configurada falta, está vacía o mide menos de 16 caracteres, si falta el header o si el valor no coincide, responde `401 UNAUTHORIZED` sin revelar causa. |

Request demo mínimo:

```json
{
  "studentDisplayName": "Persona Demo",
  "documentNumber": "00000000",
  "courseName": "Curso Demo",
  "issuedAt": "2026-06-26",
  "expiresAt": "2026-12-31"
}
```

Respuesta `201`:

```json
{
  "data": {
    "id": 10,
    "certificateCode": "CERT-2026-AB12CD34",
    "status": "vigente",
    "student": {
      "displayName": "Persona Demo",
      "documentNumber": "00000000"
    },
    "course": {
      "name": "Curso Demo"
    },
    "issuedAt": "2026-06-26",
    "expiresAt": "2026-12-31",
    "tokenPrefix": "prefijo_demo",
    "pdfDownloadUrl": "https://demo.example.edu.ar/certificados/api/admin/certificados/10/pdf"
  },
  "meta": {
    "requestId": "req_admin_no_sensible"
  }
}
```

La emisión no devuelve DNI completo ni token completo. `pdfDownloadUrl` apunta al endpoint administrativo de descarga y no contiene el token de verificación. La entrega del token queda pendiente hasta definir email/reenvío u otro canal seguro. Si la generación o persistencia del PDF falla, la emisión se aborta sin confirmar el alta lógico del certificado (rollback transaccional).

### `POST /admin/certificados/{id}/revocar`

Request opcional. Si no se envía `reason`, el cliente debe enviar un body JSON `{}` con `Content-Type: application/json`; un body ausente, con `Content-Type` distinto o con JSON malformado responde `415`/`400` sin persistir nada.

```json
{
  "reason": "Motivo operativo breve"
}
```

Respuesta `200`:

```json
{
  "data": {
    "id": 10,
    "status": "revocado",
    "revokedAt": "2026-06-26 14:30:00",
    "tokensRevoked": 1
  },
  "meta": {
    "requestId": "req_admin_no_sensible"
  }
}
```

### `GET /admin/certificados/{id}/pdf`

Descarga el PDF persistido del certificado emitido. El PDF se genera sincrónicamente durante `POST /admin/certificados` y se almacena como `{certificateCode}.pdf` en `certificate_storage_path` (configuración externa, preferentemente fuera del webroot).

Headers:

| Header | Regla |
|---|---|
| `X-Admin-Key` | Requerido. Se valida igual que en emisión/revocación. |
| `Content-Type` | No se exige; el endpoint es `GET`. |

Parámetros:

| Campo | Ubicación | Regla |
|---|---|---|
| `id` | path | Requerido. Numérico entero mayor a 0. Si no es numérico, responde `400 VALIDATION_ERROR`. |

Respuesta `200` con body binario PDF y headers:

| Header | Valor |
|---|---|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename="{certificateCode}.pdf"` |
| `Content-Length` | Tamaño del archivo |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |

Errores:

| HTTP | `code` | Uso |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `id` no numérico o fuera de rango. |
| 401 | `UNAUTHORIZED` | Falta `X-Admin-Key` o valor inválido. |
| 404 | `PDF_NOT_FOUND` | Certificado inexistente o PDF no persistido. |
| 405 | `METHOD_NOT_ALLOWED` | Método distinto de `GET` (con `Allow: GET`). |

La descarga no expone el token completo ni rutas internas en la respuesta.

### `POST /admin/certificados/{id}/reenviar`

Reenvía el certificado por email: **conserva el token/QR permanente** del certificado (no rota token en reenvío normal), envía únicamente el enlace público de validación `/certificados/validar/{token}` por el transporte configurado y responde con un DTO de entrega que NO contiene el token completo, el email completo ni credenciales. El token completo viaja exclusivamente dentro del email del destinatario. La rotación de token solo ocurre por revocación explícita o regeneración excepcional auditada, separada del reenvío normal.

Headers:

| Header | Regla |
|---|---|
| `X-Admin-Key` | Requerido. Se valida igual que en emisión/revocación/descarga. |
| `Content-Type` | `application/json` (con o sin `; charset=...`). |

Parámetros:

| Campo | Ubicación | Regla |
|---|---|---|
| `id` | path | Requerido. Numérico entero mayor a 0. Si no es numérico, responde `400 VALIDATION_ERROR`. |
| `destinatarioEmail` | body | Requerido. Email válido. |

Request demo:

```json
{
  "destinatarioEmail": "persona@example.edu.ar"
}
```

Respuesta `200`:

```json
{
  "data": {
    "certificadoId": 10,
    "enviadoEn": "2026-06-30T19:00:00-03:00",
    "destinatarioEnmascarado": "p***a@example.edu.ar"
  },
  "meta": {
    "requestId": "req_admin_no_sensible"
  }
}
```

Errores:

| HTTP | `code` | Uso |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `id` no numérico, `destinatarioEmail` ausente o inválido, o body JSON malformado. |
| 401 | `UNAUTHORIZED` | Falta `X-Admin-Key` o valor inválido. |
| 404 | `CERTIFICATE_NOT_FOUND` | Certificado inexistente o no vigente. |
| 405 | `METHOD_NOT_ALLOWED` | Método distinto de `POST` (con `Allow: POST`). |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | POST sin `Content-Type: application/json`. |
| 503 | `DELIVERY_NOT_CONFIGURED` | Transporte en modo `stub` o SMTP sin credenciales. No envía email. Conserva token permanente. |

El DTO de entrega nunca incluye el token completo, el email completo ni credenciales SMTP. La auditoría del evento `reenvio` guarda `certificado_id`, `tipo_evento`, `resultado`, `request_id` y `destinatario_enmascarado` en `detalle_seguro`; nunca guarda el token completo, DNI completo ni credenciales. El envío real solo ocurre si el transporte está configurado en modo `smtp` con credenciales externas válidas; el modo `stub` es el default seguro y nunca envía email real.

## Sobre de errores

Toda respuesta de error debe usar este formato:

```json
{
  "error": {
    "code": "CERTIFICATE_NOT_FOUND",
    "message": "No se pudo validar el certificado.",
    "details": []
  },
  "meta": {
    "requestId": "req_publico_no_sensible"
  }
}
```

| HTTP | `code` | Uso |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Token ausente o formato inválido, o body JSON malformado en POST, o `id` no numérico en `GET /admin/certificados/{id}/pdf` o `POST /admin/certificados/{id}/reenviar`. |
| 401 | `UNAUTHORIZED` | Falta autorización administrativa válida. |
| 404 | `CERTIFICATE_NOT_FOUND` | Token inexistente, revocado o no verificable públicamente. |
| 404 | `PDF_NOT_FOUND` | Certificado inexistente o PDF no persistido en `GET /admin/certificados/{id}/pdf`. |
| 405 | `METHOD_NOT_ALLOWED` | Método HTTP no permitido. |
| 409 | `CERTIFICATE_NOT_REVOCABLE` | El certificado existe pero no puede revocarse en su estado actual. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | POST JSON sin `Content-Type: application/json` (con o sin charset). |
| 429 | `RATE_LIMITED` | Demasiadas consultas desde el mismo origen. |
| 500 | `INTERNAL_ERROR` | Error no esperado sin datos internos. |
| 503 | `DELIVERY_NOT_CONFIGURED` | Transporte de email en modo `stub` o SMTP sin credenciales. No envía email. Conserva token permanente. |

## Reglas de validación

- El token público debe validarse antes de consultar la base.
- La API no debe aceptar DNI completo como criterio público de búsqueda (el DNI completo se muestra en la respuesta, no se usa como input de búsqueda pública).
- Las fechas deben emitirse en ISO 8601.
- Los campos desconocidos en `POST /consulta` deben ignorarse o rechazarse de forma consistente; la implementación futura debe documentar la decisión.
- `details` no debe incluir valores sensibles, SQL, rutas internas ni configuración.

## Estrategia de token QR

- El QR debe apuntar a una URL pública del frontend, por ejemplo `/certificados/validar/{token}`.
- El frontend debe consultar a `/certificados/api/certificados/{token}/verificacion`.
- El token público no se guarda en texto plano: se compara contra `SHA-256(token + token_pepper)` con `token_pepper` externo a Git. El cálculo PHP usa `hash('sha256', $token . $tokenPepper, true)` (binario) contra `cert_tokens_verificacion.token_hash BINARY(32)`.
- El seed demo versionable debe almacenar `token_hash` con `UNHEX(SHA2(CONCAT(token_demo, pepper_demo), 256))` para mantener coherencia con el cálculo PHP binario.
- Los logs y la auditoría solo conservan prefijos o huellas truncadas no reversibles; nunca el token completo.
- Tokens revocados, vencidos o inexistentes deben responder como no verificables sin revelar cuál caso ocurrió.

## Seguridad obligatoria

- El DTO público muestra DNI completo (`documentNumber`) por decisión institucional aprobada; esta exposición aplica solo a la validación pública.
- No loguear DNI completo, token completo, credenciales ni SQL con parámetros reales.
- Los logs, auditoría, errores y respuestas administrativas NO deben incluir DNI completo ni token completo.
- No versionar credenciales, `.env`, `db.php`, `database.php`, `config.php` ni equivalentes reales.
- Usar PDO y prepared statements para toda consulta SQL futura.
- Mantener configuración real fuera de Git.
- La verificación pública debe devolver datos mínimos necesarios para confirmar autenticidad: certificado, curso, fecha, DNI completo (decisión D0) y fechas asistidas.
- Los endpoints administrativos deben fallar cerrados si `admin_api_key` no existe, está vacío o mide menos de 16 caracteres tras `trim`.
- La auditoría administrativa no debe guardar DNI completo, token completo, claves, SQL ni rutas internas.

## Headers de seguridad y validación de request

Toda respuesta JSON de la API emite los siguientes headers de seguridad centralizados en la capa común de respuesta:

| Header | Valor | Aplica a |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Éxitos y errores JSON. |
| `X-Frame-Options` | `SAMEORIGIN` | Éxitos y errores JSON. |

Los endpoints POST que esperan JSON (`POST /certificados/consulta`, `POST /admin/certificados`, `POST /admin/certificados/{id}/revocar`, `POST /admin/certificados/{id}/reenviar`) deben recibir `Content-Type: application/json` (con o sin `; charset=...`). Si el header falta o no coincide, la API responde `415 UNSUPPORTED_MEDIA_TYPE` antes de cualquier side effect o rate-limit.

Si el `Content-Type` es correcto pero el body está malformado, la API responde `400 VALIDATION_ERROR` antes de construir el servicio, abrir la base, auditar o consumir el bucket del `RateLimiter` en el endpoint público.

## Rate limiting público

Los endpoints públicos `GET /certificados/{token}/verificacion` y `POST /certificados/consulta` aplican una protección mínima por origen antes de consultar certificados o auditar. Si se supera el umbral de la ventana configurada, la API responde:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Demasiadas consultas. Intente nuevamente más tarde.",
    "details": []
  },
  "meta": {
    "requestId": "req_publico_no_sensible"
  }
}
```

Configuración externa opcional:

| Clave | Uso |
|---|---|
| `rate_limit_threshold` | Cantidad de consultas permitidas por ventana. |
| `rate_limit_window_seconds` | Duración de la ventana. |
| `rate_limit_storage_path` | Archivo JSON temporal local. Por defecto usa `sys_get_temp_dir()`. |
| `app_salt` | Salt para hashear el origen. Si no existe, se usa `token_pepper`. |

Limitaciones operativas:

- Es rate limiting básico de nodo único; no es distribuido.
- Varios usuarios detrás de la misma NAT/IP compartida consumen el mismo bucket.
- Si el archivo temporal no se puede leer, escribir o bloquear, el limiter falla abierto para no bloquear validaciones legítimas.
- El archivo de buckets no guarda IP cruda, token completo ni DNI; solo conserva hash de bucket, contador y vencimiento.

## Conceptos de base esperados

El modelo de datos inicial contempla tablas con prefijo `cert_`:

| Concepto | Propósito |
|---|---|
| `cert_certificados` | Estado, código público, fecha de emisión y referencia al alumno/curso. |
| `cert_tokens_verificacion` | Hash del token público, vigencia, revocación y último uso. |
| `cert_eventos_auditoria` | Eventos no sensibles de emisión, verificación, revocación o reenvío. |

La migración controlada es `database/migrations/001_certificados_qr.sql`. El token público se almacena como hash con pepper externo a Git; la API futura debe calcularlo antes de consultar `cert_tokens_verificacion.token_hash`.

## Expectativas para Angular futuro

- La pantalla pública debe leer el token desde la ruta `/certificados/validar/:tokenCertificacion`.
- El servicio Angular debe tratar `404` como certificado no verificable, no como error técnico visible.
- La UI pública muestra DNI completo por decisión institucional (D0); no debe pedir DNI como input de búsqueda.
- Los modelos TypeScript futuros deben reflejar el DTO público (DNI completo + `attendedDates`), no tablas internas.

## Restricciones de deploy cPanel

- La API debe vivir bajo `public_html/certificados/api/`.
- `.htaccess` debe permitir rutas profundas de Angular sin capturar `/api/`.
- Los errores 500 no deben imprimir stack traces ni rutas internas.
- Probar en carpeta aislada antes de tocar `public_html` real.

## Hardening diferido

Los siguientes gaps del contrato quedan registrados y deben abordarse en ciclos SDD posteriores; este cambio no los cubre:

- **CORS / preflight**: no se implementan respuestas a `OPTIONS` ni cabeceras `Access-Control-*`. Resuelto como **excepción local** del checkpoint M3-06: el smoke local Angular↔PHP usa el proxy de `ng serve` (`apps/frontend-angular/proxy.conf.json` → `127.0.0.1:8080`), por lo que **no se requiere preflight** y el backend productivo permanece sin CORS abierto. Si en el futuro el proxy no cubriera el smoke, se habilitaría CORS local acotado a `http://localhost:4200` (nunca `Access-Control-Allow-Origin: *` en producción).
- **Límite de tamaño de body**: no se aplica `post_max_size` ni chequeo del largo de `php://input`.
- **Rate limiting distribuido**: el `RateLimiter` actual es de nodo único con JSON temporal y `flock`; no escala horizontalmente.
- **Observabilidad real**: no hay agregador de logs, métricas ni trazas; el backend solo emite eventos puntuales.
- **`ultimo_uso_en` en verificación pública**: la columna existe en el modelo, pero la verificación pública no la actualiza todavía.
