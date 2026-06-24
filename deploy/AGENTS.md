# AGENTS.md — deploy/

## Alcance

Guías y archivos seguros para deploy en cPanel del módulo `/certificados/`.

## Reglas

- Documentar cada paso de deploy y rollback.
- Angular debe compilar con base href `/certificados/`.
- No tocar `public_html` sin backup previo.
- Mantener configuración real fuera de Git.
- Documentar `.htaccess` y rutas públicas en `docs/deploy/` durante `sdd-archive`.

## Prohibido

No versionar credenciales, backups, zips del servidor ni configuraciones reales de cPanel.
