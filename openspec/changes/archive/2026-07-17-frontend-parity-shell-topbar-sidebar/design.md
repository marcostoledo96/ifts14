# Design: Paridad shell topbar + sidebar icons (P-01)

## Technical Approach

Pulido quirúrgico in-place de `AdminShell` + `SidebarAdmin` (Approach 1 explore).

### Topbar
- Placeholder y sr-only alineados a v0.
- Sync label: `Sincronizado 10:42` (constante estática en template).
- Botones Help/Bell: `<button type="button">` focuseables, sin `(click)` de negocio; Bell con `.topbar-bell-dot` usando `--color-warning`.
- Avatar: conservar `AD`.

### Sidebar icons
- Cambiar `NavItem.icon: string` (single path) → `iconId: NavIconId`.
- Template: `@switch (item.iconId)` con SVG Lucide multi-path (`stroke-width="1.75"`, 16×16).
- Mismo switch para Config y LogOut.

### Specs
- Actualizar `openspec/specs/admin-shell-chrome/spec.md` en archive (merge delta).
- Tests: invertir aserciones Help/Bell/hora; agregar checks de iconId/SVG size; mantener AD.

## Decisions

| Decision | Rationale |
|----------|-----------|
| Avatar `AD` no `MP` | Auth sin username; no fingir identidad |
| Hora mock fija | Paridad visual; no sync real |
| SVG inline no lucide npm | Spec + AGENTS |
| Botones no-op focuseables | Calco v0 (no disabled) |

## Files

- `admin-shell.html|css|spec.ts`
- `sidebar-admin.ts|html|css|spec.ts`
- Spec canónica al archive
