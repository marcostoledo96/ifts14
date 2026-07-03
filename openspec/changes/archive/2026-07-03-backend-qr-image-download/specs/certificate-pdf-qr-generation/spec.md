# Delta — certificate-pdf-qr-generation

## ADDED Requirements

### Requisito: QR descargable como PNG aislado

El sistema DEBE generar on-demand un PNG desde el mismo `publicValidationUrl` del PDF. NO DEBE agregar Composer si lo existente alcanza, persistir PNG, rotar token ni modificar certificado, PDF, auditoría o base.

#### Escenario: QR PNG usa la URL pública canónica

- DADO un certificado con `publicValidationUrl` recuperable
- CUANDO se genera el QR PNG administrativo
- ENTONCES el QR DEBE codificar la misma URL permanente, sin crear ni invalidar token.

#### Escenario: Generación sin side effects

- DADO una solicitud de QR PNG exitosa o fallida
- CUANDO finaliza la operación
- ENTONCES NO DEBE persistir PNG, reescribir PDF, auditar, mutar filas ni loguear la URL completa.

### Requisito: Dependencia runtime PNG

Docker/test DEBE verificar soporte PNG mediante `gd` o equivalente. Si falta, DEBE fallar cerrado con error seguro.

#### Escenario: Entorno con soporte PNG

- DADO el entorno de tests/backend con soporte PNG disponible
- CUANDO se ejecuta la verificación de módulos
- ENTONCES DEBE declarar `gd` o equivalente y validar magic bytes PNG.

#### Escenario: Entorno sin soporte PNG

- DADO que falta soporte runtime para crear PNG
- CUANDO se intenta renderizar el QR
- ENTONCES DEBE responder error seguro, sin archivo vacío/corrupto ni HTML como PNG.
