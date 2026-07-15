# Reporte de archivo — F5-01 Listado de certificaciones

## Resultado

| Control | Resultado |
|---|---:|
| Veredicto | **PASS** |
| Tareas archivadas | 30/30 |
| Requisitos verificados | 2/2 |
| Escenarios conformes | 8/8 |
| Suite completa | 498/498, exit 0 |
| Build Angular | exit 0 |
| Spec y documentación | Sincronizadas |

El ciclo `f5-01-certifications-list` quedó archivado el 2026-07-13. El [reporte de verificación](verify-report.md) preserva la ejecución y la matriz de cumplimiento; [tasks.md](tasks.md) refleja el cierre posterior de las tres tareas documentales y de archivo, con 30/30 tareas completas.

## Artefactos archivados

- [Exploración](exploration.md)
- [Propuesta](proposal.md)
- [Diseño](design.md)
- [Tareas](tasks.md)
- [Delta spec de admin-certifications-frontend](specs/admin-certifications-frontend/spec.md)
- [Reporte de verificación](verify-report.md)
- [Notas de paridad](evidence/parity-notes.md)
- [QA runtime de red y privacidad](evidence/network-privacy-check.md)

## Sincronización

- El delta quedó integrado en la [spec principal de admin-certifications-frontend](../../../specs/admin-certifications-frontend/spec.md): el requisito `Listado mock-only con datos seguros` contiene seis escenarios y se agregó `Harness y evidencia verificable del listado` con dos escenarios.
- El cierre funcional, los límites mock-only, la evidencia runtime y los handoffs quedaron registrados en la [documentación del port Angular 20](../../../../docs/frontend/00-angular20-port-v0.md#estado-f5-01--listado-de-certificaciones-con-paridad-v0-filtros-paginación-harness-qa).

## Evidencia preservada

| Evidencia | Cobertura |
|---|---|
| [Desktop 1280](evidence/f5-01-desktop-1280.png) | Listado, filtros, tabla y paginación desktop |
| [Mobile 390](evidence/f5-01-mobile-390.png) | Tarjetas y adaptación mobile |
| [Loading](evidence/f5-01-loading-desktop.png) | Estado de carga con skeletons |
| [Error](evidence/f5-01-error-desktop.png) | Estado de error y reintento |
| [Vacío total](evidence/f5-01-empty-desktop.png) | Ausencia de certificaciones mock |
| [Sin resultados](evidence/f5-01-no-results-desktop.png) | Filtros sin coincidencias |
| [Notas de paridad](evidence/parity-notes.md) | Comparación visual y criterios revisados |
| [QA runtime de red y privacidad](evidence/network-privacy-check.md) | Login mock, listado, detalle y PDF; requests sanitizadas y controles de datos visibles |

La evidencia runtime registrada cubre desktop 1280×800 y mobile 390×844, filtros combinados, conteos, paginación, estados QA, navegación a detalle/PDF, privacidad mock-only, 1 navegación `document` local permitida, 0 requests de datos/API mediante `fetch`, XHR o paths `/api/`, y consola sin errores ni warnings durante el flujo enfocado.

## Warnings no bloqueantes

El build conserva dos warnings de budget CSS preexistentes: `certification-pdf-preview-page.css` (12,41 kB) y `certification-preview-page.css` (14,31 kB). Son carry-forward de F4-01/F4-02, están por debajo del umbral de error de 16 kB y quedan fuera del alcance de F5-01.

## Trazabilidad Engram

- Observación `#5755`: verify report PASS con 2/2 requisitos, 8/8 escenarios, 498/498 tests y build exit 0.
- Observación `#5758`: archive report con spec/docs sincronizadas, inventario de evidencia y warnings carry-forward.
- Observación `#5759`: cierre de F5-01 con tareas reconciliadas a 30/30.

No quedan blockers ni findings críticos abiertos para este ciclo.
