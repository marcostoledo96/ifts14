# AGENTS.md — apps/backend-php/

## Alcance

API PHP 8.4.21 del módulo `/certificados/`.

## Reglas

- Usar PDO y prepared statements.
- Mantener API bajo `/certificados/api/` o ruta documentada equivalente.
- No exponer DNI, tokens completos ni credenciales en logs.
- Mantener configuración real fuera de Git.
- Separar controladores, servicios y acceso a datos cuando exista implementación.
- Actualizar `docs/backend/` durante `sdd-archive`.

## Prohibido

No crear archivos `config.php`, `db.php`, `database.php` o `conexion.php` reales versionables.
