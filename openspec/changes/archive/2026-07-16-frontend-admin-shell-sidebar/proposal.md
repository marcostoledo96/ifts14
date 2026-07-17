# Proposal: Admin shell + sidebar (UI polish)

## Intent

Alinear el chrome admin Angular (`AdminShell` + `SidebarAdmin`) con la referencia v0 (`muestra_pagina` + capturas `admin-desktop/mobile`), cerrando el gap deferido del dashboard: topbar con search/sync/avatar y sidebar ink “Operación”, sin tocar rutas ni auth.

## Scope

### In Scope
- Topbar: search `sm+` honesto (no-op / sin resultados); icono Search SVG; sync `md+` (chrome UI, sin claim de sync real); avatar monograma (p. ej. “MP”); quitar badge “Sesión activa” y títulos Admin del topbar
- Sidebar: tema ink; marca “IFTS N.° 14” + “Bedelía · Panel”; label “Operación”; barra activa 2px `--color-circuit`; Configuración **una sola vez** en footer (sacar de lista principal) + Cerrar sesión
- SVG inline; tokens existentes; landmarks / drawer / print CSS intactos
- Specs Karma shell/sidebar + delta openspec (`REQ-SHELL-*`)
- Help/Bell inertes solo si no inflan el diff

### Out of Scope
- `app.routes.ts`, guards, `ADMIN_AUTH`, backend search/notificaciones
- Extracción `admin-topbar`; deps lucide u otras
- Reescritura de páginas hijas / dashboard
- Verify formal / archive

## Capabilities

### New Capabilities
- `admin-shell-chrome`: paridad visual shell+sidebar v0 (REQ-SHELL-*: search, sync, avatar, Operación, barra 2px, marca Bedelía, Configuración única, responsive)

### Modified Capabilities
- `admin-foundation`: shell accesible/responsive deja de anclar chrome legacy (badge sesión / heading “Secciones”); apunta a chrome v0 sin deps nuevas

## Approach

**Approach 1 — pulido quirúrgico in-place** (explore): templates/CSS de `AdminShell` y `SidebarAdmin`; search `readonly` o sin handler + label `sr-only`; sync estático o hora local de presentación; `ITEMS` operativos (5) + link Configuración solo en pie; `isActive`/contratos de ruta sin cambio semántico.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `admin-shell.{html,css,ts,spec.ts}` | Modified | Topbar v0; quitar “Sesión activa” |
| `sidebar-admin.{html,css,ts,spec.ts}` | Modified | Ink, marca, Operación, barra, footer Config |
| `openspec/specs/admin-foundation` | Modified | Delta chrome shell |
| `openspec/specs/admin-shell-chrome` | New | REQ-SHELL-* |
| `app.routes.ts` | None | Solo lectura |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs anclan “Sesión activa” / lista con Config | High | Actualizar tests en el mismo apply |
| Duplicar Configuración | Medium | Sacar de `ITEMS` al mover al pie |
| Contraste ink / focus | Medium | Tokens + `:focus-visible` oscuro |
| Bell/Ayuda clickeables sin destino | Low | Omitir o `disabled` / inertes |
| Budget ~400 líneas | Medium | Sin componentes nuevos; Help/Bell opcionales |

## Rollback Plan

Revertir `admin-shell.*`, `sidebar-admin.*` y deltas de specs. Rutas/auth intactas.

## Dependencies

- Tokens F1-02 (`--color-ink`, `--color-circuit`, `--color-valid`)
- Ruta `/admin/configuracion` ya existente
- Referencia: `muestra_pagina/components/admin/{admin-shell,sidebar-admin}.tsx` + capturas

## Success Criteria

- [ ] Paridad visual razonable vs capturas admin desktop/mobile
- [ ] Sin badge “Sesión activa”; heading “Operación”; Configuración una sola vez
- [ ] Search/sync/avatar presentes con breakpoints v0; search honesto
- [ ] Tests focalizados shell/sidebar verdes; sin cambios auth/rutas
- [ ] Copy ES-AR institucional; SVG inline sin deps nuevas
