# Delta — certificate-pdf-qr-generation

## MODIFIED Requirements

### Requirement: Generación sincrónica de PDF con QR durante la emisión

El sistema DEBE generar el PDF del certificado con su QR de validación durante la operación de emisión, antes de confirmar el alta lógico del certificado. El QR DEBE apuntar a `{public_base_url}/validar/{token}` con `public_base_url` configurable por entorno y el mismo token permanente asociado al certificado. El sistema NO DEBE guardar el token completo en texto plano en el PDF, en la base ni en logs. Para permitir entrega manual y regeneración del PDF con el mismo QR, el sistema DEBE persistir un artefacto recuperable del token/URL pública (`token_cifrado` o URL pública cifrada equivalente) con la clave de cifrado fuera de Git. El sistema NO DEBE regenerar, rotar, revocar ni reemplazar el token tras la emisión salvo revocación o regeneración excepcional auditada.
(Previously: el requisito vinculaba el artefacto recuperable al reenvío; ahora lo vincula a entrega manual y regeneración conservando link permanente.)

#### Scenario: Emisión con PDF generado

- DADO una emisión administrativa válida con `public_base_url` configurado
- CUANDO se ejecuta `emitir()`
- ENTONCES el sistema DEBE generar un PDF horizontal con el QR apuntando al link permanente `{public_base_url}/validar/{token}`.
- Y DEBE persistirlo como `{certificateCode}.pdf` junto con un artefacto cifrado recuperable sin token en texto plano.

#### Scenario: Falla la generación de PDF

- DADO una emisión con payload válido pero la generación de PDF falla
- CUANDO se intenta generar y persistir el PDF
- ENTONCES el sistema NO DEBE confirmar el certificado como emitido.
- Y DEBE propagar el error sin dejar un certificado emitido sin PDF.

#### Scenario: Regeneración conserva link

- DADO un certificado emitido con token activo cifrado
- CUANDO se regenera el PDF por operación autorizada
- ENTONCES el nuevo PDF DEBE contener un QR al mismo `publicValidationUrl`.
- Y NO DEBE crear un token nuevo ni invalidar el anterior.

#### Scenario: Token no recuperable

- DADO un certificado anterior sin artefacto cifrado recuperable
- CUANDO se intenta regenerar el PDF con QR
- ENTONCES el sistema DEBE rechazar o limitar la operación con error seguro.
- Y NO DEBE inventar ni exponer un token.
