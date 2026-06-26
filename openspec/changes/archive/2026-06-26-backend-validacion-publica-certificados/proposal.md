# Propuesta: backend-validación-pública-certificados

## Intención

Habilitar el endpoint público de validación de certificados QR que ya está definido en el contrato, sin agregar Angular, dependencias, credenciales reales ni capas de abstracción innecesarias.

## Alcance

### Dentro de alcance
- `GET /certificados/api/certificados/{token}/verificacion`.
- `POST /certificados/api/certificados/consulta` con body `{ "token": "..." }`, mismo DTO que GET.
- Validación de formato de token (32–128 caracteres alfanuméricos, `_`, `-`).
- Lookup por `SHA-256(token + token_pepper)` usando PDO prepared statements.
- Respuesta 200 para token vigente; 404 `CERTIFICATE_NOT_FOUND` unificado para inexistente, revocado o vencido.
- Máscara del documento y DTO público sin DNI ni token completos.
- `token_pepper` en `config/certificados-config.example.php` y validación en `Config::load()`.
- Actualización del seed demo para que el hash incluya el pepper de ejemplo.
- Inserción mínima en `cert_eventos_auditoria` por cada consulta (`verificacion`, resultado `ok`/`rechazado`/`error`, `request_id`, prefijo de hash).

### Fuera de alcance
- Rate limiting (`429`): se documenta como pendiente; no se implementa.
- IP completa en auditoría: solo prefijo hasheado si se registra.
- Nuevas migraciones: el schema ya existe.
- Controller/repository/service completo: se usa un único helper `CertificateValidator`.
- Angular, `.env` real, Composer o librerías nuevas.

## Capacidades

### Nuevas capacidades
- `backend-validacion-publica-certificados`: implementación de los endpoints públicos de verificación, lookup seguro por hash con pepper, DTO público mínimo y auditoría básica.

### Capacidades modificadas
- `backend-contrato-api-certificados`: elevar a MUST el uso de `SHA-256(token + token_pepper)` para el lookup; actualizar el seed demo para reflejar el pepper.

## Enfoque

Extender `apps/backend-php/index.php` con las dos rutas y delegar toda la lógica a `src/CertificateValidator.php`. Este helper recibe el token, valida el formato, calcula el hash, ejecuta el prepared statement contra `cert_tokens_verificacion` + `cert_certificados`, enmascara la respuesta y escribe el evento de auditoría. `index.php` se mantiene como front controller procedural.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificado | Agrega routing GET y POST; mantiene 404/405/500 existentes. |
| `apps/backend-php/src/CertificateValidator.php` | Nuevo | Helper con validación, hash, query PDO y auditoría. |
| `apps/backend-php/src/Config.php` | Modificado | Valida que exista `token_pepper`. |
| `apps/backend-php/config/certificados-config.example.php` | Modificado | Agrega `token_pepper` de ejemplo. |
| `database/seeds/001_certificados_qr_demo.sql` | Modificado | Recalcula `token_hash` con el pepper de ejemplo. |
| `docs/backend/00-php84-api.md` | Modificado en `sdd-archive` | Documenta endpoints validados. |
| `docs/backend/01-contrato-api-certificados.md` | Posible ajuste menor en `sdd-archive` | Si surgen gaps de formato. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| El config real no tiene `token_pepper` | Alta | Validar en `Config::load()`; el ejemplo lo documenta. |
| Hash del seed no coincide con el cálculo de PHP | Media | Actualizar seed con `SHA2(CONCAT(token, pepper_demo), 256)` y probar smoke. |
| Auditoría falla y rompe la respuesta | Baja | Envolver `INSERT` de auditoría en `try/catch` interno; nunca exponer error al cliente. |
| Respuesta 404 revela diferencia entre revocado/vencido/inexistente | Media | Usar una sola query que falle para cualquiera de los tres casos. |

## Plan de rollback

Revierte los cambios con Git: restaurar `index.php`, `Config.php`, `certificados-config.example.php` y el seed; eliminar `src/CertificateValidator.php`. No se toca `public_html` ni base de datos productiva en este ciclo.

## Dependencias

- MariaDB 10.6.27 con las tablas `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria` ya creadas.
- Configuración real con `token_pepper` fuera de Git.

## Criterios de éxito

- [ ] `GET /certificados/api/certificados/{token_demo}/verificacion` responde 200 con `valid: true` y DTO público.
- [ ] `POST /certificados/api/certificados/consulta` con token demo responde igual que GET.
- [ ] Token inválido, inexistente, revocado o vencido responde 404 `CERTIFICATE_NOT_FOUND` sin distinguir causa.
- [ ] No aparecen DNI completos, token completos, SQL ni rutas internas en respuestas ni logs.
- [ ] `php -l` sobre archivos PHP modificados/nuevos sin errores.
- [ ] Smoke local con Docker devuelve los tres casos esperados.
