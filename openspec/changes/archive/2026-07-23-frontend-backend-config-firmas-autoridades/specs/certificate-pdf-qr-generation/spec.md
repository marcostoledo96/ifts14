# Delta for certificate-pdf-qr-generation

## MODIFIED Requirements

### Requisito: Generación sincrónica de PDF con QR durante la emisión

El sistema DEBE generar durante la emisión un PDF horizontal institucional con QR al link permanente `{public_base_url}/validar/{token}`. El PDF DEBE incluir nombre institucional, texto de certificado configurable, alumno, curso, DNI completo aprobado, fechas del snapshot `cert_certificado_fechas`, y firmantes (rector/a y asesor/a) con cargos. Para cada firmante, si existe imagen de firma válida en storage, el render (`renderSignatory` o equivalente) DEBE dibujar la imagen; si no, DEBE usar fallback tipográfico (nombre/cargo). PDFs ya emitidos NO DEBEN cambiar hasta regenerar/emitir de nuevo. El sistema NO DEBE guardar token completo en texto plano, rotarlo, enviar email ni depender de SMTP.
(Previously: firmantes solo tipográficos; sin imagen de firma.)

#### Escenario: Emisión con PDF institucional generado

- DADO una emisión administrativa válida con configuración institucional existente
- CUANDO se ejecuta `emitir()`
- ENTONCES el PDF DEBE renderizar institución, texto configurable, firmantes, curso, alumno, DNI aprobado y fechas del snapshot
- Y DEBE conservar QR al link permanente y token recuperable cifrado

#### Escenario: Firmante con imagen de firma

- DADO firma de imagen presente para rector y/o asesor
- CUANDO se genera o regenera el PDF
- ENTONCES el área del firmante DEBE incluir la imagen persistida
- Y DEBE conservar nombre/cargo según configuración

#### Escenario: Firmante sin imagen (fallback tipográfico)

- DADO ausencia de archivo de firma para un rol
- CUANDO se genera el PDF
- ENTONCES ese firmante DEBE renderizarse tipográficamente
- Y la emisión NO DEBE abortar por falta de imagen

#### Escenario: PDF emitido intacto hasta regenerar

- DADO un PDF ya emitido con o sin imagen
- CUANDO se sube/borra una firma después
- ENTONCES el archivo PDF persistido DEBE permanecer igual hasta regeneración/emisión autorizada

#### Escenario: Configuración institucional ausente

- DADO una emisión válida sin fila en `cert_configuracion_institucional`
- CUANDO se genera el PDF
- ENTONCES el sistema DEBE emitir PDF con valores institucionales seguros por defecto
- Y NO DEBE abortar emisión, rotar token ni exponer datos sensibles

#### Escenario: Falla la generación de PDF

- DADO una emisión válida pero falla generar o persistir PDF
- CUANDO se intenta confirmar la emisión
- ENTONCES el sistema NO DEBE confirmar certificado, token ni snapshot
- Y DEBE propagar error seguro

#### Escenario: Regeneración conserva link

- DADO un certificado emitido con token activo cifrado
- CUANDO se regenera el PDF por operación autorizada
- ENTONCES el nuevo PDF DEBE contener QR al mismo `publicValidationUrl`
- Y NO DEBE crear token nuevo ni invalidar el anterior
- Y DEBE usar firmas de imagen actuales si existen, o fallback tipográfico

#### Escenario: Token no recuperable

- DADO un certificado anterior sin artefacto cifrado recuperable
- CUANDO se intenta regenerar el PDF con QR
- ENTONCES el sistema DEBE rechazar o limitar la operación con error seguro
- Y NO DEBE inventar ni exponer token
