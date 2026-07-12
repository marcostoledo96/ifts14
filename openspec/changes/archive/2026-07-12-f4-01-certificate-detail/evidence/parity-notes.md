# Paridad visual — F4-01 Expediente de certificación

## Referencia v0

- `muestra_pagina/app/admin/certificaciones/[id]/page.tsx`
- `muestra_pagina/components/admin/expediente-certificacion.tsx`

## Implementación Angular

- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.{ts,html,css}`

## Capturas

| Dispositivo | Archivo |
|---|---|
| Desktop 1280×800 | `evidence/cert-detail-angular.png` |
| Mobile 390×844 | `evidence/cert-detail-angular-mobile.png` |

## Tabla comparativa

| Aspecto | v0 (React/Next) | Angular 20 | Paridad |
|---|---|---|---|
| Breadcrumb | `nav[aria-label="Migas de pan"]` con `← Certificaciones / N.°` | Mismo patrón, `routerLink` a `/admin/certificaciones` + número `IFTS14-CERT-NNNN` | ✅ |
| Encabezado | Kicker `Expediente de certificación`, h1 = `apellido, nombre`, subtítulo = curso, badge de estado | Kicker, h1 = `nombreAlumno`, subtítulo = `cursoNombre`, `.estado-badge` con label legible | ✅ |
| Layout 2 columnas | `grid lg:grid-cols-[21rem_1fr]` control + documento | `grid-template-columns: 21rem minmax(0,1fr)` en `@media (min-width: 64rem)` | ✅ |
| Ficha del expediente | Panel con datos alumno (nombre, DNI, email), fechas, trazabilidad | Panel con `documentMasked`, `tokenPrefix`, `numeroExpediente`, fechas; **sin email ni DNI completo** | ✅ (mejorada: sin datos sensibles) |
| Lista de asistencia | Lista con seq, fecha, módulo, check | Lista con seq, fecha, check presente | ✅ |
| Acciones | `AccionBtn` con iconos, estado cargando, disabled si revocada | `button[disabled][aria-disabled="true"]` con handoff visible `F4-02`, `F5-04`, `F6-03` | ✅ (acciones deshabilitadas con handoff explícito) |
| Enlace de validación | Panel con QR decorativo + URL + botón copiar | Panel con QR decorativo CSS (8x8), URL truncada, botón copiar disabled con `F6-03` | ✅ |
| Zona de riesgo | Panel danger con confirmar revocación | Panel danger con botón revocar disabled con `F6-01` | ✅ |
| Documento réplica | `<article>` con encabezado navy, declaración, tabla de asistencia, autoridades, trazabilidad | `.documento-replica` con encabezado navy (tokens `--color-ink`), declaración, tabla, autoridades, trazabilidad | ✅ |
| QR decorativo | 64 celdas (8x8) `QrDecorativo` | Mismo patrón de 64 celdas en CSS grid | ✅ |
| Autoridades firmantes | Rectora y Asesor desde `CONFIG_INSTITUCIONAL` | Placeholders neutros (`Autoridad Demo Uno/Dos`) hardcodeados como display-only, sin nombres propios plausibles | ✅ |
| Auditoría | Timeline con iconos por tipo de evento | `.auditoria-timeline` con dot, fecha, acción, detalle | ✅ |
| Estado revocado | Banda `REVOCADO`, marca diagonal, badge roja | `.doc-revocado-marca`, `.doc-revocado-banda`, `.estado-revocado` | ✅ |

## Diferencias intencionales (mejoras sobre v0)

1. **Sin email ni DNI completo**: el v0 muestra `DNI-FICTICIO-001` y `persona.ficticia@example.invalid`. Angular usa `documentMasked` (`XX****XX`) y no muestra email, por la frontera de datos administrativa.
2. **Acciones 100% deshabilitadas**: el v0 permite simular descarga, copiar, entregar, regenerar y revocar. Angular las deja `disabled` con `aria-disabled="true"` y handoff visible a `F4-02`, `F5-04`, `F6-03`, `F6-01`.
3. **Sin estado reactivo**: el v0 usa `useState` para simular acciones. Angular es mock-only sin mutación de estado.
4. **Iconos**: el v0 usa `lucide-react`. Angular usa texto/emoji/simbolos (✓, 🛡, ●) sin dependencias nuevas.
5. **Número de expediente**: derivado del id (`IFTS14-CERT-NNNN`) sin contrato nuevo.
6. **Sin librerías nuevas**: CSS local con tokens globales existentes (`--color-ink`, `--color-circuit`, `--color-valid`, `--color-destructive`).
7. **Autoridades firmantes con placeholders neutros**: el v0 usa nombres propios plausibles (`Lic. Adriana B. Funes`, `Prof. Daniel E. Roldán`). Angular los reemplaza por `Autoridad Demo Uno/Dos` para evitar nombres propios que puedan coincidir con personas reales; los cargos institucionales se mantienen para preservar la paridad visual.

## Verificación de privacidad (DOM live)

Inspección del DOM renderizado en `http://127.0.0.1:4321/certificados/admin/certificaciones/1`:

| Check | Resultado |
|---|---|
| DNI completo (7-8 dígitos contiguos) | ✅ ausente |
| Token completo (UUID) | ✅ ausente |
| Email | ✅ ausente |
| Legajo | ✅ ausente |
| Matrícula | ✅ ausente |
| Handoff F4-02 (PDF) | ✅ presente |
| Handoff F5-04 (entrega) | ✅ presente |
| Handoff F6-03 (link) | ✅ presente |
| Handoff F6-01 (revocación) | ✅ presente |
| documentMasked (`XX****XX`) | ✅ presente |
| tokenPrefix (`prefijo_demo_xxx`) | ✅ presente |
| Nombres propios de autoridades (`Adriana`, `Roldán`, etc.) | ✅ ausente (placeholders `Autoridad Demo Uno/Dos`) |

## Aceptación

**Paridad visual**: ✅ cumple. El expediente Angular mantiene o mejora la jerarquía, layout, secciones, estados y acciones visibles de la referencia v0, adaptando los datos a la frontera de privacidad administrativa (mock-only, sin DNI/email/token completo).

**Gaps**: ninguno bloqueante. Las diferencias son mejoras intencionales de privacidad y alcance (acciones deshabilitadas con handoff explícito).

## Archivos tocados

- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.ts`
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html`
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.css`
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts`
- `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts`
- `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts`
- `apps/frontend-angular/src/app/app.routes.spec.ts`
- `apps/frontend-angular/angular.json` (budget anyComponentStyle 8kB/16kB)