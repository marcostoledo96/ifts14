# Propuesta: F4-01 Detalle de certificación administrativo

## Intent

Evolucionar `/admin/certificaciones/:id` desde la previsualización mínima de F2-06 hacia un expediente administrativo seguro y mock-only. Bedelía podrá revisar estado, alumno, curso, asistencias, documento réplica, auditoría y acciones futuras sin exponer datos sensibles ni activar operaciones reales.

## Scope

### In Scope
- UI de expediente administrativo sobre la ruta existente `/admin/certificaciones/:id`.
- Paridad visual igual o mejor que `muestra_pagina/app/admin/certificaciones/[id]` y `muestra_pagina/components/admin/expediente-certificacion.tsx`.
- Datos mock-only con `documentMasked`, `tokenPrefix` y URL truncada.
- Acciones de PDF, link, entrega, regeneración y revocación deshabilitadas con handoff explícito.
- Checks/tests de privacidad y no exposición de DNI/token/email/datos reales.

### Out of Scope
- Generación real de PDF/QR, revocación real, entrega manual real o email.
- Integración HTTP, `X-Admin-Key`, sesión admin real, storage/cookies/IndexedDB.
- Crear ramas, commits, push, PR o cualquier operación Git.
- Rutas nuevas para detalle o PDF.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `admin-certifications-frontend`: reemplaza la previsualización segura por un expediente administrativo mock-only con paridad visual, acciones deshabilitadas y frontera de datos reforzada.

## Approach

Reusar la ruta, el seam `CERTIFICATIONS_SOURCE`, `CertificacionDetalle` y los mocks de F2-06. Portar el diseño v0 a Angular 20 sin copiar React/Next literalmente, manteniendo acciones deshabilitadas y extendiendo tests negativos de privacidad.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/` | Modified | Página, template, estilos y specs del expediente. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | Modified | Mocks seguros si el expediente necesita campos visuales adicionales. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/` | Modified | Checks contra secretos, datos reales y exposición de DNI/token/email. |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modified | Delta de requisitos para expediente F4-01. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Deriva de alcance hacia PDF/QR/revocación real | Med | Declarar acciones disabled y handoffs en spec, diseño y UI. |
| Exposición accidental de DNI/token/email | Med | Mantener máscaras y extender checks negativos. |
| Paridad visual insuficiente | Med | Verificar captura contra referencia v0 en `sdd-verify`. |

## Rollback Plan

Revertir los cambios del expediente en `preview/`, restaurar la previsualización F2-06 y quitar mocks/checks agregados y el delta de `admin-certifications-frontend`. No hay migraciones ni datos persistidos.

## Dependencies

- F2-06 y fix de recarga de preview como base funcional.
- Referencia visual segura en `muestra_pagina/` solo para lectura.

> **F4-02 diferido**: la réplica documental visible en F4-01 cubre el expediente; una ruta/vista PDF imprimible agregaría alcance, ruta y tests propios. F4-02 no se implementa en este cambio.

## Success Criteria

- [ ] `/admin/certificaciones/:id` muestra el expediente mock-only con secciones requeridas y acciones deshabilitadas.
- [ ] Comparación de capturas confirma paridad visual igual o mejor que la referencia v0.
- [ ] Admin UI no expone DNI completo, token completo, email ni datos reales.
- [ ] Tests/checks cubren privacidad, id inválido y handoffs explícitos.
