# Migración 005 — Prevenir certificados duplicados

## Objetivo

Agregar una restricción de base de datos para impedir más de un certificado activo por `alumno_id` + `curso_id`.

## Regla de bloqueo

La columna generada `certificado_bloqueo_activo` vale `1` solo cuando:

- `estado = 'vigente'`;
- `revocado_en IS NULL`.

En cualquier otro caso vale `NULL`, permitiendo historial, revocados y certificados con `estado='vencido'`. Los certificados legacy sin FKs tampoco bloquean porque `alumno_id` y `curso_id` forman parte nullable del índice único y MariaDB permite múltiples `NULL`.

La expresión no referencia `alumno_id` ni `curso_id` porque MariaDB 10.6 rechaza columnas generadas que usan columnas con FK. La semántica se conserva por el índice `UNIQUE(alumno_id, curso_id, certificado_bloqueo_activo)`.

> `vence_en` no participa del índice. Un vencimiento por fecha no libera el slot mientras `estado='vigente'`; la liberación exige transición explícita a `estado='vencido'` o revocación.

## Preflight

Antes del `ALTER`, ejecutar la consulta incluida en la migración. Debe devolver 0 filas. Si aparecen duplicados vigentes, resolverlos manualmente antes de aplicar.

## Rollback

Solo con backup aprobado:

```sql
ALTER TABLE cert_certificados
  DROP INDEX uq_cert_certificados_alumno_curso_activo,
  DROP COLUMN certificado_bloqueo_activo;
```
