# Migración 014 — firmas de autoridades

## Alcance

La migración `database/migrations/014_firmas_autoridades.sql` agrega metadatos de firma
imagen (PNG/JPEG) a la fila única `cert_configuracion_institucional` (`id = 1`).

Los bytes viven fuera de la base, en `signature_storage_path` (configuración externa,
fuera del webroot). La DB solo guarda basename seguro y hash SHA-256.

**No modifica ni regenera PDFs ya emitidos.** Los certificados previos conservan el
PDF tipográfico hasta una regeneración explícita.

## Columnas

| Columna | Tipo | Regla |
|---|---|---|
| `rector_firma_filename` | `VARCHAR(64) NULL` | Basename `{rector}.png` o `.jpg` |
| `rector_firma_sha256` | `CHAR(64) NULL` | Hex SHA-256 del archivo |
| `asesor_firma_filename` | `VARCHAR(64) NULL` | Basename `{asesor}.png` o `.jpg` |
| `asesor_firma_sha256` | `CHAR(64) NULL` | Hex SHA-256 del archivo |

No se almacenan rutas libres ni path traversal.

## Contrato API (Opción A)

- `POST|DELETE|GET /admin/configuracion-institucional/firmas/{rector|asesor}`
- `GET /admin/configuracion-institucional` incluye `rectorSignaturePresent` / `advisorSignaturePresent`
- `PUT /admin/configuracion-institucional` sigue siendo solo textos/parámetros JSON

## Aplicación operativa

### Local

```bash
mariadb -h HOST -u USER -p NOMBRE_DB < database/migrations/014_firmas_autoridades.sql
```

Verificar:

```sql
SHOW COLUMNS FROM cert_configuracion_institucional LIKE '%firma%';
SELECT version FROM cert_schema_migrations WHERE version = '014';
```

### Staging (cPanel)

1. Backup de la base.
2. Crear directorio de firmas fuera del webroot y configurar `signature_storage_path`.
3. phpMyAdmin → SQL → ejecutar `014_firmas_autoridades.sql`.
4. Misma verificación.
5. Orden: migración → API PHP → build Angular.

## Rollback

```sql
ALTER TABLE cert_configuracion_institucional
  DROP COLUMN rector_firma_filename,
  DROP COLUMN rector_firma_sha256,
  DROP COLUMN asesor_firma_filename,
  DROP COLUMN asesor_firma_sha256;
DELETE FROM cert_schema_migrations WHERE version = '014';
```

Vaciar el directorio de firmas de prueba. **No borrar** PDFs en `certificate_storage_path`.
Revertir código de API/PDF/FE en el mismo deploy.
