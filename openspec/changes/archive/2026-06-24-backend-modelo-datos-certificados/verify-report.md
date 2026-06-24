# Verification Report — backend-modelo-datos-certificados

## Veredicto

PASS WITH WARNINGS.

Advertencia: no se ejecutó MariaDB real en esta sesión; la verificación fue por inspección estática de SQL y rutas. El ciclo no implementa PHP/Angular.

## Comandos / evidencia

| Check | Resultado |
|---|---|
| `git check-ignore -q database/migrations/001_certificados_qr.sql` | no ignorado |
| `git check-ignore -q database/seeds/001_certificados_qr_demo.sql` | no ignorado |
| `git check-ignore -q material_privado_no_versionar/` | ignorado por `.gitignore` |
| búsqueda `apps/frontend-angular/**` y `apps/backend-php/**` en archivos cambiados | sin cambios |
| inspección SQL | tablas `cert_`, claves, índices, FK y rollback comentado presentes |

## Matriz de cumplimiento

| Requisito | Estado | Evidencia |
|---|---|---|
| Esquema `cert_` | PASS | `001_certificados_qr.sql` |
| Token sin texto plano | PASS | `token_hash BINARY(32)`, documentación de pepper |
| Exposición mínima | PASS | `documento_enmascarado`; contrato API enlazado |
| Auditoría segura | PASS | `cert_eventos_auditoria` sin DNI/token completos |
| Fixtures ficticios | PASS | seed demo con advertencia explícita |
| Sin producto | PASS | no PHP/Angular/dependencias nuevas |

## Issues

### CRITICAL

None.

### WARNING

- La sintaxis no fue validada contra un servidor MariaDB activo.

### SUGGESTION

- En el ciclo de backend PHP, definir generación de token y pepper en configuración fuera de Git antes de usar esta tabla.
