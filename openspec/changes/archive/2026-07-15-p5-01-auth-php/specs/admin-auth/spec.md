# Delta para admin-auth

## RENAMED Requirements

### Requirement: Autorización administrativa por `X-Admin-Key` → Autorización administrativa por sesión o compatibilidad CLI

(Reason: la sesión browser reemplaza el gate HTTP exclusivo; el header queda acotado a CLI/smoke.)
(Migration: actualizar consumidores para referir `admin-auth`, sin aceptar el header en HTTP.)

## MODIFIED Requirements

### Requirement: Autorización administrativa por sesión o compatibilidad CLI

Los endpoints administrativos DEBEN autorizar una sesión de navegador autenticada. La compatibilidad con `X-Admin-Key` SOLO PUEDE autorizar ejecuciones PHP CLI o smokes invocados del lado servidor, cuando esté habilitada explícitamente por configuración externa; MUST NOT evaluarse para requests HTTP, aun sin `Cookie`, `Origin` o `User-Agent`. Toda otra condición DEBE fallar cerrada. La clave legacy, si se usa, DEBE ser externa a Git, de 16 caracteres o más y comparada en tiempo constante. Respuestas, auditoría y logs MUST NOT exponer secretos ni material de sesión.
(Previously: todos los endpoints administrativos exigían exclusivamente `X-Admin-Key` en requests HTTP.)

#### Scenario: CLI legacy válido

- GIVEN una ejecución PHP CLI/smoke habilitada y una clave legacy externa válida
- WHEN presenta el `X-Admin-Key` correcto al adaptador CLI
- THEN la operación MAY continuar.

#### Scenario: Falla cerrada

- GIVEN sesión ausente o vencida, o compatibilidad CLI ausente, inválida o deshabilitada
- WHEN se invoca una operación administrativa
- THEN la API MUST responder `401 UNAUTHORIZED` con sobre de error seguro.
- AND MUST NOT revelar la causa exacta.

#### Scenario: Secreto no observable

- GIVEN una autorización exitosa o fallida
- WHEN se generan respuesta, auditoría o logs técnicos
- THEN MUST NOT incluir clave, contraseña, hash, ID de sesión, cookie ni CSRF completos o parciales.

## ADDED Requirements

### Requirement: Ciclo de sesión nativa de navegador

El sistema DEBE ofrecer operaciones de login, consulta de estado y logout para navegador mediante sesión nativa PHP. Login válido DEBE crear sesión autenticada; estado DEBE informar solo si la sesión actual está autenticada; logout DEBE invalidarla y expirar su cookie. Credenciales inválidas, ausentes o configuración inválida DEBEN producir el mismo `401 UNAUTHORIZED` genérico con el sobre de error vigente.

#### Scenario: Login y estado válidos

- GIVEN credenciales externas válidas y configuración completa
- WHEN el navegador inicia sesión y consulta su estado
- THEN la sesión queda autenticada y el estado la informa como tal.

#### Scenario: Falla genérica de login

- GIVEN credenciales inválidas o configuración incompleta
- WHEN se intenta iniciar sesión
- THEN la API MUST responder `401 UNAUTHORIZED` sin distinguir la causa.

#### Scenario: Logout invalida

- GIVEN una sesión autenticada
- WHEN el navegador solicita logout
- THEN la sesión deja de autorizar y una consulta posterior informa estado no autenticado.

### Requirement: Protección y vigencia de sesión

La cookie de sesión DEBE usar `HttpOnly`, `Secure`, `SameSite=Strict` y `Path=/certificados/`. El ID DEBE regenerarse tras login exitoso. La sesión DEBE expirar por inactividad y por duración absoluta según valores externos validados; si faltan o son inválidos, la autenticación DEBE fallar cerrada.

#### Scenario: Cookie y fijación endurecidas

- GIVEN un login exitoso
- WHEN se emite la cookie de sesión
- THEN incluye los atributos exigidos y usa un ID distinto del previo al login.

#### Scenario: Expiración temporal

- GIVEN una sesión autenticada que supera el límite de inactividad o absoluto
- WHEN accede a una operación administrativa
- THEN MUST recibir `401 UNAUTHORIZED` y la sesión queda invalidada.

#### Scenario: Configuración temporal inválida

- GIVEN límites de sesión ausentes o inválidos
- WHEN se intenta autenticar o autorizar
- THEN MUST fallar cerrada sin emitir sesión utilizable.

### Requirement: CSRF para mutaciones autenticadas por cookie

Toda operación mutante autenticada por cookie DEBE exigir una prueba CSRF válida y vinculada a la sesión actual antes de side effects. Operaciones seguras no DEBEN requerirla.

#### Scenario: Mutación con CSRF válida

- GIVEN una sesión autenticada y prueba CSRF válida
- WHEN solicita una operación administrativa mutante
- THEN la API MAY continuar con la validación de negocio.

#### Scenario: CSRF ausente o inválida

- GIVEN una sesión autenticada y una operación mutante
- WHEN falta, expira o no coincide la prueba CSRF
- THEN la API DEBE rechazarla con sobre seguro sin side effects.

### Requirement: Retiro verificable de compatibilidad legacy

La compatibilidad CLI DEBE estar deshabilitada por defecto, inventariada y tener una condición de retiro verificable. Al deshabilitarla o retirarla, ninguna ruta HTTP ni CLI DEBE aceptar `X-Admin-Key`; los smokes DEBEN migrar a sesión o finalizar explícitamente.

#### Scenario: Header legacy desde HTTP

- GIVEN un request HTTP de navegador o cualquier cliente web
- WHEN incluye `X-Admin-Key` sin sesión válida
- THEN MUST responder `401 UNAUTHORIZED` y MUST NOT usar ese header para autorizar.

#### Scenario: Retiro de legacy

- GIVEN compatibilidad legacy deshabilitada o eliminada
- WHEN un smoke intenta usar `X-Admin-Key`
- THEN MUST fallar cerrada y la evidencia de retiro identifica el consumidor migrado o discontinuado.

## Notas de contrato pendientes

- Las rutas, cuerpos de login/estado/logout, formato de prueba CSRF y valores de expiración quedan para diseño; no se inventan DTOs ni códigos nuevos. El sobre de error existente sí es obligatorio.
- Quedan fuera de alcance frontend, migraciones, infraestructura, deploy, secretos y operaciones Git.
