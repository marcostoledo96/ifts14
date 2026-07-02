# Propuesta: emisión backend desde asistencias

## Intento

Emitir certificados administrativos desde `alumnoId` + `cursoId` y asistencias activas, dejando snapshot en `cert_certificado_fechas`. Hoy la emisión usa texto libre y no sostiene DNI completo institucional ni fechas asistidas sin recalcular.

## Alcance

### Incluido
- Cambiar `POST /admin/certificados` para validar alumno, curso y asistencias activas.
- Agregar migración aditiva `004` con `alumno_id` y `curso_id` nullable; no editar `003`.
- Persistir snapshot en `cert_certificado_fechas` y devolver validación pública con `documentNumber` y `attendedDates`.
- Mantener entrega manual, token/QR permanente, `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`.

### Fuera de alcance
- Frontend Angular, SMTP/email, `/reenviar`, rotación normal de token.
- Regeneración excepcional, login real, auditoría nueva de entrega manual.

## Capacidades

### Capacidades nuevas
- Ninguna.

### Capacidades modificadas
- `admin-certificate-emission`: emisión por alumno/curso/asistencias, no por texto libre.
- `backend-modelo-datos-certificados`: vínculo nullable certificado-alumno-curso mediante migración `004`.
- `backend-contrato-api-certificados`: payload admin y DTO público con fechas asistidas reales.
- `backend-validacion-publica-certificados`: lectura de snapshot y DNI descifrado seguro.
- `certificate-pdf-qr-generation`: PDF de curso con fechas asistidas sin cambiar token.

## Enfoque

Usar la opción A: FKs nullable, `emitir()` como única entrada, asistencias activas, snapshot transaccional, DNI descifrado solo para DTO público/PDF y respuestas admin seguras. `dni_cipher_key` va fuera de Git y falla cerrado si falta.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `database/migrations/004_*.sql` | Nuevo | Columnas/FKs nullable para legado. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificado | Emisión desde entidades reales y snapshot. |
| `apps/backend-php/index.php` | Modificado | Payload admin y errores seguros. |
| `apps/backend-php/src/CertificateValidator.php` | Modificado | `documentNumber` y `attendedDates`. |
| `apps/backend-php/src/CertificatePdfService.php` | Modificado | Fechas asistidas en PDF. |
| `docs/backend/`, `docs/database/` | Modificado | Contrato y modelo actualizados en archive. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---:|---|
| Certificados legacy sin FKs/snapshot | Media | Columnas nullable y fallback explícito. |
| Exposición de DNI/token en canales admin | Media | DTOs seguros, logs sin valores completos. |
| Falta `dni_cipher_key` | Media | Error cerrado sin emitir ni validar DNI completo. |

## Plan de reversión

Revertir PHP/docs/specs. Si `004` fue aplicada, dejar columnas nullable sin uso o ejecutar rollback SQL aprobado con backup; no borrar certificados, tokens ni snapshots sin autorización.

## Dependencias

- PR #23/M4-02 ya mergeado; `003` no se modifica.
- MariaDB 10.6.27, `dni_cipher_key` externa, datos ficticios.

## Criterios de éxito

- [ ] Emisión acepta `alumnoId` y `cursoId`, persiste certificado, token permanente, PDF y snapshot.
- [ ] Validación pública devuelve DNI completo aprobado y fechas asistidas snapshot.
- [ ] Respuestas admin conservan `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix` sin DNI/token completo separado.
- [ ] Entrega manual conserva el mismo QR/token y no activa email.
