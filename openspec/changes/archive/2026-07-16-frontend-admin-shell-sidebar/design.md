# Design: Admin shell + sidebar (UI polish)

## Technical Approach

Pulido quirúrgico in-place de `AdminShell` + `SidebarAdmin` hacia paridad v0 (`muestra_pagina`), sin componentes nuevos ni cambios de rutas/auth. Cumple REQ-SHELL-01..08 y locks: sin Help/Bell; sync texto estático; avatar `AD`; search editable no-op; Config única en footer; logout funcional ink.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Scope | Extraer topbar / in-place | **In-place** | Un solo consumidor; menos líneas; approach 1 del proposal |
| Help/Bell | Incluir inertes / omitir | **Omitir** | Lock cerrado; evita chrome clickeable sin destino |
| Sync copy | Hora local / fija / sin hora | **“Sincronizado”** sin timestamp | Lock; no inventar sync real |
| Avatar | MP / AD / iniciales sesión | **AD** | Lock; sin PII |
| Search | readonly / editable no-op | **Editable no-op** | Lock; sin handler de resultados/navegación |
| Config | En ITEMS + footer / solo footer | **Solo footer** | REQ-SHELL-07; evita duplicado |
| Icons | lucide / SVG inline | **SVG inline** | Convención front; sin deps |
| Breakpoints | Tailwind rem / px mágicos | **40rem / 48rem / 64rem** | Alineado a sm/md/lg del repo y v0 |

## CSS tokens & breakpoints

| Token / BP | Uso |
|------------|-----|
| `--color-ink` / `--color-ink-foreground` | Fondo sidebar + avatar |
| `--color-circuit` | Barra activa 2px + monograma marca |
| `--color-valid` | Punto sync |
| `--color-card`, `--color-border`, `--color-muted-foreground` | Topbar superficies |
| `--focus-ring` | Focus visible (sidebar ink: ring claro vía `color-mix`) |
| `min-width: 40rem` (sm) | Search visible |
| `min-width: 48rem` (md) | Sync visible |
| `min-width: 64rem` (lg) | Sidebar desktop / menú oculto (ya existente) |

## Data Flow

```
Router NavigationEnd → AdminShell.rutaActual
                            │
                            ▼
              SidebarAdmin [active] → isActive(item)
                            │
              logout click → cerrarSesion output
                            │
                            ▼
              AdminShell.cerrarSesion → ADMIN_AUTH.logout → /admin/login
```

Search: binding local opcional o input sin `(ngModel)`/`(input)` de negocio — escribir no dispara API ni `navigate`.
Sync/avatar: markup estático.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `admin-shell.html` | Modify | Topbar: menú + search + sync + avatar AD; quitar badge/títulos legacy |
| `admin-shell.css` | Modify | Estilos search/sync/avatar; BPs 40/48rem; drawer ink bg |
| `admin-shell.ts` | Modify | Sin lógica nueva salvo close drawer opcional vía sidebar; auth intacto |
| `admin-shell.spec.ts` | Modify | Quitar “Sesión activa”; asertar search/sync/AD; sin Help/Bell |
| `sidebar-admin.html` | Modify | Marca + Operación + 5 ítems + footer Config + logout |
| `sidebar-admin.css` | Modify | Tema ink; barra 2px; logout ink |
| `sidebar-admin.ts` | Modify | `ITEMS` sin Config; `configItem` + `isActive` para config en footer |
| `sidebar-admin.spec.ts` | Modify | Operación; Config ×1 footer; 5 operativos |
| `openspec/specs/admin-foundation/spec.md` | Modify | Chrome v0; no anclar badge/Secciones |
| `openspec/specs/admin-shell-chrome/spec.md` | Create | REQ-SHELL-01..08 |
| `app.routes.ts` / auth | **None** | Lock |

## Interfaces

```ts
// sidebar-admin.ts — split nav
const ITEMS: readonly NavItem[]; // 5 operativos
const CONFIG_ITEM: NavItem;      // route '/admin/configuracion'
// isActive() unchanged semantics (prefix rules + attendance exception)
```

Optional `cerrarMenu` output on sidebar if close-X is added for mobile parity; shell already closes via overlay.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit shell | Search/sync/AD; sin legacy/Help/Bell; drawer | Karma `admin-shell.spec.ts` |
| Unit sidebar | Operación; Config unique; barra `.active`; logout emit | Karma `sidebar-admin.spec.ts` |
| E2E | — | Out of cycle |

## Migration / Rollout

No migration required. UI-only chrome.

## Open Questions

None — locks closed.
