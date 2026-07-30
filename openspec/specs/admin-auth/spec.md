# Spec — admin-auth

## Propósito

Definir la autenticación administrativa por sesión PHP nativa, con compatibilidad CLI acotada y falla cerrada. El header `X-Admin-Key` no autoriza requests HTTP.

## Requisitos

### Requisito: Autorización administrativa por sesión o compatibilidad CLI

Los endpoints administrativos DEBEN autorizar una sesión de navegador autenticada. `X-Admin-Key` SOLO PUEDE autorizar PHP CLI o smokes del lado servidor cuando la configuración externa lo habilita; NUNCA DEBE evaluarse en requests HTTP. La clave legacy, si se usa, DEBE ser externa a Git, tener al menos 16 caracteres y compararse en tiempo constante. Respuestas, auditoría y logs NO DEBEN exponer secretos ni material de sesión.

#### Escenario: CLI legacy válido

- DADO una ejecución PHP CLI habilitada y una clave legacy externa válida
- CUANDO presenta `X-Admin-Key` al adaptador CLI
- ENTONCES la operación PUEDE continuar.

#### Escenario: Falla cerrada

- DADO una sesión ausente o vencida, o compatibilidad CLI ausente, inválida o deshabilitada
- CUANDO se invoca una operación administrativa
- ENTONCES la API DEBE responder `401 UNAUTHORIZED` con sobre seguro.

#### Escenario: Header legacy desde HTTP

- DADO un request HTTP sin sesión válida que incluye `X-Admin-Key`
- CUANDO se invoca una operación administrativa
- ENTONCES DEBE responder `401 UNAUTHORIZED` y no usar el header.

### Requisito: Ciclo de sesión nativa de navegador

El sistema DEBE ofrecer login, consulta de estado y logout mediante sesión PHP nativa. Login válido crea sesión autenticada; estado informa únicamente el estado actual; logout la invalida y expira su cookie. Credenciales o configuración inválidas producen el mismo `401 UNAUTHORIZED` genérico.

#### Escenario: Login y estado válidos

- DADO credenciales externas válidas y configuración completa
- CUANDO el navegador inicia sesión y consulta estado
- ENTONCES la sesión queda autenticada y el estado lo informa.

#### Escenario: Falla genérica de login

- DADO credenciales inválidas o configuración incompleta
- CUANDO se intenta iniciar sesión
- ENTONCES responde `401 UNAUTHORIZED` sin distinguir la causa.

#### Escenario: Logout invalida

- DADO una sesión autenticada
- CUANDO el navegador solicita logout
- ENTONCES deja de autorizar y una consulta posterior informa no autenticado.

### Requisito: Protección y vigencia de sesión

La cookie DEBE usar `HttpOnly`, `Secure`, `SameSite=Strict` y el path del entorno (`/certificados/` en producción; `/certificados_staging/` en staging). El ID DEBE regenerarse tras login. La sesión DEBE expirar por inactividad exacta de **14400** segundos (4 h) o duración absoluta exacta de **28800** segundos (8 h); configuración faltante o inválida implica falla cerrada. Tras confirmar sesión activa, `GET /admin/auth/session` y los GETs administrativos autorizados DEBEN renovar `lastSeen` al instante actual y liberar el lock de escritura de sesión tras el touch. Este ciclo NO rediseña atributos de cookie ni la política absoluta de 8 h (U7).

#### Escenario: Idle y absoluto exactos

- DADO configuración de sesión válida (14400 / 28800)
- CUANDO la inactividad alcanza 14400 s o la edad absoluta 28800 s
- ENTONCES la sesión DEBE considerarse vencida
- Y las operaciones administrativas DEBEN responder `401 UNAUTHORIZED`

#### Escenario: Poll de session renueva idle

- DADO una sesión autenticada aún vigente
- CUANDO el cliente consulta `GET /admin/auth/session`
- ENTONCES el sistema DEBE actualizar `lastSeen` al instante actual
- Y DEBE liberar el lock de escritura de sesión tras el touch
- Y el estado DEBE informar autenticado

#### Escenario: GET autorizado renueva idle

- DADO una sesión autenticada aún vigente
- CUANDO un GET administrativo autorizado pasa por la autorización de sesión
- ENTONCES el sistema DEBE actualizar `lastSeen`
- Y DEBE liberar el lock de escritura de sesión tras el touch

#### Escenario: Configuración temporal inválida

- DADO límites de sesión ausentes o distintos de 14400 / 28800
- CUANDO se inicia o evalúa la sesión administrativa
- ENTONCES el sistema DEBE fallar cerrado sin sesión usable

### Requisito: Fallo de almacenamiento en rate-limit de login

Cuando el almacenamiento del rate-limit de login administrativo no pueda escribirse o falle de forma operativa, el sistema DEBE NOT responder `429 RATE_LIMITED` como si el umbral se hubiera excedido. DEBE responder `503` (error de servicio seguro distinto de `RATE_LIMITED`) sin autenticar y sin exponer PII ni detalles de almacenamiento. DEBE NOT fallar abierto el login por este motivo.

#### Escenario: Storage rate-limit no escribible

- DADO storage del rate-limit de login no escribible o con fallo al persistir
- CUANDO un cliente intenta login administrativo
- ENTONCES la API DEBE responder `503` con código distinto de `RATE_LIMITED`
- Y DEBE NOT autenticar ni tratar el caso como umbral excedido

### Requisito: CSRF para mutaciones autenticadas por cookie

Toda operación mutante autenticada por cookie DEBE exigir una prueba CSRF válida y vinculada a la sesión antes de side effects. Operaciones seguras no la requieren.

#### Escenario: CSRF ausente o inválido

- DADO una sesión autenticada y una operación mutante
- CUANDO falta o no coincide el token CSRF
- ENTONCES rechaza con error seguro y cero side effects.

### Requisito: Retiro verificable de compatibilidad legacy

La compatibilidad CLI DEBE estar deshabilitada por defecto, inventariada y tener condición de retiro. El smoke histórico basado en HTTP fue discontinuado; los smokes futuros DEBEN usar sesión o quedar explícitamente fuera de alcance.
