# Exploration — backend-emision-desde-asistencias

## Estado actual

La emisión administrativa de certificados funciona con datos libres y sin vínculo a las tablas de cursos, alumnos y asistencias migradas en `003`:

- `AdminCertificateService::emitir()` recibe `studentDisplayName`, `documentNumber`, `courseName`, `issuedAt` y `expiresAt`.
- Inserta en `cert_certificados` los valores recibidos como texto: `alumno_nombre_mostrar`, `documento_hash`, `documento_enmascarado`, `curso_nombre`.
- Genera token, `token_hash`, `token_prefijo` y `token_cifrado`, y persiste en `cert_tokens_verificacion`.
- Genera el PDF dentro de la transacción, antes del `commit`.
- No escribe en `cert_certificado_fechas`.
- No lee ni valida `cert_alumnos`, `cert_cursos`, `cert_curso_fechas` ni `cert_asistencias`.
- `CertificateValidator::verify()` devuelve `documentMasked` y no devuelve `attendedDates`.
- `cert_certificados` no tiene columnas `alumno_id` ni `curso_id`.

El contrato público vigente (`docs/backend/01-contrato-api-certificados.md`) ya exige DNI completo (`documentNumber`) y `attendedDates` en la validación pública, pero el backend actual no los puede producir.

## Áreas afectadas

| Archivo / recurso | Por qué se ve afectado |
|---|---|
| `apps/backend-php/src/AdminCertificateService.php` | El método `emitir()` debe cambiar de payload libre a lectura desde tablas reales y escritura del snapshot de fechas. |
| `apps/backend-php/src/CertificateValidator.php` | Debe devolver DNI completo y `attendedDates` en el DTO público. |
| `apps/backend-php/index.php` | Cambia el payload del `POST /admin/certificados`; debe conservar autorización, validación y manejo de errores. |
| `apps/backend-php/src/CertificatePdfService.php` | Probablemente deba mostrar fechas asistidas en el PDF institucional. |
| `apps/backend-php/src/Config.php` | Requiere nueva clave de descifrado de DNI (`dni_cipher_key`) además de `token_cipher_key`. |
| `database/migrations/003_cursos_alumnos_asistencias.sql` o nueva migración `004` | `cert_certificados` necesita `alumno_id` y `curso_id` (nullable para legado) para mantener integridad referencial. |
| `database/seeds/002_cursos_alumnos_asistencias_demo.sql` | Debe incluir un certificado emitido desde alumno+curso+asistencias para validación end-to-end. |
| `docs/backend/01-contrato-api-certificados.md` | Actualizar request/response de emisión y DTO público. |
| `docs/database/01-modelo-datos-certificados.md` | Documentar el vínculo runtime y el snapshot. |
| `openspec/specs/admin-certificate-emission/spec.md` | Fusionar delta al cerrar el ciclo. |
| `apps/backend-php/tests/AdminCertificateServiceTest.php` | Adaptar tests de payload y agregar cobertura de snapshot. |
| `apps/backend-php/tests/HttpContractTest.php` | Verificar contrato de emisión y validación pública. |

## Enfoques evaluados

### Opción A — FKs en `cert_certificados` + lectura desde tablas + snapshot de fechas

Agregar `alumno_id` y `curso_id` (nullable) a `cert_certificados` con FKs a `cert_alumnos` y `cert_cursos`. `emitir()` recibe `alumnoId` y `cursoId`, valida existencia y estado, calcula asistencias activas y escribe `cert_certificado_fechas`. El validador público descifra `dni_cifrado` para devolver `documentNumber` y lee `cert_certificado_fechas` para `attendedDates`.

- **Pros**: integridad referencial, soporte real a D0, snapshot histórico, reutiliza el modelo `003`.
- **Cons**: requiere migración aditiva sobre `cert_certificados`, nueva clave de descifrado de DNI, más tests.
- **Esfuerzo**: Medio.

### Opción B — Emisión libre con snapshot de fechas opcional

Conservar el payload actual y agregar opcionalmente `alumnoId`/`cursoId`. Si vienen, se calculan fechas y se escriben en `cert_certificado_fechas`; si no, se emite como antes.

- **Pros**: menor fricción con certificados ya emitidos, cambio incremental.
- **Cons**: doble camino de emisión, riesgo de inconsistencia, no resuelve el DNI completo del DTO público sin descifrado.
- **Esfuerzo**: Medio-Alto (por mantener dos modos).

### Opción C — Solo denormalizar fechas en `cert_certificados`

Agregar una columna JSON/texto con fechas asistidas en `cert_certificados` y seguir emitiendo con payload libre.

- **Pros**: cambio mínimo de esquema.
- **Cons**: rompe el propósito de `cert_certificado_fechas` ya migrado, no permite consultar fechas por curso, no da integridad, almacena DNI/libre sin control.
- **Esfuerzo**: Bajo, pero descartado por ir contra el modelo aprobado.

## Recomendación

**Opción A** con FKs nullable y migración aditiva (`004` o extensión controlada de `003` si aún no se aplicó en producción). Es la única que satisface D0, aprovecha las tablas migradas y mantiene el snapshot histórico sin duplicar lógica.

## Riesgos

- **Migración sobre `cert_certificados`**: si ya existe en producción, agregar `alumno_id`/`curso_id` nullable es seguro, pero requiere backup y validación.
- **Clave de descifrado de DNI**: nuevo secreto (`dni_cipher_key`) que debe vivir fuera de Git; su ausencia debe fallar cerrado.
- **Rendimiento del validador público**: leer `cert_certificado_fechas` y descifrar DNI por cada validación. Mitigación: índices adecuados y no exponer DNI en logs.
- **Compatibilidad hacia atrás**: certificados emitidos antes de este cambio no tendrán `alumno_id`/`curso_id` ni snapshot. El validador debe seguir respondiendo con los datos denormalizados heredados (`documentMasked`, sin `attendedDates`) o decidirse un tratamiento explícito.
- **PDF**: si se agregan fechas asistidas al PDF, `CertificatePdfService` debe recibir el arreglo y el diseño institucional debe ajustarse.
- **No rotar token**: la entrega manual (`entregaManual`) ya conserva el token permanente; este cambio no debe modificar esa lógica.

## Listo para propuesta

Sí. Se cuenta con:

- modelo `003` aplicado y verificado localmente;
- contrato público vigente que define `documentNumber` y `attendedDates`;
- servicio de emisión existente como punto de partida;
- token permanente recuperable (`token_cifrado`) ya operativo;
- tests de entrega manual que protegen el comportamiento de no rotación.

Faltante para cerrar `explore`: confirmar si la migración se hará como `004` o como extensión de `003` no aplicada aún en producción.
