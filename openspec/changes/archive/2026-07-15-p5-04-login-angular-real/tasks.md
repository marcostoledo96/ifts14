# Tasks: P5-04 — Login Angular Real

**Review Workload Forecast**: ~250 líneas nuevas/cambiadas, ~8 archivos. Bajo la cuota de 1000. PR única.

## Tasks

### T1: Crear AdminAuthService (CRITICAL)
- [x] Archivo: `apps/frontend-angular/src/app/features/admin/admin-auth.service.ts` (NUEVO)
- Métodos: `login(creds)`, `session()`, `logout()`, `clearSession()`
- Token: `ADMIN_AUTH` InjectionToken
- Almacena `csrfToken` como `Signal<string|null>`
- Usa `HttpClient` con paths relativos a `apiBaseUrl`
- No guarda password ni admin key

### T2: Crear CSRF interceptor (CRITICAL)
- [x] Archivo: `apps/frontend-angular/src/app/core/interceptors/csrf.interceptor.ts` (NUEVO)
- `HttpInterceptorFn` que inyecta header `X-CSRF-Token` en POST/PUT/PATCH/DELETE
- Captura 401 → limpia sesión → redirige a `/admin/login`

### T3: Actualizar app.config.ts (CRITICAL)
- [x] Archivo: `apps/frontend-angular/src/app/app.config.ts`
- `provideHttpClient(withInterceptors([csrfInterceptor]))`
- Reemplazar `MOCK_SESSION` provider por `ADMIN_AUTH`

### T4: Actualizar LoginPage (CRITICAL)
- [x] Archivo: `apps/frontend-angular/src/app/features/admin/login-page.ts`
- POST real con `AdminAuthService.login()`
- Manejo de errores: 401 → "Credenciales inválidas", 429 → "Demasiados intentos"
- Limpiar password después del request
- Navegar a `/admin/dashboard` en éxito

### T5: Actualizar adminGuard (CRITICAL)
- [x] Archivo: `apps/frontend-angular/src/app/features/admin/admin-guard.ts`
- Llamar `AdminAuthService.session()` en vez de `MOCK_SESSION.hasSession()`
- Manejar respuesta asíncrona (Promise/Observable)
- Redirigir a `/admin/login` si no autenticado

### T6: Actualizar AdminShell (HIGH)
- [x] Archivo: `apps/frontend-angular/src/app/features/admin/admin-shell.ts`
- Logout real con `AdminAuthService.logout()`
- Navegar a `/admin/login` después del logout

### T7: Eliminar mock-session.ts (HIGH)
- [x] Archivos a eliminar:
  - `apps/frontend-angular/src/app/features/admin/mock-session.ts`
  - `apps/frontend-angular/src/app/features/admin/mock-session.spec.ts`

### T8: Actualizar/crear tests (HIGH)
- [x] `admin-auth.service.spec.ts` (NUEVO) — tests con `HttpTestingController`
- `login-page.spec.ts` — adaptar a `AdminAuthService` mockeado
- `admin-guard.spec.ts` — adaptar a `AdminAuthService`
- `admin-shell.spec.ts` — adaptar a `AdminAuthService`
- `app.config.spec.ts` — verificar que `ADMIN_AUTH` está provisto

### T9: Ejecutar tests de regresión
- [x] `npm run test:ci` — 605/605 tests SUCCESS

## Dependencias

```
T1 → T4, T5, T6
T2 → T3
T3 → T4, T5, T6
T1, T3 → T7
T4, T5, T6, T7 → T8 → T9
```

## Estimación

~250 líneas netas. 8 archivos tocados (3 nuevos, 4 modificados, 2 eliminados).
