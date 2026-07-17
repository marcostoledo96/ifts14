## Exploration: Admin shell + sidebar (UI polish)

### Current State

**Referencia visual (`muestra_pagina/`)**

- No existe `muestra_pagina/app/admin/layout.tsx`. El chrome vive en componentes:
  - `muestra_pagina/components/admin/admin-shell.tsx` — sidebar fija desktop + drawer mobile + topbar sticky + `main`.
  - `muestra_pagina/components/admin/sidebar-admin.tsx` — marca, nav “Operación”, pie Configuración + Cerrar sesión.
- Capturas: `muestra_pagina/capturas/admin-desktop.png`, `admin-mobile.png`.
- Desktop: sidebar ink oscura; topbar con search (icono Search), “Sincronizado HH:MM”, Ayuda, Bell+dot, avatar “MP”.
- Mobile: hamburguesa; sin search ni sync en viewport estrecho; Ayuda/Bell/avatar a la derecha; drawer con misma sidebar.

**Sidebar v0 (detalle)**

| Pieza | v0 |
|-------|-----|
| Marca | SVG 2×2 + “IFTS N.° 14” + “Bedelía · Panel” |
| Label sección | “Operación” (caps mono) |
| Nav principal | Inicio, Cursos, Alumnos, Asistencias, Certificaciones |
| Activo | `bg-white/10` + barra lateral 2px `bg-circuit` (`w-0.5` = 2px) |
| Pie | Configuración (link) + Cerrar sesión — **fuera** del grupo Operación |
| Tema | `bg-ink` / texto claro |

**Topbar v0 (detalle)**

| Pieza | Comportamiento |
|-------|----------------|
| Search | `hidden sm:flex`; input `type=search`; placeholder “Buscar curso, alumno o certificado…”; **sin backend** en la muestra |
| Sync | `hidden md:flex`; punto `bg-valid` + “Sincronizado 10:42” (estático en mock) |
| Ayuda / Bell | botones decorativos; Bell con dot warning |
| Avatar | círculo ink “MP”, `aria-hidden` |

**Angular hoy**

| Pieza | Path | Estado |
|-------|------|--------|
| Shell | `admin-shell.{ts,html,css,spec.ts}` | OnPush; drawer condicional; `rutaActual` → sidebar; logout via `ADMIN_AUTH` |
| Topbar | `admin-shell.html` | Monograma + “IFTS N.° 14 — Admin” / “Panel administrativo” + badge **“Sesión activa”** (warning). **Sin** search, sync, avatar usuario, Ayuda/Bell |
| Sidebar | `sidebar-admin.{ts,html,css,spec.ts}` | 6 ítems en una sola lista (incluye Configuración); heading **“Secciones”**; fondo card claro; activo = fondo muted **sin** barra 2px; logout botón bordeado |
| Rutas | `app.routes.ts` | `AdminShell` envuelve hijos; `/admin/configuracion` y `/admin/certificaciones/nueva` ya existen — **no tocar** |
| Tokens | design system | `--color-ink`, `--color-circuit`, `--color-valid` ya usados en el front |
| Iconos | patrón repo | SVG inline; **sin** lucide |

**Configuración:** ya hay un solo ítem `route: '/admin/configuracion'` en `ITEMS`. Specs de sidebar cubren link + prefijo activo. Riesgo de duplicar si se agrega otro link en el pie sin sacar el de la lista.

**Gaps vs REQ / capturas**

1. Topbar search + icono Search (placeholder honesto; sin filtrar ni API).
2. Indicador de sincronización (chrome UI; no inventar sync real).
3. Avatar/monograma usuario (p. ej. “MP”).
4. Label “Operación” (reemplazar “Secciones”).
5. Barra activa lateral 2px color institucional (`--color-circuit`).
6. Marca sidebar “IFTS N.° 14” + “Bedelía · Panel” (mover identidad desde topbar hacia sidebar, como v0).
7. Responsive: search/sync ocultos en breakpoints v0; drawer/overlay intactos.
8. Opcional paridad captura: Ayuda + Bell inertes (no en lista REQ explícita; recomendable para no quedar a medias vs desktop/mobile screenshots).

**Fuera de alcance de este ciclo**

- Rutas, guards, `ADMIN_AUTH`, backend search/notificaciones.
- Dependencia lucide u otra librería de iconos.
- Reescritura del dashboard u otras páginas hijas.
- Verify formal / archive (orquestador).

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/admin-shell.{html,css,ts,spec.ts}` — topbar v0; quitar badge “Sesión activa” / títulos admin del topbar; mantener landmarks, skip-link, drawer, print CSS.
- `apps/frontend-angular/src/app/features/admin/sidebar-admin.{html,css,ts,spec.ts}` — tema ink, marca, “Operación”, barra 2px, pie Configuración+logout; `isActive` y rutas **sin cambio de contratos**.
- Specs: actualizar expectativa “Sesión activa”; asertar search/sync/avatar; heading Operación; marca; barra activa; Configuración una sola vez en footer visual.
- `app.routes.ts` — **solo lectura** (verificar que no se rompe nesting); no modificar salvo regresión accidental.
- `apps/frontend-angular/AGENTS.md` — paridad visual con `muestra_pagina/`; SVG inline.

### Approaches

1. **Pulido quirúrgico in-place (recomendado)** — Alinear templates/CSS de `AdminShell` + `SidebarAdmin` a v0; SVG inline; search disabled o no-op + `aria` honesto; sync estático o hora local de presentación sin claim de sync real; Configuración se mueve visualmente al pie (mismo `route`, un solo link).
   - Pros: paridad con capturas; blast radius acotado; sin deps; rutas/auth intactas; OnPush/signals ya presentes.
   - Cons: specs shell/sidebar a actualizar; contraste ink sidebar requiere cuidado a11y (tokens existentes).
   - Effort: Low–Medium

2. **Extraer `admin-topbar` componente** — Separar topbar del shell.
   - Pros: templates más chicos.
   - Cons: overhead de archivos para un solo consumidor; no mejora paridad.
   - Effort: Medium (innecesario)

3. **Search “casi real” (filtrar rutas / localStorage)** — Simular utilidad.
   - Pros: más “producto”.
   - Cons: fuera de REQ (sin backend + placeholder honesto); riesgo de falsa expectativa; más tests.
   - Effort: Medium–High (rechazar)

### Recommendation

**Approach 1.** Single-cycle apply UI-only:

- **Sidebar:** fondo ink; header marca + monograma SVG; label “Operación”; 5 ítems operativos; activo con barra 2px `--color-circuit`; pie con Configuración (única) + Cerrar sesión (icono SVG opcional); botón cerrar drawer en mobile si falta paridad.
- **Topbar:** menú mobile; search `sm+` con icono Search inline; sync `md+` con punto valid + copy “Sincronizado …” (hora fija o `toLocaleTimeString` sin backend); avatar “MP”; opcional Ayuda/Bell inertes para paridad captura; quitar badge “Sesión activa” y títulos “Admin / Panel administrativo” del topbar (marca vive en sidebar).
- **Honestidad search:** `readonly` o sin handler de resultados; placeholder institucional; `sr-only` label; no fingir resultados.
- **Tests focalizados:** actualizar/agregar casos en `admin-shell.spec.ts` y `sidebar-admin.spec.ts`; no tocar `app.routes.spec.ts` salvo falla de landmarks.
- Mantener español argentino formal en copy UI.

### Risks

- Specs actuales asertan “Sesión activa” y heading “Secciones” → fallarán hasta actualizar (esperado en TDD del apply).
- Tema ink en sidebar: asegurar contraste y focus-visible sobre fondo oscuro.
- Duplicar Configuración si se agrega al pie sin sacar de `ITEMS` / lista principal.
- Incluir Bell/Ayuda clickeables sin destino → preferir `disabled` o `aria-disabled` / botones sin acción documentados como chrome visual.
- Budget ~400 líneas: shell+sidebar+specs puede rozar Medium; encajar en single-cycle si se evita refactor de componentes nuevos.

### Ready for Proposal

**Yes.** Orquestador puede correr `sdd-propose` / `sdd-spec` con capacidad `REQ-SHELL-*` (search, sync, avatar, Operación, barra 2px, marca Bedelía, Configuración única, responsive) y design breve de tokens/breakpoints. Apply single-cycle; verify/archive fuera de este explore.
