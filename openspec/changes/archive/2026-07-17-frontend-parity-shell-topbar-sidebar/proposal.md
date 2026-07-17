# Proposal: Paridad shell topbar + sidebar icons (P-01)

## Intent

Cerrar P0-2/P0-3 del plan de paridad: calcar topbar v0 (placeholder, sync+hora mock, Help, Bell+dot) e iconografía Lucide-like del sidebar, sin portar React ni inventar APIs.

## Scope

### In Scope
- Placeholder search `"Buscar curso, alumno o certificado…"` (sigue no-op)
- Sync `"Sincronizado 10:42"` mock estático documentado
- Botones Ayuda + Notificaciones presentacionales (SVG inline, sin panel/API)
- Iconos nav Lucide-like multi-path (LayoutGrid, BookOpen, Users, CalendarCheck, QrCode, Settings, LogOut) a 16px
- Actualizar locks de `admin-shell-chrome` + tests
- Avatar permanece **`AD`** (auth sin identidad; divergence intencional vs `MP` v0)

### Out of Scope
- Dashboard tiles, login, rutas, auth, footer page bajo main
- Dependencia lucide npm
- Backend search/help/notifications
- Cambiar monograma a `MP`

## Approach

Approach 1 (explore): SVG inline multi-path vía `iconId` + `@switch` en template; topbar con botones no-op como v0.

## Risks

| Risk | Mitigation |
|------|------------|
| Spec/tests viejos bloquean Help/Bell/hora | Delta REQ + actualizar specs en el mismo apply |
| Hora/Bell leídos como reales | Aria presentacional + nota honest UI en spec |
| Budget líneas | Sin componentes nuevos; solo shell/sidebar |

## Rollback

Revertir `admin-shell.*`, `sidebar-admin.*` y delta `admin-shell-chrome`.

## Ready for Spec

Yes.
