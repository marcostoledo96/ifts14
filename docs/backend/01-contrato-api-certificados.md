# Contrato de API — Certificados QR

Este contrato define la API PHP bajo `/certificados/api/` para validar certificados por QR o enlace. Tras el ciclo `backend-validacion-publica-certificados`, los endpoints públicos `GET .../verificacion` y `POST .../consulta` están implementados y verificados con base local ficticia (ver `docs/backend/00-php84-api.md`). Los endpoints administrativos de emisión, revocación y reenvío siguen fuera de alcance y se definirán en ciclos SDD posteriores.

## Alcance

| Tema | Decisión |
|---|---|
| Ruta pública | `/certificados/api/` |
| Formato | JSON UTF-8 |
| Persistencia | MariaDB 10.6.27 con PDO y prepared statements cuando se implemente. Modelo documentado en `docs/database/01-modelo-datos-certificados.md`. |
| Exposición pública | Mínima: autenticidad, estado y datos no sensibles del certificado |
| Fuera de alcance | Código PHP, Angular, migraciones, generación PDF/QR, envío de mails |

## Endpoints previstos

| Método | Ruta | Uso | Acceso |
|---|---|---|---|
| `GET` | `/certificados/api/health` | Verificar disponibilidad básica de la API. | Público técnico, sin datos sensibles. |
| `GET` | `/certificados/api/certificados/{token}/verificacion` | Validar un token leído desde QR o link. | Público, respuesta mínima. |
| `POST` | `/certificados/api/certificados/consulta` | Consulta alternativa cuando el cliente no pueda usar path param. | Público, respuesta mínima. |

No se definen todavía endpoints administrativos de carga, emisión, reenvío ni revocación. Deben salir en ciclos SDD posteriores.

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
      "documentMasked": "12******90"
    },
    "course": {
      "name": "Nombre del curso",
      "issuedAt": "2026-06-24"
    },
    "verifiedAt": "2026-06-24T18:00:00-03:00"
  },
  "meta": {
    "requestId": "req_publico_no_sensible"
  }
}
```

### `POST /certificados/consulta`

Request:

```json
{
  "token": "TOKEN_PUBLICO_DEL_QR"
}
```

La respuesta debe reutilizar el mismo DTO de verificación pública.

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
| 400 | `VALIDATION_ERROR` | Token ausente o formato inválido. |
| 404 | `CERTIFICATE_NOT_FOUND` | Token inexistente, revocado o no verificable públicamente. |
| 405 | `METHOD_NOT_ALLOWED` | Método HTTP no permitido. |
| 429 | `RATE_LIMITED` | Demasiadas consultas desde el mismo origen. |
| 500 | `INTERNAL_ERROR` | Error no esperado sin datos internos. |

## Reglas de validación

- El token público debe validarse antes de consultar la base.
- La API no debe aceptar DNI completo como criterio público de búsqueda.
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

- No exponer DNI completo en respuestas públicas.
- No loguear DNI completo, token completo, credenciales ni SQL con parámetros reales.
- No versionar credenciales, `.env`, `db.php`, `database.php`, `config.php` ni equivalentes reales.
- Usar PDO y prepared statements para toda consulta SQL futura.
- Mantener configuración real fuera de Git.
- La verificación pública debe devolver solo datos mínimos necesarios para confirmar autenticidad.

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
- La UI no debe pedir DNI completo para validar públicamente.
- Los modelos TypeScript futuros deben reflejar el DTO público, no tablas internas.

## Restricciones de deploy cPanel

- La API debe vivir bajo `public_html/certificados/api/`.
- `.htaccess` debe permitir rutas profundas de Angular sin capturar `/api/`.
- Los errores 500 no deben imprimir stack traces ni rutas internas.
- Probar en carpeta aislada antes de tocar `public_html` real.
