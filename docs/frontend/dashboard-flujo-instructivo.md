# Dashboard — flujo de trabajo e instructivo

## Resumen

El panel admin incluye un instructivo «Flujo de trabajo» antes de Pendientes (explicación + CTA destacado a la guía, sin duplicar el menú) y una guía detallada en `/admin/guia` con layout tipo Configuración.

## Qué hace

1. **Dashboard**: banner instructivo con orden sugerido (chips no clicables) y botón tinta «Ver guía de trabajo».
2. **Guía** (`/admin/guia`): header institucional, nota de orden, nav sticky lateral y secciones con CTA secundario a cada módulo.

## Decisiones

- El dashboard no navega a módulos: eso ya está en el sidebar.
- Paridad visual con Configuración institucional (kicker, lede, banner, nav 13rem).
- Copy alineado a D0 (QR permanente, DNI completo en UI admin).

## Archivos

- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.*`
- `apps/frontend-angular/src/app/features/admin/guide/admin-guide-page.*`
- Ciclo: `openspec/changes/archive/2026-07-22-frontend-admin-dashboard-flujo-instructivo/`
