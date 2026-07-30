# Delta for admin-auth

## MODIFIED Requirements

### Requirement: Protección y vigencia de sesión

La cookie de sesión administrativa DEBE emitir `HttpOnly`, `Secure` y `SameSite=Strict` (atributos fijos, no configurables por overlay). El path DEBE ser el del entorno (`/certificados/` en producción; `/certificados_staging/` en staging). El `lifetime` de cookie DEBE ser `0` (cookie de sesión del navegador: sin `Max-Age`/`Expires` persistente). La vigencia absoluta DEBE aplicarse app-side exactamente a **28800** segundos (8 h) desde el inicio de sesión; la inactividad exacta DEBE ser **14400** segundos (4 h). El sistema DEBE NOT aflojar ni redefinir esos TTL (14400 / 28800) sin evidencia y cambio de spec. El ID DEBE regenerarse tras login. Configuración temporal faltante o distinta de 14400/28800 implica falla cerrada. Tras confirmar sesión activa, `GET /admin/auth/session` y los GETs administrativos autorizados DEBEN renovar `lastSeen` al instante actual y liberar el lock de escritura de sesión tras el touch.

(Previously: atributos y path ya exigidos; defería a U7 la profundidad cookie `lifetime=0` vs absoluto app-side 28800; no prohibía explícitamente aflojar TTL.)

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

#### Scenario: Atributos fijos de cookie en login

- GIVEN credenciales externas válidas y configuración completa
- WHEN el navegador inicia sesión administrativa
- THEN `Set-Cookie` DEBE incluir `HttpOnly`, `Secure` y `SameSite=Strict`
- AND DEBE usar path `/certificados/` (producción) o `/certificados_staging/` (staging)

#### Scenario: Cookie de sesión vs absoluto app-side

- GIVEN login administrativo exitoso
- WHEN se inspecciona la cookie emitida
- THEN el lifetime de cookie DEBE ser `0` (sesión de navegador; sin `Max-Age` persistente de 8 h)
- AND la vigencia absoluta app-side DEBE seguir siendo exactamente 28800 s
