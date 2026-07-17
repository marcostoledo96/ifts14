# Archive report — frontend-configuracion-institucional

**Fecha**: 2026-07-16
**Veredicto verify**: verified (663/663, tsc 0, build 0)
**Destino**: `openspec/changes/archive/2026-07-16-frontend-configuracion-institucional/`

## Acciones de cierre

1. Movido el change desde `sdd/frontend-configuracion-institucional/` al archive ISO.
2. Sincronizado `openspec/specs/frontend-http-services/spec.md`:
   - DTO 1:1 + `guardar()` PUT
   - `INSTITUTIONAL_CONFIG_SOURCE` con toggle `useRealApi` (ya no HTTP-only)
3. Documentación: `docs/frontend/configuracion-institucional.md`
4. Sin `git commit` (no solicitado)

## Producto entregado

- Ruta `/admin/configuracion` + ítem sidebar Configuración
- Página admin con chrome v0 y solo campos sustentados por backend
- Seam GET/PUT + mock in-memory

## Ciclo siguiente

**Ciclo 2: Nueva certificación** (`/admin/certificaciones/nueva`, wizard 3 pasos).
