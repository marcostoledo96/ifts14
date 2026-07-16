# Spec: Admin Angular Auth (P5-04)

## Capability: `admin-angular-auth`

Delta spec para P5-04 — reemplazar sesión mock por autenticación real vía cookies PHP.

### REQ-AUTH-001: Login con credenciales reales

**Prioridad**: CRITICAL

**Given** un usuario en la página de login con credenciales válidas  
**When** envía el formulario  
**Then** el frontend DEBE enviar `POST /admin/auth/login` con `{ username, password }` en JSON  
**And** en caso de éxito (200) DEBE redirigir a `/admin/dashboard`  
**And** en caso de error (401) DEBE mostrar mensaje genérico sin revelar si falló usuario o contraseña  
**And** NUNCA DEBE almacenar la contraseña en memoria, localStorage ni sessionStorage

### REQ-AUTH-002: Sesión vía cookie HttpOnly

**Prioridad**: CRITICAL

**Given** un login exitoso  
**When** el backend responde con `Set-Cookie` de sesión PHP  
**Then** el `HttpClient` DEBE estar configurado con `withCredentials: true`  
**And** la cookie DEBE enviarse automáticamente en requests subsiguientes  
**And** el frontend NUNCA DEBE leer ni manipular la cookie directamente

### REQ-AUTH-003: Guard verifica sesión real

**Prioridad**: CRITICAL

**Given** un usuario intenta acceder a `/admin/*`  
**When** el `adminGuard` se ejecuta  
**Then** DEBE llamar a `GET /admin/auth/session`  
**And** si `authenticated: true`, DEBE permitir la navegación  
**And** si `authenticated: false` o error de red, DEBE redirigir a `/admin/login`

### REQ-AUTH-004: Logout real

**Prioridad**: HIGH

**Given** un usuario autenticado en el panel admin  
**When** hace clic en "Cerrar sesión"  
**Then** DEBE enviar `POST /admin/auth/logout`  
**And** al recibir respuesta, DEBE redirigir a `/admin/login`  
**And** DEBE limpiar cualquier estado de sesión local (CSRF token, signals)

### REQ-AUTH-005: CSRF en requests mutantes

**Prioridad**: CRITICAL

**Given** una sesión activa con CSRF token obtenido del login o session  
**When** se envía cualquier request POST, PUT, PATCH o DELETE a `/admin/`  
**Then** DEBE incluir el header `X-CSRF-Token` con el valor del token  
**And** si el backend responde 403 por CSRF inválido, DEBE redirigir a login

### REQ-AUTH-006: 401 redirige a login

**Prioridad**: HIGH

**Given** un usuario con sesión expirada o inválida  
**When** cualquier request admin recibe 401  
**Then** el interceptor DEBE redirigir a `/admin/login`  
**And** DEBE limpiar el estado de sesión local

### REQ-AUTH-007: Sin X-Admin-Key en bundle

**Prioridad**: CRITICAL

**Given** un build productivo  
**When** se inspecciona el bundle JavaScript  
**Then** NO DEBE contener `X-Admin-Key` ni ninguna clave admin hardcodeada

### REQ-AUTH-008: Sin credenciales en memoria

**Prioridad**: HIGH

**Given** un formulario de login enviado  
**When** la respuesta del backend es recibida (éxito o error)  
**Then** los campos `username` y `password` del formulario DEBEN limpiarse  
**And** ninguna variable o signal DEBE retener la contraseña más allá del request HTTP
