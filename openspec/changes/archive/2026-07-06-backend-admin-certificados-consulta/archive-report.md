# Archive Report — backend-admin-certificados-consulta

**Change**: `backend-admin-certificados-consulta`
**Branch**: `backend/admin-certificados-consulta`
**Archived**: 2026-07-06
**Verdict**: PASS (syntax); HTTP test requiere MariaDB descartable local

## Resumen

Se agregaron endpoints admin de consulta: listado y detalle de certificados, y lectura/actualización de configuración institucional. Desbloquea integración Angular admin (F4–F6) con contratos reales.

## Endpoints

| Método | Ruta |
|---|---|
| GET | `/admin/certificados` |
| GET | `/admin/certificados/{id}` |
| GET | `/admin/configuracion-institucional` |
| PUT | `/admin/configuracion-institucional` |

## Validación

| Check | Resultado |
|---|---|
| `php -l` (Docker) | 14/14 archivos fuente sin errores |
| `AdminCertificadosConsultaHttpTest` | Requiere `IFTS14_TEST_DB_DSN` + `IFTS14_TEST_DB_ALLOW_RESET=1` |

## Próximo paso sugerido

Matías: F4–F6 admin con contratos reales. Marcos: M4-07 staging operativo o smoke M3-06 con PHP CLI.
