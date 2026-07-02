# Delta — backend-modelo-datos-certificados

## MODIFIED Requirements

### Requirement: Token QR sin texto plano y recuperable para reenvío

El sistema DEBE almacenar tokens públicos como `token_hash` no reversible con pepper externo a Git y DEBE mantener un artefacto recuperable cifrado (`token_cifrado` o equivalente reversible) con clave externa a Git para reconstruir el link permanente en emisión, entrega manual y regeneración de PDF. El token completo NO DEBE guardarse en texto plano ni aparecer en logs, auditoría, errores o respuestas administrativas. `token_prefijo` DEBE usarse solo como ayuda operativa segura.
(Previously: la recuperabilidad se justificaba por reenvío permanente.)

#### Scenario: Token verificable y recuperable

- DADO un certificado emitido con token activo
- CUANDO se persiste el token
- ENTONCES el sistema DEBE guardar `token_hash`, `token_prefijo` y `token_cifrado` o equivalente cifrado.
- Y NO DEBE guardar el token completo en texto plano.

#### Scenario: Clave externa obligatoria

- DADO la configuración de entorno del backend
- CUANDO se emite o consulta entrega manual
- ENTONCES la clave de cifrado DEBE provenir de configuración externa a Git.
- Y su ausencia DEBE producir error seguro sin exponer secretos ni tokens.

### Requirement: Persistencia de entrega con reutilización de tablas `cert_`

El endpoint de entrega manual DEBE reutilizar `cert_tokens_verificacion` para leer el token permanente recuperable y DEBE ser de solo lectura respecto de certificado, token y entrega: NO DEBE rotar, revocar, crear token, insertar evento operativo ni crear tabla nueva. La auditoría de copia de link queda fuera de alcance/futura salvo decisión explícita de diseño; si se implementa en otro ciclo, DEBE omitir DNI completo, token completo, link completo si se considera sensible, credenciales y SQL.
(Previously: la persistencia hablaba de reenvío y evento `reenvio` en `cert_eventos_auditoria`.)

#### Scenario: Entrega manual conserva token sobre tabla existente

- DADO un certificado con token activo en `cert_tokens_verificacion`
- CUANDO se consulta la entrega manual
- ENTONCES el sistema DEBE conservar el token activo sin rotar.
- Y NO DEBE crear un nuevo token, revocar el previo ni almacenar el token completo en texto plano.

#### Scenario: Sin auditoría operativa en este endpoint

- DADO una consulta de entrega manual exitosa o fallida
- CUANDO se procesa el endpoint
- ENTONCES NO DEBE insertarse evento obligatorio en `cert_eventos_auditoria` ni modificarse estado de entrega.
- Y cualquier auditoría futura DEBE definirse en otro ciclo sin datos sensibles.

#### Scenario: Certificados anteriores sin token cifrado

- DADO un certificado emitido antes de existir `token_cifrado`
- CUANDO se solicita reconstruir el link
- ENTONCES el sistema NO DEBE regenerar token automáticamente.
- Y DEBE requerir regeneración excepcional auditada o limitarse al PDF existente.

#### Scenario: Tabla `cert_entregas` diferida

- DADO el diseño técnico finalizado para este MVP
- CUANDO se evalúa persistencia adicional de entrega manual
- ENTONCES el sistema NO DEBE crear `cert_entregas` para el endpoint de solo lectura.
- Y una tabla futura DEBE requerir nuevo ciclo SDD y migración `cert_` compatible con MariaDB 10.6.
