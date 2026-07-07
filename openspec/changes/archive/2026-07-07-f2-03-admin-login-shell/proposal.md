# Propuesta: F2-03 — Login y shell administrativo

## Intención

Preparar la base navegable del panel administrativo Angular 20 para F2-04..F2-06, con login visual honesto y sesión mock en memoria, sin implementar autenticación real ni embeber claves admin en bundle o almacenamiento del navegador.

## Alcance

### Incluido
- Rutas `/admin/login`, `/admin`, `/admin/dashboard` con `loadComponent` y `adminGuard`.
- `AdminShell`, `SidebarAdmin`, `LoginPage`, `LoginForm`, `AdminDashboardPage` bajo `features/admin/`.
- `MockSession` con `signal<boolean>`, `signIn()` y `signOut()`; botón **Cerrar sesión** solo in-memory.
- Login con subtítulo visible: “Acceso simulado — la autenticación real se define en una fase posterior”.
- Tests de rutas, guard, sesión mock, accesibilidad básica y no persistencia.
- Patch mínimo de `docs/frontend/00-angular20-port-v0.md` durante apply/archive.

### Excluido
- Backend, deploy, base de datos, `.htaccess`, material privado, secretos, logs o dumps.
- Auth real, claves admin embebidas en Angular, cookies propias, `localStorage`/`sessionStorage`, credenciales demo.
- Mocks de datos de cursos, alumnos, asistencias o certificaciones.
- Tailwind, shadcn, lucide, librerías auth o nuevas dependencias.
- Copia literal de React/Next o cambios al `app.html` raíz salvo hard blocker de diseño.

## Capacidades

### Nuevas capacidades
- `admin-foundation`: shell administrativo, login placeholder, sesión mock en memoria y rutas admin protegidas.

### Capacidades modificadas
- Ninguna; no se cambia contrato base no relacionado.

## Enfoque

Aplicar el Approach A: `MockSession` in-memory con signals, `adminGuard` funcional, UI admin propia con tokens F1-02 y SVG inline. El admin debe tener shell/topbar propio solo en rutas admin y evitar banner duplicado; si el diseño detecta bloqueo con `app.html`, resolver con el mínimo cambio documentado.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/app.routes.ts` | Modificado | Rutas admin y guard. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Modificado | Cobertura de routing admin. |
| `apps/frontend-angular/src/app/features/admin/` | Nuevo | Shell, sidebar, login, dashboard, guard y sesión mock. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado | Estado F2-03 y límites. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Seguridad falsa o credenciales en frontend | Baja | Subtítulo visible, sin storage, tests y grep negativo de claves admin embebidas. |
| Landmarks/banner duplicados | Media | Admin shell solo en rutas admin; diseño valida el mínimo cambio necesario. |
| Exceder 1500 líneas | Baja | Sin dependencias ni datos de dominio; cortar scope en tasks si crece. |

## Plan de reversión

Revertir el bloque de rutas admin, eliminar `features/admin/`, retirar tests nuevos y revertir el patch documental. No hay migraciones, deploy ni persistencia que deshacer.

## Dependencias

- Angular 20 actual, tokens/primitivos F1-02 y referencia visual segura de `muestra_pagina/`.

## Criterios de éxito

- [ ] `/admin/login`, `/admin` y `/admin/dashboard` navegan sin colisionar con rutas públicas.
- [ ] `MockSession` no usa almacenamiento ni endpoints reales.
- [ ] Login/shell son accesibles, responsive y explícitamente mock.
- [ ] Tests y build Angular pasan; documentación frontend queda actualizada.
