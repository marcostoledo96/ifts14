# QA manual completo — F3-04

> Reporte de la pasada manual transversal del frontend Angular 20 antes del build de entrega (F3-05). La pasada visual en navegador la realiza Mati; OpenCode estructura el reporte y documenta la evidencia automática del build.

## 1. Resumen ejecutivo

F3-04 es un ciclo documental puro: no modifica código de `apps/frontend-angular/`. La evidencia automática del build no pudo ejecutarse en este entorno porque faltan las dependencias de Node (`node_modules` no está instalado). Los 9 criterios de aceptación se relevaron mediante lectura de código y estructura; las verificaciones visuales manuales quedan pendientes para que Mati las complete en el navegador. No se detectaron filtraciones de datos sensibles en el código fuente.

## 2. Build

| Comando | Resultado | Detalle |
|---|---|---|
| `cd apps/frontend-angular && npm run build` | **BLOCKED** | Exit code distinto de 0. Error: `Could not find the '@angular/build:application' builder's node package`. Causa: `apps/frontend-angular/node_modules` no existe en este workspace. |
| `cd apps/frontend-angular && npm test -- --watch=false --browsers=ChromeHeadless` | **BLOCKED** | El script `scripts/no-focused-tests.mjs` falla antes de lanzar Angular: `ENOENT: no such file or directory, scandir 'C:\C:\Users\...\src'`. La causa es que `new URL('../src', import.meta.url).pathname` produce una ruta con barra inicial en Windows (`/C:/...`), que Node interpreta como `C:\C:\...`. Además, faltan las dependencias de Node. |

**Acción correctiva propuesta**: en el entorno local de Mati o en la máquina de build, ejecutar `cd apps/frontend-angular && npm install` y volver a correr `npm run build` y `npm run test:ci`. El historial del repo muestra builds verdes en F4-01 (initial 313.84 kB raw / 90.36 kB transfer) y tests 420/420 SUCCESS, por lo que el blocker es puramente ambiental.

## 3. Responsive

Criterio: verificar 5 anchos (360 px, 390 px, 430 px, tablet 768 px, desktop 1280 px) en Chrome estable (y opcionalmente Edge/Firefox).

| Feature / Ancho | 360 px | 390 px | 430 px | Tablet (768 px) | Desktop (1280 px) |
|---|---|---|---|---|---|
| Landing (`/`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Validación pública (`/validar/:token`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Admin login (`/admin/login`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Admin dashboard (`/admin/dashboard`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Cursos (`/admin/cursos`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Asistencias (`/admin/asistencias`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Certificaciones (`/admin/certificaciones`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Not found (`/**`) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

**Notas**: Mati debe completar las celdas indicando PASS / FAIL / PARTIAL y adjuntar breve observación (por ejemplo: "overflow horizontal en tabla de cursos", "texto truncado en badge"). La app usa `baseHref: "/certificados/"` y CSS con `@media` estándar; no hay indicios de breakpoints hardcodeados en el código relevado.

## 4. Teclado y foco

Criterio: Tab, Shift+Tab, Enter, Escape y foco visible (`:focus-visible`, `--focus-ring`).

| Feature | Tab nav | Shift+Tab | Enter | Escape | Foco visible | Resultado |
|---|---|---|---|---|---|---|
| Landing | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Validación pública | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Admin login | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Admin cursos (listado/editor) | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Admin asistencias | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Admin certificaciones | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Skip link (`app.ts`) | Pendiente | Pendiente | — | — | Pendiente | Pendiente |

**Hallazgo estático**: `app.ts` incluye skip link apuntando a `main#contenido`. El sistema visual define `--focus-ring: 0 0 0 2px var(--color-ring)`. Mati debe confirmar que el anillo es visible en todos los elementos interactivos y que no hay trampas de foco.

## 5. Contraste y legibilidad

Criterio: WCAG AA (4.5:1 para texto normal, 3:1 para texto grande y elementos UI), tipografía legible a 16 px mínimo, sin texto recortado ni overflow horizontal.

| Elemento | Ratio esperado | Resultado | Notas |
|---|---|---|---|
| Texto principal `--color-ink` sobre `--color-paper` | ≥ 4.5:1 | Pendiente | `#0b1f33` sobre `#f5f7fa` debería dar ~16:1; confirmar con DevTools. |
| Links `--color-tech-blue` sobre `--color-paper` | ≥ 4.5:1 | Pendiente | `#1565c0` sobre `#f5f7fa` debería dar ~6.8:1. |
| Error `--color-destructive` sobre `--color-destructive-soft` | ≥ 4.5:1 | Pendiente | `#c62828` sobre `#fbeaea` debería dar ~7.4:1. |
| Badge "Sistema en línea" `--color-valid` sobre `--color-valid-soft` | ≥ 3:1 | Pendiente | `#2e7d32` sobre `#e8f5e9`. |
| Tamaño de fuente base | ≥ 16 px | Pendiente | Confirmar en `styles.css` y en render. |
| Overflow horizontal | 0 | Pendiente | Revisar en 360 px y 390 px. |

**Nota**: Los valores estimados de contraste se calcularon con WebAIM Contrast Checker sobre los tokens documentados en `docs/frontend/02-sistema-visual-v0-f1-02.md`. Mati debe validar el render real.

## 6. Estados

Criterio: cada flujo diferencia carga, vacío, error y éxito; `BandaEstado` es la región live.

| Feature | Carga | Vacío | Error | Éxito | Resultado |
|---|---|---|---|---|---|
| Landing | N/A | N/A | N/A | Render estático | Pendiente |
| Validación pública (`validar/:token`) | `resource()` con `isLoading()` | No encontrado / revocado / expirado | Error técnico | Certificado válido con DNI y fechas | Pendiente |
| Admin cursos listado | Pendiente | "Sin cursos" / `output aria-live` | Error de carga | Listado con artículos | Pendiente |
| Admin curso detalle | Pendiente | "Curso no encontrado" | Error de carga | Ficha del curso | Pendiente |
| Admin asistencias | Pendiente | "Sin fechas" / "Sin alumnos" | Error de carga | Marcado guardado | Pendiente |
| Admin certificaciones listado | Pendiente | `output aria-live="polite"` | Error de carga | Listado con artículos | Pendiente |
| Admin certificación preview | Pendiente | "Certificación no encontrada" | Error de carga | Expediente administrativo | Pendiente |
| Not found | N/A | N/A | 404 | N/A | Pendiente |

**Hallazgo estático**: el código de `public-validation-page` maneja tres bloques (`valid`, `not-verifiable`, `technical-error`) y usa `BandaEstado`. Los features admin usan `<p role="alert">`, `<output aria-live="polite">` y bandas de estado propias. Mati debe confirmar que no hay regiones live anidadas y que los mensajes son comprensibles.

## 7. Consola del navegador

Criterio: 0 errores nuevos y warnings registrados (no bloquean).

| Entorno | Errores | Warnings | Notas |
|---|---|---|---|
| Chrome DevTools, landing | Pendiente | Pendiente | Mati completa tras pasada manual. |
| Chrome DevTools, validación pública | Pendiente | Pendiente | Mati completa tras pasada manual. |
| Chrome DevTools, admin login | Pendiente | Pendiente | Mati completa tras pasada manual. |
| Chrome DevTools, admin flujos | Pendiente | Pendiente | Mati completa tras pasada manual. |

**Hallazgo estático**: no se ejecutó navegación en este entorno (faltan dependencias y no hay servidor levantado). El build histórico de F4-01 fue verde con un único warning de budget CSS aceptado (`certification-preview-page.css` 13.78 kB > 8 kB warning, dentro de 16 kB error).

## 8. Datos sensibles

Criterio: NO DNI completo en UI admin, NO tokens completos, NO claves admin en bundle, NO tokens en URL admin.

| Check | Método | Resultado | Evidencia |
|---|---|---|---|
| UI admin no muestra DNI completo | `Select-String` sobre `apps/frontend-angular/src/app/features/admin` | **PASS** | Los modelos admin usan `documentMasked` con formato `XX****XX`. Los seeds usan `12****34`, `34****56`, etc. |
| No tokens completos en UI admin | Revisión de `certifications.models.ts`, `in-memory-certifications.service.ts` y templates | **PASS** | Se expone `tokenPrefix` (`prefijo_demo_xxx`) y URL pública truncada a 60 caracteres. |
| No clave admin en bundle Angular | `Select-String "X-Admin-Key"` en `src` | **PASS** | Solo aparece en specs negativos `__checks__/no-secrets.spec.ts` como patrón prohibido. 0 matches en código de producto. |
| No storage en frontend | `Select-String` de `localStorage`, `sessionStorage`, `IndexedDB` | **PASS** | Solo aparece en specs negativos como patrón prohibido. |
| UI pública y DNI completo | Revisión de `dto.ts`, `result-mapper.ts`, `public-validation-page` | **PASS con nota** | D0 exige DNI completo (`documentNumber`) en validación pública; es correcto por decisión institucional. |
| Token en URL | Revisión de rutas | **PASS con nota** | La ruta pública `validar/:tokenCertificacion` requiere el token por diseño. No se detectan tokens completos en URL admin ni en logs/errores del frontend. |

**Nota**: Los datos de prueba (`12345678` en `mock-tokens.ts`, `documentNumber` en tests) son mocks ficticios con fines de testing; no corresponden a personas reales.

## 9. Pendientes y blockers

| Ítem | Severidad | Descripción | Próximo paso |
|---|---|---|---|
| Instalación de dependencias | **blocker** | `npm run build` y `npm test` no corren sin `node_modules`. | Ejecutar `npm install` en `apps/frontend-angular/` y re-verificar build/tests antes de F3-05. |
| Pasada manual responsive (5 anchos × 8 features) | **high** | Mati debe completar la tabla de la sección 3. | Navegar con Chrome DevTools en 360/390/430/tablet/desktop. |
| Pasada manual teclado y foco | **high** | Mati debe completar la tabla de la sección 4. | Tab, Shift+Tab, Enter, Escape en cada flujo. |
| Validación de contraste real | **medium** | Los ratios teóricos son buenos, pero falta medición en render. | Usar DevTools o axe/WAVE en cada feature. |
| Validación de estados en navegador | **medium** | Carga, vacío, error y éxito relevados estáticamente; falta confirmación visual. | Recorrer cada feature forzando los 4 estados. |
| Consola del navegador | **medium** | No se ejecutó navegación; pendiente confirmar 0 errores. | Abrir DevTools durante la pasada manual. |
| Tech debt conocido | **low** | `HeaderInstitucional` raíz en `/admin/*` (documentado en F2-03) y budget CSS relajado en F4-01. | No corregir en F3-04; documentar para ciclo posterior. |

---

**Fin del reporte**. Las secciones manuales quedan con placeholders para que Mati complete los resultados reales de la pasada en navegador. El blocker ambiental (`node_modules`) debe resolverse antes de declarar el build verde.
