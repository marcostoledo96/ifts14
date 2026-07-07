# Exploration: F2-03 — Login/admin shell

## Goal

F2-03 es el primer ciclo de Fase 2 dedicado al shell administrativo. Su objetivo, según `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 853-899) y la división de responsabilidades en `docs/frontend/00-angular20-port-v0.md` (líneas 19-22), es **preparar la base operativa administrativa** sobre el sistema visual F1-02: `AdminShell`, `SidebarAdmin`, `LoginForm`, página de login y página de dashboard placeholder, todo bajo estructura por features, con mocks explícitos de sesión y **sin autenticación real**. NO es implementar login real contra backend: la auth admin simple por header (clave admin temporal, server-to-server) es temporal y la spec de `admin-auth` y `backend-contrato-api-certificados` prohíbe explícitamente embeber esa clave en bundles Angular o en `localStorage`/`sessionStorage`. F2-03 deja lista la navegación interna para que F2-04 (cursos), F2-05 (asistencias) y F2-06 (certificaciones) se integren contra el mismo shell.

Rama: `frontend/admin-foundation` (creada desde `main` ya actualizado con PR #33 de F1-02, sin cambios locales). Modo SDD: artifact store `hybrid` (OpenSpec + Engram), chained-PR `single-pr-default`, review budget 1500.

## Scope (in / out)

### Incluido

- **Rutas admin** bajo `/admin/...` agregadas a `app.routes.ts` con `loadComponent` (mismo patrón que `landing-page` y `public-validation-page`):
  - `/admin/login` → `LoginPage` (página de acceso, two-column responsive: aside institucional + columna con `LoginForm`).
  - `/admin` → redirección a `/admin/dashboard` si hay sesión mock activa, o a `/admin/login` si no.
  - `/admin/dashboard` → `AdminDashboardPage` (placeholder accesible: tarjetas con "Próximamente: Cursos / Asistencias / Certificaciones", sin datos). Protegido por `adminGuard` funcional.
  - `**` no se toca: sigue apuntando a `NotFoundPage`. Ninguna ruta admin debe colisionar con el wildcard público.
- **Componentes nuevos** bajo `apps/frontend-angular/src/app/features/admin/` con CSS por componente consumiendo tokens F1-02 (sin Tailwind, sin shadcn, sin lucide):
  - `features/admin/admin-shell.ts/.html/.css/.spec.ts`: layout compositivo con slots `topbar`, `sidebar`, `main`, `footer`. Topbar `sticky` con monograma 4-cuadrados (mismo SVG que `HeaderInstitucional`), título "Panel de certificaciones" y badge "Sesión mock". Sidebar fija a la izquierda en `lg+`, drawer en mobile (mismo patrón que v0 `admin-shell.tsx`). `role="banner"` único para topbar, `role="navigation"` para sidebar, `<main role="main">` para contenido.
  - `features/admin/sidebar-admin.ts/.html/.css/.spec.ts`: navegación vertical con 5 ítems placeholder (Inicio, Cursos, Alumnos, Asistencias, Certificaciones), cada uno con etiqueta mono tracking y `aria-current="page"` en el activo. SVG inline por ítem (sin librería). `role="navigation"` y `<ul>/<li>` semánticos.
  - `features/admin/login-page.ts/.html/.css/.spec.ts`: página completa de login, two-column responsive (aside con monograma + estado del sistema + protocolo + textura técnica sutil; columna con tarjeta que contiene `LoginForm`). La columna aside replica el patrón de `muestra_pagina/app/admin/login/page.tsx` (líneas 14-81) sin copiar JSX, sin credenciales demo, sin `window.location.href`.
  - `features/admin/login-form.ts/.html/.css/.spec.ts`: formulario standalone. `fieldset/legend` con legend sr-only, dos `input` (`id` institucional + `password`) con `label` asociado y `autocomplete` correcto, botón primario con `bg-ink`, alerta inline accesible (`role="alert"`, `aria-describedby`, foco al mensaje de error diferido con `setTimeout(0)` post-render). Validación local: campos requeridos y mínimos caracteres. **No envía a ningún endpoint real**: al submit válido setea el flag de sesión mock y navega a `/admin/dashboard`. **No persiste nada en `localStorage`/`sessionStorage`**. Visible en código y en UI que la auth es placeholder: subtítulo "Acceso simulado — la autenticación real se define en una fase posterior".
  - `features/admin/admin-dashboard-page.ts/.html/.css/.spec.ts`: placeholder con membrete y tres tarjetas "Próximamente" (Cursos, Asistencias, Certificaciones). Sin llamadas a API, sin mocks de datos. Sirve como verificación end-to-end del guard y de la sesión mock.
- **Sesión mock en memoria**:
  - `features/admin/mock-session.ts`: `InjectionToken<MockSession>` + servicio `@Injectable({providedIn: 'root'})` con un `signal<boolean>` (Angular 20 signals, ya en uso en el repo). Métodos `hasSession()`, `signIn()`, `signOut()`. **No persiste** a `localStorage`/`sessionStorage` (cumple D0 y las specs `admin-certificate-delivery` y `admin-certificate-emission` que prohíben almacenamiento de credenciales).
- **Guard funcional**:
  - `features/admin/admin-guard.ts`: `adminGuard: CanActivateFn` que consulta `MockSession.hasSession()` y, según el caso, permite o redirige a `/admin/login`. Pure function sin DI oculta; recibe `Router` y `MockSession` por `inject()`.
- **Tests unitarios** (Karma + ChromeHeadless, ya configurado):
  - 1 test por componente nuevo cubriendo render básico con tokens aplicados, foco visible, role ARIA, navegación por teclado.
  - Tests del guard: redirige sin sesión, permite con sesión.
  - Tests de `MockSession`: `signIn()` activa, `signOut()` desactiva, no toca `localStorage`/`sessionStorage` (spy sobre `Storage.prototype.setItem`).
  - Tests de rutas: `admin/login` no es wildcard, `admin/dashboard` exige guard, raíz `/admin` redirige correctamente.
- **Pequeño patch en `docs/frontend/00-angular20-port-v0.md`** con la sección "Estado F2-03" (~10-15 líneas) confirmando el shell admin creado, los límites explícitos (sin auth real, sin clave admin temporal, sin mocks de datos) y la dependencia con F2-04..F2-06. Confirmar y ajustar en `sdd-archive`.
- **Pequeño patch en `docs/frontend/02-sistema-visual-v0-f1-02.md`** solo si F2-03 introduce algún token nuevo (probablemente NO: reusa `--color-ink`, `--color-circuit`, `--space-*`, `--focus-ring` existentes). Decisión final en `sdd-design`.

### Excluido (no tocar)

- **Auth real**: no implementar login contra backend, no enviar la clave admin temporal desde el bundle, no usar `localStorage`/`sessionStorage` para tokens, no instalar `@auth0/angular-jwt`, `angular-oauth2-oidc`, `keycloak-angular`, `ngx-auth`, ni similares. Decisión: la clave admin temporal queda server-to-server per `docs/backend/01-contrato-api-certificados.md:534` y `openspec/specs/admin-certificate-delivery/spec.md:11`. UI admin en navegador debe pasar por cPanel Basic Auth o sesión PHP `HttpOnly`; ese wiring NO entra en F2-03.
- **Datos reales o mocks de dominio**: no listar cursos, alumnos, certificaciones, asistencias, ni siquiera con datos ficticios. Esos mocks entran en F2-04 (Cursos), F2-05 (Asistencias) y F2-06 (Certificaciones). F2-03 entrega solo la "carpeta vacía" navegable.
- **Backend / base / deploy**: NO tocar `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos. El backend admin con la clave admin temporal ya está implementado por Marcos; F2-03 es solo shell.
- **Tailwind / shadcn / CVA / lucide / fuentes web / cn() / class-variance-authority / tailwind-merge**: NO instalar. F1-02 dejó el sistema visual en CSS custom properties y SVG inline; F1-04 (otra rama) define Tailwind. F2-03 hereda la decisión de F1-02.
- **`muestra_pagina/`**: lectura segura de `app/admin/login/page.tsx` (129 líneas, layout) y de `components/admin/admin-shell.tsx` (103 líneas, layout) y `components/admin/sidebar-admin.tsx` (131 líneas, nav) y `components/admin/login-form.tsx` (230 líneas, **NO portable por credenciales demo**). **No abrir** capturas pesadas ni `prompts_stitch_v0_ifts14.md` ni `pnpm-lock.yaml`. **No modificar** ningún archivo de `muestra_pagina/`.
- **Credenciales demo de `muestra_pagina/components/admin/login-form.tsx`** (`usuario.demo@example.invalid` / `demo`, redirect `window.location.href = "/admin/dashboard"`). El nuevo `LoginForm` Angular no contiene credenciales hardcodeadas ni redirige con `window.location`.
- **FolioShell / HeaderInstitucional / BandaEstado / CampoDato**: se reusan sin modificación. F2-03 puede consumirlos desde `shared/ui/` sin tocarlos.
- **Rutas públicas existentes**: `''`, `validar/:tokenCertificacion`, `**` quedan intactas. Los tests de `app.routes.spec.ts` (8 casos) deben seguir pasando; cualquier cambio en `app.routes.ts` que rompa los asertos (ej. wildcard admin) es regresión.
- **`app.html` raíz**: hoy usa `HeaderInstitucional` global. Decisión de diseño: NO modificar `app.html` raíz. En su lugar, cada feature admin renderiza su propio shell; el `HeaderInstitucional` raíz sólo aparece en rutas públicas. Esto evita duplicar `role="banner"` y mantiene la regla F1-02 ("`HeaderInstitucional` se usa una sola vez por página raíz"). Si el `sdd-design` recomienda otra cosa, se discute antes de `apply`.
- **Persistencia real de sesión**: nada de `localStorage`, `sessionStorage`, IndexedDB, cookies propias. Sesión solo en memoria del `signal`.
- **Rama de Marcos o de otros**: no tocar `frontend/api-readiness`, `frontend/public-validation-flow`, `integration/*` ni `main`.

## Current State (Angular hoy, F2-03)

### Estructura y estado del scaffold (post F1-02)

- `apps/frontend-angular/` Angular CLI 20.3.30 standalone. Estructura por features. `package.json` sin Tailwind, sin design system, sin librerías de auth: solo `@angular/*` 20.3.0, `rxjs`, `tslib`, `zone.js` y tooling (Karma, Jasmine, TypeScript 5.9.2).
- `angular.json`: `baseHref: "/certificados/"` en producción, presupuesto `500 kB warn / 1 MB error` por bundle initial y `4 kB warn / 8 kB error` por `anyComponentStyle`. Tres configuraciones: `production`, `production-staging` (`/certificados_staging/`) y `development`. `proxy.conf.json` activo en `ng serve`. **No modificar `angular.json`**.
- `src/styles.css` (119 líneas): tokens F1-02 completos en `:root` — `--color-ink`, `--color-ink-foreground`, `--color-tech-blue`, `--color-circuit`, `--color-valid`/`-soft`, `--color-destructive`/`-soft`, `--color-warning`/`-soft`, `--color-paper`, `--color-card`, `--color-foreground`, `--color-muted`/`-foreground`, `--color-border`, `--color-ring`, `--font-sans`, `--font-mono`, `--tracking-caps*`, `--radius-*`, `--space-1..6`, `--focus-ring`, `--motion-fast`, `--layout-page-max` (56rem), `--layout-folio-max` (42rem). Foco global `:focus-visible` con `var(--focus-ring)`. `prefers-reduced-motion` desactiva animaciones. **Suficiente para F2-03**; no requiere tokens nuevos.
- `src/app/app.html` (8 líneas): skip-link + `<app-header-institucional>` + `<main id="contenido" role="main">` con `<router-outlet>` + footer simple.
- `src/app/app.ts`: `App` standalone con `ChangeDetectionStrategy.OnPush`, importa `RouterOutlet`, `HeaderInstitucional`.
- `src/app/app.routes.ts` (26 líneas): 3 rutas — `''` (landing), `validar/:tokenCertificacion` (público), `**` (not-found). Lazy via `loadComponent`.
- `src/app/app.config.ts` (30 líneas): `provideRouter(routes, withComponentInputBinding())`, `provideHttpClient()`, `VALIDATION_SOURCE` selecciona `MockValidationSource` por default.
- `src/app/features/`: 3 features — `landing/`, `not-found/`, `public-validation/`. **No existe `admin/`** aún.
- `src/app/shared/`: `certificates/` (validación) y `ui/` (4 primitivos F1-02: `BandaEstado`, `CampoDato`, `FolioShell`, `HeaderInstitucional`).
- `src/environments/`: `environment.ts` y `environment.development.ts` con `useRealApi: false` por defecto y `apiBaseUrl: '/certificados/api'`. **No agregar campos admin en `environment.ts`** en F2-03 (no hay endpoint admin al que llamar; si F2-04+ lo necesita, se discute con Marcos).
- Tests: 96/96 verdes al cierre de F1-02 (`verify-report.md` archivado). Build de producción: 263.84 kB initial / 75.22 kB transfer, dentro de presupuestos. Lazy `public-validation-page` 8.96 kB. `FolioShell` creado/testeado pero no integrado en página pública (queda para F2/F4).
- `apps/frontend-angular/src/app/app.routes.spec.ts` (73 líneas): 8 casos que validan (a) raíz carga `LandingPage` y no `PublicValidationPage`, (b) `validar/:tokenCertificacion` carga `PublicValidationPage`, (c) wildcard no redirige a `demo-valido`, (d) navegación real no termina en `demo-valido`. F2-03 agrega casos equivalentes para admin sin romper los actuales.

### Estado del sistema visual y primitivos disponibles para reuso

- **Primitivos F1-02 disponibles** (en `shared/ui/`, standalone, CSS por componente, tokens por cascada):
  - `BandaEstado` (selector `app-banda-estado`, `kind: 'valid' | 'revoked' | 'not-verifiable' | 'error' | 'loading'`, `title`, `description`, `stateLabel`, dueño único de `aria-live`/`aria-atomic`). Reusable para mensajes de error del `LoginForm` (estado `error` o `loading`).
  - `CampoDato` (directiva `[appCampoDato]` sobre `<dt>/<dd>`, variantes `default | mono | highlight`). Reusable en `AdminDashboardPage` para mostrar "Sesión activa" o "Versión" en un futuro.
  - `HeaderInstitucional` (selector `app-header-institucional`, `subtitle`, `showOnlineBadge`). Reusable en `LoginPage` con `subtitle="Acceso administrativo"` y `showOnlineBadge=false`. **No se usa dentro de `AdminShell`**: el admin tiene su propio topbar con monograma 4-cuadrados y badge "Sesión mock", no el membrete institucional de v0 (mismo principio que v0 `admin-shell.tsx` líneas 40-97: topbar admin distinto al header público).
  - `FolioShell`: **no aplica** al admin (FolioShell es composición de folio, no de pantalla admin).
- **Tokens y reglas de uso F1-02** (en `docs/frontend/02-sistema-visual-v0-f1-02.md`):
  - Paleta completa con semántica de estados. F2-03 usa principalmente `--color-ink`, `--color-ink-foreground`, `--color-circuit`, `--color-tech-blue`, `--color-border`, `--color-muted`/`-foreground`, `--color-destructive`/`-soft`, `--color-foreground`, `--color-card`, `--color-paper`, `--color-ring`.
  - Tipografía: `--font-sans` y `--font-mono`, tracking `--tracking-caps*` para labels y badges.
  - Espaciado: `--space-1..6` para padding/margin/gap; `--radius-*` para bordes.
  - Foco: `:focus-visible` global con `var(--focus-ring)`; no se redefine por componente.
  - Motion: `--motion-fast` (120ms) opcional; respetar `prefers-reduced-motion`.
  - Reglas duras: `HeaderInstitucional` una sola vez por página raíz; SVG decorativo con `aria-hidden="true"`; `BandaEstado` dueño único de la región live; pares `dt/dd` nativos con `appCampoDato`.

## Reference state (`muestra_pagina/`, lectura segura)

Inventario confirmado por F1-01 + F1-02 (archivado en `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/exploration.md` y `docs/frontend/00-angular20-port-v0.md`):

- `muestra_pagina/components/admin/admin-shell.tsx` (103 líneas): sidebar fija `lg:block w-64` con `SidebarAdmin`, drawer mobile `lg:hidden` con overlay `bg-ink/60`, topbar `sticky top-0` con `border-b border-border bg-card/90 backdrop-blur`, búsqueda `h-9 rounded-sm border border-input` (F2-03 deja la búsqueda fuera del scope), iconos `h-5 w-5` con `strokeWidth={1.75}`. F2-03 replica la **estructura** (sidebar + drawer + topbar + main) con SVG inline en lugar de lucide.
- `muestra_pagina/components/admin/sidebar-admin.tsx` (131 líneas): nav items `[{Inicio, LayoutGrid}, {Cursos, BookOpen}, {Alumnos, Users}, {Asistencias, CalendarCheck}, {Certificaciones, QrCode}]` (131 líneas restantes tienen `Settings` y `LogOut`). F2-03 replica solo los 5 ítems visibles en páginas; `Settings`/`LogOut` se difieren a F4-F6. SVG inline por ítem, sin librería.
- `muestra_pagina/app/admin/login/page.tsx` (129 líneas): two-column `lg:flex-row`, aside con monograma 4-cuadrados + título "IFTS N.° 14" + subtítulo "Bedelía Digital" + filete `bg-circuit` + copy "Sistema de gestión de certificaciones académicas" + `<dl>` con "Estado del sistema: Activo" y "Protocolo: SHA-256 / SSL" + textura técnica (grid `44px 44px` con `opacity-[0.04]`). Columna central: tarjeta `border border-border bg-card shadow-sm` con `LoginForm`. Footer institucional discreto. F2-03 replica el layout y la **composición** sin copiar JSX, sin credenciales demo, sin `Metadata` (eso es Next), sin copy que prometa autenticación real.
- `muestra_pagina/components/admin/login-form.tsx` (230 líneas): **NO portable** por su contenido (credenciales demo `usuario.demo@example.invalid` / `demo`, redirect `window.location.href = "/admin/dashboard"`, `useState` con status `idle | loading | error`). Solo la **estructura de formulario** (fieldset/legend sr-only, input con icono izquierdo, label mono tracking, botón primario `bg-ink` con `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`) y la **alerta inline** con `border-l-2 border-destructive bg-destructive-soft` son reutilizables como patrón. F2-03 usa el patrón estructural: fieldset/legend, label asociado, autocomplete correcto, foco al error. F2-03 **NO** porta los iconos (`IdCard`, `KeyRound`, `Eye`, `EyeOff`, `ShieldCheck`, `ArrowRight`, `Loader2`, `AlertTriangle` de `lucide-react`); reemplaza por texto o SVG inline simple cuando aporta.
- Otras piezas admin (`acciones-principales.tsx`, `actividad-reciente.tsx`, `bandeja-pendientes.tsx`, etc.): **fuera de F2-03**. Pertenecen a F2-04..F2-06 y F4-F6.

## Affected Areas

- `apps/frontend-angular/src/app/app.routes.ts` — **MODIFICAR** agregando bloque de rutas admin (3 entradas + redirect `/admin`) sin tocar las 3 rutas públicas existentes. Estimado: +25-35 líneas (incluye comentarios de seguridad D0 y no-clave admin temporal).
- `apps/frontend-angular/src/app/app.routes.spec.ts` — **MODIFICAR** agregando 4-6 tests específicos para admin: `/admin/login` carga `LoginPage`, `/admin/dashboard` exige `adminGuard`, `/admin` redirige correctamente, ninguna ruta admin coincide con wildcard, raíz `/admin` no colisiona con `validar/:tokenCertificacion`. Estimado: +50-70 líneas.
- `apps/frontend-angular/src/app/features/admin/` — **CREAR** directorio con 5 features:
  - `admin/admin-shell.ts/.html/.css/.spec.ts`: compositivo con topbar + sidebar + main + footer. Estimado: 200-260 líneas total.
  - `admin/sidebar-admin.ts/.html/.css/.spec.ts`: navegación con 5 ítems. Estimado: 120-160 líneas total.
  - `admin/login-page.ts/.html/.css/.spec.ts`: página completa two-column. Estimado: 180-240 líneas total.
  - `admin/login-form.ts/.html/.css/.spec.ts`: formulario standalone. Estimado: 160-220 líneas total.
  - `admin/admin-dashboard-page.ts/.html/.css/.spec.ts`: placeholder con 3 tarjetas. Estimado: 120-160 líneas total.
- `apps/frontend-angular/src/app/features/admin/mock-session.ts` y `admin-guard.ts` — **CREAR**: `InjectionToken` + servicio `MockSession` con `signal<boolean>` y guard funcional `CanActivateFn`. Estimado: 60-90 líneas total con sus tests.
- `apps/frontend-angular/src/app/features/admin/index.ts` (opcional) — barrel export para imports limpios. Decisión en `sdd-design`; probablemente NO necesario (Angular CLI carga por ruta).
- `docs/frontend/00-angular20-port-v0.md` — **MODIFICAR** con patch mínimo en la sección "Estado de la app Angular 20" agregando subsección F2-03 (~10-15 líneas): rutas admin, archivos creados, límites explícitos. Confirmar y ajustar en `sdd-archive`.
- `openspec/changes/f2-03-admin-login-shell/` — **CREAR** con los 7 artefactos OpenSpec (`proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md`; `exploration.md` se crea en este turno).

### Out of affected areas (no tocar)

- `apps/frontend-angular/src/styles.css` (tokens F1-02 suficientes; no se agregan tokens nuevos en F2-03).
- `apps/frontend-angular/src/app/app.html` y `app.ts` (no se modifica el shell raíz; cada feature admin renderiza el suyo).
- `apps/frontend-angular/src/app/shared/certificates/*` (lógica de validación intacta, M3-06 verde + F1-02 verde).
- `apps/frontend-angular/src/app/shared/ui/*` (4 primitivos F1-02 reusables sin tocar).
- `apps/frontend-angular/src/app/features/landing/*`, `features/not-found/*`, `features/public-validation/*` (placeholders y validación pública intactos; toman tokens por cascada).
- `apps/frontend-angular/src/environments/*` (intactos; F2-03 no agrega endpoint admin al environment).
- `apps/frontend-angular/angular.json`, `package.json`, `tsconfig*.json`, `proxy.conf.json`, `karma.conf.*` (intactos; no se modifica config).
- `apps/frontend-angular/src/index.html`.
- `muestra_pagina/` (lectura segura ya listada arriba; no se modifica).
- `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos.
- Cualquier archivo bajo `openspec/changes/` distinto a `f2-03-admin-login-shell/`.

## Approaches (resumen comparativo)

| Approach | Pros | Con | Effort | Notas |
|---|---|---|---|---|
| **A. MockSession en memoria (signal) + adminGuard funcional + LoginForm con validación local sin endpoint (RECOMENDADO)** | Cero dependencias nuevas; cumple specs `admin-certificate-delivery`/`admin-certificate-emission` (no clave admin temporal en bundle, no localStorage); compatible con presupuesto `4 kB warn / 8 kB error` por componente; reusa tokens F1-02; tests Karma+Jasmine sin infra nueva; signal Angular 20 es la API idiomática. | "Login" no es real (es placeholder visible); dashboard no tiene datos (es placeholder visible). | Low-Medium | Encaja con `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:867-877` y `docs/backend/01-contrato-api-certificados.md:534` ("auth admin simple temporal con la clave admin temporal; no portar credenciales demo"). |
| B. Auth real con la clave admin temporal enviado desde Angular (header literal o cookie propia) | "Funciona" sin más cambios backend. | **PROHIBIDO** por `openspec/specs/admin-certificate-delivery/spec.md:11` y `:41-46` y `admin-certificate-emission/spec.md:73-78` y `admin-auth/spec.md`: clave admin temporal NO DEBE aparecer en bundle Angular, localStorage, sessionStorage, ni en headers salientes del browser. | — | Descartado. |
| C. Auth real con cPanel Basic Auth o PHP HttpOnly session (lo que las specs recomiendan para UI admin en browser) | Es la solución correcta per specs. | Requiere tocar `apps/backend-php/` (login PHP + cookie `HttpOnly` `SameSite`), `deploy/`, `.htaccess`, y `apps/frontend-angular/` con proxy de credenciales; alcance real de F4-F6, **no de F2-03**. | High | Diferido a F4-F6 según `docs/frontend/00-angular20-port-v0.md:39-54` (admin, PDF, QR, revocación, configuración institucional quedan para ciclos posteriores con spec previa). F2-03 no toca eso. |
| D. Auth real con `ngx-auth` o `@auth0/angular-jwt` contra un endpoint nuevo `/admin/auth/login` | Flujo "estándar" OAuth. | Implica instalar 1-2 dependencias (prohibido en F2-03 per `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:874`); no hay endpoint backend; no hay spec de auth aprobada. | High | Descartado. |
| E. Auth real contra `/certificados/api/admin/certificados` con la clave admin temporal enviado por un servicio Angular que lee la clave de un asset en `public/` | Evita al usuario pegar la clave. | clave admin temporal terminaría en el bundle (mismo problema que B). | — | Descartado. |

### Decisión recomendada: Approach A

- Cumple la regla "No instalar dependencias no aprobadas" sin negociar.
- Cumple las specs `admin-auth`, `admin-certificate-delivery`, `admin-certificate-emission`, `backend-contrato-api-certificados` que prohíben clave admin temporal en browser.
- Encaja con `apps/frontend-angular/AGENTS.md:11` ("Angular 20, estructura por features, separar componentes/servicios/modelos") y con el scaffold verde de F1-02.
- Deja explícito que la auth es placeholder (subtítulo visible + comentario en el código + tests que verifican que no se llama a endpoint).
- Prepara el terreno para F2-04..F2-06 (cursos, asistencias, certificaciones) que solo agregarán rutas bajo `/admin/...` y componentes, sin tocar el shell.
- Presupuesto: ~800-1100 líneas (5 features × ~200 + mock-session + guard + tests de rutas + patch de docs). Margen ~400-700 líneas para imprevistos y tests extras. Bien por debajo de 1500.

## Decisiones a resolver en `sdd-propose`

1. **Subtítulo visible de la pantalla de login**: recomendar "Acceso simulado — la autenticación real se define en una fase posterior" (texto neutro, honesto, sin prometer auth real). Decisión final con Matías.
2. **Items del `SidebarAdmin`**: 5 ítems placeholder (Inicio, Cursos, Alumnos, Asistencias, Certificaciones) según v0. `Configuración` y `Cerrar sesión` se difieren a F4-F6. Confirmar con Matías si quiere ver el botón "Cerrar sesión" ya en F2-03 (afecta mock-session: `signOut()` + `navigate(['/admin/login'])`).
3. **Redirección `/admin`**: si hay sesión mock → `/admin/dashboard`; si no → `/admin/login`. Decisión estándar; confirmar.
4. **Patch a `00-angular20-port-v0.md`**: sí, mínimo, en la sección "Estado de la app Angular 20". Decisión final en `sdd-archive`.
5. **Delta a specs base**: recomendación inicial **NO**. Las specs `frontend-angular-shell`, `frontend-design-system-readiness`, `admin-auth`, `admin-certificate-delivery`, `admin-certificate-emission` y `backend-contrato-api-certificados` ya cubren la regla "no clave admin temporal en bundle, no inventar pantallas sin diseño aprobado, no auth real en F2-03". Delta solo si aparece un criterio nuevo realmente portable (por ejemplo, "toda pantalla admin DEBE usar `AdminShell` con `SidebarAdmin`"); en ese caso el delta va a `frontend-angular-shell` o a un spec nuevo `frontend-admin-shell`. Decisión en `sdd-propose`.

## Tokens que F2-03 reusa (no introduce nuevos)

- Color: `--color-ink`, `--color-ink-foreground`, `--color-circuit`, `--color-tech-blue`, `--color-border`, `--color-muted`, `--color-muted-foreground`, `--color-destructive`, `--color-destructive-soft`, `--color-foreground`, `--color-card`, `--color-paper`, `--color-ring`, `--color-warning`, `--color-warning-soft`.
- Tipografía: `--font-sans`, `--font-mono`, `--tracking-caps`, `--tracking-caps-tight`, `--tracking-caps-membrete`.
- Radio: `--radius-sm`, `--radius-md`, `--radius-lg`.
- Espaciado: `--space-1..6`.
- Foco: `--focus-ring` (heredado del global `:focus-visible`).
- Motion: `--motion-fast`.
- Layout: `--layout-page-max` (si el shell admin se ajusta al ancho institucional).

## Componentes candidatos (F2-03 produce los 5 nuevos + 2 servicios)

| Componente Angular | Patrón v0 de referencia | Por qué entra en F2-03 | Por qué NO entra (queda para ciclos siguientes) |
|---|---|---|---|
| `AdminShell` | `components/admin/admin-shell.tsx` | Base operativa para todas las pantallas F2-04..F2-06 y F4-F6. | — |
| `SidebarAdmin` | `components/admin/sidebar-admin.tsx` | Navegación interna mínima; si no está en F2-03, los siguientes ciclos la duplican. | — |
| `LoginPage` | `app/admin/login/page.tsx` | Punto de entrada admin; el ciclo la pide explícitamente ("login visual mínimo"). | — |
| `LoginForm` | `components/admin/login-form.tsx` (estructura, no credenciales) | Punto de entrada admin; patrón de formulario con fieldset/legend, label, autocomplete, foco a error. | — |
| `AdminDashboardPage` | `app/admin/dashboard/page.tsx` (placeholder) | Verificación end-to-end del guard y la sesión mock. | Datos reales, KPIs, bandeja de pendientes, actividad reciente (F4-F6). |
| `MockSession` | — | In-memory session con `signal<boolean>`; sin persistencia. | Persistencia real o refresh-token (F4-F6 con cPanel Basic Auth o PHP HttpOnly). |
| `adminGuard` | — | Bloquea `/admin/dashboard` y `/admin/*` sin sesión. | Permisos por rol (futuro). |
| `AccionesPrincipales` | `components/admin/acciones-principales.tsx` | — | Admin F2-04+. No entra. |
| `BandejaPendientes` | `components/admin/bandeja-pendientes.tsx` | — | Admin F2-04+. No entra. |
| `ActividadReciente` | `components/admin/actividad-reciente.tsx` | — | F4-F6. No entra. |
| `ConfiguracionInstitucional` | `components/admin/configuracion-institucional.tsx` | — | Configuración institucional (F4-F6 con spec previa de configuración). No entra. |
| `CursoEditor`, `AsistenciasEditor`, `NuevaCertificacionEditor`, `ListaCursos`, `ListaAlumnos`, `ListaCertificaciones`, `ExpedienteCertificacion`, `RevocarCertificacion`, `EntregaManual`, `VistaPreviaPdf` | `components/admin/*.tsx` | — | F2-04 (Cursos y fechas), F2-05 (Asistencias), F2-06 (Certificaciones) y F4-F6. No entran. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Implementar "auth real" o transmitir la clave admin temporal desde el browser | Low (regla clara en specs y AGENTS) | `admin-auth`/`admin-certificate-delivery`/`admin-certificate-emission` lo prohíben; tests verifican que no hay la clave admin temporal literal en `dist/` (`grep` en `verify-report.md`); subtítulo visible en `LoginPage` y `LoginForm` aclara que es placeholder. |
| Hardcodear credenciales demo (`usuario.demo@example.invalid` / `demo` de v0) | Low | LoginForm no contiene literales de credenciales; los `assert` en `login-form.spec.ts` verifican que la única credencial "válida" del mock es vacío o cualquier string de al menos 1 char; el form setea `signIn()` sin comparar credenciales. Si F2-03 quiere ser más explícito, el test puede verificar que `setItem` no se llama con nada que parezca credencial. |
| Exceder 1500 LOC en una sola PR | Low | Estimación ~800-1100 líneas. Margen 400-700. Si pasa, `sdd-tasks` divide en PRs encadenados. |
| Romper 96/96 tests existentes de F1-02 | Low-Medium | Tests de `app.routes.spec.ts` actuales verifican 3 rutas públicas; F2-03 agrega admin sin tocar las 3 públicas; nuevos tests admin no tocan asertos existentes. |
| Romper presupuesto `4 kB warn / 8 kB error` por `anyComponentStyle` | Low | `LoginPage` con two-column responsive + textura técnica puede tocar 3-4 kB. `AdminShell` con sidebar + topbar puede tocar 3 kB. `LoginForm` con fieldset + alerta inline puede tocar 2-3 kB. Reducir si warn. |
| Conflicto con `HeaderInstitucional` raíz que ya marca `role="banner"` | Medium | El admin NO usa `HeaderInstitucional` raíz; `AdminShell` define su propio topbar con `role="banner"`. Esto significa que el `app.html` raíz no debe envolver las rutas admin en otro `header`. Solución: el shell raíz no es condicional; el admin simplemente ignora el `HeaderInstitucional` raíz renderizando su propio layout completo. Decisión final en `sdd-design` (opciones: (a) el `app.html` raíz no tiene `<app-header-institucional>`, lo agrega cada feature pública; (b) `AdminShell` no incluye topbar propio y se basa en el raíz). Recomendación: opción (a) — el `app.html` raíz solo tiene skip-link + `<main>` + footer; las features públicas (landing, validación, futura landing admin) incluyen su propio `HeaderInstitucional`. Pero esto es cambio de F1-02 que el ciclo debe coordinar. Alternativa más conservadora: dejar `app.html` raíz intacto y `AdminShell` define su propio topbar; el `HeaderInstitucional` raíz sigue apareciendo en `/admin/*` también (no es grave, es header institucional + topbar admin). Decisión en `sdd-design`. |
| Pérdida del patrón D0 (no DNI completo, no token completo en UI/logs) | Low | El admin no muestra datos personales en F2-03 (es placeholder); cuando F2-04+ agregue datos, las specs ya cubren el enmascarado (`admin-certificate-consulta/spec.md:11` con `documentMasked`). F2-03 no introduce nada que filtre. |
| `muestra_pagina/app/admin/login/page.tsx` cambia mientras se porta | Low | Snapshot export; rama actual no modifica v0. |
| `sdd-propose` decide delta a spec base | Low | Recomendación: NO delta. Las specs ya cubren las reglas. |
| Auto-commit / auto-push | Low (regla clara) | `AGENTS.md:25`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:875` y la sección de Git en la guía exigen aprobación explícita de Matías en el mismo turno + diff-confirmation gate + pre-push safety. OpenCode solo propone comandos. |
| Romper accesibilidad | Low | `AdminShell` con `role="banner"` único, `SidebarAdmin` con `role="navigation"` y `<ul>/<li>` semánticos, `aria-current="page"` en el ítem activo; `LoginForm` con fieldset/legend sr-only, label asociado, `aria-describedby` para el mensaje de error, foco al error tras submit inválido. Foco global preservado. `prefers-reduced-motion` respetado. |
| `proxy.conf.json` reenvía `/certificados/api` y admin usa prefijo `/admin/...` que NO debe pasar por la API pública | Low | Las rutas admin en Angular son client-side; no hay llamadas HTTP en F2-03. Si en F2-04+ se agrega endpoint admin, NO debe pasar por el proxy público (es server-to-server, vía cPanel Basic Auth o PHP HttpOnly, no desde el browser). Documentar en `sdd-design`. |

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | ~800-1100 (5 features × ~200 + mock-session + admin-guard + tests de rutas + patch de docs) |
| Riesgo de exceder el presupuesto de 1500 líneas | **Low** (margen 400-700 líneas) |
| PRs encadenados recomendados | **No** (single-pr) |
| Estrategia de entrega | single-pr sobre `frontend/admin-foundation` |
| Decisión antes de apply | **Sí** — `sdd-propose` debe confirmar: (a) subtítulo visible del login, (b) si se incluye botón "Cerrar sesión" en `SidebarAdmin` o se difiere, (c) si se hace delta a spec base, (d) si se parchea `00-angular20-port-v0.md`, (e) decisión sobre `app.html` raíz (¿admin doble banner o se separa? — ver riesgo). |
| Tiempo estimado de revisión | Medio: 1 PR con 5 features nuevos + 2 servicios + 1 routes patch + 1 tests patch + 1 doc patch; tests verde; sin deploy, sin build prod nuevo, sin backend. |
| `Decision needed before apply` | **Yes** (5 decisiones listadas arriba) |
| `Chained PRs recommended` | **No** |
| `400-line budget risk` | **Low** (single PR ~1000 líneas) |
| `1500-line budget risk` | **Low** (margen 400-700) |

## Relevant files (read in this exploration)

- `AGENTS.md` (133 líneas) — reglas operativas, rama sugerida, política Git, sección sobre `muestra_pagina/`, clave admin temporal, DNI completo.
- `apps/frontend-angular/AGENTS.md` (18 líneas) — reglas del frontend Angular.
- `docs/00-indice-general.md` (52 líneas) — ruta de lectura mínima vigente.
- `docs/opencode/optimizacion-tokens.md` (105 líneas) — uso de `RTK`, perfil eficiente, Graphify solo para Marcos.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (extracto: F2-03 líneas 853-899) — definición exacta del ciclo y su rama.
- `docs/frontend/00-angular20-port-v0.md` (211 líneas) — fuente de verdad del port, división de responsabilidades Marcos/Matías, inventario prompts 4-22, tokens visuales observados, componentes candidatos, riesgos, estado del scaffold M3-06/F1-02.
- `docs/frontend/02-sistema-visual-v0-f1-02.md` (118 líneas) — tokens F1-02, primitivos disponibles, reglas de uso, fuera de alcance, verificación.
- `apps/frontend-angular/package.json` (49 líneas) — confirmar ausencia de Tailwind/shadcn/lucide/auth libs.
- `apps/frontend-angular/angular.json` (133 líneas) — presupuestos y base href.
- `apps/frontend-angular/src/styles.css` (119 líneas) — tokens completos.
- `apps/frontend-angular/src/app/app.html`, `app.css`, `app.ts`, `app.routes.ts`, `app.config.ts`, `app.routes.spec.ts`, `app.config.spec.ts` — shell raíz y rutas.
- `apps/frontend-angular/src/app/features/landing/`, `features/not-found/`, `features/public-validation/` — features existentes.
- `apps/frontend-angular/src/app/shared/ui/` (4 primitivos F1-02): `BandaEstado`, `CampoDato`, `FolioShell`, `HeaderInstitucional`.
- `apps/frontend-angular/src/app/shared/certificates/` — validación intacta (no se toca en F2-03).
- `apps/frontend-angular/src/environments/environment.ts` y `environment.development.ts` — confirmar `useRealApi: false` y `apiBaseUrl: '/certificados/api'`.
- `muestra_pagina/components/admin/admin-shell.tsx` (103 líneas) — patrón del shell admin.
- `muestra_pagina/components/admin/sidebar-admin.tsx` (131 líneas) — patrón de la navegación.
- `muestra_pagina/app/admin/login/page.tsx` (129 líneas) — layout de la pantalla de login.
- `muestra_pagina/components/admin/login-form.tsx` (230 líneas) — patrón de formulario (no portar credenciales demo).
- `openspec/specs/frontend-design-system-readiness/spec.md` (73 líneas) — base del sistema visual.
- `openspec/specs/admin-auth/spec.md` — gate la clave admin temporal server-to-server; UI admin en browser debe usar cPanel Basic Auth o PHP HttpOnly.
- `openspec/specs/admin-certificate-delivery/spec.md` (líneas 11, 41-46) — clave admin temporal no en bundle/Angular/localStorage.
- `openspec/specs/admin-certificate-emission/spec.md` (líneas 73-78) — clave admin temporal no en bundle/Angular.
- `openspec/specs/backend-contrato-api-certificados/spec.md` (línea 534) — clave admin temporal no en bundles Angular.
- `docs/backend/01-contrato-api-certificados.md` (líneas 22-40, 104, 133, 145, 532-534) — endpoints admin existentes con la clave admin temporal, todos server-to-server.
- `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (71 líneas) — auditoría F1-01 con confirmación de inventario.
- `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/exploration.md` (279 líneas) — precedente estructural de `explore.md` con secciones in/out/affected/risks/forecast/ready.
- Engram: 0 observaciones previas específicas de F2-03. Contexto: 5 sesiones recientes de revisión y merge de F1-02 + PR #33 mergeado; F1-02 archivado limpio.

## Do not touch (read-only this cycle)

- `apps/frontend-angular/src/styles.css` (tokens F1-02 suficientes).
- `apps/frontend-angular/src/app/app.html` raíz (decisión en `sdd-design`; si se decide opción conservadora "no tocar", queda intacto).
- `apps/frontend-angular/src/app/shared/certificates/*` (96/96 tests verdes; intactos).
- `apps/frontend-angular/src/app/shared/ui/*` (4 primitivos F1-02; reusables sin tocar).
- `apps/frontend-angular/src/app/features/landing/*`, `features/not-found/*`, `features/public-validation/*` (placeholders y validación pública intactos; toman tokens por cascada).
- `apps/frontend-angular/src/environments/*` (intactos; F2-03 no agrega endpoint admin al environment).
- `apps/frontend-angular/angular.json`, `package.json`, `tsconfig*.json`, `proxy.conf.json`, `karma.conf.*`, `src/index.html` (intactos; no se modifica config).
- `muestra_pagina/` salvo lectura segura de `app/admin/login/page.tsx`, `components/admin/admin-shell.tsx`, `components/admin/sidebar-admin.tsx`, `components/admin/login-form.tsx`. **No abrir** capturas pesadas, `prompts_stitch_v0_ifts14.md`, `pnpm-lock.yaml`, ni otros `app/admin/*/page.tsx`.
- `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos.
- Cualquier archivo bajo `openspec/changes/` distinto a `f2-03-admin-login-shell/`.
- Ramas no mergeadas: `frontend/v0-design-system-f1-02` ya mergeada vía PR #33. F2-03 parte de `main` actualizado.

## Ready for Proposal

**Yes**, con 5 decisiones a resolver en `sdd-propose`:

1. **Subtítulo visible de la pantalla de login**: "Acceso simulado — la autenticación real se define en una fase posterior" (recomendación).
2. **Botón "Cerrar sesión" en `SidebarAdmin`**: incluir ya en F2-03 (con `signOut()` mock + `navigate(['/admin/login'])`) o diferir a F4-F6.
3. **Delta a spec base**: recomendación inicial **NO**. Si se aprueba, el delta iría a `frontend-angular-shell` o a un spec nuevo `frontend-admin-shell` con reglas como "toda pantalla admin DEBE usar `AdminShell` con `SidebarAdmin`" y "ningún código Angular puede contener la clave admin temporal literal". El test de "no clave admin temporal en `dist/`" podría vivir en una nueva spec `frontend-admin-shell` o como criterio añadido a `admin-certificate-delivery`.
4. **Patch a `00-angular20-port-v0.md`**: sí, mínimo, en la sección "Estado de la app Angular 20" agregando subsección F2-03. Decisión final en `sdd-archive`.
5. **Decisión sobre `app.html` raíz y `HeaderInstitucional` en admin**: (a) admin doble banner (institucional raíz + topbar admin propio — `role="banner"` duplicado, anti-patrón), (b) refactor de `app.html` para que solo tenga skip-link + `<main>` + footer y cada feature pública incluya su `HeaderInstitucional` (cambio F1-02 retroactivo, no recomendado en F2-03), (c) admin sin `HeaderInstitucional` propio y el raíz queda en admin también (subóptimo), (d) `AdminShell` detecta ruta y oculta el raíz vía CSS (hacky). **Recomendación: (a)** — el `role="banner"` del topbar admin pisa al del `HeaderInstitucional` raíz en la práctica; documentar como tech debt para refactor futuro. Confirmar con Matías.

**Próxima fase recomendada**: `sdd-propose`. Tamaño estimado: 100-150 líneas de `proposal.md`, 5 decisiones explícitas con respuesta de Matías, y forecast de revisión.

**Estructura esperada del change folder**:
```
openspec/changes/f2-03-admin-login-shell/
├── exploration.md         (este archivo)
├── proposal.md            (sdd-propose)
├── design.md              (sdd-design)
├── tasks.md               (sdd-tasks)
├── specs/                 (sdd-spec, solo si se aprueba delta)
├── apply-progress.md      (sdd-apply)
├── verify-report.md       (sdd-verify)
└── archive-report.md      (sdd-archive)
```

**Mensaje de commit sugerido** (a proponer en `sdd-archive`, no a ejecutar en este turno):
`feat(frontend): preparar shell administrativo y login placeholder (F2-03)`.
