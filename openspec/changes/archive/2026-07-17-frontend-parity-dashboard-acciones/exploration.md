# Exploration + Proposal + Spec (compressed): frontend-parity-dashboard-acciones (P-02)

## Gaps
| Tile v0 | Angular before | Decisión |
|---------|----------------|---------|
| Nueva certificación | OK | Mantener |
| Nuevo curso | OK | Mantener |
| Cargar asistencias | Alumnos ❌ | → `/admin/asistencias` |
| Entrega manual | Configuración ❌ | → `/admin/certificaciones` (hub honesto) |
| Carga masiva | disabled OK | Copy v0 + disabled |

## Spec REQ-DASH-TILES
Given dashboard, When se listan acciones, Then labels exactas v0 y links arriba; Carga masiva disabled.

## Apply
Hecho en admin-dashboard-page.html + spec. Tests 8/8.
