# Diseño: emisión backend desde asistencias

## Enfoque técnico

Implementar la opción A del proposal con cambios mínimos sobre el backend PHP actual: `AdminCertificateService::emitir()` deja de aceptar datos libres y pasa a recibir `alumnoId` + `cursoId`; desde allí lee alumno, curso y asistencias activas, inserta certificado, token, PDF y snapshot en una única transacción. La validación pública y el PDF leen el snapshot (`cert_certificado_fechas`) y el DNI descifrado desde `cert_alumnos.dni_cifrado`; certificados legacy conservan fallback con datos denormalizados disponibles.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| FKs nullable en `cert_certificados` vía `004` | Mantiene legacy sin backfill obligatorio; requiere migración nueva. | Usar `alumno_id` y `curso_id` nullable con índices y FKs; no editar `003`. |
| Reusar `AdminCertificateService` | Evita framework/servicio nuevo; el método cambia más internamente. | Mantener `emitir()` como única entrada administrativa. |
| Snapshot transaccional | Más escrituras en emisión; evita recalcular ante cambios posteriores. | Insertar `cert_certificado_fechas` antes del commit. |
| `dni_cipher_key` externa | Nueva config operativa; protege DNI plano fuera de Git. | Agregar helper tipo `Config::requireDniCipherKey()` y fallar cerrado. |
| Fallback legacy | DTO puede no tener `attendedDates`; no inventa evidencia. | Para certificados sin FKs/snapshot, responder con datos heredados seguros. |

## Flujo de datos

```txt
POST /admin/certificados {alumnoId, cursoId}
  → index.php valida JSON + X-Admin-Key + config PDF/token/DNI
  → AdminCertificateService::emitir()
      → SELECT alumno activo + curso activo
      → SELECT asistencias activas del alumno para fechas del curso
      → BEGIN
      → INSERT cert_certificados(alumno_id, curso_id, datos denormalizados)
      → INSERT cert_tokens_verificacion(token_hash, token_cifrado)
      → INSERT cert_certificado_fechas(snapshot)
      → generar PDF con DNI + fechas snapshot + QR permanente
      → COMMIT
  → 201 DTO admin seguro
```

```txt
GET /certificados/{token}/verificacion
  → hash token
  → JOIN certificado/token (+ alumno si existe)
  → leer snapshot por certificado_id
  → descifrar DNI solo si es certificado nuevo
  → DTO público con documentNumber + attendedDates, o fallback legacy
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `database/migrations/004_certificados_alumno_curso.sql` | Crear | Agrega `alumno_id`, `curso_id`, índices y FKs nullable; rollback comentado. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificar | Validar `alumnoId`/`cursoId`, consultar asistencias activas, snapshot y PDF transaccional. |
| `apps/backend-php/index.php` | Modificar | Cargar clave DNI en emisión; mantener errores `CONFIGURATION_ERROR` seguros. |
| `apps/backend-php/src/Config.php` | Modificar | Agregar normalización fail-closed de `dni_cipher_key` de 32 bytes. |
| `apps/backend-php/src/CertificateValidator.php` | Modificar | JOIN con alumno/snapshot; devolver `documentNumber` y `attendedDates`; fallback legacy. |
| `apps/backend-php/src/CertificatePdfService.php` | Modificar | Aceptar `documentNumber` y `attendedDates` en `viewData`; no imprimir token. |
| `apps/backend-php/config/certificados-config.example.php` | Modificar | Documentar placeholder ficticio de `dni_cipher_key`. |
| `apps/backend-php/tests/*.php` | Modificar/crear | Ajustar scripts procedurales y agregar cobertura DB-backed con MariaDB 10.6. |

## Interfaces / contratos

Request admin:

```json
{ "alumnoId": 1, "cursoId": 2, "issuedAt": "2026-07-02", "expiresAt": null }
```

Query de asistencias activa mínima:

```sql
SELECT cf.id AS curso_fecha_id, cf.fecha, cf.descripcion, cf.orden
FROM cert_asistencias a
JOIN cert_curso_fechas cf ON cf.id = a.curso_fecha_id
WHERE a.alumno_id = ? AND cf.curso_id = ? AND a.eliminado_en IS NULL
ORDER BY cf.orden, cf.fecha;
```

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Scripts PHP | Payload `alumnoId`/`cursoId`, config DNI, PDF sin token visible. | Actualizar `AdminCertificateServiceTest.php`, `HttpContractTest.php`, `PdfResilienceTest.php`. |
| Integración DB | Migraciones `001→004`, emisión con snapshot, rechazo sin asistencias. | Script PHP contra Docker MariaDB 10.6 con seeds ficticios. |
| Validación pública | Nuevo DTO y fallback legacy. | Caso DB-backed: certificado nuevo con snapshot y certificado viejo sin FKs. |

## Migración / rollout

Aplicar `004` después de backup aprobado sobre base con `001`, `002`, `003`. Al ser nullable, no requiere backfill ni rompe certificados existentes. Rollback preferido: dejar columnas sin uso; DROP solo con autorización y backup.

## Preguntas abiertas

Ninguna bloqueante.
