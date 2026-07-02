# Delta — certificate-pdf-qr-generation

## MODIFIED Requirements

### Requisito: DNI en el PDF del certificado de curso

El PDF DEBE corresponder a un certificado de curso emitido desde alumno, curso y asistencias activas. DEBE incluir las fechas asistidas desde el snapshot `cert_certificado_fechas`, no desde un recálculo de asistencias vivas. El PDF PUEDE mostrar el DNI completo visible por decisión institucional aprobada como contenido público del certificado. Los logs, auditoría, errores y respuestas administrativas NO DEBEN exponer el DNI completo ni el token completo.
(Previously: el PDF debía incluir fechas asistidas, pero no fijaba que provinieran del snapshot inmutable.)

#### Escenario: DNI visible en el PDF del certificado

- DADO una emisión que produce un PDF de certificado de curso
- CUANDO se renderiza el documento
- ENTONCES el PDF PUEDE mostrar el DNI completo aprobado, junto con fechas asistidas del snapshot.
- Y NO DEBE exponer el token completo en texto visible ni como dato recuperable.

#### Escenario: PDF conserva snapshot después de cambios

- DADO un certificado emitido con snapshot de fechas
- CUANDO cambian asistencias o fechas vivas del curso
- ENTONCES una descarga o regeneración autorizada del PDF DEBE usar el snapshot original.
- Y NO DEBE recalcular fechas asistidas.

### Requisito: Generación sincrónica de PDF con QR durante la emisión

El sistema DEBE generar el PDF del certificado con QR durante la emisión desde `alumnoId` + `cursoId`, antes de confirmar el alta lógico. El QR DEBE apuntar a `{public_base_url}/validar/{token}` con el mismo token permanente. El sistema NO DEBE guardar el token completo en texto plano ni rotarlo después de emitir salvo revocación o regeneración excepcional auditada. Para entrega manual y regeneración, DEBE persistir artefacto recuperable cifrado con clave fuera de Git.
(Previously: la generación sincrónica no dependía explícitamente de alumno/curso/asistencias ni del snapshot.)

#### Escenario: Emisión con PDF generado

- DADO una emisión administrativa válida desde alumno y curso
- CUANDO se ejecuta `emitir()`
- ENTONCES el sistema DEBE generar PDF horizontal con QR al link permanente.
- Y DEBE persistirlo junto con token recuperable cifrado y snapshot.

#### Escenario: Falla la generación de PDF

- DADO una emisión válida pero falla generar o persistir PDF
- CUANDO se intenta confirmar la emisión
- ENTONCES el sistema NO DEBE confirmar certificado, token ni snapshot.
- Y DEBE propagar error seguro.

#### Escenario: Regeneración conserva link

- DADO un certificado emitido con token activo cifrado
- CUANDO se regenera el PDF por operación autorizada
- ENTONCES el nuevo PDF DEBE contener QR al mismo `publicValidationUrl`.
- Y NO DEBE crear token nuevo ni invalidar el anterior.

#### Escenario: Token no recuperable

- DADO un certificado anterior sin artefacto cifrado recuperable
- CUANDO se intenta regenerar el PDF con QR
- ENTONCES el sistema DEBE rechazar o limitar la operación con error seguro.
- Y NO DEBE inventar ni exponer token.
