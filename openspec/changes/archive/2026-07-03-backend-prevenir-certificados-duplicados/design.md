# Diseño correctivo: Prevenir certificados vigentes duplicados

## Estado

Este diseño reemplaza el diseño MVP service-only archivado. La revisión pre-commit bloqueó ese enfoque porque dos emisiones concurrentes pueden pasar el `SELECT` y persistir dos certificados vigentes para el mismo `alumno_id + curso_id`. El alcance autorizado ahora exige constraint en MariaDB.

## Enfoque técnico

Agregar migración `005` con una columna generada determinística en `cert_certificados` y un índice único que use `NULL` para permitir filas no activas, siguiendo el patrón probado de `cert_asistencias.asistencia_activa` en migración `003`.

No incluir `CURRENT_DATE` en la columna generada: MariaDB permite funciones no determinísticas solo en columnas virtuales no indexadas; para columnas `STORED` o virtuales indexadas deben ser expresiones consistentes. La DB debe asegurar un único certificado con `estado='vigente'` y `revocado_en IS NULL` para el mismo `alumno_id + curso_id`. La expresión de la columna no referencia `alumno_id`/`curso_id` porque MariaDB 10.6 rechaza columnas generadas que usan columnas con FK; la semántica se conserva porque ambos campos nullable integran el índice único. La expiración por fecha queda como transición explícita de estado (`vencido`) o revocación.

## Decisiones

| Decisión | Elección | Alternativa | Motivo |
|---|---|---|---|
| Unicidad | `UNIQUE(alumno_id, curso_id, certificado_bloqueo_activo)` | Solo `SELECT` en servicio | Cierra la carrera concurrente en InnoDB. |
| Columna generada | `STORED` determinística con `CASE` | `CURRENT_DATE` en generated column | Evita expresión no determinística indexada y valores stale. |
| Expiración | No libera slot por sí sola | `vence_en < CURRENT_DATE` libera automáticamente | La DB no puede mantener esa regla temporal con índice seguro; liberar exige `estado='vencido'` o revocar. |
| Legacy nullable | `CASE` devuelve `NULL` si falta FK | Backfill obligatorio | No bloquea certificados históricos con `alumno_id`/`curso_id` nulos. |

## Migración 005 recomendada

```sql
ALTER TABLE cert_certificados
  ADD COLUMN certificado_bloqueo_activo TINYINT
    AS (
      CASE
        WHEN estado = 'vigente'
          AND revocado_en IS NULL
        THEN 1
        ELSE NULL
      END
    ) STORED,
  ADD UNIQUE KEY uq_cert_certificados_alumno_curso_activo
    (alumno_id, curso_id, certificado_bloqueo_activo);
```

Rollback manual, solo con backup aprobado: dropear índice y columna. Preflight obligatorio: detectar duplicados actuales antes del `ALTER` y abortar si existen.

## PHP mapping

Mantener `assertNoActiveCertificateForPair()` como error temprano y UX clara, pero tratarlo como optimización, no garantía. En el `INSERT` de `AdminCertificateService::emitir()`, capturar `PDOException`; si `SQLSTATE` es `23000` y el mensaje menciona `uq_cert_certificados_alumno_curso_activo`, lanzar `AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', 'Ya existe un certificado vigente para este alumno y curso.')`. El catch existente audita rechazo y responde con envelope seguro vía `respondToAdmin()`.

## Pruebas

| Capa | Actualización requerida |
|---|---|
| Migración | Aplicar `001`→`005` en MariaDB 10.6.27 ficticia; probar que el segundo insert directo falla con `23000` y que revocar libera slot. |
| Servicio | Simular/forzar `PDOException 23000` por el índice y verificar `409 CERTIFICATE_ALREADY_EXISTS`. |
| HTTP E2E | Segundo `POST` mismo par responde 409; revocación y/o `estado='vencido'` habilita nuevo 201. |
| Specs | Cambiar escenario “certificado vencido no bloquea”: vencido solo libera si el estado se materializa como `vencido` o si se revoca. |

## Riesgos y rollout

- Si ya existen duplicados activos, la migración falla: requiere reporte preflight y decisión manual.
- Un certificado con `vence_en` pasada pero aún `estado='vigente'` seguirá bloqueando hasta mantenimiento de estado; es intencional para coherencia DB.
- No se agregan locks, triggers ni jobs en este ciclo; el mínimo correcto es constraint + mapping.
