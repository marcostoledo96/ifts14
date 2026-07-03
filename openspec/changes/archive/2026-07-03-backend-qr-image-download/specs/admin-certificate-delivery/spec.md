# Delta — admin-certificate-delivery

## ADDED Requirements

### Requisito: Entrega manual con descarga de QR

La entrega manual DEBE permitir QR PNG vía `GET /certificados/api/admin/certificados/{id}/qr.png`, sin reemplazar `entrega-manual`, email, SMTP/PHPMailer, `/reenviar`, regeneración ni rotación. DEBE requerir admin auth y reutilizar `publicValidationUrl`.

#### Escenario: Bedelía descarga QR para canal externo

- DADO un certificado con token recuperable y PDF disponible
- CUANDO Bedelía solicita el QR PNG con autorización válida
- ENTONCES recibe PNG adjunto con el mismo link público que entrega manual/PDF.

#### Escenario: QR no cambia el flujo de entrega

- DADO una descarga QR exitosa
- CUANDO se revisa el estado posterior del certificado y token
- ENTONCES NO DEBE haber rotación, reenvío, email, regeneración ni mutación; el token vigente DEBE seguir validando.

#### Escenario: Fallas seguras de entrega QR

- DADO un request sin autorización, certificado inexistente o token no recuperable
- CUANDO se solicita el QR PNG
- ENTONCES DEBE responder `401`, `404` o `409`, sin DNI admin, token separado ni detalles internos.
