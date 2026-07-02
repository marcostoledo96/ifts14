# Contrato de API — Certificados QR

Este contrato define la API PHP bajo `/certificados/api/` para validar certificados por QR o enlace. Tras el ciclo `backend-entrega-manual-certificados`, la API suma endpoints administrativos mínimos para emitir, revocar, descargar PDF y entregar manualmente certificados con `X-Admin-Key`. La entrega manual reemplaza al reenvío por email: Bedelía copia el link público y descarga el PDF por canal externo, conservando el token/QR permanente (no rota token, no envía email, no usa SMTP/PHPMailer). El token recuperable se persiste cifrado con AES-256-GCM y clave externa a Git. El certificado es de curso e incluye fechas asistidas; el DTO público muestra DNI completo por decisión institucional aprobada.

## Alcance

| Tema | Decisión |
|---|---|
| Ruta pública | `/certificados/api/` |
| Formato | JSON UTF-8 |
| Persistencia | MariaDB 10.6.27 con PDO y prepared statements cuando se implemente. Modelo documentado en `docs/database/01-modelo-datos-certificados.md`. |
| Exposición pública | Mínima: autenticidad, estado y datos no sensibles del certificado |
| Fuera de alcance | Angular, migraciones nuevas, generación PDF/QR fuera de emisión, envío masivo, SMTP/PHPMailer, email automático, cola de jobs y operaciones reales sobre cPanel/public_html |

## Endpoints previstos

| Método | Ruta | Uso | Acceso |
|---|---|---|---|
| `GET` | `/certificados/api/health` | Verificar disponibilidad básica de la API. | Público técnico, sin datos sensibles. |
| `GET` | `/certificados/api/certificados/{token}/verificacion` | Validar un token leído desde QR o link. | Público, respuesta mínima. |
| `POST` | `/certificados/api/certificados/consulta` | Consulta alternativa cuando el cliente no pueda usar path param. | Público, respuesta mínima. |
| `POST` | `/certificados/api/admin/certificados` | Emitir certificado y token verificable; genera PDF/QR sincrónico; responde `201` con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`. | Admin con `X-Admin-Key`. |
| `POST` | `/certificados/api/admin/certificados/{id}/revocar` | Revocar certificado e invalidar tokens activos. | Admin con `X-Admin-Key`. |
| `GET` | `/certificados/api/admin/certificados/{id}/pdf` | Descargar el PDF persistido del certificado. | Admin con `X-Admin-Key`. |
| `GET` | `/certificados/api/admin/certificados/{id}/entrega-manual` | Entrega manual de solo lectura: devuelve `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix` para copia/descarga externa. Sin email, sin rotación, sin escritura. | Admin con `X-Admin-Key`. |

La entrega manual está cubierta por el contrato `admin-certificate-delivery`: **conserva el token/QR permanente** del certificado (no rota token), descifra `token_cifrado` en memoria solo para reconstruir `publicValidationUrl` y responde `200` con DTO de entrega sin token completo como campo separado. No envía email, no usa SMTP/PHPMailer. Si `token_cifrado` está ausente, el envelope es inválido, la clave no decodifica a 32 bytes o el descifrado falla, responde `409 TOKEN_NOT_RECOVERABLE` sin regenerar ni auditar entrega. `POST /admin/certificados/{id}/reenviar` NO forma parte del contrato MVP: responde `404 NOT_FOUND`.

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

Request mínimo:

```json
{
  "alumnoId": 1,
  "cursoId": 2,
  "issuedAt": "2026-06-26",
  "expiresAt": "2026-12-31"
}
```

La emisión toma alumno, curso y asistencias activas existentes. El DNI completo se descifra desde `cert_alumnos.dni_cifrado` solo para PDF/validación pública. La respuesta `201` NO lo devuelve: por D0, el DNI completo solo se expone en el DTO público de validación. Logs, auditoría, errores y respuestas administrativas no incluyen DNI completo.

Respuesta `201`:

```json
{
  "data": {
    "id": 10,
    "certificateCode": "CERT-2026-AB12CD34",
    "status": "vigente",
    "student": {
      "displayName": "Persona Demo",
      "documentMasked": "00******00"
    },
    "course": {
      "name": "Curso Demo"
    },
    "issuedAt": "2026-06-26",
    "expiresAt": "2026-12-31",
    "tokenPrefix": "prefijo_demo",
    "publicValidationUrl": "https://demo.example.edu.ar/certificados/validar/{token}",
    "pdfDownloadUrl": "https://demo.example.edu.ar/certificados/api/admin/certificados/10/pdf"
  },
  "meta": {
    "requestId": "req_admin_no_sensible"
  }
}
```

La emisión no devuelve DNI completo ni token completo como campo separado. El campo `documentMasked` (enmascarado) en la respuesta administrativa es el único dato de documento permitido; el DNI completo queda reservado para el DTO público de validación (decisión D0). `publicValidationUrl` es el único link público previsto y contiene el token permanente; `pdfDownloadUrl` apunta al endpoint administrativo de descarga y no contiene el token de verificación. `tokenPrefix` es ayuda operativa segura. El token se persiste como `token_hash` (verificación), `token_prefijo` (soporte) y `token_cifrado` (recuperable, AES-256-GCM con clave externa a Git). Si la generación o persistencia del PDF falla, o si el cifrado del token falla, la emisión se aborta sin confirmar el alta lógico del certificado (rollback transaccional, fail closed).

La emisión persiste `alumno_id`, `curso_id` y snapshot en `cert_certificado_fechas`. Si no hay asistencias activas (`cert_asistencias.eliminado_en IS NULL` y fecha de curso `programada|realizada`), responde `400 VALIDATION_ERROR` sin persistir certificado, token, PDF ni snapshot.

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

### `GET /admin/certificados/{id}/entrega-manual`

Entrega manual de solo lectura: **conserva el token/QR permanente** del certificado (no rota token, no envía email, no usa SMTP/PHPMailer), descifra `token_cifrado` en memoria solo para reconstruir `publicValidationUrl` y responde con un DTO que NO contiene el token completo como campo separado. Bedelía copia el link público y descarga el PDF por canal externo. El endpoint NO modifica estado de certificado/token, NO inserta auditoría operativa y NO requiere body.

> **Estrategia de token recuperable (requerida para entrega manual).** Guardar solo `token_hash` (SHA-256 con pepper) es **insuficiente** para entrega manual: el hash no permite reconstruir el token ni la URL `/validar/{token}`. Para que la entrega manual conserve el QR sin rotar, el backend persiste un artefacto recuperable del token:
>
> | Columna | Uso |
> |---|---|
> | `token_hash` | Lookup y verificación pública. No reversible. |
> | `token_prefijo` | Soporte/identificación parcial. No reversible a token completo. |
> | `token_cifrado` | Token completo cifrado con AES-256-GCM, clave externa a Git. Envelope `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`. Permite reconstruir la URL pública y regenerar PDF sin rotar QR. |
>
> La clave de cifrado de `token_cifrado` (`token_encryption_key`) debe vivir fuera de Git y decodificar (base64/base64url) exactamente a 32 bytes. Su ausencia o invalidez aborta la emisión y la entrega manual (fail closed). Certificados previos sin `token_cifrado` responden `409 TOKEN_NOT_RECOVERABLE`; no se regeneran salvo decisión auditada explícita. Hash-only NO habilita entrega manual.

Headers:

| Header | Regla |
|---|---|
| `X-Admin-Key` | Requerido. Se valida igual que en emisión/revocación/descarga. |
| `Content-Type` | No se exige; el endpoint es `GET` y no acepta body. |

Parámetros:

| Campo | Ubicación | Regla |
|---|---|---|
| `id` | path | Requerido. Numérico entero mayor a 0. Si no es numérico, responde `400 VALIDATION_ERROR`. |

Respuesta `200`:

```json
{
  "data": {
    "certificadoId": 10,
    "publicValidationUrl": "https://demo.example.edu.ar/certificados/validar/{token}",
    "pdfDownloadUrl": "https://demo.example.edu.ar/certificados/api/admin/certificados/10/pdf",
    "tokenPrefix": "prefijo_demo"
  },
  "meta": {
    "requestId": "req_admin_no_sensible"
  }
}
```

Errores:

| HTTP | `code` | Uso |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `id` no numérico. |
| 401 | `UNAUTHORIZED` | Falta `X-Admin-Key` o valor inválido. |
| 404 | `CERTIFICATE_NOT_FOUND` | Certificado inexistente o no vigente. |
| 405 | `METHOD_NOT_ALLOWED` | Método distinto de `GET` (con `Allow: GET`). |
| 409 | `TOKEN_NOT_RECOVERABLE` | `token_cifrado` ausente, envelope inválido, clave inválida o descifrado fallido. No regenera token. |

El DTO de entrega nunca incluye el token completo como campo separado: el token solo vive dentro de `publicValidationUrl`. El endpoint es de solo lectura: no inserta auditoría, no rota token, no modifica estado de certificado/token. Logs, auditoría y errores nunca incluyen token completo, clave, IV, tag ni ciphertext.

### `POST /admin/certificados/{id}/reenviar` (REMOVIDO)

El endpoint `POST /admin/certificados/{id}/reenviar` fue **removido** del contrato MVP. No existe flujo de email, SMTP, PHPMailer ni transporte `stub|smtp`. Cualquier invocación a esa ruta responde `404 NOT_FOUND`. La entrega manual reemplaza al reenvío: ver `GET /admin/certificados/{id}/entrega-manual`.

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
| 400 | `VALIDATION_ERROR` | Token ausente o formato inválido, o body JSON malformado en POST, o `id` no numérico en `GET /admin/certificados/{id}/pdf` o `GET /admin/certificados/{id}/entrega-manual`. |
| 401 | `UNAUTHORIZED` | Falta autorización administrativa válida. |
| 404 | `CERTIFICATE_NOT_FOUND` | Token inexistente, revocado o no verificable públicamente. |
| 404 | `PDF_NOT_FOUND` | Certificado inexistente o PDF no persistido en `GET /admin/certificados/{id}/pdf`. |
| 405 | `METHOD_NOT_ALLOWED` | Método HTTP no permitido. |
| 409 | `CERTIFICATE_NOT_REVOCABLE` | El certificado existe pero no puede revocarse en su estado actual. |
| 409 | `TOKEN_NOT_RECOVERABLE` | `token_cifrado` ausente, envelope inválido, clave inválida o descifrado fallido en entrega manual. No regenera token. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | POST JSON sin `Content-Type: application/json` (con o sin charset). |
| 429 | `RATE_LIMITED` | Demasiadas consultas desde el mismo origen. |
| 500 | `INTERNAL_ERROR` | Error no esperado sin datos internos. |

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
- **Hash-only es insuficiente para entrega manual.** El `token_hash` no permite reconstruir el token ni la URL `/validar/{token}`. La entrega manual que conserva el QR exige además `token_cifrado` (AES-256-GCM, envelope `v1.<iv>.<tag>.<ciphertext>`) con clave externa a Git; ver `GET /admin/certificados/{id}/entrega-manual`. Certificados previos sin `token_cifrado` responden `409 TOKEN_NOT_RECOVERABLE` y no se regeneran salvo decisión auditada explícita.
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
- **`X-Admin-Key` no debe exponerse en bundles Angular ni en `localStorage`/`sessionStorage`.** El header `X-Admin-Key` es para uso técnico/API/smoke/staging controlado, no para UI de navegador. Para una UI admin en browser se debe usar cPanel Directory Privacy / Basic Auth, o un login PHP simple con cookie `HttpOnly` + `SameSite` que el backend valide; nunca incrustar la clave admin en el bundle. Si se implementa login PHP, el ciclo correspondiente define el contrato.

## Headers de seguridad y validación de request

Toda respuesta JSON de la API emite los siguientes headers de seguridad centralizados en la capa común de respuesta:

| Header | Valor | Aplica a |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Éxitos y errores JSON. |
| `X-Frame-Options` | `SAMEORIGIN` | Éxitos y errores JSON. |

Los endpoints POST que esperan JSON (`POST /certificados/consulta`, `POST /admin/certificados`, `POST /admin/certificados/{id}/revocar`) deben recibir `Content-Type: application/json` (con o sin `; charset=...`). Si el header falta o no coincide, la API responde `415 UNSUPPORTED_MEDIA_TYPE` antes de cualquier side effect o rate-limit. `GET /admin/certificados/{id}/entrega-manual` y `GET /admin/certificados/{id}/pdf` no exigen `Content-Type` (son `GET`).

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
| `cert_eventos_auditoria` | Eventos no sensibles de emisión, verificación o revocación. El evento `reenvio` quedó obsoleto: la entrega manual no inserta auditoría operativa (endpoint de solo lectura). |

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
