# Verificación de build para /certificados/ — F3-05

## 1. Resumen ejecutivo

Build de producción de la app Angular 20 (`apps/frontend-angular/`) ejecutado históricamente con `ng build --configuration production --base-href /certificados/`. **Resultado: PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE**. El output preservado muestra completion en 6.256 segundos, 2 warnings de CSS budget y métricas de 314.03 kB raw / 90.41 kB transfer; no preserva el exit code, por lo que no permite declarar PASS ni ausencia comprobada de errores. La `baseHref: "/certificados/"` aparece aplicada en la evidencia histórica de `dist/.../index.html` (línea 6). Sin secretos ni modificación de `public_html/`, cPanel o configuración real del servidor. Estas métricas corresponden al baseline `ca2f9c3`, no al HEAD actual de la rama. La release readiness actual requiere regenerar el build y capturar su exit code.

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

Output location: apps/frontend-angular/dist/frontend-angular
```

**Build at: 2026-07-12T21:19:30.609Z** — confirmado por línea de output. Build completo en **6.256 segundos**.

## 4. Artefactos generados

**Output location informada por Angular**: `apps/frontend-angular/dist/frontend-angular/`.

La salida parcial conservada en la sección 3 permite verificar los chunks nombrados y sus tamaños, pero no constituye un inventario completo. `dist/` no está versionado y no está disponible en esta rama; además, las dependencias locales no están instaladas. Por eso el listado verbatim de todos los artefactos no es reproducible desde este checkout y no se agregan nombres inferidos ni globs como si fueran archivos concretos.

## 5. Tamaño del bundle

| Métrica | Valor |
|---|---:|
| **Initial total (raw)** | 314.03 kB |
| **Initial total (transfer, gzip estimado)** | 90.41 kB |
| **Mayor chunk verificable en el output parcial** | 30.29 kB (`chunk-VJAOMNEI.js` — certification-preview-page) |

**Warnings de CSS budget** (per Angular config `production.budgets`):

| Archivo CSS | Tamaño | Budget | Exceso |
|---|---:|---:|---:|
| `certification-preview-page.css` | **14.31 kB** | 8.00 kB | +6.32 kB ⚠️ |
| `certification-pdf-preview-page.css` | **13.70 kB** | 8.00 kB | +5.70 kB ⚠️ |

**Severidad**: WARNING (no error). El threshold de error es 16 kB; ambos chunks están por debajo del error threshold pero exceden el warning threshold de 8 kB.

## 6. Errores y warnings

**Errores visibles en el fragmento histórico preservado**: ninguno. El output muestra "Application bundle generation complete" y la ubicación generada, pero el exit code no quedó preservado y no es verificable desde este checkout; por eso no se afirma "sin errores" ni PASS.

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
| low | El inventario completo de `dist/` no es reproducible desde la rama porque el directorio no está versionado ni disponible | Regenerar el build cuando estén instaladas las dependencias y capturar el listado exacto con tamaños. |
| low | `docs/deploy/00-cpanel-certificados.md` puede requerir patch si el build revela config de servidor (e.g., `.htaccess` SPA fallback) | Verificar en el archive; aplicar solo si hay info nueva. |
| low | Build de F3-05 no valida `.htaccess` ni config de servidor (cPanel) — fuera de scope de F3-05 | Cubrir en F3-06 (handoff a Marcos) o en ciclo dedicado. |

## 9. Comando documentado (referencia)

Para reproducir este build localmente:

```bash
cd apps/frontend-angular
npm ci
npm run build -- --configuration production --base-href /certificados/
```

Para reproducir exactamente las métricas documentadas, ejecutar el comando sobre el baseline `ca2f9c3`; el HEAD actual puede producir tamaños o chunks distintos.

## 10. Validación contra la guía MATIAS_PROMPTS (líneas 1215-1258)

| Criterio de la guía | Estado | Notas |
|---|---|---|
| `ng build --configuration production --base-href /certificados/` pasa o queda bloqueo verificable | ⚠️ PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE | El output histórico muestra completion y métricas, pero el exit code no quedó preservado. La release readiness actual requiere regenerar el build y capturar su exit code. |
| La salida del build se revisa sin copiarla al servidor | ✅ PASS | Output revisado localmente; `dist/` NO se copió a `public_html/`. |
| No se modifica `public_html`, cPanel ni deploy real | ✅ PASS | `test ! -e public_html` confirmó que el path no existe en este checkout; `dist/` no se versiona. |
| No se versionan artefactos pesados de build si no están aprobados | ✅ PASS | `dist/` y `node_modules/` están en `.gitignore` (no se commitean). |
| Se confirma que la base href esperada es `/certificados/` | ✅ PASS | `<base href="/certificados/">` confirmado en `dist/.../index.html` línea 6. |
| Se documenta si las rutas internas requieren configuración adicional de servidor | ⚠️ NOTE | La app es SPA con `<base href>`. Requiere `.htaccess` con rewrite a `index.html` para deep links (cPanel). Fuera de scope F3-05; documentar en F3-06 o ciclo dedicado. |
| Se registran errores de build con causa probable y próximo paso | ⚠️ PARTIAL | No hay errores visibles en el fragmento histórico y se documentan 2 warnings de CSS budget, pero la ausencia de errores no puede probarse sin exit code preservado. |
| `docs/frontend/00-angular20-port-v0.md` con comando real de build | ✅ PASS | La sección "Ver también" enlaza este reporte. |
| `docs/deploy/00-cpanel-certificados.md` solo si corresponde documentar una instrucción aprobada de deploy futuro | ⚠️ NOTE | Out of scope F3-05; verificar en F3-06. |
