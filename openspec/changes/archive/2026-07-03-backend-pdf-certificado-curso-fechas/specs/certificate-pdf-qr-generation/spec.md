# Delta — certificate-pdf-qr-generation

## MODIFIED Requirements

### Requisito: Generación sincrónica de PDF con QR durante la emisión

El sistema DEBE generar durante la emisión un PDF horizontal institucional con QR al link permanente `{public_base_url}/validar/{token}`. El PDF DEBE incluir nombre institucional, texto de certificado configurable, alumno, curso, DNI completo aprobado para el certificado, fechas certificadas del snapshot `cert_certificado_fechas`, rector/a y asesor/a pedagógica con sus cargos. El sistema NO DEBE guardar token completo en texto plano, rotarlo, enviar email ni depender de SMTP.
(Antes: el PDF se generaba con QR y token permanente, pero sin contenido institucional configurable ni firmantes.)

#### Escenario: Emisión con PDF institucional generado

- DADO una emisión administrativa válida con configuración institucional existente
- CUANDO se ejecuta `emitir()`
- ENTONCES el PDF DEBE renderizar institución, texto configurable, firmantes, curso, alumno, DNI aprobado y fechas del snapshot.
- Y DEBE conservar QR al link permanente y token recuperable cifrado.

#### Escenario: Configuración institucional ausente

- DADO una emisión válida sin fila en `cert_configuracion_institucional`
- CUANDO se genera el PDF
- ENTONCES el sistema DEBE emitir PDF con valores institucionales seguros por defecto.
- Y NO DEBE abortar emisión, rotar token ni exponer datos sensibles.

#### Escenario: Falla la generación de PDF

- DADO una emisión válida pero falla generar o persistir PDF
- CUANDO se intenta confirmar la emisión
- ENTONCES el sistema NO DEBE confirmar certificado, token ni snapshot.
- Y DEBE propagar error seguro.

### Requisito: DNI en el PDF del certificado de curso

El PDF DEBE corresponder a un certificado de curso emitido desde alumno, curso y asistencias activas. DEBE incluir fechas asistidas desde el snapshot `cert_certificado_fechas`, no desde asistencias vivas. El PDF PUEDE mostrar DNI completo por decisión institucional. Logs, auditoría, errores y respuestas administrativas NO DEBEN exponer DNI completo ni token completo.
(Antes: exigía DNI y fechas snapshot, sin requerir texto institucional ni firmantes.)

#### Escenario: DNI visible en el PDF institucional

- DADO una emisión que produce un PDF de certificado de curso
- CUANDO se renderiza el documento
- ENTONCES el PDF PUEDE mostrar DNI completo aprobado junto con fechas del snapshot, texto institucional y firmantes.
- Y NO DEBE exponer token completo como texto visible ni dato recuperable.

#### Escenario: PDF emitido conserva snapshot después de cambios

- DADO un certificado emitido con snapshot de fechas
- CUANDO cambian asistencias o fechas vivas del curso
- ENTONCES la descarga del PDF ya emitido DEBE conservar el contenido generado con el snapshot original.
- Y NO DEBE recalcular fechas asistidas.

## ADDED Requirements

### Requisito: Verificación testable de generación PDF

El sistema DEBE permitir pruebas procedurales que verifiquen emisión institucional y generación del PDF sin depender de parseo frágil del binario ni de dobles de una clase `final`.

#### Escenario: Prueba de emisión con PDF persistido

- DADO una emisión con configuración institucional y fechas snapshot conocidas
- CUANDO la prueba ejecuta la emisión contra storage temporal
- ENTONCES DEBE poder afirmar snapshot persistido, archivo PDF existente, firma `%PDF` y tamaño mayor a cero.

#### Escenario: Prueba de generación binaria mínima

- DADO insumos válidos del certificado institucional
- CUANDO se genera el PDF
- ENTONCES la prueba DEBE verificar que se produce y persiste un PDF descargable.
