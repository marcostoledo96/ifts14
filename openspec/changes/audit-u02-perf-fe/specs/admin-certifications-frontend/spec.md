# Delta for admin-certifications-frontend

## ADDED Requirements

### Requirement: CERT-PERF-01 — Carga diferida de html2canvas-pro y jspdf

La vista `/admin/certificaciones/:id/pdf` DEBE NOT cargar `html2canvas-pro` ni `jspdf` al abrir/renderizar el folio. DEBEN cargarse solo al ejecutar **Descargar PDF** (import dinámico). Filename (`cert-{codigo}.pdf`), captura del folio, D0 e **Imprimir** (`window.print()`) DEBEN permanecer sin cambio de contrato. Fallo DEBE seguir error controlado existente (sin Reintentar/`errorRecuperable`/raw).

#### Scenario: Abrir PDF no baja deps de captura

- **GIVEN** navegación a `/admin/certificaciones/:id/pdf` con id válido
- **WHEN** el folio se renderiza sin pulsar **Descargar PDF**
- **THEN** chunks de `html2canvas-pro` y `jspdf` NO DEBEN solicitarse
- **AND** Imprimir y el folio DEBEN seguir disponibles

#### Scenario: Descarga dispara import dinámico

- **GIVEN** folio visible en la vista PDF
- **WHEN** Bedelía pulsa **Descargar PDF**
- **THEN** DEBE cargar `html2canvas-pro` y `jspdf` en ese momento
- **AND** DEBE generar `cert-{codigo}.pdf` por captura del folio
- **AND** NO DEBE usar `CertificationsService.descargarPdf` ni blob API

#### Scenario: Fallo de deps o captura sin regresión UX

- **GIVEN** falla el import dinámico o la generación PDF
- **WHEN** se captura el error
- **THEN** mensaje controlado (*«No se pudo generar el PDF.»* o `mensajeErrorApi`)
- **AND** NO Reintentar/`errorRecuperable`/raw; D0 vigente en camino feliz
