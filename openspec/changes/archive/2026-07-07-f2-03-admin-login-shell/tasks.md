# Tasks: F2-03 — Login y shell administrativo

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | 900–1200 (según `design.md`) |
| Riesgo presupuesto 1500 líneas (proyecto) | **Exceeded** — medición final: tracked 232 + new `features/admin/` 1351 = ~1583 producto/docs (excluye OpenSpec archive) |
| Chained PRs recomendados | No — `size:exception` aprobado por mantenedor (Matías, 2026-07-07) |
| Estrategia de entrega | single-pr sobre `frontend/admin-foundation` con `size:exception` (sin split) |
| Chain strategy | N/A |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: High
1500-line budget risk: **Exceeded** → **`size:exception` aprobado** (medición final post pre-PR fixes: ~1583 producto/docs)

> El proyecto ifts14 opera con presupuesto de revisión de **1500 líneas** (override del default 400 del skill `sdd-tasks`). La línea `400-line budget risk` se conserva por contrato literal del skill; aplica el override del proyecto al tomar la decisión final.
> **Actualización post-fixes pre-PR (2026-07-07)**: la medición final verificada es tracked 232 + new `features/admin/` 1351 = ~1583 líneas de producto/docs, excluyendo artefactos OpenSpec archivados. Esto **excede levemente** el presupuesto de 1500 para producto/docs. El forecast original (Low) correspondía al estado previo a los fixes H1..H5 y quedó desactualizado.
> **Decisión del mantenedor (2026-07-07)**: Matías aceptó `size:exception` ("Aceptar excepción") antes de la preparación del PR. No se realiza split de PR. La evidencia OpenSpec archivada permanece en el mismo PR salvo cambio posterior.

### Suggested Work Units

| Unit | Meta | Likely PR | Notas |
|------|------|-----------|-------|
| 1 | F2-03 completo (single PR) | PR 1 | base `frontend/admin-foundation`; incluye tests, checks negativos y patch documental |

## Phase 1: Foundation (Mock session + guard)

- [x] 1.1 Crear `apps/frontend-angular/src/app/features/admin/mock-session.ts` con `InjectionToken<MockSession>`, servicio `@Injectable({ providedIn: 'root' })` y `signal<boolean>` interno.
- [x] 1.2 Exponer `isActive: Signal<boolean>`, `hasSession(): boolean`, `signIn(): void`, `signOut(): void`. Sin storage, sin red, sin claves.
- [x] 1.3 Crear `apps/frontend-angular/src/app/features/admin/admin-guard.ts` con `adminGuard: CanActivateFn`; recibe `Router` y `MockSession` por `inject()`. La ruta `/admin` se resuelve con `redirectTo` a `/admin/dashboard` (Angular exige `component`/`redirectTo`/`children` por ruta), donde aplica `adminGuard`. No se define un guard de índice separado.
- [x] 1.4 Redactar `mock-session.spec.ts` y `admin-guard.spec.ts`: `signIn` activa, `signOut` desactiva, no invoca `Storage.prototype.setItem`, guard redirige a `/admin/login` sin sesión.
- [x] 1.5 `npm run test:ci` debe pasar verde antes de continuar a Phase 2. (143 SUCCESS verificado)

## Phase 2: Shell y sidebar admin

- [x] 2.1 Crear `features/admin/admin-shell.{ts,html,css,spec.ts}` con slots `topbar`, `sidebar`, `main`, `footer`; topbar `sticky` con monograma 4-cuadrados y badge "Sesión mock"; `role="banner"` único.
- [x] 2.2 Crear `features/admin/sidebar-admin.{ts,html,css,spec.ts}` con 5 ítems (Inicio, Cursos, Alumnos, Asistencias, Certificaciones) y SVG inline; `role="navigation"`, `<ul>/<li>`, `aria-current="page"` en activo.
- [x] 2.3 Botón "Cerrar sesión" en `SidebarAdmin` o `AdminShell`: invoca `signOut()` y `Router.navigate(['/admin/login'])`.
- [x] 2.4 Specs de landmarks, `aria-current`, foco visible y responsive estructural para `AdminShell` y `SidebarAdmin`.

## Phase 3: Login y dashboard placeholder

- [x] 3.1 Crear `features/admin/login-page.{ts,html,css,spec.ts}` con layout two-column responsive (aside con monograma + estado del sistema + protocolo + textura técnica + tarjeta con `LoginForm`).
- [x] 3.2 Crear `features/admin/login-form.{ts,html,css,spec.ts}` con `fieldset/legend sr-only`, dos `input` con `label` asociado, `autocomplete` correcto, validación local, alerta `role="alert"` con `aria-describedby`, foco al error.
- [x] 3.3 Mostrar subtítulo visible "Acceso simulado — la autenticación real se define en una fase posterior". Nunca usar `window.location.href`.
- [x] 3.4 Crear `features/admin/admin-dashboard-page.{ts,html,css,spec.ts}` con 3 tarjetas "Próximamente: Cursos / Asistencias / Certificaciones". Sin datos, sin llamadas a API.
- [x] 3.5 Specs DOM de `LoginForm`, `LoginPage`, `AdminDashboardPage`: render básico, foco, errores, subtítulo visible, ausencia de `fetch`/`HttpClient`.

## Phase 4: Routing y tests de rutas

- [x] 4.1 Modificar `apps/frontend-angular/src/app/app.routes.ts`: agregar bloque `/admin/login`, `/admin` (redirect), `/admin/dashboard` antes del wildcard `**`; comentarios inline que recuerden D0 y la prohibición de la clave admin temporal en bundle.
- [x] 4.2 Modificar `apps/frontend-angular/src/app/app.routes.spec.ts`: casos para `/admin/login` carga `LoginPage`; `/admin/dashboard` exige `adminGuard`; `/admin` redirige según sesión; wildcard no captura `/admin/*`; rutas públicas intactas.
- [x] 4.3 (Solo si la decisión de `design.md` lo exige) Modificar `app.{ts,html,css,spec.ts}` para que el shell raíz sea route-aware: en `/admin/*` no renderiza `HeaderInstitucional` raíz ni `main#contenido` público. Documentar la decisión.
- [x] 4.4 `npm run test:ci` verde sobre el set completo y `npm run build` sin warnings nuevos fuera del presupuesto Angular (`4 kB warn / 8 kB error` por `anyComponentStyle`). (143 SUCCESS; build sin warnings)

## Phase 5: Verificación, checks negativos, docs y archive

- [x] 5.1 Check negativo de la clave admin temporal: grep negativo de la literal en `apps/frontend-angular/src` debe devolver 0. Repetir en `dist/` post-build.
- [x] 5.2 Check negativo storage: `grep -RIn "localStorage\|sessionStorage\|indexedDB\|IndexedDB\|document\.cookie" apps/frontend-angular/src/app/features/admin` debe devolver 0.
- [x] 5.3 Check negativo red: `grep -RIn "fetch(\|HttpClient\|http\.get\|XMLHttpRequest\|navigator\.sendBeacon" apps/frontend-angular/src/app/features/admin` debe devolver 0.
- [x] 5.4 Spies en `MockSession.spec.ts` y `LoginForm.spec.ts` sobre `Storage.prototype.setItem`, `fetch` y `HttpClient` para confirmar que no se invocan en el flujo admin.
- [x] 5.5 Patch mínimo en `docs/frontend/00-angular20-port-v0.md` (sección "Estado de la app Angular 20" → subsección "Estado F2-03"): archivos creados, límites explícitos (sin auth real, sin la clave admin temporal, sin mocks de dominio) y handoff a F2-04..F2-06.
- [x] 5.6 `sdd-verify` para producir `verify-report.md` con diff de tests, build, presupuesto Angular y resultado de los 3 checks negativos. (`verify-report.md` creado; verdict PASS WITH WARNINGS)
- [x] 5.7 `sdd-archive` para mover el change folder a `openspec/changes/archive/2026-07-07-f2-03-admin-login-shell/` y actualizar `docs/frontend/` si corresponde. (**Cerrado 2026-07-07**: change folder archivado; ver `archive-report.md`. Doc `docs/frontend/` ya parcheada en 5.5/H3, sin nuevas modificaciones en archive.)

## Reglas operativas (resumen)

- No backend, deploy, base, material privado, auth real, storage/cookies, datos mock de dominio, Tailwind/shadcn/lucide/CVA/libs de auth, ni copia literal de React/Next.
- No tocar `angular.json`, `package.json`, `tsconfig*.json`, `proxy.conf.json`, `karma.conf.*`, `src/index.html`, `src/styles.css`, `src/environments/*`, ni los features `landing/`, `not-found/`, `public-validation/`, `shared/ui/`, `shared/certificates/`.
- No portar credenciales demo de `muestra_pagina/components/admin/login-form.tsx` ni `window.location.href`; no abrir capturas pesadas de `muestra_pagina/`.
- Commits y push requieren aprobación explícita de Matías en el mismo turno, con diff-confirmation y pre-push safety.

## Fix correctivo post apply-gate FAIL (2026-07-07)

- [x] G1 Provider `MOCK_SESSION` a nivel app en `app.config.ts` (`useExisting: InMemoryMockSession`) + test en `app.config.spec.ts` que fallaría sin el provider.
- [x] G2 Comentarios de la clave admin temporal reemplazados por wording neutral en `app.routes.ts`, `mock-session.ts`, `admin-guard.ts`. `grep` negativo devuelve 0 en src y dist.
- [x] G3 Se evita definir un guard de índice separado: `/admin` usa `redirectTo` + `adminGuard` en `/admin/dashboard`. Se removió el `describe` residual del spec de guard de índice en `admin-guard.spec.ts`.
- [x] G4 Foco al alert de error diferido inicialmente con `queueMicrotask` tras el render + test que verifica `document.activeElement` es el alert. **(Reemplazado por `setTimeout(0)` en G7 tras gate review: la microtask corría antes del flush de CD de zone y el `@if(errorMsg())` aún no renderizaba el `<p>`.)**
- [x] G5 `npm run test:ci` 143/143 SUCCESS; `npm run build` verde sin warnings (274.43 kB / 78.80 kB initial).

## Fix correctivo post second apply-gate FAIL (2026-07-07)

- [x] G6 `(ngSubmit)` no disparaba `enviar()` porque `LoginForm` (standalone) no importaba `FormsModule`. Agregado `imports: [FormsModule]` al componente — sin eso el binding de plantilla `(ngSubmit)` no existe en runtime.
- [x] G7 Foco diferido cambiado de `queueMicrotask` a `setTimeout(0)`: la microtask corre antes del flush de CD de zone (`onMicrotaskEmpty`) y el `@if(errorMsg())` aún no renderiza el `<p>`. La macrotask corre después del render, estable en el flujo real de `ngSubmit`.
- [x] G8 Test de foco reescrito para ejercitar el path real: `form.dispatchEvent(new Event('submit'))` dispara `ngSubmit` (via `FormsModule`), luego dos `await setTimeout(0)` cubren flush de CD + el timer del componente, y se aserta `document.activeElement === #login-error`. Eliminado el patrón de falso positivo (llamada directa a `enviar()`).
- [x] G9 `npm run test:ci` 143/143 SUCCESS; `npm run build` verde sin warnings (278.91 kB / 80.06 kB initial; +4.5 kB por FormsModule, dentro del presupuesto Angular).
- [x] G10 Checks negativos re-verificados: clave admin temporal, storage y red devuelven 0 en `src` y `dist`.

## Fix correctivo pre-PR review (2026-07-07)

- [x] H1 Sidebar navigation: `SidebarAdmin` reescrito para usar `RouterLink` en `/admin/dashboard` (única ruta definida); los 4 ítems futuros (Cursos/Alumnos/Asistencias/Certificaciones) se renderizan como `<button disabled aria-disabled="true">` sin href, evitando que `[href]` absolutos escapen el base href `/certificados/`, recarguen la app y pierdan la sesión mock en memoria. Template + CSS `.nav-placeholder` + spec actualizado (1 link + 4 placeholders, aserción de ausencia de hrefs inseguros, `aria-current` preservado).
- [x] H2 Literales de la clave admin temporal reemplazados por wording neutral en `docs/frontend/00-angular20-port-v0.md`. Grep negativo en Angular `src` y `docs/frontend` devuelve 0.
- [x] H3 Doc `docs/frontend/00-angular20-port-v0.md` actualizada: referencia al guard de índice removida (solo `adminGuard`), 146/146 tests, tamaños de build corrientes (283.68 kB / 81.34 kB initial; admin-shell 10.38 kB / 2.78 kB, login-page 29.32 kB / 6.97 kB).
- [x] H4 `enviado` signal muerto removido de `login-form.ts` (no leído en plantilla ni tests).
- [x] H5 Re-run: `npm run test:ci` 146/146 SUCCESS; `npm run build` verde sin warnings. Verify-report y este tasks actualizados con la nueva evidencia.
