# Delta — backend-modelo-datos-certificados

## MODIFIED Requirements

### Requirement: Token QR sin texto plano

El sistema DEBE almacenar tokens públicos como hash no reversible, NO DEBE guardar el token completo en texto plano y DEBE tratar el QR/token como permanente durante la vida del certificado, salvo revocación explícita o decisión futura documentada.
(Previously: el modelo permitía rotación normal del token en reenvío.)

#### Scenario: Token verificable por hash

- DADO un token público futuro
- CUANDO el backend lo consulte
- ENTONCES DEBE calcular hash con pepper externo a Git y comparar contra `cert_tokens_verificacion.token_hash`.
- Y PUEDE conservar solo `token_prefijo` para soporte seguro.

#### Scenario: Reenvío conserva token

- DADO un certificado vigente con token activo
- CUANDO se registra un reenvío normal
- ENTONCES el modelo DEBE conservar el token activo.
- Y NO DEBE crear un nuevo token salvo revocación explícita.

### Requirement: Exposición pública definida

El modelo DEBE sostener el DTO público con DNI completo visible y fechas asistidas del curso, sin exponer token completo, hashes, pepper ni tablas internas. Las tablas futuras para cursos, alumnos, asistencias y configuración institucional DEBEN usar prefijo `cert_` y migraciones controladas.
(Previously: el DTO público se sostenía sin requerir DNI completo y con `documento_enmascarado`.)

#### Scenario: Certificado vigente

- DADO un certificado `vigente` con token `activo`
- CUANDO se resuelva una verificación pública
- ENTONCES la respuesta futura DEBE usar código, estado, curso, fecha, DNI completo y fechas asistidas.
- Y NO DEBE exponer `documento_hash`, `token_hash` ni datos internos.

#### Scenario: Tablas futuras documentadas

- DADO la planificación de cursos y asistencias
- CUANDO se documenten tablas futuras
- ENTONCES DEBEN declararse como futuras, con prefijo `cert_` y sin migración en este ciclo.
