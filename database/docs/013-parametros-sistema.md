# Migración 013 — parámetros de sistema (KV tipado)

## Alcance

La migración `database/migrations/013_parametros_sistema.sql` crea `cert_parametros_sistema` para textos de la pantalla de Configuración que no viven en `cert_configuracion_institucional` (firmantes / texto base del PDF).

Las firmas digitales y logos quedan fuera de este ciclo.

## Tabla

| Columna | Tipo | Regla |
|---|---|---|
| `clave` | `VARCHAR(64)` PK | Identificador estable (snake_case). |
| `valor` | `TEXT NOT NULL` | Contenido; vacío permitido. |
| `tipo` | `ENUM('texto','textarea','url','email')` | Hint de UI y validación API. |
| `grupo` | `ENUM('identidad','certificados','contacto','validacion')` | Sección de la página admin. |
| `etiqueta` | `VARCHAR(120) NOT NULL` | Label admin. |
| `updated_at` | `DATETIME` | Actualización automática. |

Seed histórico: 11 claves (demos previos del frontend). El catálogo activo de API/UI
excluye `formato_numero` y `link_validacion` (9 claves); las filas seed pueden
permanecer en DB sin exponerse en GET/PUT.

## Contrato API

- `GET/PUT /admin/configuracion-institucional`
- GET incluye `parameters`: mapa `clave → { value, type, group, label }`
- PUT acepta `parameters?: { [clave]: string }` solo para claves seed conocidas

## Aplicación operativa

### Local

```bash
mariadb -h HOST -u USER -p NOMBRE_DB < database/migrations/013_parametros_sistema.sql
```

Verificar:

```sql
SHOW TABLES LIKE 'cert_parametros_sistema';
SELECT clave, tipo, grupo FROM cert_parametros_sistema ORDER BY grupo, clave;
SELECT version FROM cert_schema_migrations WHERE version = '013';
```

### Staging (cPanel)

1. Backup de la base.
2. phpMyAdmin → SQL → pegar y ejecutar `013_parametros_sistema.sql`.
3. Misma verificación.
4. Orden: migración → API PHP → build Angular.
