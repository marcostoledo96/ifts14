# Tasks: base backend PHP para certificados (M2-02)

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas | 250–380 |
| Riesgo presupuesto 400 líneas | Bajo |
| Riesgo presupuesto 800 líneas | Bajo |
| PRs encadenados recomendados | Sí (directriz `force-chained`) |
| Estrategia de cadena | pendiente |
| División sugerida | 3 unidades de trabajo |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unidad | Objetivo | PR | Notas |
|---|---|---|---|
| 1 | Esqueleto PHP + health | PR 1 | `index.php`, `src/Response.php`, `apps/backend-php/.htaccess`; `GET /health` 200. |
| 2 | Config externa + PDO lazy | PR 2 | `src/Config.php`, `src/Database.php`, `config/certificados-config.example.php`. |
| 3 | Documentación | PR 3 | `README.md` y notas para `sdd-archive` en `docs/backend/` y `docs/02-arquitectura.md`. |

## Phase 1 — Esqueleto PHP y health (Unidad 1)

- [x] 1.1 Crear `apps/backend-php/index.php` con `declare(strict_types=1)`, `require_once` de `Response.php`, normalización de ruta, enrutador `GET /health`, captura global con `set_exception_handler` y 500 seguro.
- [x] 1.2 Crear `apps/backend-php/src/Response.php` con `json(int $status, array $data)` y `error(int $status, string $code, string $message)`, header `application/json; charset=utf-8`, `requestId` no sensible.
- [x] 1.3 Manejar 404 (ruta inexistente) y 405 (método no permitido en `/health` con `Allow: GET`) en `index.php`.
- [x] 1.4 Crear `apps/backend-php/.htaccess` con `FallbackResource /certificados/api/index.php` (o `mod_rewrite` mínimo equivalente), sin reglas para Angular ni `deploy/`.

## Phase 2 — Config externa y PDO (Unidad 2)

- [x] 2.1 Crear `apps/backend-php/src/Config.php` con `load(): array` que lea `CERTIFICADOS_CONFIG_PATH` o el path externo por defecto documentado, y falle con `RuntimeException` controlada sin imprimir rutas ni secretos.
- [x] 2.2 Crear `apps/backend-php/src/Database.php` con `pdo(): PDO` lazy, DSN `mysql:host=...;dbname=...;charset=utf8mb4`, opciones `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES=false`.
- [x] 2.3 Crear `apps/backend-php/config/certificados-config.example.php` con array ficticio (`db_host`, `db_name`, `db_user`, `db_pass`) y comentario "no usar en producción".
- [x] 2.4 Verificar que `index.php` NO llama `Config::load()` ni `Database::pdo()` en `/health`.

## Phase 3 — Documentación (Unidad 3)

- [x] 3.1 Crear `apps/backend-php/README.md` con estructura, comando `php -S 127.0.0.1:8080 -t apps/backend-php`, ubicación esperada de config externa y checklist de QA.
- [x] 3.2 Anotar para `sdd-archive`: actualizar `docs/backend/00-php84-api.md` y validar `docs/02-arquitectura.md`.
- [x] 3.3 No tocar `deploy/.htaccess`, `deploy/htaccess/*`, `.atl/skill-registry.md` ni `.gitignore` en este ciclo.

## Phase 4 — Verificación y QA

- [x] 4.1 `git status --ignored --short`: sin `config.php`, `db.php`, `database.php` o `conexion.php` reales versionados.
- [ ] 4.2 `php -l` sobre `index.php`, `src/Response.php`, `src/Config.php`, `src/Database.php` y `config/certificados-config.example.php`.
- [ ] 4.3 `php -m` confirma `pdo_mysql`, `openssl` y `mbstring` habilitadas.
- [ ] 4.4 `curl -i http://127.0.0.1:8080/health` devuelve 200 con `{ "data": { "status": "ok", "service": "certificados-api" }, "meta": { ... } }`.
- [ ] 4.5 `curl -i -X POST http://127.0.0.1:8080/health` devuelve 405 con `Allow: GET` y sin ejecutar PDO.

## Non-goals explícitos

- No Angular, migraciones SQL, conexión real, servicios, controladores ni repositorios de negocio.
- No `GET /certificados/api/certificados/{token}/verificacion` ni `POST /certificados/api/certificados/consulta` (M2-03).
- No `.env` versionado, ni `composer.json`/`vendor/`.
- No archivos `config.php`, `db.php`, `database.php` o `conexion.php` reales.

## Forbidden file touches

- `deploy/.htaccess` · `deploy/htaccess/*` · `.atl/skill-registry.md` · `.gitignore`
