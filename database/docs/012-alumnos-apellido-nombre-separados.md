# Migración 012 — apellido y nombre separados en alumnos

## Alcance

La migración `database/migrations/012_alumnos_apellido_nombre_separados.sql` agrega columnas `apellido` y `nombre` a `cert_alumnos` y hace backfill desde `apellido_nombre`.

`apellido_nombre` se mantiene como campo denormalizado (sincronizado por la API en cada escritura) para emisión de certificados y compatibilidad con consumidores que aún leen el compuesto.

## Cambio

| Columna | Tipo | Regla |
|---|---|---|
| `apellido` | `VARCHAR(80) NOT NULL DEFAULT ''` | Apellido(s) del alumno. |
| `nombre` | `VARCHAR(80) NOT NULL DEFAULT ''` | Nombre(s) del alumno. |

Backfill:

- Si `apellido_nombre` tiene coma: apellido = antes de la coma; nombre = después.
- Si no: primer espacio separa apellido | nombre; sin espacio → todo en apellido, nombre vacío.

## Contrato API (post-migración)

- Body create/update: `{ apellido, nombre, dni, email? }` (ambos nombre/apellido obligatorios al crear).
- DTO admin: `{ id, apellido, nombre, apellidoNombre, dniMostrar, email, estado }` donde `apellidoNombre` es el compuesto.

## Aplicación operativa

### Local

1. Backup opcional de `cert_alumnos`.
2. Con la DB local levantada y credenciales de `certificados-config.local.php`:

```bash
# Ejemplo con cliente mariadb (reemplazar host/user/db; la clave se pide interactiva)
mariadb -h HOST -u USER -p NOMBRE_DB < database/migrations/012_alumnos_apellido_nombre_separados.sql
```

3. Verificar:

```sql
SHOW COLUMNS FROM cert_alumnos LIKE 'apellido';
SHOW COLUMNS FROM cert_alumnos LIKE 'nombre';
SELECT version FROM cert_schema_migrations WHERE version = '012';
SELECT id, apellido, nombre, apellido_nombre FROM cert_alumnos LIMIT 5;
```

### Staging (cPanel)

1. Backup: phpMyAdmin → exportar la base de staging (o al menos `cert_alumnos`).
2. phpMyAdmin → pestaña SQL → pegar y ejecutar el contenido de `012_alumnos_apellido_nombre_separados.sql`.
3. Misma verificación SQL que arriba.
4. **Orden de deploy:** migración SQL → API PHP → build Angular.
5. Smoke: `/certificados_staging/admin/alumnos/nuevo` con apellido y nombre separados.

> Nota (2026-07-22): la aplicación automática local desde el agente falló (`DB_CONNECT_FAIL` vía Docker/`certificados-config.local.php`). Hay que aplicar 012 a mano en local y staging.
