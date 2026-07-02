# Delta — actualizar-plan-matias-v0

## ADDED Requirements

### Requirement: Copys de entrega manual para Matías/v0

La documentación y prompts de Matías DEBEN reemplazar el lenguaje de “enviar”, “enviar por email” y “reenviar certificado” por acciones de MVP manual: copiar link público, descargar PDF y entregar fuera del sistema. La UI NO DEBE prometer SMTP, PHPMailer, envío automático ni reenvío en el MVP. El copy DEBE mantener claro que Bedelía opera la entrega manual y que el QR/link es permanente.

#### Scenario: Botones principales del flujo administrativo

- DADO una pantalla administrativa basada en la referencia v0
- CUANDO se emite o consulta un certificado
- ENTONCES los CTAs DEBEN decir “Copiar link”, “Descargar PDF” o “Entrega manual”.
- Y NO DEBEN decir “Enviar por email” ni “Reenviar certificado”.

#### Scenario: Texto de ayuda del MVP

- DADO que Matías ajusta prompts o microcopy del flujo
- CUANDO describe la entrega al alumno
- ENTONCES DEBE indicar que Bedelía comparte el link/PDF por un canal externo.
- Y DEBE aclarar que el sistema no envía emails en el MVP.

#### Scenario: Coherencia con token permanente

- DADO que se muestra el resultado de emisión
- CUANDO la UI ofrece copiar link o descargar PDF
- ENTONCES DEBE comunicar que QR y link corresponden al mismo acceso permanente.
- Y NO DEBE sugerir rotación por reenvío normal.
