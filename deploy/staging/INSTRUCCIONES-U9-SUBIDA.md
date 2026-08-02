# Instrucciones de subida — staging U9 (2026-07-30)

Paquetes generados desde `audit/u09-qa-staging` (post PR #116 + **fix 401 asistencias**). Los ZIP viven en `deploy/staging/paquetes/` (gitignored).

## Hotfix — 401 al guardar asistencias (subir YA)

**No es el idle de 30 minutos.** Al marcar varios presentes, el FE lanzaba DELETE/POST en paralelo; el lock de sesión PHP en cPanel hacía fallar `session_start` → API 401 → el interceptor echaba al login.

| Archivo | Destino | Notas |
|---|---|---|
| `frontend-completo-staging-20260730-u09-fix401.zip` | Extraer sobre `…/certificados_staging/` | `marcar()` en serie |
| `backend-completo-staging-20260730-u09-fix401.zip` | Extraer sobre `…/certificados_staging/` (trae `api/`) | `session_start` fail → **503** (no 401) |

Copias en Escritorio: `frontend-fix401-asistencias.zip`, `backend-fix401-asistencias.zip`, `LEEME-FIX401-ASISTENCIAS.txt`.

Tras subir: hard refresh del navegador. Probar marcar asistencias con varios alumnos.

## Paquetes U9 base (si aún no subiste nada)

| Archivo | Destino en cPanel | Notas |
|---|---|---|
| `frontend-completo-staging-20260730-u09.zip` | Extraer sobre `…/certificados_staging/` | SPA + `.htaccess` root; `baseHref=/certificados_staging/` |
| `backend-completo-staging-20260730-u09.zip` | Extraer sobre `…/certificados_staging/` (trae `api/`) | Incluye `vendor/` (tcpdf) + deny `src\|config` |
| `sql-migraciones-011-015-staging-20260730-u09.zip` | **Solo phpMyAdmin/CLI** | Nunca al webroot |

Detalle operativo: `deploy/staging/paquetes/LEEME-SUBIDA.txt`.

## Base de datos

No hay migración *nueva* por U1–U8 ni por este fix. Si staging aún no registró **011–015**, aplicarlas en orden tras backup. Verificar con `00-verificar-versiones.sql` del ZIP SQL.

## Config (no viene en el ZIP)

No tocar `.user.ini` ni el bootstrap externo. Confirmar idle/absolute **14400/28800** en la config de staging.

## Smoke corto

1. `GET …/api/health` → 200
2. `GET …/api/src/Config.php` → **403** (o bloqueo; no código fuente)
3. Login + **marcar asistencias** (varios presentes) sin echar a login
4. Un flujo emit→PDF→validar
5. Checklist: `docs/qa/CHECKLIST-TESTING-MANUAL.md` / PLAN §U9
