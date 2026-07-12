# Parity Notes — F4-02 Vista previa imprimible

Comparación visual entre la referencia v0 (`muestra_pagina/components/admin/vista-previa-pdf.tsx` + capturas `pdf-desktop.png`, `pdf-desktop2.png`, `pdf-mobile.png`) y la implementación Angular 20 (`certification-pdf-preview-page`).

## Tabla comparativa

| Aspecto v0 | Angular 20 | Estado |
|---|---|---|
| Ruta `/admin/certificaciones/:id/pdf` | Misma ruta en Angular | ✅ id exacto |
| Layout horizontal (apaisado) | `@page { size: A4 landscape; margin: 0; }` + grid fluido | ✅ |
| Encabezado con escudo + marca programa + IFTS | SVG/Unicode inline con tokens (`--color-ink`, `--color-tech-blue`, `--color-circuit`) | ✅ sin librerías |
| Título "CERTIFICADO" centrado, serif bold | `<h2 class="cert-titulo">` con `font-family: serif; font-size: clamp(2.5rem, 6vw, 4.5rem)` | ✅ |
| Cuerpo: intro institucional + alumno + curso + periodo | Intro, protagonista (`nombreAlumno`), curso, periodo derivado de `attendedDates` | ✅ |
| DNI del alumno | `documentMasked` (XX****XX) con texto "Documento {mask}" | ⚠️ Diferencia intencional de privacidad (D0: admin no expone DNI completo) |
| Carga horaria | Omitida (no está en `CertificacionDetalle`) | ⚠️ Diferencia intencional de scope |
| Firmantes (Rector + Asesor) | `Autoridad Demo Uno` (Rector/a) y `Autoridad Demo Dos` (Asesor/a Pedagógica) | ⚠️ Placeholders neutros (sin nombres plausibles) |
| Cargos | "Rector/a — IFTS N.° 14" y "Asesor/a Pedagógica — IFTS N.° 14" | ✅ literal |
| Bloque de validación con QR + URL | QR 8×8 decorativo + `publicValidationUrl` truncada a 60 chars | ✅ |
| Folio (número interno) | Omitido (no está en el modelo admin) | ⚠️ Diferencia intencional de scope |
| Pie: marca BA + nota de configuración | Marca BA (Unicode) + "Datos institucionales desde Configuración (pendiente)" | ✅ con nota de placeholder |
| Barra de acciones (no imprime) | `.acciones-barra` con `.no-print` (Imprimir + Volver) | ✅ |
| Live region de feedback | `role="status" aria-live="polite"` con `.no-print` | ✅ |
| `window.print()` con guard | `typeof window !== 'undefined'` + `requestAnimationFrame` | ✅ |
| Iconos lucide-react | Unicode/emoji (🖨 🛡 🔗 🔒 ⚙) | ⚠️ Diferencia intencional (sin librerías) |
| `print:hidden` (Tailwind) | `.no-print { display: none !important; }` en `@media print` | ✅ equivalente sin Tailwind |
| `print-color-adjust: exact` | Aplicado en folio y `*` en `@media print` | ✅ |
| Breadcrumb | Migas de pan con enlace a certificaciones + expediente + "Vista imprimible" | ✅ |
| Nota QR fuera del documento | `.cert-nota-qr` con `.no-print` | ✅ |

## Diferencias intencionales

1. **Privacidad**: `documentMasked` en lugar de DNI completo (D0: admin no expone DNI completo).
2. **Firmantes neutros**: `Autoridad Demo Uno/Dos` en lugar de nombres plausibles (`M. Marcelo Canetti`, `María Eugenia Pizzul`).
3. **Sin carga horaria**: no está en `CertificacionDetalle`; la guía F4-01 dice "No ampliar el modelo salvo necesidad real".
4. **Sin Folio**: no está en el modelo admin; se omite con nota de scope.
5. **Sin librerías de iconos**: Unicode/emoji en lugar de `lucide-react` (D0: sin dependencias nuevas).
6. **Sin Tailwind**: CSS local con tokens globales (`--color-ink`, `--color-tech-blue`, etc.).

## Evidencia visual

| Artefacto | Tamaño | Resolución |
|---|---|---|
| `pdf-desktop.png` | 99.9 kB | 1280×800 |
| `pdf-mobile.png` | 54.7 kB | 390×844 |
| `pdf-print.png` | 83.7 kB | 1189×842 (A4 landscape, media print) |

## Verificación de print

- `@media print` aplica `@page { size: A4 landscape; margin: 0; }`.
- `.no-print` oculta breadcrumb, barra de acciones, live region, nota QR y footer-volver.
- `admin-shell.css` `@media print` oculta skip-link, sidebar-desktop, topbar, footer, drawer-overlay, drawer-mobile y menu-btn de forma estable (no depende de manipulación DOM).
- El folio fluye con altura natural y `overflow: visible`; la compactación print entra en A4 sin recortar contenido.
- `print-color-adjust: exact` conserva fondos (navy, celeste, amarillo BA).
- `break-inside: avoid` en folio + contenido evita cortes.
- **PDF real Chromium** (`evidence/print-app-check.sh`): login UI mock, SPA y PDF de los casos normal/revocado; ambos 1 página, sin chrome, overflow ni datos prohibidos.

## Conclusión

La paridad visual es igual o mejor que la referencia v0 en desktop, mobile e impresión. La salida impresa ocupa exactamente una página A4 landscape con el folio completo y sin chrome admin, verificada con PDF real Chromium. Diferencias intencionales de privacidad y scope documentadas.
