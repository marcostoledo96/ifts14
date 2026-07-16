# Propuesta: P5-04 Login Angular Real

## Intención

El panel de administración actual usa `InMemoryMockSession`: cualquier clic en "Ingresar" abre sesión sin credenciales. Esto deja el admin expuesto y bloquea cualquier despliegue real. Se necesita autenticación real contra el backend PHP que ya expone endpoints de sesión y CSRF.

## Alcance

### En alcance
- Reemplazar `MockSession`/`InMemoryMockSession` por `AdminAuthService` con `HttpClient`.
- Activar `withCredentials: true` en `provideHttpClient` para enviar cookies de sesión.
- Agregar interceptor CSRF que inyecte `X-CSRF-Token` en requests mutantes.
- Actualizar `LoginPage` para POST real con usuario/contraseña.
- Actualizar `adminGuard` para consultar `GET /admin/auth/session`.
- Actualizar `AdminShell` para POST real de logout.
- Actualizar tests unitarios (`login-page.spec.ts`, `admin-guard.spec.ts`, `admin-shell.spec.ts`, `mock-session.spec.ts`).

### Fuera de alcance
- Cambios en backend PHP (ya listos en P5-01).
- Registro de usuarios, múltiples roles o recuperación de contraseña.
- Configuración CORS/cookies de cPanel (responsabilidad de infraestructura).

## Capacidades

### Capacidades nuevas
- `admin-angular-auth`: Autenticación real del panel Angular mediante cookies de sesión PHP y CSRF.

### Capacidades modificadas
- `frontend-angular-shell`: Ahora el shell admin depende de sesión backend real; el login y logout ejecutan requests HTTP y el guard redirige en 401.

## Enfoque

Opción A recomendada: eliminar la abstracción mock y crear `AdminAuthService` que exponga métodos `login(credentials)`, `session()` y `logout()`, todos basados en `HttpClient`. Almacenar el `csrfToken` en una signal o BehaviorSubject. Registrar un interceptor HTTP que lea ese token e inyecte el header `X-CSRF-Token` solo en métodos mutantes. No se guarda contraseña ni admin key en memoria más allá del formulario.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/frontend-angular/src/app/features/admin/admin-auth.service.ts` | Nuevo | Servicio real de login/session/logout. |
| `apps/frontend-angular/src/app/features/admin/mock-session.ts` | Eliminado | Reemplazo de `MockSession` e `InMemoryMockSession`. |
| `apps/frontend-angular/src/app/features/admin/login-page.ts` | Modificado | POST real de credenciales y manejo de error 401. |
| `apps/frontend-angular/src/app/features/admin/admin-guard.ts` | Modificado | Verifica sesión con `GET /admin/auth/session`. |
| `apps/frontend-angular/src/app/features/admin/admin-shell.ts` | Modificado | Logout real y redirección a login. |
| `apps/frontend-angular/src/app/app.config.ts` | Modificado | `provideHttpClient(withCredentials(), withInterceptors(...))`. |
| `apps/frontend-angular/src/app/core/interceptors/csrf.interceptor.ts` | Nuevo | Inyecta `X-CSRF-Token` en POST/PUT/PATCH/DELETE. |
| `*.spec.ts` asociados | Modificado | Tests con `HttpClientTestingModule`/`provideHttpClientTesting`. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Cookies no se envían por CORS/SameSite | Medio | Verificar que Angular y API compartan origen/site; probar en staging cPanel antes de prod. |
| CSRF expira con la sesión (30 min idle) | Medio | Interceptor redirige 401/403 a `/admin/login`; guard consulta estado. |
| Rate limit en tests e2e | Medio | Tests e2e deben mockear backend o usar bypass controlado. |
| Dependencia circular AuthService ↔ interceptor | Baja | Leer token desde signal global o `HttpContext`, no inyectar `AdminAuthService` en interceptor. |

## Plan de reversión

1. Restaurar `mock-session.ts` desde Git.
2. Revertir `login-page.ts`, `admin-guard.ts`, `admin-shell.ts` y `app.config.ts` a usos de `MOCK_SESSION`.
3. Eliminar `admin-auth.service.ts` y `csrf.interceptor.ts`.
4. Restaurar tests originales.
5. Verificar que `ng build` y tests pasen.

## Dependencias

- Backend PHP P5-01 desplegado y endpoints `/admin/auth/*` accesibles.
- `frontend-angular-shell` y `frontend-http-services` disponibles.

## Criterios de éxito

- [ ] Ingresar con credenciales inválidas muestra error y no avanza.
- [ ] Ingresar con credenciales válidas crea sesión, redirige a `/admin/dashboard` y envía cookies.
- [ ] Acceder a ruta admin sin sesión redirige a `/admin/login`.
- [ ] Logout destruye sesión en backend y redirige a login.
- [ ] Requests mutantes (POST/PUT/PATCH/DELETE) incluyen header `X-CSRF-Token` y responden 2xx.
- [ ] Todos los tests unitarios de login, guard, shell y auth service pasan.
- [ ] `ng build --configuration production` compila sin errores.
