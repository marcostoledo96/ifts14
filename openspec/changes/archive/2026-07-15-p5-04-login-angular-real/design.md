# Design: P5-04 — Login Angular Real

## Arquitectura

```
┌──────────────────────────────────────────────────┐
│  Angular 20                                       │
│                                                   │
│  app.config.ts                                    │
│  └─ provideHttpClient(                            │
│       withCredentials(),                          │
│       withInterceptors([csrfInterceptor])         │
│     )                                             │
│                                                   │
│  AdminAuthService (NUEVO)                         │
│  ├─ login(creds) → POST /admin/auth/login         │
│  ├─ session()   → GET  /admin/auth/session        │
│  └─ logout()    → POST /admin/auth/logout         │
│       │                                           │
│       └─ csrfToken: Signal<string|null>           │
│                                                   │
│  csrfInterceptor (NUEVO)                          │
│  └─ inyecta X-CSRF-Token en POST/PUT/PATCH/DELETE │
│                                                   │
│  LoginPage ────→ AdminAuthService.login()         │
│  AdminGuard ───→ AdminAuthService.session()       │
│  AdminShell ───→ AdminAuthService.logout()        │
└──────────────────────────────────────────────────┘
```

## Decisiones

| Decisión | Elección | Motivo |
|---|---|---|
| Token de auth | `ADMIN_AUTH` InjectionToken | Reemplaza `MOCK_SESSION`, consistente con pattern del proyecto |
| CSRF token | `Signal<string|null>` en AuthService | Reactivo, sin mutación externa |
| Interceptor | `HttpInterceptorFn` funcional | Patrón Angular 20 moderno |
| Guard | Mantener `adminGuard` como función | Ya existe, solo cambiar fuente de verdad |
| Manejo 401 | Interceptor redirige a `/admin/login` | Centralizado, no se repite en cada servicio |
| Almacenamiento | Solo en memoria (Signal) | Sin localStorage/sessionStorage |

## Archivos

### Nuevos

| Archivo | Rol |
|---|---|
| `admin-auth.service.ts` | Servicio de auth con HttpClient: login, session, logout |
| `csrf.interceptor.ts` | Interceptor HTTP que inyecta X-CSRF-Token |

### Modificados

| Archivo | Cambio |
|---|---|
| `app.config.ts` | `provideHttpClient(withCredentials(), withInterceptors([csrfInterceptor]))` + reemplazar `MOCK_SESSION` por `ADMIN_AUTH` |
| `login-page.ts` | POST real con username/password, manejo de error 401 |
| `admin-guard.ts` | `inject(ADMIN_AUTH).session()` en vez de `MOCK_SESSION.hasSession()` |
| `admin-shell.ts` | `inject(ADMIN_AUTH).logout()` en vez de `MOCK_SESSION.signOut()` |

### Eliminados

| Archivo | Motivo |
|---|---|
| `mock-session.ts` | Reemplazado por `AdminAuthService` real |
| `mock-session.spec.ts` | Reemplazado por `admin-auth.service.spec.ts` |

## Flujo de login

```
Usuario → LoginPage.form
  → AdminAuthService.login({username, password})
    → POST /admin/auth/login (JSON body, withCredentials)
      ← 200 { authenticated: true, csrfToken: "..." }
        → guardar csrfToken en signal
        → navegar a /admin/dashboard
      ← 401 { error: "..." }
        → mostrar "Credenciales inválidas"
        → limpiar password del form
```

## Flujo de guard

```
Usuario → /admin/cursos
  → adminGuard
    → AdminAuthService.session()
      → GET /admin/auth/session (withCredentials)
        ← 200 { authenticated: true }
          → permitir navegación
        ← 200 { authenticated: false } o error
          → navegar a /admin/login
```

## Interceptor CSRF

```typescript
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(ADMIN_AUTH);
  const token = auth.csrfToken();
  if (token && isMutatingMethod(req.method)) {
    req = req.clone({ setHeaders: { 'X-CSRF-Token': token } });
  }
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        auth.clearSession();
        inject(Router).navigate(['/admin/login']);
      }
      return throwError(() => err);
    })
  );
};
```

## Riesgos

- **CORS/cookies**: `SameSite=Strict` requiere mismo dominio. En desarrollo local con proxy, verificar.
- **Circularidad**: AuthService ↔ Interceptor. Mitigación: interceptor usa `inject()` en scope de request (lazy), no en constructor.
- **Rate limiting**: Backend limita 5 intentos/300s. Tests deben mockear HTTP o usar bypass.
