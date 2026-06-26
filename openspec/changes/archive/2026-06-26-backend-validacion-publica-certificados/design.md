# Diseño: validación pública de certificados

## Enfoque técnico

Extender el front controller PHP existente con dos rutas públicas y concentrar la lógica en un único helper `CertificateValidator`. No se agregan dependencias, Composer, Angular ni capas controller/repository/service. El diseño sigue los deltas `backend-validacion-publica-certificados` y `backend-contrato-api-certificados`: validación temprana del token, lookup por `SHA-256(token + token_pepper)`, DTO público mínimo, 404 unificado y auditoría no bloqueante. El seed demo debe usar un token ficticio válido, por ejemplo `TOKEN_DEMO_FICTICIO_VALIDO_2026_0001`, porque el valor actual `TOKEN_DEMO_FICTICIO_NO_USAR` no cumple el mínimo de 32 caracteres.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Helper único `CertificateValidator` | Menos extensible que varias capas, pero menor diff y suficiente para dos endpoints públicos. | Crear `apps/backend-php/src/CertificateValidator.php` con validación, hash, consulta, DTO y auditoría. |
| Normalizar rutas en `index.php` | Acopla routing simple al front controller, pero ya existe `normalizePath()`. | Reusar `normalizePath()` para aceptar `/certificados/api/...`, `/index.php/...` y rutas internas. |
| 404 por query filtrada | No distingue causa, pero evita leaks. | La consulta solo retorna tokens activos, dentro de ventana y certificados `vigente`; cualquier ausencia es `CERTIFICATE_NOT_FOUND`. |
| Auditoría aislada | Puede perder eventos si falla el insert. | Envolver auditoría en `try/catch`; nunca romper la respuesta pública ni exponer errores. |
| `requestId` opcional en `Response` | Cambia dos firmas, pero evita exponer el generador privado. | Usar `Response::json(int $status, array $data, ?string $requestId = null)` y `Response::error(int $status, string $code, string $message, ?string $requestId = null)`. |

## Flujo de datos

```txt
GET/POST público
  -> index.php normaliza ruta y extrae token
  -> index.php crea requestId una vez
  -> CertificateValidator::verify($token, $requestId)
  -> valida formato ^[A-Za-z0-9_-]{32,128}$
  -> hash('sha256', $token . token_pepper, true)
  -> PDO prepared SELECT filtrado
  -> DTO 200 o error 404/400
  -> INSERT auditoría best-effort
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificar | Requerir `Database.php` y `CertificateValidator.php`; agregar GET `/certificados/{token}/verificacion`, POST `/certificados/consulta`, 405 por ruta conocida y body JSON mínimo. |
| `apps/backend-php/src/CertificateValidator.php` | Crear | Helper final con `verify()`, validación de token, cálculo de hash, query, armado de DTO, máscara ya persistida y auditoría. |
| `apps/backend-php/src/Response.php` | Modificar | Agregar parámetro opcional `?string $requestId = null` a `json()` y `error()`; si no llega, seguir usando el generador privado existente. |
| `apps/backend-php/src/Config.php` | Modificar | Exigir `token_pepper` string no vacío además de credenciales DB. |
| `apps/backend-php/config/certificados-config.example.php` | Modificar | Agregar `token_pepper` ficticio de demo. |
| `database/seeds/001_certificados_qr_demo.sql` | Modificar | Reemplazar el token demo por un valor ficticio válido de 32–128 caracteres y recalcular `token_hash` binario con `UNHEX(SHA2(CONCAT(token_demo, pepper_demo), 256))`. |
| `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/database/01-modelo-datos-certificados.md` | Modificar en archive | Documentar endpoints implementados, pepper obligatorio, seed demo y pendiente de rate limiting. |

## Interfaces / contratos

Respuesta 200:

```json
{
  "data": {
    "valid": true,
    "status": "vigente",
    "certificateCode": "CERT-DEMO-2026-0001",
    "student": { "displayName": "Persona Demo", "documentMasked": "00******00" },
    "course": { "name": "Curso Demo de Validación QR", "issuedAt": "2026-06-24" },
    "verifiedAt": "2026-06-25T20:00:00-03:00"
  },
  "meta": { "requestId": "req_..." }
}
```

Consulta SQL base:

```sql
SELECT c.id, c.codigo_certificado, c.alumno_nombre_mostrar,
       c.documento_enmascarado, c.curso_nombre, c.emitido_en
FROM cert_tokens_verificacion t
JOIN cert_certificados c ON c.id = t.certificado_id
WHERE t.token_hash = ?
  AND t.estado = 'activo'
  AND t.revocado_en IS NULL
  AND t.vigente_desde <= CURRENT_TIMESTAMP
  AND (t.vigente_hasta IS NULL OR t.vigente_hasta >= CURRENT_TIMESTAMP)
  AND c.estado = 'vigente'
  AND c.revocado_en IS NULL
  AND (c.vence_en IS NULL OR c.vence_en >= CURRENT_DATE)
LIMIT 1
```

`token_hash` se pasa como binario (`hash(..., true)`). En SQL de seed, el valor equivalente debe escribirse como `UNHEX(SHA2(CONCAT(token_demo, pepper_demo), 256))`, no como `SHA2(...)` plano. `token_hash_prefijo` usa `substr(hash(..., false), 0, 16)`. Los tokens con formato inválido se auditan como `resultado='rechazado'` sin calcular ni guardar prefijo de hash. No se guarda token completo, DNI, SQL ni credenciales.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Sintaxis | PHP modificado/nuevo | `bash scripts/php-docker-lint.sh`. |
| Routing | health, GET/POST validación, métodos no permitidos | Servidor embebido Docker existente y `curl`. |
| Seguridad | token inválido 400 sin DB; no verificable 404; DTO sin sensibles | Smoke HTTP y revisión JSON. |
| Datos demo | hash PHP coincide con seed | MariaDB local/demo si está disponible; no usar DB real. |

## Migración / rollout

No hay migración nueva. Rollback: revertir `index.php`, `Response.php`, `Config.php`, config example y seed; eliminar `CertificateValidator.php`. Deploy posterior debe cargar configuración real externa con `token_pepper` antes de habilitar endpoints.

## Preguntas abiertas

- [ ] El smoke 200/404 con MariaDB demo depende de tener una base local cargada; los scripts Docker actuales validan PHP y HTTP sin DB.
