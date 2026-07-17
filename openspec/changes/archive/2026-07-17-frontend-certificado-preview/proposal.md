# Proposal: Preview de certificado

## Intent

Completar el expediente administrativo de certificado para que Bedelía pueda copiar o compartir la URL pública canónica y ver autoridades institucionales reales, sin placeholders demo ni exposición de DNI/token completos.

## Scope

### In Scope
- Cargar en paralelo detalle, configuración institucional y entrega manual en `/admin/certificaciones/:id`.
- Reemplazar autoridades demo por `rectorName/rectorRole` y `advisorName/advisorRole`; si falla config o faltan nombres, mostrar "Configuración institucional pendiente".
- Habilitar `Copiar link` y `Compartir` con `obtenerEntregaManual().publicValidationUrl`; deshabilitarlos si el certificado está revocado.
- Actualizar F6-03 para dejar de esperar `Copiar link` deshabilitado.

### Out of Scope
- Cambios en PDF preview, backend, revocación, emisión o rotación de token/QR.
- Corrección general de `detalle.publicValidationUrl` fuera del preview.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-certifications-frontend`: el expediente deja el handoff F6-03 para `Copiar link`, agrega `Compartir`, consume configuración institucional y usa URL canónica desde entrega manual.

## Approach

Aplicar Approach 1 inline: en `CertificationPreviewPage`, resolver detalle/config/entrega-manual en paralelo con Angular 20 OnPush/signals. Mantener UI en español, reutilizar patrón clipboard de entrega manual y agregar `navigator.share` con feature-detect y fallback a clipboard. No usar `detalle.publicValidationUrl` para copiar/compartir.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/` | Modified | Estado, acciones, autoridades, estilos y tests focalizados |
| `apps/frontend-angular/src/app/features/admin/certifications/` | Modified | Uso de `obtenerEntregaManual` como fuente canónica |
| `apps/frontend-angular/src/app/features/admin/institutional-config/` | Read-only dependency | Lectura GET de autoridades |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modified | Requisito F6-03 actualizado |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Copiar URL truncada por error | Medium | Tests contra `obtenerEntregaManual().publicValidationUrl` |
| Web Share no disponible o abortado | Medium | Feature-detect; fallback clipboard salvo cancelación |
| Config institucional incompleta | Medium | Mensaje pendiente único, sin placeholders demo |
| Certificado revocado compartible | Low | Deshabilitar Copiar/Compartir por estado revocado |

## Rollback Plan

Revertir los cambios del preview y la delta F6-03 para volver al handoff deshabilitado; no hay migraciones ni persistencia nueva.

## Dependencies

- `GET /admin/configuracion-institucional`
- `CERTIFICATIONS_SOURCE.obtenerEntregaManual(id)`
- Clipboard API, `execCommand('copy')` fallback y Web Share API opcional

## Success Criteria

- [ ] Copiar/Compartir usan la URL canónica de entrega manual.
- [ ] Acciones quedan deshabilitadas cuando el certificado está revocado.
- [ ] Autoridades reales aparecen o se muestra "Configuración institucional pendiente".
- [ ] Specs/tests F6-03 reflejan el nuevo comportamiento sin DNI/token completo.

## Proposal question round

Preguntas para revisar antes de cerrar producto: ¿Compartir debe copiar al portapapeles si el usuario cancela Web Share? ¿El mensaje de configuración pendiente debe bloquear solo autoridades o también acciones? ¿Debe registrarse auditoría cuando un admin copia/compartir el link? Asumo que la primera entrega no agrega auditoría, no bloquea acciones por config pendiente y trata `AbortError` como cancelación sin fallback.
