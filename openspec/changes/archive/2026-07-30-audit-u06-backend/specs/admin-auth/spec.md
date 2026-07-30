# Delta for admin-auth

## ADDED Requirements

### Requirement: Fallo de almacenamiento en rate-limit de login

Cuando el almacenamiento del rate-limit de login administrativo no pueda escribirse o falle de forma operativa, el sistema DEBE NOT responder `429 RATE_LIMITED` como si el umbral se hubiera excedido. DEBE responder `503` (error de servicio seguro distinto de `RATE_LIMITED`) sin autenticar y sin exponer PII ni detalles de almacenamiento. DEBE NOT fallar abierto el login por este motivo.

#### Scenario: Storage rate-limit no escribible

- GIVEN storage del rate-limit de login no escribible o con fallo al persistir
- WHEN un cliente intenta login administrativo
- THEN la API DEBE responder `503` con código distinto de `RATE_LIMITED`
- AND DEBE NOT autenticar ni tratar el caso como umbral excedido

## MODIFIED Requirements

### Requirement: Protección y vigencia de sesión

La cookie DEBE usar `HttpOnly`, `Secure`, `SameSite=Strict` y el path del entorno (`/certificados/` en producción; `/certificados_staging/` en staging). El ID DEBE regenerarse tras login. La sesión DEBE expirar por inactividad exacta de **14400** segundos (4 h) o duración absoluta exacta de **28800** segundos (8 h); configuración faltante o inválida implica falla cerrada. Tras confirmar sesión activa, `GET /admin/auth/session` y los GETs administrativos autorizados DEBEN renovar `lastSeen` al instante actual y liberar el lock de escritura de sesión tras el touch. Este ciclo NO rediseña atributos de cookie ni la política absoluta de 8 h (U7).

(Previously: idle 30 minutos; sin renovación de `lastSeen` en consulta de estado.)

#### Scenario: Idle y absoluto exactos

- GIVEN configuración de sesión válida (14400 / 28800)
- WHEN la inactividad alcanza 14400 s o la edad absoluta 28800 s
- THEN la sesión DEBE considerarse vencida
- AND las operaciones administrativas DEBEN responder `401 UNAUTHORIZED`

#### Scenario: Poll de session renueva idle

- GIVEN una sesión autenticada aún vigente
- WHEN el cliente consulta `GET /admin/auth/session`
- THEN el sistema DEBE actualizar `lastSeen` al instante actual
- AND DEBE liberar el lock de escritura de sesión tras el touch
- AND el estado DEBE informar autenticado

#### Scenario: GET autorizado renueva idle

- GIVEN una sesión autenticada aún vigente
- WHEN un GET administrativo autorizado pasa por la autorización de sesión
- THEN el sistema DEBE actualizar `lastSeen`
- AND DEBE liberar el lock de escritura de sesión tras el touch

#### Scenario: Configuración temporal inválida

- GIVEN límites de sesión ausentes o distintos de 14400 / 28800
- WHEN se inicia o evalúa la sesión administrativa
- THEN el sistema DEBE fallar cerrado sin sesión usable
