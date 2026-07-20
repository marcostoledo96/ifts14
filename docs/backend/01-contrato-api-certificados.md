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
| `GET` | `/certificados/api/admin/certificados/{id}/qr.png` | Descarga administrativa del QR como PNG aislado (`image/png`, `attachment`), generado on-demand desde el mismo `publicValidationUrl`. Sin rotación de token, sin persistencia, sin email. | Admin con `X-Admin-Key`. Requiere extensión PHP `gd` (o equivalente) en el hosting. |
| `POST` | `/certificados/api/admin/cursos` | Crear curso certificable. | Admin con `X-Admin-Key`. |
| `GET` | `/certificados/api/admin/cursos` | Listar cursos; admite filtro `estado`. | Admin con `X-Admin-Key`. |
| `GET` | `/certificados/api/admin/cursos/{id}` | Consultar curso. | Admin con `X-Admin-Key`. |
| `PATCH` | `/certificados/api/admin/cursos/{id}/estado` | Actualizar estado del curso. | Admin con `X-Admin-Key`. |
| `POST` | `/certificados/api/admin/alumnos` | Crear alumno con DNI cifrado/hash, DTO admin con DNI completo y email opcional. | Admin con sesión/CSRF. |
| `GET` | `/certificados/api/admin/alumnos` | Listar alumnos con DNI completo en `dniMostrar`/`documentMasked`. | Admin con sesión/CSRF. |
| `GET` | `/certificados/api/admin/alumnos/{id}` | Consultar alumno con DNI completo en DTO admin. | Admin con sesión/CSRF. |
| `PATCH` | `/certificados/api/admin/alumnos/{id}/estado` | Actualizar estado del alumno. | Admin con `X-Admin-Key`. |
| `POST` | `/certificados/api/admin/cursos/{cursoId}/fechas` | Crear fecha de curso. | Admin con `X-Admin-Key`. |
| `GET` | `/certificados/api/admin/cursos/{cursoId}/fechas` | Listar fechas ordenadas por `orden` y `fecha`. | Admin con `X-Admin-Key`. |
| `PATCH` | `/certificados/api/admin/cursos/{cursoId}/fechas/{fechaId}` | Actualizar fecha, orden o estado. | Admin con `X-Admin-Key`. |
| `POST` | `/certificados/api/admin/asistencias` | Registrar asistencia activa para alumno/fecha. | Admin con `X-Admin-Key`. |
| `GET` | `/certificados/api/admin/asistencias?cursoId=&alumnoId=` | Listar asistencias activas. | Admin con `X-Admin-Key`. |
| `DELETE` | `/certificados/api/admin/asistencias/{id}` | Anular asistencia por eliminación lógica. | Admin con `X-Admin-Key`. |

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

> **Decisión D0 (2026-07-20)**: el DTO público y los DTOs admin muestran DNI completo (`documentNumber` / `dniMostrar`/`documentMasked` con dígitos completos). Los logs, auditoría, errores y dumps NO deben exponer DNI completo ni token completo. `attendedDates` lista las fechas del curso a las que asistió el alumno.

### `POST /certificados/consulta`

Request:

```json
{
  "token": "TOKEN_PUBLICO_DEL_QR"
}
```

La respuesta debe reutilizar el mismo DTO de verificación pública.

### Endpoints admin de datos maestros

Todos requieren `X-Admin-Key`. Los `POST` y `PATCH` exigen `Content-Type: application/json` y body JSON válido antes de persistir cambios.

DTOs administrativos principales:

```json
{
  "curso": { "id": 1, "codigo": "CUR-2026-01", "nombre": "Curso Demo", "estado": "activo", "createdAt": "2026-07-02 10:00:00", "updatedAt": "2026-07-02 10:00:00" },
  "alumno": { "id": 2, "apellidoNombre": "Persona Demo", "dniMostrar": "12****78", "estado": "activo" },
  "fecha": { "id": 3, "cursoId": 1, "fecha": "2026-08-01", "descripcion": "Clase 1", "orden": 1, "estado": "programada" },
  "asistencia": { "id": 4, "alumnoId": 2, "cursoId": 1, "cursoFechaId": 3, "fecha": "2026-08-01", "fechaEstado": "programada", "registradoEn": "2026-07-02 10:00:00" }
}
```

Reglas de privacidad y persistencia:

- `POST /admin/alumnos` normaliza DNI a dígitos, exige longitud 7 a 10, calcula `dni_hash` binario como HMAC-SHA-256 usando `dni_cipher_key` y guarda `dni_cifrado` con esa misma clave externa.
- Si `dni_cipher_key` falta o es inválida, responde `500 CONFIGURATION_ERROR` antes de insertar alumno.
- `PATCH /admin/alumnos/{id}/estado` no requiere `dni_cipher_key`: solo actualiza el estado y conserva el DTO admin con DNI completo en `dniMostrar`/`documentMasked`.
- Las respuestas admin usan `dniMostrar`/`documentMasked` con dígitos completos (D0 2026-07-20); email opcional (nullable). NO devuelven `dni_hash`, `dni_cifrado`, tokens, SQL, secretos ni rutas internas. Logs, auditoría y errores NO incluyen DNI completo ni token completo.
- Asistencia válida requiere alumno `activo`, curso `activo` y fecha `programada` o `realizada` del curso.
- Tras `POST` o `DELETE` de asistencia, si la fecha no está `cancelada`, el backend recalcula su `estado` con día local `America/Argentina/Buenos_Aires`: `realizada` solo si hay ≥1 asistencia activa y `fecha < hoy`; si no, `programada`. `cancelada` no se infiere ni se modifica automáticamente. Al entrar o salir de `realizada` se conserva el sync de snapshots / `pdf_estado=desactualizado`.
- Los filtros `cursoId` y `alumnoId` de `GET /admin/asistencias` deben ser enteros positivos; si vienen informados con formato inválido, responden `400 VALIDATION_ERROR` en vez de ampliar el listado.
- Una asistencia activa duplicada responde `409 CONFLICT`; la anulación usa `eliminado_en` y no hace `DELETE` físico.
- `orden` de fechas de curso acepta solo `1..65535`; aplica a creación, actualización y al próximo orden automático. Si se supera el máximo, responde `400 VALIDATION_ERROR`.

Errores específicos de datos maestros:

| HTTP | `code` | Uso |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Payload inválido, estado no permitido, fecha inválida, curso/alumno/fecha no elegible para asistencia. |
| 401 | `UNAUTHORIZED` | Falta `X-Admin-Key` o valor inválido. |
| 404 | `COURSE_NOT_FOUND`, `STUDENT_NOT_FOUND`, `COURSE_DATE_NOT_FOUND`, `ATTENDANCE_NOT_FOUND`, `NOT_FOUND` | Recurso inexistente o ruta no disponible. |
| 409 | `CONFLICT` | Código de curso, DNI, fecha/orden o asistencia activa duplicados. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | `POST`/`PATCH` sin JSON compatible. |
| 500 | `CONFIGURATION_ERROR` | Configuración externa requerida ausente o inválida, por ejemplo `dni_cipher_key` al crear alumnos. |

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

La emisión toma alumno, curso y asistencias activas certificables (fecha de curso en estado `realizada`, `eliminado_en` NULL). El DNI completo se descifra desde `cert_alumnos.dni_cifrado` para PDF/validación pública y para DTO admin (`documentMasked`/`dniMostrar` con dígitos completos; D0). Logs, auditoría, errores y dumps no incluyen DNI completo ni token completo.

Respuesta `201`:

```json
{
  "data": {
    "id": 10,
    "certificateCode": "CERT-2026-AB12CD34",
    "status": "vigente",
    "student": {
      "displayName": "Persona Demo",
      "documentMasked": "00123456"
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

La emisión no devuelve token completo como campo separado. El campo `documentMasked`/`dniMostrar` en respuestas admin contiene DNI completo visible (D0 2026-07-20). `publicValidationUrl` es el único link público previsto y contiene el token permanente; `pdfDownloadUrl` apunta al endpoint administrativo de descarga y no contiene el token de verificación. `tokenPrefix` es ayuda operativa segura. El token se persiste como `token_hash` (verificación), `token_prefijo` (soporte) y `token_cifrado` (recuperable, AES-256-GCM con clave externa a Git). Si la generación o persistencia del PDF falla, o si el cifrado del token falla, la emisión se aborta sin confirmar el alta lógico del certificado (rollback transaccional, fail closed).

El PDF generado durante la emisión usa `cert_configuracion_institucional` (`id = 1`) cuando existe. Si la fila falta o un campo está vacío, la emisión continúa con valores institucionales seguros por defecto. La edición de configuración se realiza por `PUT /admin/configuracion-institucional`.

La emisión persiste `alumno_id`, `curso_id` y snapshot en `cert_certificado_fechas`. Si no hay asistencias activas certificables (`cert_asistencias.eliminado_en IS NULL` y fecha de curso `realizada`), responde `400 VALIDATION_ERROR` sin persistir certificado, token, PDF ni snapshot. Fechas `programada` o `cancelada` no entran al snapshot. Este ciclo no refresca el estado de la fecha dentro de `emitir` (diferido). Si ya existe un certificado con `estado='vigente'` y `revocado_en IS NULL` para el mismo alumno y curso, responde `409 CERTIFICATE_ALREADY_EXISTS` sin persistir certificado, token, PDF ni snapshot. Revocar o pasar explícitamente el estado a `vencido` libera una nueva emisión; una fecha `vence_en` pasada no libera el slot mientras el estado siga `vigente`.

### `GET /admin/certificados`

Listado administrativo de certificados. Requiere auth admin. No expone token completo, hash, clave ni rutas internas. DNI completo visible en `documentMasked`/`dniMostrar` (D0).

Query opcionales:

| Parámetro | Regla |
|---|---|
| `estado` | `borrador`, `vigente`, `revocado` o `vencido`. Valor inválido → `400 VALIDATION_ERROR`. |
| `cursoId` | Entero positivo. |
| `alumnoId` | Entero positivo. |

Respuesta `200`:

```json
{
  "data": {
    "items": [
      {
        "id": 10,
        "certificateCode": "CERT-2026-AB12CD34",
        "status": "vigente",
        "student": {
          "displayName": "Persona Demo",
          "documentMasked": "00123456"
        },
        "course": { "id": 2, "name": "Curso Demo" },
        "alumnoId": 1,
        "cursoId": 2,
        "issuedAt": "2026-06-26",
        "expiresAt": "2026-12-31",
        "revokedAt": null,
        "tokenPrefix": "prefijo_demo"
      }
    ]
  },
  "meta": { "requestId": "req_admin_no_sensible" }
}
```

### `GET /admin/certificados/{id}`

Detalle administrativo (expediente) de un certificado. Requiere `X-Admin-Key`. `id` numérico entero mayor a 0.

Incluye snapshot de fechas asistidas (`attendedDates`), eventos de auditoría seguros (`auditEvents` sin DNI ni token en logs), y `links` relativos a PDF, entrega manual y QR PNG. No devuelve token completo. DNI completo en campos de documento del DTO admin (D0).

Respuesta `200` extiende el ítem de listado con:

```json
{
  "revocationReason": null,
  "attendedDates": [
    { "fecha": "2026-06-05", "descripcion": "Clase 1", "orden": 1 }
  ],
  "auditEvents": [
    { "eventType": "emision", "result": "ok", "createdAt": "2026-06-26 14:00:00" }
  ],
  "links": {
    "pdf": "/admin/certificados/10/pdf",
    "manualDelivery": "/admin/certificados/10/entrega-manual",
    "qrPng": "/admin/certificados/10/qr.png"
  }
}
```

Errores: `400 VALIDATION_ERROR` si `id` no es numérico; `404 CERTIFICATE_NOT_FOUND` si no existe.

### `GET /admin/configuracion-institucional`

Lectura de la configuración institucional single-row (`id = 1`). Si no existe fila, devuelve fallback seguro documentado en `InstitutionalConfig`.

Respuesta `200`:

```json
{
  "data": {
    "institutionName": "IFTS N.° 14",
    "certificateText": "Se certifica que...",
    "rectorName": "",
    "rectorRole": "Rector/a",
    "advisorName": "",
    "advisorRole": "Asesor/a Pedagógica",
    "updatedAt": null
  },
  "meta": { "requestId": "req_admin_no_sensible" }
}
```

### `PUT /admin/configuracion-institucional`

Actualiza la configuración institucional. Requiere `X-Admin-Key` y `Content-Type: application/json`. `institutionName` es obligatorio y no vacío. Campos opcionales usan fallback seguro cuando llegan vacíos.

Request:

```json
{
  "institutionName": "IFTS N.° 14",
  "certificateText": "Texto del certificado.",
  "rectorName": "Nombre Rector/a",
  "rectorRole": "Rector/a",
  "advisorName": "Nombre Asesor/a",
  "advisorRole": "Asesor/a Pedagógica"
}
```

Respuesta `200`: mismo DTO que `GET`, con `updatedAt` persistido.

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

El PDF es institucional y contiene nombre institucional, texto configurable con fallback, alumno, curso, DNI completo autorizado para el certificado, fechas certificadas del snapshot, rector/a, asesor/a pedagógica y QR al link permanente. No imprime el token completo como texto visible.

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
| 409 | `PDF_OUTDATED` | El certificado cambió y su PDF debe ser regenerado. |

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
    "tokenPrefix": "prefijo_demo",
    "pdfAvailable": true,
    "pdfStatus": "valid"
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

### `GET /admin/certificados/{id}/qr.png`

Descarga administrativa del QR como PNG aislado, generado on-demand desde el mismo `publicValidationUrl` del PDF. Permite a Bedelía obtener el QR para uso manual en diseños externos conservando el token/QR permanente: no rota token, no persiste el PNG, no muta base, no inserta auditoría y no envía email. La operación reutiliza el helper de `AdminCertificateService` que ya usa la entrega manual y comparte la misma validación de `X-Admin-Key`.

> **Dependencia runtime.** El render del PNG exige extensión PHP `gd` (o equivalente) en el hosting. La imagen Docker `docker/php84/Dockerfile` instala `libpng-dev` y compila `gd`; `scripts/php-docker-modules-check.sh` declara `gd` como módulo requerido. Antes de deploy, confirmar que cPanel/staging tenga `gd` habilitado: si falta, la ruta responde `500 CONFIGURATION_ERROR` y se registra como gate pendiente.

Headers:

| Header | Regla |
|---|---|
| `X-Admin-Key` | Requerido. Se valida igual que en emisión/revocación/descarga. |
| `Content-Type` | No se exige; el endpoint es `GET` y no acepta body. |

Parámetros:

| Campo | Ubicación | Regla |
|---|---|---|
| `id` | path | Requerido. Numérico entero mayor a 0. Si no es numérico, responde `400 VALIDATION_ERROR`. |

Respuesta `200` con body binario PNG y headers:

| Header | Valor |
|---|---|
| `Content-Type` | `image/png` |
| `Content-Disposition` | `attachment; filename="{certificateCode_sanitizado}-qr.png"` |
| `Content-Length` | Tamaño real del PNG (`strlen($png)`) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Cache-Control` | `no-store, private, max-age=0` |
| `Pragma` | `no-cache` |
| `Expires` | `0` |

El filename se sanitiza con `preg_replace('/[^A-Za-z0-9_-]/', '_', $certificateCode)` (la misma regex aplicada a PDF) para impedir CRLF, path traversal, caracteres fuera de `[A-Za-z0-9_-]` o tokens embebidos. La sanitización también aplica al `Content-Disposition` del endpoint PDF (`{certificateCode}.pdf`) para cerrar la misma superficie.

Errores:

| HTTP | `code` | Uso |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `id` no numérico o fuera de rango. |
| 401 | `UNAUTHORIZED` | Falta `X-Admin-Key` o valor inválido. |
| 404 | `CERTIFICATE_NOT_FOUND` | Certificado inexistente o no vigente. |
| 405 | `METHOD_NOT_ALLOWED` | Método distinto de `GET` (con `Allow: GET`). |
| 409 | `TOKEN_NOT_RECOVERABLE` | `token_cifrado` ausente, envelope inválido, clave inválida o descifrado fallido. No regenera token. |
| 500 | `CONFIGURATION_ERROR` | Falta `gd` o equivalentes de cifrado/configuración. |

La descarga QR no expone el token completo ni rutas internas en la respuesta, logs o auditoría. La URL pública codificada en el PNG es el mismo `publicValidationUrl` que devuelve `entrega-manual` y que ya viaja dentro del PDF.

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
| 409 | `CERTIFICATE_ALREADY_EXISTS` | Ya existe un certificado vigente para el mismo alumno y curso. |
| 409 | `CONFLICT` | Duplicado de negocio en datos maestros administrativos. |
| 409 | `TOKEN_NOT_RECOVERABLE` | `token_cifrado` ausente, envelope inválido, clave inválida o descifrado fallido en entrega manual. No regenera token. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | POST JSON sin `Content-Type: application/json` (con o sin charset). |
| 429 | `RATE_LIMITED` | Demasiadas consultas desde el mismo origen. |
| 500 | `CONFIGURATION_ERROR` | Configuración externa faltante o inválida para PDF, token o DNI. |
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
- Los logs, auditoría, errores y dumps NO deben incluir DNI completo ni token completo (D0: UI admin y validación pública sí muestran DNI completo).
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
| `X-Content-Type-Options` | `nosniff` | Éxitos y errores JSON, y descargas binarias PDF/QR. |
| `X-Frame-Options` | `SAMEORIGIN` | Éxitos y errores JSON, y descargas binarias PDF/QR. |
| `Cache-Control` | `no-store, private, max-age=0` | Éxitos y errores JSON, y descargas binarias PDF/QR. |
| `Pragma` | `no-cache` | Éxitos y errores JSON, y descargas binarias PDF/QR. |
| `Expires` | `0` | Éxitos y errores JSON, y descargas binarias PDF/QR. |

Las cabeceras anti-cache (`Cache-Control`, `Pragma`, `Expires`) se aplican también a las descargas binarias PDF y QR para impedir caching de contenido administrativo sensible; el helper `Response::noStoreSecurityHeaders()` las centraliza en `apps/backend-php/src/Response.php` y se invoca desde `Response::json()`, `Response::error()`, `streamPdf()` y `streamQrPng()`.

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

## Checkpoint M3-06 final — checklist compartido Angular/API

Cierre documental post-merge del ciclo `m3-06-final-angular-api-smoke`. Registra el checklist D0 compartido y la evidencia CI Docker/MariaDB reproducible. No agrega deploy, cPanel, rotación de token/QR, email, SMTP/PHPMailer ni vendor versionado.

### DTO público D0

| Ítem | Estado |
|---|---|
| `student.documentNumber` (DNI completo) en DTO/UI pública y admin | OK: decisión D0 2026-07-20. |
| `course.attendedDates` para certificados vigentes nuevos | OK: snapshot en `cert_certificado_fechas`. |
| Legado tolerado: `student.documentMasked` sin fechas cuando no hay snapshot D0 | OK: mapper Angular lo admite como fallback. |
| UI pública no pide DNI como input de búsqueda pública | OK: solo token desde ruta. |

### DTO administrativo

| Ítem | Estado |
|---|---|
| `documentMasked`/`dniMostrar` con dígitos completos en respuestas admin | OK: emisión, listado, detalle, alumnos y entrega manual (D0). |
| `tokenPrefix` (prefijo no reversible); nunca token completo como campo separado | OK: el token solo vive dentro de `publicValidationUrl`. |
| `links` relativos a PDF, entrega manual y QR PNG en detalle | OK: `/admin/certificados/{id}/{pdf,entrega-manual,qr.png}`. |
| `attendedDates` en detalle administrativo (expediente) | OK: snapshot seguro sin DNI ni token. |
| `auditEvents` sin DNI completo ni token completo | OK: eventos no sensibles. |

### Códigos de error y estados no verificables

| Ítem | Estado |
|---|---|
| `404 CERTIFICATE_NOT_FOUND` → estado público no verificable | OK: token inexistente, revocado, vencido o inválido colapsan a no verificable sin revelar causa. |
| `400 VALIDATION_ERROR` | OK: token ausente o formato inválido, body malformado, `id` no numérico. |
| `401 UNAUTHORIZED` | OK: falta/invalida `X-Admin-Key`. |
| `405 METHOD_NOT_ALLOWED` | OK: método no permitido con `Allow`. |
| `409 CERTIFICATE_ALREADY_EXISTS`, `CERTIFICATE_NOT_REVOCABLE`, `CONFLICT`, `TOKEN_NOT_RECOVERABLE` | OK: conflictos de negocio y token recuperable. |
| `415 UNSUPPORTED_MEDIA_TYPE` | OK: POST/PATCH sin JSON. |
| `429 RATE_LIMITED` | OK: rate limiting público de nodo único. |
| `500 CONFIGURATION_ERROR`, `INTERNAL_ERROR` | OK: config externa faltante/inválida y error no esperado, sin datos internos. |

### Privacidad

| Ítem | Estado |
|---|---|
| Logs, auditoría, errores y dumps NO exponen DNI completo ni token completo | OK: canales no-UI sin DNI ni token; UI admin y validación pública sí muestran DNI completo (D0). |
| Logs, auditoría, errores y respuestas NO exponen token completo, claves, IV, tag, ciphertext, SQL ni rutas internas | OK. |
| `X-Admin-Key` no se expone en bundles Angular ni en `localStorage`/`sessionStorage` | OK: admin queda fuera del bundle público; UI admin futura requerirá login PHP/Basic Auth. |
| `details` no incluye valores sensibles | OK. |

### Invariantes D0

| Ítem | Estado |
|---|---|
| Token/QR permanente: sin rotación normal | OK: reenvío normal y entrega manual no rotan token. |
| Sin email, sin SMTP/PHPMailer, sin transporte `stub|smtp` | OK: `POST /admin/certificados/{id}/reenviar` responde `404 NOT_FOUND`. |
| `X-Admin-Key` temporal: login real es fase posterior | OK: validación con `hash_equals()`, fail closed si la clave < 16 chars. |
| Token recuperable: `token_hash` + `token_prefijo` + `token_cifrado` (AES-256-GCM, clave externa) | OK: entrega manual conserva el QR sin rotar. |
| Sin vendor versionado | OK: dependencias Composer bajo `apps/backend-php/composer.json`. |

### Evidencia CI reproducible

| Verificación | Comando | Entorno |
|---|---|---|
| Backend unit (sin DB) | `docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php tests/AuthGateTest.php && php tests/NormalizePathTest.php && php tests/EntregaManualTest.php && php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php && php tests/PdfResilienceTest.php'` | `ifts14-php84` (PHP 8.4-cli + ext gd/pdo_mysql/mbstring/xml/zip). **6/6 OK local** (6 scripts ejecutados: AuthGate, NormalizePath, EntregaManual, AdminCertificateService, HttpContract, PdfResilience). CI: `.github/workflows/backend-tests.yml` step "Unit tests". |
| Backend E2E (MariaDB 10.6) | `docker network create m3-06-net && docker run -d --name m3-06-mariadb --network m3-06-net -e MARIADB_ROOT_PASSWORD=test_root_only -e MARIADB_DATABASE=ifts14_test mariadb:10.6` luego `docker run --rm --network m3-06-net -v "$PWD":/workspace -w /workspace -e IFTS14_TEST_DB_DSN='mysql:host=m3-06-mariadb;dbname=ifts14_test' -e IFTS14_TEST_DB_USER=root -e IFTS14_TEST_DB_PASS=test_root_only -e IFTS14_TEST_DB_ALLOW_RESET=1 ifts14-php84 sh -lc 'php apps/backend-php/tests/SnapshotEmissionTest.php && php apps/backend-php/tests/HttpEmissionE2eTest.php && php apps/backend-php/tests/AdminMasterDataHttpTest.php && php apps/backend-php/tests/AdminCertificadosConsultaHttpTest.php'` | Red Docker aislada, MariaDB 10.6, DSN host = nombre del contenedor. 4/4 OK local; CI: step "E2E con MariaDB" (`--network host` con service container `mariadb:10.6` en `3306:3306`). |

> **Nota operativa local.** El host del entorno de verificación tiene MySQL/MariaDB escuchando en `127.0.0.1:3306` (auth distinta), por lo que la reproducción local del E2E usa una red Docker aislada con el contenedor MariaDB y DSN apuntando al nombre del contenedor. El workflow CI usa `--network host` con el service container en `3306:3306`; ambos caminos ejecutan los mismos tests contra la misma imagen `ifts14-php84` y `mariadb:10.6`. El test `HttpEmissionE2eTest.php` parsea el DSN sin `port` (sólo `host`/`dbname`), por lo que el E2E local requiere que el host del DSN sea alcanzable en el puerto default 3306 — condición que se cumple con la red Docker aislada y el contenedor MariaDB exponiendo 3306 interno.

### Bloqueo local documentado

`scripts/m3-06-smoke.sh` (smoke backend-only Angular↔PHP con token ficticio) resuelve PHP al inicio: prefiere `php` CLI en PATH; si no está, cae a la imagen Docker local `ifts14-php84` (construida con `bash scripts/php-docker-build.sh`); si ninguna está disponible, sale `2` (BLOCKED). **Falta de `php` CLI ya no es un hard blocker si la imagen Docker está disponible**: el script levanta la API vía `docker run --network host`, `curl` desde el host golpea `127.0.0.1:8080` y el `trap` limpia el contenedor.

Evidencia del ciclo `m3-06-final-angular-api-smoke` (histórico): el host de verificación no tenía `php` CLI y el script aún no tenía fallback Docker, por lo que el smoke quedó **BLOCKED** (exit 2); la evidencia reproducible alternativa fue backend unit + E2E vía Docker + `npm test`/`npm run build` Angular.

Evidencia del ciclo `m3-06-warning-cleanup` (actual): con `php` CLI ausente y la imagen `ifts14-php84` presente, el fallback Docker levantó la API, `/health` respondió 200 y el `trap` limpió el contenedor. La verificación con token ficticio respondió **500** porque la DB demo local no estaba sembrada/rechazaba credenciales ficticias → el smoke sale 1 (FAIL esperado del entorno, no regresión del fallback). **End-to-end real todavía requiere DB demo sembrada con credenciales ficticias válidas** para alcanzar 404 `CERTIFICATE_NOT_FOUND` controlado o 200 con DTO. El flujo manual Angular→PHP vía `proxy.conf.json` (`environment.development.ts` con `useRealApi: true` local, `ng serve`) se documenta como paso operativo futuro; no usa datos reales.
