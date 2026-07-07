# Diseño: F2-03 — Login y shell administrativo

## Enfoque técnico

Aplicar Approach A: base admin Angular 20 standalone, por `features/admin/`, con sesión mock en memoria y guard funcional. No hay backend, storage, cookies, la clave admin temporal, datos de dominio ni dependencias nuevas. La UI reutiliza tokens F1-02 y SVG inline. Para evitar landmarks duplicados, el `App` raíz será route-aware: en rutas públicas conserva `HeaderInstitucional` + `main#contenido` + footer; en `/admin/*` renderiza solo skip-link + `router-outlet`, y `AdminShell` asume `banner`, `navigation`, `main#contenido` y footer admin.

## Decisiones de arquitectura

| Decisión | Alternativas | Fundamento |
|---|---|---|
| Sesión mock en memoria con `signal<boolean>` | Storage/cookies/API | Cumple spec: navegación visual sin seguridad falsa ni persistencia. |
| Guard funcional `CanActivateFn` + redirect guard para `/admin` | Auth real o redirects en componentes | Mantiene routing declarativo y testeable sin endpoints. |
| Root route-aware para admin | Doble banner/main, CSS hide, mover headers a cada pública | Es el menor cambio seguro para una sola jerarquía de landmarks. |
| CSS por componente con tokens F1-02 | Tailwind/shadcn/lucide | No agrega dependencias ni tokens globales. |

## Flujo de datos

```txt
LoginForm válido ─→ MOCK_SESSION.signIn() ─→ Router /admin/dashboard
                                      │
/admin/dashboard ─→ adminGuard ───────┘
                                      └─ false → /admin/login
Sidebar logout ─→ signOut() ─→ /admin/login
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/app.ts/html/css/spec.ts` | Modificar | Shell raíz route-aware; admin evita header/footer/main públicos duplicados. |
| `apps/frontend-angular/src/app/app.routes.ts` | Modificar | Agrega bloque `/admin`, `/admin/login`, `/admin/dashboard` antes del wildcard. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Modificar | Cubre rutas admin y preservación de públicas. |
| `apps/frontend-angular/src/app/features/admin/mock-session.ts` | Crear | Contrato y estado mock en memoria. |
| `apps/frontend-angular/src/app/features/admin/admin-guard.ts` | Crear | `adminGuard` funcional (CanActivateFn). La ruta `/admin` usa `redirectTo` + `adminGuard` en `/admin/dashboard` porque Angular exige `component`/`redirectTo`/`children` en cada ruta; no se define un guard de índice separado. |
| `apps/frontend-angular/src/app/features/admin/admin-shell.*` | Crear | Topbar, sidebar, `main#contenido`, footer admin y logout. |
| `apps/frontend-angular/src/app/features/admin/sidebar-admin.*` | Crear | Navegación Inicio/Cursos/Alumnos/Asistencias/Certificaciones. |
| `apps/frontend-angular/src/app/features/admin/login-page.*` | Crear | Layout responsive two-column, mensaje de simulación. |
| `apps/frontend-angular/src/app/features/admin/login-form.*` | Crear | Formulario accesible, validación local, foco al error, sin red. |
| `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.*` | Crear | Placeholder sin datos reales, dentro de `AdminShell`. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar en archive/apply | Estado F2-03, límites y handoff. |

No crear `index.ts` barrel: no aporta valor para lazy imports directos.

## Interfaces / contratos

```ts
export interface MockSession {
  readonly isActive: Signal<boolean>;
  hasSession(): boolean;
  signIn(): void;
  signOut(): void;
}
export const MOCK_SESSION = new InjectionToken<MockSession>('MOCK_SESSION');
export const adminGuard: CanActivateFn;      // true o UrlTree('/admin/login')
// Nota: la ruta `/admin` usa `redirectTo` en `app.routes.ts` (Angular exige
// `component`/`redirectTo`/`children` por ruta). No se define un guard de
// índice separado; el redirect apunta a `/admin/dashboard`, que sí está
// protegido por `adminGuard`.
```

`LoginForm` acepta cualquier par no vacío con mínimos locales, muestra “Acceso simulado — la autenticación real se define en una fase posterior”, llama `signIn()` y navega con `Router`, nunca `window.location`.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit | `MockSession`, guards, formulario inválido/válido, logout | Jasmine/Karma; spies sobre `Storage.prototype.setItem`, `fetch`/HTTP no llamados. |
| Component | Landmarks, labels, `aria-current`, foco visible, responsive estructural | Tests DOM por componente; sin snapshots pesados. |
| Routing | `/admin` redirige según sesión; públicas intactas; wildcard intacto | `provideRouter(routes)` y navegación real. |
| Verificación | Regresión completa | `cd apps/frontend-angular && npm run test:ci`; `npm run build`. |

## Rollback / despliegue

Sin migración ni rollout. Revertir rutas admin, `features/admin/`, cambios route-aware del `App`, tests nuevos y patch documental. Presupuesto estimado: 900–1200 líneas; bajo el límite de 1500. Si en tasks supera 1300, cortar documentación/QA extra a un slice posterior.

## Open Questions

Ninguna.
