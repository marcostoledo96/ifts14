# Proposal: Configuración institucional Angular

## Intent

Crear una pantalla administrativa alcanzable para editar la configuración institucional real usada por certificados, sin portar React literalmente ni mostrar campos que el backend no persiste.

## Scope

### In Scope
- Nueva página standalone Angular 20 bajo `/admin/configuracion`, lazy dentro de `AdminShell`.
- Ítem sidebar “Configuración” e `isActive` correspondiente; queda en scope porque sin navegación la página no es alcanzable.
- Realinear `InstitutionalConfig` al DTO real: `institutionName`, `certificateText`, `rectorName`, `rectorRole`, `advisorName`, `advisorRole`, `updatedAt`.
- Agregar `guardar()`/PUT en `InstitutionalConfigService` leyendo/escribiendo `res.data.*` del envelope `{ data, meta }`.
- Chrome visual inspirado en v0: encabezado, aviso de impacto, secciones, preview simple de firmantes, dirty/save/discard.
- Tests Karma+Jasmine para servicio, página, ruta y sidebar.

### Out of Scope
- Dirección, logo, email, firmas archivo, formato de numeración, sello, link QR, textos de validación pública.
- Uploads, storage de assets, cambios backend/base, envío de emails.
- Copia literal de React/Next o dependencia visual nueva.

## Capabilities

### New Capabilities
- `admin-institutional-config-frontend`: página Angular para consultar, editar y guardar campos institucionales soportados.

### Modified Capabilities
- `frontend-http-services`: `HttpInstitutionalConfigService` pasa de GET parcial a GET/PUT con DTO real.
- `admin-foundation`: el shell suma ruta e ítem navegable de Configuración.

## Approach

Usar **Approach 1** del explore: conservar el chrome visual útil de v0 y limitar los inputs a los 6 campos backend. El código, UI copy y comentarios futuros se escribirán en inglés según el plan del usuario. La página usará Angular 20 standalone, `OnPush`, signals, `inject()`, y estado local para carga, error, dirty, guardado y descarte.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend-angular/src/app/features/admin/institutional-config/` | Modified/New | Modelo, servicio HTTP, página y specs. |
| `apps/frontend-angular/src/app/app.routes.ts` | Modified | Child route lazy `configuracion`. |
| `apps/frontend-angular/src/app/features/admin/sidebar-admin.*` | Modified | Ítem “Configuración” y estado activo. |
| `openspec/specs/frontend-http-services/spec.md` | Future spec | Ajustar contrato GET/PUT real. |
| `openspec/specs/admin-foundation/spec.md` | Future spec | Incorporar ruta/sidebar. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Paridad v0 esperada con campos no persistidos | Medium | Scope explícito: solo campos backend. |
| Provider HTTP-only falla offline | Medium | Testear errores; mock queda decisión de spec/tasks si se requiere. |
| Cambios de sidebar/rutas chocan con ciclos de polish | Medium | Mantener diff pequeño y cubrir `isActive`. |
| Validación cliente diverge de PHP | Low | Replicar límites documentados; backend sigue siendo autoridad. |

## Rollback Plan

Revertir el ciclo completo: eliminar ruta, página y specs nuevos; quitar ítem sidebar; restaurar `InstitutionalConfig`/HTTP service a GET parcial. No hay migraciones ni cambios backend.

## Dependencies

- Backend existente `GET`/`PUT /admin/configuracion-institucional`.
- Referencia visual: TSX y prompt §22; capturas `cfg-*.png` no son fuente verificable.

## Testing

- Karma+Jasmine para componente nuevo, servicio modificado, `app.routes.ts` y `sidebar-admin`.
- Tests de GET/PUT deben verificar método, URL, body y lectura desde `res.data`.

## Verification

- `npm run test:ci`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`

## Success Criteria

- [ ] `/admin/configuracion` carga dentro del shell admin.
- [ ] Sidebar permite llegar a la página y marca “Configuración”.
- [ ] La UI edita y guarda solo los campos backend reales.
- [ ] No aparecen inputs para campos inexistentes en API.
- [ ] Los tres comandos de verificación pasan.
