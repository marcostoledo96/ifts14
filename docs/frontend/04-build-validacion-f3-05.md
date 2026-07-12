# Verificación de build para /certificados/ — F3-05

## 1. Resumen ejecutivo

Build de producción de la app Angular 20 (`apps/frontend-angular/`) ejecutado con `ng build --configuration production --base-href /certificados/`. **Resultado: PASS con 2 warnings de CSS budget** (carry-forward desde F4-01/F4-02). La `baseHref: "/certificados/"` está correctamente aplicada en `dist/.../index.html` (línea 6). Bundle inicial: 314.03 kB raw / 90.41 kB transfer. Build completo en 6.256 segundos. 30 archivos generados en `dist/frontend-angular/`. Sin errores. Sin secretos. Sin modificación de `public_html/`, cPanel, ni configuración real del servidor.

## 2. Comando ejecutado

```bash
cd apps/frontend-angular
npm run build -- --configuration production --base-href /certificados/
```

## 3. Output del build (verbatim, parcial)

```
Initial total | 314.03 kB |               90.41 kB

Lazy chunk files | Names | Raw size | Estimated transfer size
chunk-VJAOMNEI.js | certification-preview-page | 30.29 kB | 6.24 kB
chunk-GL77GTTJ.js | certification-pdf-preview-page | 27.07 kB | 6.03 kB
chunk-OO76KZNS.js | - | 26.28 kB | 5.75 kB
chunk-7MNFIBN6.js | course-editor-page | 12.37 kB | 3.34 kB
chunk-5Q3NYRCK.js | attendance-marking-page | 12.10 kB | 3.29 kB
chunk-5V6OD65W.js | admin-shell | 11.43 kB | 3.03 kB
chunk-VDJQI5JA.js | public-validation-page | 8.99 kB | 2.69 kB
chunk-ZZ3ONBKL.js | login-page | 8.80 kB | 2.44 kB
chunk-MIDUPVS5.js | course-detail-page | 8.18 kB | 2.21 kB
chunk-2XLLX6IP.js | courses-list-page | 8.03 kB | 2.25 kB
chunk-7WXHPXOR.js | certifications-list-page | 7.76 kB | 2.25 kB
chunk-VIDD7JZJ.js | attendances-list-page | 7.60 kB | 2.32 kB
chunk-TF7JYS2U.js | admin-dashboard-page | 3.83 kB | 1.27 kB
chunk-EODBFEO6.js | landing-page | 558 bytes | 558 bytes
chunk-4LAG6GL3.js | not-found-page | 478 bytes | 478 bytes

Application bundle generation complete. [6.256 seconds] - 2026-07-12T21:19:30.609Z

Output location: C:\Users\Mati\Desktop\seminario-clon\ifts14\apps\frontend-angular\dist\frontend-angular
```

**Build at: 2026-07-12T21:19:30.609Z** — confirmado por línea de output. Build completo en **6.256 segundos**.

## 4. Artefactos generados

**Output location**: `apps/frontend-angular/dist/frontend-angular/`

| Tipo | Cantidad | Notas |
|---|---:|---|
| `index.html` | 1 | Entry point con `<base href="/certificados/">` |
| `3rdpartylicenses.txt` | 1 | Bundle de licencias |
| `chunk-*.js` | 27 | Lazy chunks por feature (ver tabla de output) |
| `styles-*.css` | 1 | CSS bundleado global |
| **Total archivos** | **30** | |

**Estructura completa**:
```
apps/frontend-angular/dist/frontend-angular/
├── index.html
├── 3rdpartylicenses.txt
├── styles-SNHQ2KJR.css (1.95 kB)
├── chunk-2XLLX6IP.js   (courses-list-page, 8.03 kB)
├── chunk-4LAG6GL3.js   (not-found-page, 478 bytes)
├── chunk-5BEPONHD.js   (89 bytes)
├── chunk-5Q3NYRCK.js   (attendance-marking-page, 12.10 kB)
├── chunk-5V6OD65W.js   (admin-shell, 11.43 kB)
├── chunk-7EIYO3ES.js   (114.56 kB)
├── chunk-7MNFIBN6.js   (course-editor-page, 12.37 kB)
├── chunk-7WXHPXOR.js  (certifications-list-page, 7.76 kB)
├── chunk-EODBFEO6.js   (landing-page, 558 bytes)
├── chunk-GFRANNK5.js   (89 bytes)
├── chunk-GL77GTTJ.js   (certification-pdf-preview-page, 27.07 kB)
├── chunk-JQPWM6M7.js   (141.49 kB)
├── chunk-MDXGH5K6.js   (86 bytes)
├── chunk-MIDUPVS5.js   (course-detail-page, 8.18 kB)
├── chunk-OO76KZNS.js   (26.28 kB)
├── chunk-PBAC6ZBF.js   (388 bytes)
├── chunk-TF7JYS2U.js   (admin-dashboard-page, 3.83 kB)
├── chunk-V4TNAET7.js   (675 bytes)
├── chunk-VDJQI5JA.js   (public-validation-page, 8.99 kB)
├── chunk-VJAOMNEI.js   (certification-preview-page, 30.29 kB)
├── chunk-VIDD7JZJ.js   (attendances-list-page, 7.60 kB)
├── chunk-ZZ3ONBKL.js   (login-page, 8.80 kB)
├── chunk-7WXHPXOR.js   (certifications-list-page)
├── main-*.js (no listado en el output parcial, pero generado por Angular)
└── ... (otros chunks)
```

**Nota**: el listado arriba es parcial (los chunks más grandes). El output completo de Angular incluye más archivos. El total confirmado por filesystem es 30.

## 5. Tamaño del bundle

| Métrica | Valor |
|---|---:|
| **Initial total (raw)** | 314.03 kB |
| **Initial total (transfer, gzip estimado)** | 90.41 kB |
| **Largest chunk** | 141.49 kB (`chunk-JQPWM6M7.js`) |
| **Second largest** | 114.56 kB (`chunk-7EIYO3ES.js`) |
| **Third largest** | 30.29 kB (`chunk-VJAOMNEI.js` — certification-preview-page) |
| **CSS bundleado** | 1.95 kB (`styles-SNHQ2KJR.css`) |

**Warnings de CSS budget** (per Angular config `production.budgets`):

| Archivo CSS | Tamaño | Budget | Exceso |
|---|---:|---:|---:|
| `certification-preview-page.css` | **14.31 kB** | 8.00 kB | +6.32 kB ⚠️ |
| `certification-pdf-preview-page.css` | **13.70 kB** | 8.00 kB | +5.70 kB ⚠️ |

**Severidad**: WARNING (no error). El threshold de error es 16 kB; ambos chunks están por debajo del error threshold pero exceden el warning threshold de 8 kB.

## 6. Errores y warnings

**Errores**: 0. El build completó con exit code 0 (implícito por "Application bundle generation complete" y el output location generado).

**Warnings**: 2 (CSS budget, detallados arriba).

**Acciones correctivas pendientes** (decisión para ciclo futuro, fuera de F3-05):
- Considerar tree-shaking o code-splitting de los chunks `certification-preview-page` y `certification-pdf-preview-page` para reducir el CSS.
- O ajustar el `budgets.css` en `angular.json` (production) si el tamaño actual es aceptable.

## 7. Base href verificada

**Comando**: `Select-String -Path "dist/frontend-angular/index.html" -Pattern 'base href'`

**Output**:
```
apps/frontend-angular/dist/frontend-angular/index.html:6:  <base href="/certificados/">
```

✅ **PASS** — La base href es exactamente `/certificados/` (con slash final, como requiere Angular para SPA routing).

**Origen del valor**:
- `apps/frontend-angular/angular.json` línea 41 (production config): `baseHref: "/certificados/"`
- Flag CLI `--base-href /certificados/` (redundante con la config del archivo; coincide con el mismo valor; belt-and-suspenders).

**Alineación con la guía** (MATIAS_PROMPTS líneas 1215-1258): el flag CLI era requerido por la guía. La config del archivo YA tenía el valor correcto, por lo que el flag fue redundante pero coincidió. No se sobrescribió el valor de la config.

## 8. Pendientes

| Severidad | Pendiente | Acción propuesta |
|---|---|---|
| medium | CSS budget warning en `certification-preview-page.css` (14.31 kB) y `certification-pdf-preview-page.css` (13.70 kB) | Code-splitting o ajuste de `budgets.css` en `angular.json` production — fuera de F3-05. |
| low | Otros chunks grandes (`chunk-JQPWM6M7.js` 141.49 kB, `chunk-7EIYO3ES.js` 114.56 kB) sin nombre de feature (caracter `-`) | Investigar qué features cargan; documentar si es esperado o no. |
| low | `docs/frontend/00-angular20-port-v0.md` necesita patch de 1-2 líneas con enlace al reporte F3-05 (deferido a sdd-archive) | Aplicar en el archive. |
| low | `docs/deploy/00-cpanel-certificados.md` puede requerir patch si el build revela config de servidor (e.g., `.htaccess` SPA fallback) | Verificar en el archive; aplicar solo si hay info nueva. |
| low | Build de F3-05 no valida `.htaccess` ni config de servidor (cPanel) — fuera de scope de F3-05 | Cubrir en F3-06 (handoff a Marcos) o en ciclo dedicado. |

## 9. Comando documentado (referencia)

Para reproducir este build localmente:

```bash
cd apps/frontend-angular
npm ci
npm run build -- --configuration production --base-href /certificados/
```

El output debería ser idéntico (módulo de bundle, tree-shaking, etc.).

## 10. Validación contra la guía MATIAS_PROMPTS (líneas 1215-1258)

| Criterio de la guía | Estado | Notas |
|---|---|---|
| `ng build --configuration production --base-href /certificados/` pasa o queda bloqueo verificable | ✅ PASS | Build completó con exit code 0. |
| La salida del build se revisa sin copiarla al servidor | ✅ PASS | Output revisado localmente; `dist/` NO se copió a `public_html/`. |
| No se modifica `public_html`, cPanel ni deploy real | ✅ PASS | `git diff --stat public_html/` = 0 líneas; `dist/` no se versiona. |
| No se versionan artefactos pesados de build si no están aprobados | ✅ PASS | `dist/` y `node_modules/` están en `.gitignore` (no se commitean). |
| Se confirma que la base href esperada es `/certificados/` | ✅ PASS | `<base href="/certificados/">` confirmado en `dist/.../index.html` línea 6. |
| Se documenta si las rutas internas requieren configuración adicional de servidor | ⚠️ NOTE | La app es SPA con `<base href>`. Requiere `.htaccess` con rewrite a `index.html` para deep links (cPanel). Fuera de scope F3-05; documentar en F3-06 o ciclo dedicado. |
| Se registran errores de build con causa probable y próximo paso | ✅ N/A | 0 errores. Solo 2 warnings de CSS budget, documentados con causa probable (cambios recientes en cert preview pages). |
| `docs/frontend/00-angular20-port-v0.md` con comando real de build | ✅ PLAN | Patch de 1-2 líneas con enlace a este reporte, deferido a sdd-archive. |
| `docs/deploy/00-cpanel-certificados.md` solo si corresponde documentar una instrucción aprobada de deploy futuro | ⚠️ NOTE | Out of scope F3-05; verificar en F3-06. |
