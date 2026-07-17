# Exploration: frontend-parity-shell-topbar-sidebar (P-01)

## Exploration: Paridad visual shell admin (topbar + iconos sidebar)

### Current State

**Angular** (`admin-shell.*`, `sidebar-admin.*`):

- Topbar: search editable no-op con placeholder `"Buscar…"`, sync `"Sincronizado"` sin hora (`md+`), avatar `"AD"`. Sin Help ni Bell.
- Sidebar: iconos SVG de un solo `path`; Inicio usa trazo tipo *home*, no LayoutGrid; resto no Lucide-like. Spacing ya cercano a v0.
- Auth (`AdminAuthService`): solo `authenticated` + `csrfToken` — sin username ni iniciales derivadas.
- Spec canónica `admin-shell-chrome` y tests actuales **prohíben** Help/Bell, hora en sync y avatar `MP`.

**v0** (`muestra_pagina/components/admin/admin-shell.tsx`, `sidebar-admin.tsx`; captura `capturas/admin-desktop.png` alineada):

- Placeholder `"Buscar curso, alumno o certificado…"`, `"Sincronizado 10:42"`, HelpCircle, Bell + dot warning, avatar `"MP"`.
- Nav Lucide: LayoutGrid, BookOpen, Users, CalendarCheck, QrCode, Settings, LogOut.
- Help/Bell/sync/avatar son chrome presentacional (sin backend).

### Tabla de gaps (medible)

| # | Elemento v0 | Estado Angular | Decisión P-01 |
|---|-------------|----------------|---------------|
| T1 | Placeholder `"Buscar curso, alumno o certificado…"` | `"Buscar…"` | **Calcar** placeholder. Search editable, sin resultados/API. |
| T2 | `"Sincronizado 10:42"` + punto valid | `"Sincronizado"` sin hora | **Calcar** hora **estática mock** `10:42`. Documentar honest UI (no sync real). |
| T3 | Botón Ayuda (HelpCircle) | Ausente | **Agregar** botón presentacional (no-op, sin panel/API). |
| T4 | Bell + dot warning | Ausente | **Agregar** botón presentacional + dot (sin API notificaciones). |
| T5 | Avatar `"MP"` | `"AD"` | **Calcar `MP`**. Auth no expone iniciales; monograma estático de paridad visual (no PII real). |
| S1 | Inicio = LayoutGrid | Path home | **Reemplazar** path SVG Lucide-like LayoutGrid. |
| S2–S6 | BookOpen, Users, CalendarCheck, QrCode, Settings, LogOut | Paths genéricos | **Reemplazar** con paths stroke Lucide-like. |
| S7 | Icon size ~16px | 18px | Alinear a 16px si el calco lo exige. |
| — | Sin footer bajo main en shell v0 | Angular tiene footer | **OUT OF SCOPE** P-01 (solo documentar). |

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/admin-shell.{html,css,spec.ts}` (+ `.ts` si hace falta constante mock)
- `apps/frontend-angular/src/app/features/admin/sidebar-admin.{ts,html,css,spec.ts}`
- Delta de `openspec/specs/admin-shell-chrome/spec.md` (fase spec): liberar Help/Bell, hora mock, avatar `MP`
- Tests que hoy afirman ausencia de Help/Bell/hora/`MP` → actualizar

### Approaches

1. **Quirúrgico HTML/CSS/TS + paths Lucide inline (recomendado)** — Actualizar topbar (placeholder, sync+hora, Help, Bell+dot, avatar `MP`) y reemplazar `icon` path data en sidebar por trazos Lucide-like; sin dependencia npm; search sigue no-op.
   - Pros: Alcance mínimo; sin deps; cierra P0-2/P0-3; coherente con «no portar React».
   - Cons: Paths a mantener a mano; si un icono Lucide necesita varios `<path>`, puede requerir ajustar el template (hoy un solo `d`).
   - Effort: **Low–Medium**

2. **Agregar lucide-angular** — Componentes Lucide como v0.
   - Pros: Geometría exacta.
   - Cons: Nueva dependencia; overkill para ~9 iconos; choca con política previa «sin lucide».
   - Effort: **Medium–High** — no recomendado.

### Recommendation

**Approach 1.** Calcar topbar completa (incl. Help/Bell presentacionales, sync `10:42` mock, avatar `MP`) e iconos sidebar Lucide-like por path SVG. Actualizar tests y delta de spec que hoy bloquean esos elementos. Sin APIs de búsqueda/ayuda/notificaciones. Sin tocar dashboard, login, rutas ni footer.

### Risks

- Spec + `admin-shell.spec.ts` fallan hasta actualizar contrato (Help/Bell, `\d:\d{2}`, `MP`).
- Modelo single-`path` puede limitar iconos multi-elemento (LayoutGrid/QrCode): si el calco visual falla, ampliar template a multi-path en apply.
- Sync/Bell pueden leerse como estado real — mitigar con aria/copy presentacional y nota en spec.

### OUT OF SCOPE

- Tiles/CTAs dashboard, pendientes, actividad, resumen.
- Login page/form.
- APIs de búsqueda, ayuda o notificaciones.
- Rutas, auth, contenido de cursos/alumnos/asistencias/certificaciones/config.
- Footer institucional bajo `main` (divergencia conocida; no P-01).
- Portar React/Next literalmente.

### Ready for Proposal

**Yes** — listo para `sdd-propose`.
