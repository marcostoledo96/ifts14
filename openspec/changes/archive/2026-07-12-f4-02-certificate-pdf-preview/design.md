# Diseño: F4-02 Vista previa imprimible de certificado

## Enfoque técnico

Se agregará una página Angular 20 standalone y lazy en `/admin/certificaciones/:id/pdf`. Consumirá `CERTIFICATIONS_SOURCE.obtener(id)`, reutilizará `CertificacionDetalle` y renderizará un folio HTML/CSS mock-only. `window.print()` será la única impresión; no habrá red, PDF ni QR real. Imprimir, descargar y regenerar **no rotan el token ni el QR permanente**. La intención visual se portará, sin copiar React/Next, desde `muestra_pagina/components/admin/vista-previa-pdf.tsx`, `muestra_pagina/app/admin/certificaciones/[id]/pdf/page.tsx` y las capturas `muestra_pagina/capturas/pdf-desktop.png`, `muestra_pagina/capturas/pdf-desktop2.png`, `muestra_pagina/capturas/pdf-mobile.png`.

## Decisiones de arquitectura

| Decisión | Alternativas y trade-off | Fundamento |
|---|---|---|
| Página nueva `CertificationPdfPreviewPage` | Incrustarla en F4-01 mezclaría controles y folio. | Aísla ruta, layout y rollback; reutiliza el provider admin. |
| Validación decimal positiva vigente | `Number()` aceptaría `0x1` y `1e0`; un helper ampliaría scope. | Replica el patrón corto de F4-01; `effect` + generación descartan cargas obsoletas. |
| `qrCells` fijo 8×8 local | Compartirlo modificaría F4-01 por pocas líneas. | Es decorativo; menor blast radius. |
| Impresión nativa con guard de browser | Un servicio tendría una sola implementación. | Actualizar `role="status" aria-live="polite"` y programar `window.print()` con `requestAnimationFrame` permite pintar/anunciar feedback antes del diálogo bloqueante. Sin API, informar indisponibilidad. |

## Flujo de datos

```text
Router (:id) → validación decimal → CERTIFICATIONS_SOURCE.obtener(id)
      ├─ válido → CertificacionDetalle seguro → folio HTML/CSS
      │                                      → live region actualizada
      │                                      → siguiente frame → window.print()
      └─ inválido/error → “Certificación no encontrada” (sin red)
F4-01 Descargar/Regenerar PDF ────────────────→ nueva ruta
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.ts` | Crear | Carga robusta, estado accesible, impresión diferida al siguiente frame y QR decorativo. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.html` | Crear | Folio seguro, live region, navegación y controles no imprimibles. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.css` | Crear | Layout responsive y estilos A4 apaisado. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.spec.ts` | Crear | Pruebas runtime, privacidad, ids y secuencia de impresión. |
| `apps/frontend-angular/src/app/app.routes.ts` | Modificar | Declarar `certificaciones/:id/pdf` antes de `certificaciones/:id`. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Modificar | Probar resolución de ruta específica y entradas adversariales. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html` | Modificar | Activar Descargar/Regenerar como `routerLink`; mantener `Copiar link → F6-03`, `Entrega manual → F5-04` y `Revocar certificación → F6-01`, todos `disabled` y con `aria-disabled="true"`. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts` | Modificar | Verificar enlaces PDF y los tres handoffs deshabilitados exactos. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts` | Modificar | Incluir la página PDF en checks de secretos, red y storage. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts` | Modificar | Incluir la página PDF en checks de datos reales. |
| `openspec/changes/f4-02-certificate-pdf-preview/evidence/parity-notes.md` | Crear en verify | Comparación v0/Angular y diferencias deliberadas. |

## Interfaces y contratos

No se crean DTOs ni servicios. Se conserva `CertificationsService.obtener(id: number): Promise<CertificacionDetalle>`. El DOM muestra datos demo, `documentMasked`, fechas, expediente y URL truncada; omite `tokenPrefix`, DNI/token completos, email, UUID, legajo y matrícula. Autoridades: `Autoridad Demo Uno` y `Autoridad Demo Dos`. Descargar/Regenerar navegan; Imprimir abre el diálogo nativo; ninguna acción muta token/QR.

## Estrategia de pruebas

| Capa | Cobertura | Enfoque |
|---|---|---|
| Componente/runtime | Render seguro, QR 64 celdas, navegación, feedback actualizado antes de `print`; ids `abc`, `0`, `0x1`, `1e0`, `999`, vacío y cambio de id. | TestBed, dobles de `CERTIFICATIONS_SOURCE`, stub de `requestAnimationFrame` y spy de `window.print` para probar el orden. |
| Rutas/contrato | Ruta PDF protegida y específica; `:id` no captura `/pdf`; F4-01 enlaza y demás handoffs siguen deshabilitados. | `RouterTestingHarness` + `withComponentInputBinding()`. |
| Checks/build | Sin secretos, red, storage, datos reales ni dependencias nuevas. | `npm run test:ci`, `npm run build`, diff de `package.json`/lockfiles. |
| Visual | Paridad desktop 1280×800, mobile 390×844 y media print contra las cinco referencias v0 nombradas. | Capturas en `openspec/changes/f4-02-certificate-pdf-preview/evidence/`; verificar controles ocultos, A4 landscape, colores y responsive. |

CSS local: `@page { size: A4 landscape; margin: 0; }`, `.no-print`, `break-inside: avoid` y `print-color-adjust: exact`/prefijo WebKit. La pantalla mantiene controles visibles; impresión conserva solo el folio.

## Matriz de amenazas

El cambio altera routing, pero no cruza límites de ejecución/VCS contemplados por la matriz de referencia.

| Límite | Aplicabilidad | Respuesta | RED tests |
|---|---|---|---|
| Rutas tipo documentación | N/A: no se clasifican ni ejecutan archivos. | — | — |
| Selección de repositorio Git | N/A: sin automatización Git. | — | — |
| Estado de commit | N/A: sin commits automatizados. | — | — |
| Estado de push | N/A: sin push. | — | — |
| Comandos de PR | N/A: sin comandos de PR. | — | — |

## Migración, despliegue y reversión

No requiere migración, feature flag ni backend. Un único PR (presupuesto 4000). Rollback: quitar ruta/página/tests y restaurar los dos CTAs F4-01 como deshabilitados; no existen datos persistidos ni paquetes que revertir.

## Preguntas abiertas

Ninguna.
