# AGENTS.md — database/

## Alcance

Documentación, migraciones controladas y seeds ficticios para MariaDB 10.6.27.

## Reglas

- No versionar dumps reales ni datos personales.
- Usar prefijo `cert_` para tablas nuevas salvo decisión documentada.
- Escribir migraciones reversibles o con plan de rollback.
- Usar seeds solo con datos ficticios.
- Documentar cambios en `database/docs/` y `docs/database/` durante `sdd-archive`.

## Prohibido

No leer ni copiar contenido de dumps SQL reales dentro de documentación o commits.
