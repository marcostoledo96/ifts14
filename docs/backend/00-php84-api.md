# Backend PHP 8.4.22 — contrato de autenticación P5-01

> PHP 8.4.22 CGI/FastCGI fue verificado únicamente en el candidato aislado de staging. Producción no está activada ni validada. Las referencias históricas a `X-Admin-Key` HTTP o `STOP DESPLIEGUE` no son normativa vigente.

## Objetivo

Implementar la API del módulo de certificaciones QR usando PHP 8.4.21.

## Principios

- Usar PDO.
- Usar prepared statements.
- No exponer credenciales.
- No imprimir DNI ni tokens completos en logs.
- Separar configuración, rutas, servicios y acceso a datos.
- Mantener documentación en español argentino formal.
- Token/QR permanente: la entrega manual no rota token; no hay reenvío por email en el MVP.
- DNI completo visible en validación pública (decisión D0); logs/auditoría/errores sin DNI completo.
- Certificado de curso con fechas asistidas.

## Ruta conceptual

```txt
/certificados/api/
```

## Endpoints implementados

| Método | Ruta pública | Resultado |
|---|---|---|
| `GET` | `/certificados/api/health` | Estado técnico básico, sin abrir configuración ni PDO. |
| `GET` | `/certificados/api/certificados/{token}/verificacion` | Valida token público por hash `SHA-256(token + token_pepper)` y devuelve DTO público mínimo. |
| `POST` | `/certificados/api/certificados/consulta` | Lee JSON `{ "token": "..." }` y reutiliza la misma validación que el GET. |
| `POST` | `/certificados/api/admin/certificados` | Emite certificado desde `alumnoId` + `cursoId` y asistencias activas certificables (fecha `realizada`); requiere sesión admin y CSRF, y devuelve DTO seguro con `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`; sin DNI ni token completos como campos separados. |
| `POST` | `/certificados/api/admin/certificados/{id}/revocar` | Revoca certificado e invalida tokens activos; requiere sesión admin y CSRF. |
| `GET` | `/certificados/api/admin/certificados/{id}/entrega-manual` | Entrega manual de solo lectura: devuelve `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix` para copia/descarga externa por Bedelía; sin email, sin rotación, sin escritura. |
| `GET` | `/certificados/api/admin/certificados/{id}/qr.png` | Descarga administrativa del QR como PNG aislado (`image/png`, `attachment`) generado on-demand desde el mismo `publicValidationUrl`. No rota token, no persiste PNG, no envía email; requiere extensión PHP `gd` (o equivalente) en hosting. |
| `POST/GET/PATCH` | `/certificados/api/admin/cursos`, `/admin/cursos/{id}`, `/admin/cursos/{id}/estado` | CRUD mínimo de cursos para datos maestros; requiere sesión admin; las mutaciones exigen CSRF. |
| `POST/GET/PATCH` | `/certificados/api/admin/alumnos`, `/admin/alumnos/{id}`, `/admin/alumnos/{id}/estado` | CRUD mínimo de alumnos con DNI cifrado/hash y DTO admin con DNI completo en `dniMostrar`/`documentMasked`; email opcional; requiere sesión admin; las mutaciones exigen CSRF. |
| `POST/GET/PATCH` | `/certificados/api/admin/cursos/{cursoId}/fechas`, `/admin/cursos/{cursoId}/fechas/{fechaId}` | Carga y mantenimiento de fechas de curso ordenadas. |
| `POST/GET/DELETE` | `/certificados/api/admin/asistencias`, `/admin/asistencias/{id}` | Registro, listado y anulación lógica de asistencias activas; tras escritura recalcula `cert_curso_fechas.estado` (`programada`↔`realizada`, nunca `cancelada`) con día local AR. |

La validación pública acepta tokens de 32 a 128 caracteres alfanuméricos, `_` o `-`. Los casos inexistentes, revocados, vencidos o fuera de ventana responden `404 CERTIFICATE_NOT_FOUND` sin revelar la causa. Los endpoints públicos aplican rate limiting mínimo por origen y responden `429 RATE_LIMITED` al superar el umbral configurado.

Para certificados nuevos emitidos desde alumno+curso, `CertificateValidator::verify()` devuelve `student.documentNumber` y `course.attendedDates` desde `cert_alumnos.dni_cifrado` y `cert_certificado_fechas`. Los certificados legacy mantienen fallback con `student.documentMasked` y no inventan fechas asistidas.

`token_pepper` es obligatorio en la configuración externa real y debe mantenerse fuera de Git. El ejemplo versionable usa valores ficticios solo para demo local.

### Seguimiento separado: entrega manual con datos de negocio

El endpoint `GET /certificados/api/admin/certificados/{id}/entrega-manual` requiere smoke DB-backed formal antes de cerrar el gate de deploy: un certificado recuperable debe responder `200` y un legacy sin `token_cifrado` debe responder `409 TOKEN_NOT_RECOVERABLE`. El happy path recuperable local quedó versionado en `apps/backend-php/tests/HttpEmissionE2eTest.php`: emisión `201`, validación pública `200`, entrega manual `200` sin rotación y `/reenviar` `404`.

El smoke remoto con datos de negocio queda como seguimiento explícito fuera de P5-01. El staging validado permaneció vacío; cualquier ejecución futura debe usar datos ficticios, login/cookie/CSRF y evidencia sanitizada.

## Contrato vigente

El contrato público futuro de la API de certificados QR está documentado en:

- `docs/backend/01-contrato-api-certificados.md`

Ese contrato define endpoints, DTOs, sobre de errores, validación de token QR, reglas de seguridad y expectativas de integración. La implementación actual cubre la validación pública mínima y el slice administrativo mínimo de emisión/revocación protegido por `X-Admin-Key`.

## Autenticación administrativa por sesión (P5-01)

Los endpoints administrativos usan sesión PHP nativa: `POST /admin/auth/login`, `GET /admin/auth/session` y `POST /admin/auth/logout`. La cookie es `HttpOnly`, `Secure`, `SameSite=Strict`, host-only y usa `/certificados/` en producción o `/certificados_staging/` en staging. Login regenera el ID; la sesión vence por **4 horas** de inactividad (`14400` s) o **8 horas** absolutas (`28800` s). `GET /admin/auth/session` y los GETs administrativos autorizados renuevan `lastSeen`. Las mutaciones requieren `X-CSRF-Token` antes de acceder a servicios o base.

**D-009 (profundidad cookie):** el `lifetime` de cookie es `0` (cookie de sesión del navegador: sin `Max-Age`/`Expires` persistente). El tope absoluto de **28800** s se aplica solo app-side (`createdAt` + `sessionIsActive`), no como duración de cookie. Atributos fijos: `Secure`, `HttpOnly`, `SameSite=Strict`; el path sigue el entorno. El `.htaccess` de la API deniega acceso directo a `src/` y `config/` antes del fallback — ver `docs/deploy/00-cpanel-certificados.md` §API htaccess.

La configuración externa requiere `admin_username`, `admin_password_hash` creado con `PASSWORD_DEFAULT` y ambos TTL exactos. No se versionan ni exponen valores. `X-Admin-Key` no autoriza HTTP; la compatibilidad CLI queda deshabilitada por defecto, requiere expiración futura y debe retirarse antes de activar login de navegador en producción.

El smoke histórico `scripts/test-alto-c-interactive.sh` fue discontinuado porque dependía de `X-Admin-Key` por HTTP. El candidato de staging aprobó el gate operativo; producción permanece sin activar ni validar.

### Inventario de compatibilidad legacy

| Alcance rastreado | Estado | Tratamiento |
|---|---|---|
| Runtime PHP HTTP | Retirado | No lee `HTTP_X_ADMIN_KEY`; toda autorización usa sesión/cookie y CSRF. |
| `AuthGateTest`, `AdminAuthHttpTest`, matriz de 18 sitios | Negativo | Envían el header solo para probar que responde `401`; no es un consumidor autorizado. |
| `AuthGate::requireLegacyCli()` | CLI acotado | Requiere opt-in externo, clave de 16+ caracteres, vencimiento futuro y `PHP_SAPI === 'cli'`; deshabilitado por defecto y en producción. |
| `scripts/test-alto-c-interactive.sh` | Discontinuado | Termina con código `2`; no ejecuta requests ni despliegues. |
| Docs/specs/archivos históricos y deploy | No ejecutable | Se conservan como evidencia o quedan bajo el gate de despliegue; no autorizan HTTP ni se modifican en este ciclo. |

El audit `fault-injection-audit.php` corre en el paso E2E de CI: con `IFTS14_TEST_DB_*` + `ALLOW_RESET=1` genera config demo temporal y el token fixture; fuera de CI exige `CERTIFICADOS_CONFIG_PATH` demo/test explícito. El rechazo sin esos prerequisitos es una protección correcta.

## Pendientes

- Confirmar si Composer está disponible en cPanel (gate para TCPDF). PHPMailer fue removido: no hay flujo de email en el MVP.
- Confirmar generación de PDF/QR viable en el hosting.
- La entrega manual reemplaza al reenvío por email: Bedelía copia el link público y descarga el PDF por canal externo. No hay SMTP/PHPMailer activos.
- `token_cifrado` (AES-256-GCM, clave externa a Git) habilita reconstruir `publicValidationUrl` sin rotar token. Certificados previos sin `token_cifrado` responden `409 TOKEN_NOT_RECOVERABLE`; no se regeneran salvo decisión auditada explícita.
- Firmantes institucionales completos en PDF quedan pendientes de un ciclo específico si no se cargan desde configuración institucional.
- La activación de login de navegador en staging/producción queda bloqueada hasta `PASS DESPLIEGUE`.
- **Rate limiting público**: implementado como protección básica de nodo único con JSON temporal y `flock()`. No reemplaza controles anti-abuso distribuidos.
- **Auditoría fault-injection**: disponible en `apps/backend-php/tests/fault-injection-audit.php` para DB demo ficticia; restaura `cert_eventos_auditoria` en `finally`.
- **Dependencia runtime `gd` para QR PNG**: el endpoint `GET /certificados/api/admin/certificados/{id}/qr.png` exige la extensión PHP `gd` (o equivalente) en hosting. La imagen Docker `docker/php84/Dockerfile` instala `libpng-dev` y compila `gd`; `scripts/php-docker-modules-check.sh` valida el módulo. Confirmar `gd` habilitado en cPanel antes de deploy; si falta, la ruta responde `500 CONFIGURATION_ERROR` y queda como gate pendiente.

## Validación local con PHP 8.4

Si el PHP nativo local no coincide con producción (PHP 8.4.21), existe un runtime Docker mínimo en `docker/php84/` con scripts en `scripts/php-docker-*.sh`. El runtime local se ejecuta exclusivamente con `sudo docker build` y `sudo docker run`; no se usa Docker Compose en este ciclo ni en los siguientes hasta decisión explícita. No conecta a bases de datos reales y no monta credenciales. Fue validado localmente con PHP 8.4.22, módulos requeridos OK y `php -l` sin errores sobre el backend base.

El smoke HTTP local real se ejecutó dentro de la imagen `ifts14-php84` mediante `sudo docker run` (sin Docker Compose) con el siguiente comando:

```bash
sudo docker run -d --rm \
  --name ifts14-php84-smoke \
  -p 8080:8080 \
  -v "$PWD/apps/backend-php":/app \
  -w /app \
  -e CERTIFICADOS_CONFIG_PATH=/app/config/certificados-config.example.php \
  ifts14-php84 \
  php -S 0.0.0.0:8080 -t /app /app/index.php
```

Para QA manual con login admin (`bedelia` / `password-demo-auth`), no uses ese `example.php`: levantá con `bash scripts/local-api-up.sh` (usa `certificados-config.local.php` y valida el login).

Casos verificados:

- `GET http://127.0.0.1:8080/health` → 200 JSON `data.status: ok`, `data.service: certificados-api`.
- `POST http://127.0.0.1:8080/health` → 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`.
- `GET http://127.0.0.1:8080/no-existe` → 404 con `error.code: NOT_FOUND`.

### Verificación local del endpoint público

La implementación de `backend-validacion-publica-certificados` quedó validada con evidencia local real provista por Marcos en una sesión interactiva, con `sudo docker run` aislado y un MariaDB 10.6 con configuración ficticia bajo `/tmp`:

| Verificación | Resultado |
|---|---|
| `bash scripts/php-docker-modules-check.sh` (módulos PHP) | `PASS` — `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `bash scripts/php-docker-lint.sh` (`php -l` sobre archivos modificados/nuevos) | `PASS` — sin errores de sintaxis. |
| `GET /health` con config de ejemplo | `PASS` — `200` con `data.status: ok`, `data.service: certificados-api`. |
| `GET .../verificacion` con token de formato inválido (`bad`) | `PASS` — `400 VALIDATION_ERROR` sin DB lookup. |
| `POST .../consulta` con `{"token":"bad"}` | `PASS` — `400 VALIDATION_ERROR` sin DB lookup. |
| DB-backed `GET .../verificacion` con token demo válido | `PASS` — `200` con DTO público (`data.valid: true`, `requestId`). Evidencia histórica del ciclo `backend-validacion-publica-certificados`. **El DTO actual implementado todavía usa `documentMasked` sin `attendedDates`; el DTO vigente post-D0 (`documentNumber` + `attendedDates`) ya tiene su contrato documental cerrado (M4-01A) y su implementación está pendiente (M4-01B).** |
| DB-backed `POST .../consulta` con token demo válido | `PASS` — `200` con el mismo DTO que GET. |
| DB-backed `GET .../verificacion` con token no verificable | `PASS` — `404 CERTIFICATE_NOT_FOUND` unificado. |

Las respuestas capturadas no incluyen DNI completo, token completo, SQL, credenciales, rutas internas ni configuración sensible. La falla del `INSERT` de auditoría quedó probada con `apps/backend-php/tests/fault-injection-audit.php` contra DB demo ficticia: válido conserva `200`, no verificable conserva `404`, token inválido conserva `400` y `cert_eventos_auditoria` se restaura en `finally`.

Detalle de uso en `docker/php84/README.md` y en `apps/backend-php/README.md` (sección "Smoke HTTP local con `sudo docker run`").

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye una carpeta `api/` con subcarpetas PHP por recurso y operaciones CRUD candidatas.
- **Observado**: existen archivos de conexión/configuración bajo `api/`; no fueron abiertos por riesgo de credenciales.
- **Observado**: `api.zip` existe como artefacto comprimido y no fue descomprimido.
- **Hipótesis**: el backend original parece procedural y desplegado en carpeta pública; el nuevo módulo debe separar configuración, servicios y acceso a datos.

## Hardening aplicado (ciclo `qa-backend-hardening-certificados`)

Cambios quirúrgicos implementados en el front controller PHP y las clases comunes, sin dependencias, migraciones ni nuevos módulos.

| Comportamiento | Implementación | Spec |
|---|---|---|
| Headers de seguridad en toda respuesta JSON | `Response::json()` y `Response::error()` emiten `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN` antes de `Content-Type`. | `backend-base-php-certificados`, `backend-contrato-api-certificados`. |
| `415 UNSUPPORTED_MEDIA_TYPE` por `Content-Type` no JSON | Helper local `requireJsonContentType()` en `index.php`: split por `;`, `trim`, `strtolower`, exige `application/json` exacto. Se aplica antes de cualquier side effect o rate-limit. | `backend-contrato-api-certificados`. |
| `400 VALIDATION_ERROR` por JSON malformado en POST JSON | Helper local `readJsonBody()` exige `json_decode` como array sin `JSON_ERROR_NONE`. Aplica a `POST /certificados/consulta`, `POST /admin/certificados` y `POST /admin/certificados/{id}/revocar`. | `backend-contrato-api-certificados`, `admin-certificate-emission`. |
| Falla cerrada para sesión admin inválida | `Config::adminSessionSettings()` exige usuario externo, hash `PASSWORD_DEFAULT` y TTL exactos. Las rutas admin responden `401 UNAUTHORIZED` sin revelar causa; los endpoints públicos no se rompen. | `admin-auth`. |
| Revocación sin motivo | Cuando no se envía `reason`, el cliente debe enviar un body JSON `{}`. Un body sin `Content-Type: application/json` o con JSON malformado responde `415`/`400` sin persistir. | `backend-contrato-api-certificados`. |

### Pendientes diferidos (fuera de este ciclo)

Los siguientes gaps quedan registrados en specs y deben abordarse en ciclos SDD posteriores:

- **CORS / preflight**: no se implementan respuestas a `OPTIONS` ni cabeceras `Access-Control-*`.
- **Límite de tamaño de body**: no se aplica `post_max_size` ni chequeo manual del largo de `php://input`.
- **Rate limiting distribuido**: el `RateLimiter` actual es de nodo único con JSON temporal y `flock`; no escala horizontalmente.
- **Observabilidad real**: no hay agregador de logs, métricas ni trazas; el backend solo emite eventos puntuales.
- **`ultimo_uso_en` en verificación pública**: la columna existe en el modelo, pero la verificación pública no la actualiza todavía.

## PDF institucional

La emisión administrativa genera el PDF con contenido institucional desde `cert_configuracion_institucional` (`id = 1`): nombre de institución, texto de certificado, rector/a y asesor/a pedagógica con sus cargos. Si la fila no existe o algún campo está vacío, el backend usa valores seguros por defecto y no aborta la emisión.

El PDF conserva el contrato vigente: certificado de curso horizontal, DNI completo permitido solo dentro del certificado, fechas desde el snapshot `cert_certificado_fechas`, QR al link permanente y sin token completo como texto visible. No agrega endpoints, SMTP, reenvío automático ni edición de configuración institucional.
