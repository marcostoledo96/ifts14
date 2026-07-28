# Desarrollo local

Guía mínima para levantar frontend y backend en la máquina de desarrollo. No usa datos reales ni configs de staging/producción.

## Requisitos

- Node.js compatible con Angular 20 (LTS actual del equipo).
- PHP 8.4+ en PATH **o** Docker (scripts `scripts/php-docker-*.sh`).
- Composer 2 (para `apps/backend-php/vendor`).
- MariaDB/MySQL local opcional (varios tests usan dobles; E2E reales necesitan DB + config).

## Frontend

```bash
cd apps/frontend-angular
npm install
npm start
```

- App: `http://localhost:4200/` (o el puerto que indique el CLI).
- Tests: `npm test` / `npm run test:ci`.
- Build staging: `npm run build -- --configuration production-staging`.
- Build producción: configuración `production` con `baseHref` `/certificados/`.

El proxy/API base depende de `environment*.ts`. En local suele apuntarse a un backend en `127.0.0.1:8080` o a staging solo con cuidado (no mezclar credenciales en el repo).

## Backend

```bash
cd apps/backend-php
composer install
```

Config: copiar `config/certificados-config.example.php` a una ruta **fuera del repo** y exportar:

```bash
export CERTIFICADOS_CONFIG_PATH=/ruta/absoluta/a/tu-config.php
```

Servidor embebido:

```bash
php -S 127.0.0.1:8080 -t apps/backend-php
# desde la raíz del repo
```

Smoke:

```bash
curl -i http://127.0.0.1:8080/health
```

Con Docker PHP 8.4 del repo:

```bash
bash scripts/php-docker-build.sh
bash scripts/php-docker-modules-check.sh
bash scripts/php-docker-lint.sh
```

Detalle adicional: `apps/backend-php/README.md`.

## Base de datos local

1. Crear schema vacío.
2. Aplicar migraciones en orden: `database/migrations/001_*.sql` … `015_*.sql`.
3. Opcional: seeds ficticios en `database/seeds/` (nunca datos reales).

Documentación: `docs/database/00-mariadb.md`.

## Login admin local

En la config externa: `admin_username`, `admin_password_hash` (bcrypt), TTL exactos `14400` / `28800`. El frontend usa cookies de sesión + header CSRF en mutaciones.

Si el login devuelve 401 “silencioso”, revisar TTL distintos a los esperados por `Config.php` o rate limit (limpiar buckets en `runtime/` solo en local).

## Checklist rápido “¿está vivo?”

1. `GET /health` → 200 JSON.
2. SPA carga sin errores de consola graves.
3. Login admin OK.
4. Rutas sensibles (`/api/src/…`, vendor) no exponen código (en Apache/.htaccess de deploy; el server embebido de PHP no replica todos los bloqueos).

## Pruebas recomendadas antes de PR

| Área | Comando / acción |
|---|---|
| Frontend unit | `cd apps/frontend-angular && npm run test:ci` |
| Backend | suite PHP del directorio `apps/backend-php/tests/` (ver README/CI) |
| Lint PHP | `php -l` o `scripts/php-docker-lint.sh` |
| QA manual | `docs/qa/CHECKLIST-TESTING-MANUAL.md` (subset del flujo tocado) |
