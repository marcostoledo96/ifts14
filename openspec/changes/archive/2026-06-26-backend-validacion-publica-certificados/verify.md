# Verificación SDD — backend-validacion-publica-certificados

## Resultado

| Campo | Valor |
|---|---|
| Estado | `PASS WITH WARNINGS` |
| Modo | Standard SDD verify; Strict TDD no activo |
| Cambio | `backend-validacion-publica-certificados` |
| Persistencia | Hybrid: OpenSpec file + Engram |
| Fecha | 2026-06-26 |

La implementación queda alineada con la propuesta, specs y diseño para la porción verificada. Marcos aportó evidencia local interactiva real para módulos PHP, lint, arranque del servidor HTTP, smokes seguros de `/health` e invalid-format `400`, y smoke DB/demo con MariaDB local ficticia para GET/POST `200` y no verificable `404`. No quedan blockers de verificación; corresponde pasar a `sdd-archive` con las advertencias documentadas.

## Artefactos leídos

- `openspec/changes/backend-validacion-publica-certificados/proposal.md`
- `openspec/changes/backend-validacion-publica-certificados/design.md`
- `openspec/changes/backend-validacion-publica-certificados/tasks.md`
- `openspec/changes/backend-validacion-publica-certificados/specs/backend-validacion-publica-certificados/spec.md`
- `openspec/changes/backend-validacion-publica-certificados/specs/backend-contrato-api-certificados/spec.md`
- Engram topic `sdd/backend-validacion-publica-certificados/apply-progress`
- Backend, database, deploy and docs files relevant to this change.

## Completeness

| Métrica | Valor |
|---|---:|
| Tasks total | 21 |
| Tasks complete | 21 |
| Tasks incomplete | 0 |
| Unchecked required runtime tasks | Ninguna |

## Commands run and results

### PHP Docker modules check

```bash
bash scripts/php-docker-modules-check.sh
```

```text
marcos@marcos-ASUS:~/Escritorio/ifts14$ bash scripts/php-docker-modules-check.sh
[sudo: authenticate] Contraseña:
Installed PHP modules:
[PHP Modules]
Core
ctype
curl
date
dom
fileinfo
filter
hash
iconv
json
libxml
mbstring
mysqlnd
openssl
pcre
PDO
pdo_mysql
pdo_sqlite
Phar
posix
random
readline
Reflection
session
SimpleXML
sodium
SPL
sqlite3
standard
tokenizer
xml
xmlreader
xmlwriter
Zend OPcache
zip
zlib

[Zend Modules]
Zend OPcache

Required module check:
OK pdo_mysql
OK openssl
OK mbstring
OK curl
OK zip
OK xml
marcos@marcos-ASUS:~/Escritorio/ifts14$
```

Result: `PASS` from trusted user-provided interactive local evidence.

### PHP Docker lint

```bash
bash scripts/php-docker-lint.sh
```

```text
marcos@marcos-ASUS:~/Escritorio/ifts14$ bash scripts/php-docker-lint.sh
No syntax errors detected in apps/backend-php/config/certificados-config.example.php
No syntax errors detected in apps/backend-php/index.php
No syntax errors detected in apps/backend-php/src/Config.php
No syntax errors detected in apps/backend-php/src/CertificateValidator.php
No syntax errors detected in apps/backend-php/src/Response.php
No syntax errors detected in apps/backend-php/src/Database.php
marcos@marcos-ASUS:~/Escritorio/ifts14$
```

Result: `PASS` from trusted user-provided interactive local evidence.

### HTTP smoke with `sudo docker run`

Marcos started the local smoke server with the example config only:

```bash
sudo docker run -d --rm -p 8080:8080 -v "$PWD/apps/backend-php:/app:ro" -w /app -e CERTIFICADOS_CONFIG_PATH=/app/config/certificados-config.example.php ifts14-php84 php -S 0.0.0.0:8080 -t /app /app/index.php
```

```text
container_id=48be529c2db86d46da27707d9b66078fd578afd79dd9e8ba8d01b6a475df483c
```

#### `/health`

```bash
rtk curl --silent --show-error --include --max-time 5 'http://localhost:8080/health'
```

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"data":{"status":"ok","service":"certificados-api"},"meta":{"requestId":"req_f34703a9f48fcdef"}}
```

Result: `PASS`; service reports `ok`.

#### Invalid-format GET validation route

```bash
rtk curl --silent --show-error --include --max-time 5 'http://localhost:8080/certificados/api/certificados/bad/verificacion'
```

```text
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"error":{"code":"VALIDATION_ERROR","message":"Token inválido.","details":[]},"meta":{"requestId":"req_edd275e3f17935c8"}}
```

Result: `PASS`; invalid format returns `400 VALIDATION_ERROR` before DB-backed lookup.

#### Invalid-format POST consultation route

```bash
rtk curl --silent --show-error --include --max-time 5 -X POST -H 'Content-Type: application/json' --data '{"token":"bad"}' 'http://localhost:8080/certificados/api/certificados/consulta'
```

```text
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"error":{"code":"VALIDATION_ERROR","message":"Token inválido.","details":[]},"meta":{"requestId":"req_6230e52035fb95d0"}}
```

Result: `PASS`; invalid format returns `400 VALIDATION_ERROR` before DB-backed lookup.

### Seed coherence helper check

```bash
python3 - <<'PY'
import hashlib

token = 'TOKEN_DEMO_FICTICIO_VALIDO_2026_0001'
pepper = 'pepper_demo_ficticio_2026_no_usar'
print(f'token_length={len(token)}')
print(f'sha256_hex_prefix={hashlib.sha256((token + pepper).encode()).hexdigest()[:16]}')
print('format_ok=' + str(32 <= len(token) <= 128 and all(c.isalnum() or c in '_-' for c in token)))
PY
```

```text
token_length=36
sha256_hex_prefix=02c6ea1df5b8be45
format_ok=True
```

Result: static/runtime helper only; it confirms the demo token format and hash input shape, but does not replace PHP/MariaDB smoke evidence.

### Full demo DB smoke

Marcos provided trusted safe local demo evidence using MariaDB 10.6 with fictitious credentials/config under `/tmp`; no real DB or production config was used.

#### Demo MariaDB container

```bash
sudo docker run -d --rm --name ifts14-mariadb-demo \
  -e MARIADB_ROOT_PASSWORD=root_demo_no_real \
  -e MARIADB_DATABASE=ifts14_certificados_demo \
  -e MARIADB_USER=usuario_demo \
  -e MARIADB_PASSWORD=clave_demo_no_real \
  -p 3307:3306 \
  mariadb:10.6
```

```text
Pulled mariadb:10.6 and started container 538038a4fc8b...
```

#### Migration and demo seed

```bash
sudo docker exec -i ifts14-mariadb-demo mariadb \
  -uusuario_demo -pclave_demo_no_real ifts14_certificados_demo \
  < database/migrations/001_certificados_qr.sql

sudo docker exec -i ifts14-mariadb-demo mariadb \
  -uusuario_demo -pclave_demo_no_real ifts14_certificados_demo \
  < database/seeds/001_certificados_qr_demo.sql
```

Result: `PASS`; schema and fictitious demo seed loaded into the isolated local MariaDB container.

#### Demo PHP API container

```bash
# temp config created at /tmp/ifts14-certificados-demo/certificados-api.php with fictitious values

sudo docker run -d --rm --name ifts14-api-demo -p 8080:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v "$PWD/apps/backend-php:/app:ro" \
  -v /tmp/ifts14-certificados-demo:/demo-config:ro \
  -w /app \
  -e CERTIFICADOS_CONFIG_PATH=/demo-config/certificados-api.php \
  ifts14-php84 php -S 0.0.0.0:8080 -t /app /app/index.php
```

```text
container_id=ac2b8fc126b0...
```

#### Valid GET returns public DTO `200`

```bash
curl -i http://localhost:8080/certificados/api/certificados/TOKEN_DEMO_FICTICIO_VALIDO_2026_0001/verificacion
```

```text
HTTP/1.1 200 OK
{"data":{"valid":true,"status":"vigente","certificateCode":"CERT-DEMO-2026-0001","student":{"displayName":"Persona Demo","documentMasked":"00******00"},"course":{"name":"Curso Demo de Validación QR","issuedAt":"2026-06-24"},"verifiedAt":"2026-06-25T22:04:08-03:00"},"meta":{"requestId":"req_23f9f5331ea14905"}}
```

Result: `PASS`; valid token returns `200`, `data.valid: true`, public certificate DTO and masked document only.

#### Valid POST returns same public DTO contract `200`

```bash
curl -i -X POST http://localhost:8080/certificados/api/certificados/consulta -H 'Content-Type: application/json' -d '{"token":"TOKEN_DEMO_FICTICIO_VALIDO_2026_0001"}'
```

```text
HTTP/1.1 200 OK
{"data":{"valid":true,"status":"vigente","certificateCode":"CERT-DEMO-2026-0001","student":{"displayName":"Persona Demo","documentMasked":"00******00"},"course":{"name":"Curso Demo de Validación QR","issuedAt":"2026-06-24"},"verifiedAt":"2026-06-25T22:04:20-03:00"},"meta":{"requestId":"req_867ad125483faa62"}}
```

Result: `PASS`; POST reuses the same public DTO contract as GET. `requestId` and `verifiedAt` differ per request, as expected.

#### Non-verifiable token returns unified `404`

```bash
curl -i http://localhost:8080/certificados/api/certificados/TOKEN_DEMO_FICTICIO_VALIDO_2026_9999/verificacion
```

```text
HTTP/1.1 404 Not Found
{"error":{"code":"CERTIFICATE_NOT_FOUND","message":"No se pudo validar el certificado.","details":[]},"meta":{"requestId":"req_92db2db91999b59a"}}
```

Result: `PASS`; valid-format but non-verifiable token returns unified `404 CERTIFICATE_NOT_FOUND` without revealing cause.

## Spec coverage

| Requirement | Scenario | Evidence | Result |
|---|---|---|---|
| Validación pública por GET | Certificado vigente por GET | DB-backed demo GET returns `200` with `data.valid: true` and public DTO. | `PASS` |
| Consulta pública por POST | Certificado vigente por POST | DB-backed demo POST returns `200` with the same public DTO contract as GET. | `PASS` |
| Lookup seguro por hash | Token con formato inválido | GET and POST invalid-format HTTP smokes return `400 VALIDATION_ERROR` without DB-backed lookup. | `PASS` |
| Respuesta pública segura | DTO válido mínimo | DB-backed `200` responses include `valid: true`, masked document `00******00`, public course/certificate fields and `requestId`; no full DNI/token/SQL/config/internal path appears. | `PASS` |
| No verificable unificado | Caso no verificable | DB-backed valid-format non-verifiable GET returns `404 CERTIFICATE_NOT_FOUND` with generic message and no cause detail. | `PASS` |
| Auditoría mínima no bloqueante | Auditoría falla | `audit()` catches `Throwable`; no runtime fault-injection test was provided. | `PARTIAL / WARNING` |
| Configuración, seed y rate limiting | Seed demo coherente | Migration and seed loaded in MariaDB demo; valid seeded token resolves to `200`, proving seed/hash/config coherence for the demo values. Rate limiting remains intentionally out of scope. | `PASS` |
| Contrato público modificado | GET/POST/security/log scenarios | Invalid-format GET/POST runtime smokes passed; DB-backed GET/POST `200` and non-verifiable `404` smokes passed; public responses exclude sensitive values. | `PASS` |

Compliance summary: runtime evidence now covers `/health`, invalid-format GET/POST `400`, DB-backed GET/POST `200`, and DB-backed non-verifiable `404`. Full archive readiness is no longer blocked. Remaining warning: audit INSERT failure behavior is source-verified but not fault-injection tested at runtime.

## Static correctness

| Área | Estado | Evidencia |
|---|---|---|
| GET route | Implemented and smoke-tested | `apps/backend-php/index.php` normalizes `/certificados/api` and handles `/certificados/{token}/verificacion`; DB-backed demo GET returned `200`. |
| POST route | Implemented and smoke-tested | `apps/backend-php/index.php` handles `/certificados/consulta` and reads JSON `token`; DB-backed demo POST returned `200`. |
| Request ID reuse | Implemented | `Response::json()` and `Response::error()` accept caller-provided `requestId`. |
| Config pepper | Implemented | `Config::load()` requires non-empty string `token_pepper`; example config uses fictitious value. |
| Hash lookup | Implemented | `CertificateValidator` calculates binary `hash('sha256', $token . token_pepper, true)` and binds it to a prepared statement. |
| Verifiable-row filters | Implemented | Query filters active token, `t.revocado_en IS NULL`, token window, certificate `vigente`, certificate revocation and expiration. |
| Unified 404 | Implemented and smoke-tested | Missing/not-current rows return `404 CERTIFICATE_NOT_FOUND` without cause details; DB-backed demo non-verifiable GET returned `404`. |
| Invalid format | Implemented and smoke-tested | Regex `^[A-Za-z0-9_-]{32,128}$` equivalent and `400 VALIDATION_ERROR`; GET/POST invalid-format smokes passed. |
| Audit | Implemented statically | Best-effort insert into `cert_eventos_auditoria`; audit failures are swallowed. |
| Seed | Implemented and smoke-tested | Demo token length 36, allowed format, seed stores binary `UNHEX(SHA2(CONCAT(...), 256))`; seeded token resolved successfully in MariaDB demo. |
| New migrations | Compliant | No new migration was added for this change; existing `001_certificados_qr.sql` remains the schema source. |

## Design coherence

| Design decision | Followed? | Notes |
|---|---|---|
| Minimal helper, no controller/repository scaffolding | Yes | Single `CertificateValidator` helper; no new dependency or Composer use. |
| Reuse path normalization | Yes | `normalizePath()` handles public prefix and `index.php`. |
| 404 by filtered query | Yes | Query only returns currently verifiable certificates. |
| Audit isolated | Yes | Audit insert is wrapped in `try/catch`. |
| Request ID injection into Response | Yes | Optional `requestId` parameter added. |
| Seed hash as binary `UNHEX(SHA2(...))` | Yes | Implemented in seed. |
| Document rate limiting as pending | Warning | SDD proposal/design mark rate limiting out of scope; archive must keep the pending note visible in canonical docs. |

## Sensitive-data and private-material check

- Static review found no public response field for full token, full DNI, SQL, credentials, internal paths or sensitive config.
- Audit stores `token_hash_prefijo` only for valid-format tokens and stores `NULL` for invalid-format token hash prefix.
- Runtime verification used only an isolated local MariaDB demo container and fictitious config values under `/tmp`; no real DB, `.env`, real credentials, real config, dumps, logs, zips, or private material were used.
- No file content from `material_privado_no_versionar/` was opened or returned in this verify report.

## Issues and blockers

### CRITICAL

- None.

### WARNING

- Audit failure behavior is source-verified through `try/catch`, but no runtime fault-injection test was provided for a failing `cert_eventos_auditoria` insert.
- Rate limiting remains intentionally out of scope for this cycle and must stay documented as pending during archive.

### SUGGESTION

- Run `sdd-archive` next and sync the verified endpoint behavior, privacy guarantees, fictitious demo verification evidence, and pending rate limiting note into the canonical docs/specs.

## Final verdict

`PASS WITH WARNINGS`

The implementation is aligned with the SDD artifacts and has runtime evidence for modules, lint, safe HTTP behavior, DB-backed valid GET/POST `200`, and unified non-verifiable `404`. No sensitive values are exposed in captured public responses. Next recommended action: run `sdd-archive`.
