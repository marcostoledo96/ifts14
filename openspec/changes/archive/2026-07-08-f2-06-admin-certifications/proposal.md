# Propuesta — F2-06 Certificaciones admin

## Por qué

Cerrar el handoff F2-06: pasar Certificaciones de placeholder a base navegable mock en Angular 20, sin adelantar emisión, PDF/QR, revocación ni backend real.

## Qué cambia

- Crear UI mock en `/admin/certificaciones` y `/admin/certificaciones/:id` con listado y previsualización segura.
- Crear `admin-certifications-frontend` y actualizar el handoff de `admin-foundation`.
- Activar sidebar/dashboard hacia Certificaciones con conteo ficticio.
- Documentar cierre frontend en `docs/frontend/00-angular20-port-v0.md` durante archive.

## Capacidades

### Capacidades nuevas
- `admin-certifications-frontend`: UI administrativa mock-only para listar y previsualizar certificaciones sin red, storage ni datos sensibles.

### Capacidades modificadas
- `admin-foundation`: Certificaciones deja de ser placeholder deshabilitado y pasa a ruta navegable mock.

## Impacto

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/` | Nuevo | Modelos, servicio in-memory, listado, preview y checks. |
| `app.routes.ts`, `app.routes.spec.ts` | Modificado | Rutas protegidas y cobertura runtime. |
| `sidebar-admin.*`, `admin-dashboard-page.*` | Modificado | Navegación real a Certificaciones. |
| `openspec/specs/` | Modificado | Nueva capability y ajuste de foundation. |

## Fuera de alcance

Emisión real, PDF/QR reales, revocación, entrega manual, integración HTTP/HttpClient, `X-Admin-Key`, storage/cookies, datos reales, DNI completo admin, token completo, dependencias nuevas, Tailwind y copia literal de `muestra_pagina/`.

## Historias de usuario / escenarios

- Como Bedelía, quiero abrir Certificaciones desde sidebar/dashboard para revisar una base navegable mock.
- Como Bedelía, quiero filtrar certificaciones por estado para validar el flujo visual sin backend.
- Como Bedelía, quiero previsualizar un certificado con `documentMasked`, `tokenPrefix`, URL truncada, fechas y auditoría mínima.
- Como usuario revisor, quiero CTAs deshabilitados con handoff explícito para no confundir mock con funcionalidad real.

## Restricciones de seguridad y privacidad

- Sin DNI completo en UI admin; solo `documentMasked`.
- Sin token completo; `tokenPrefix` no reversible y URL pública truncada.
- Sin HTTP, storage, cookies, IndexedDB, claves admin, datos reales ni material privado.
- Checks negativos para secretos y datos reales.

## Reversión

Revertir el PR: quitar rutas y carpeta `certifications`, restaurar sidebar/dashboard como placeholder y revertir specs/docs del ciclo. No hay migraciones, red ni persistencia que deshacer.

## Criterios de aceptación para entrar a spec/design

- Alcance mock-only confirmado y alineado con exploración.
- Capabilities definidas: una nueva y una modificada.
- Límites F4-F6 explícitos antes de diseñar tareas.
- Forecast bajo presupuesto de revisión.

## Pronóstico de carga de revisión

| Campo | Valor |
|---|---|
| Líneas estimadas | 1100–1800 |
| Riesgo budget 5000 | Bajo |
| Chained PRs recomendado | No |
| Decisión necesaria antes de apply | No |
