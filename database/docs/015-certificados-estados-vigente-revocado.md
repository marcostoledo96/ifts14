# Migración 015 — estados de certificado vigente|revocado

## Cambio

El producto solo usa **vigente** (válida) y **revocado**. Los valores `borrador` y `vencido` eran legado de diseño y no forman parte del flujo real de emisión (siempre inserta `vigente`; solo `revocar` cambia el estado).

## Efectos

1. Convierte `estado='vencido'` → `revocado` (certificados y tokens).
2. Elimina certificados `borrador` y sus dependencias.
3. Estrecha ENUM de `cert_certificados.estado` y `cert_tokens_verificacion.estado`.
4. Registra versión `015` en `cert_schema_migrations`.

## Staging

Preferir ejecutar el contenido de `deploy/staging/LIMPIA-ESTADOS-CERTIFICADO.sql` (equivalente operativo) o esta migración en phpMyAdmin sobre `ifts14c8_cert_stg`.

## Verificación

```sql
SHOW COLUMNS FROM cert_certificados LIKE 'estado';
SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'estado';
SELECT version FROM cert_schema_migrations WHERE version = '015';
SELECT estado, COUNT(*) FROM cert_certificados GROUP BY estado;
```
