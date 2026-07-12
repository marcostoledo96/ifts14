# Design: F3-05 — Build para `/certificados/`

## Contexto

F3-05 es el quinto y último ciclo operativo de Fase 3. Su único objetivo es verificar que el build de producción de la app Angular 20 compila correctamente con `base-href /certificados/` y documentar el resultado como reporte técnico. No introduce código de producto, no despliega al servidor y no modifica la spec base.

El precedente directo es F3-04 (QA manual completo), un ciclo documental de igual naturaleza que generó siete artefactos SDD estándar. F3-05 sigue el mismo patrón estructural, pero sustituye el foco de QA visual por verificación de build y artefactos de `dist/`.

Contexto crítico: `apps/frontend-angular/angular.json` ya tiene `baseHref: "/certificados/"` en la configuración `production` (línea 41). Por lo tanto, el flag CLI `--base-href /certificados/` actúa como *belt-and-suspenders*: confirma que el valor coincide con la config, no que la sobreescribió. Además, `node_modules` no está instalado en el working tree actual; Mati debe ejecutar `npm ci` antes del build. Este bloqueador conocido se documenta como parte del ciclo, no se resuelve automáticamente.

## Decisiones técnicas

### (a) Estructura del reporte de build

El entregable principal es `docs/frontend/04-build-validacion-f3-05.md` con ocho secciones fijas:

1. **Resumen ejecutivo** — Estado global (verde/warning/blocker) en 2-3 oraciones. Justificación: permite a un revisor entender el resultado sin leer todo el documento.
2. **Comando ejecutado** — Literal: `ng build --configuration production --base-href /certificados/`. Justificación: garantiza reproducibilidad y trazabilidad del comando exacto.
3. **Output del build** — Exit code, salida verbatim y métricas finales. Justificación: evidencia objetiva de que el build ocurrió y cómo terminó.
4. **Artefactos generados** — Lista de archivos en `dist/frontend-angular/browser/` con tamaños. Justificación: permite auditar qué se generó y detectar archivos inesperados.
5. **Tamaño del bundle** — Raw, transferido y gzip si está disponible; warnings de budget. Justificación: control de presupuestos de rendimiento definidos en `angular.json`.
6. **Errores y warnings** — Cada warning con causa probable y severidad. Justificación: documenta deuda técnica visible (e.g. CSS budget carry-forward) sin ocultarla.
7. **Base href verificada** — Confirmar que `dist/.../index.html` contiene `<base href="/certificados/">`. Justificación: valida el requisito de deploy en cPanel.
8. **Pendientes** — Categorizados: blocker / high / medium / low. Justificación: deja claro qué queda para F3-06 o ciclos de deploy.

### (b) Estrategia de integración con specs

No hay delta aditivo. El ciclo es operacional; la spec base (`guia-matias-angular-windows`) ya cubre verificación de build bajo "Política frontend, pruebas y QA". No se crea `spec.md` en el change dir.

### (c) Patch a `docs/frontend/00-angular20-port-v0.md`

En `sdd-archive`, agregar 1-2 líneas en la sección "Ver también" (o crearla si no existe) con enlace al nuevo reporte. No modificar la sección "Build para cPanel" (líneas 105-113), que ya contiene el comando esperado.

### (d) Patch opcional a `docs/deploy/00-cpanel-certificados.md`

Diferido a `sdd-archive`. Solo si el build revela notas de configuración de servidor (ej. necesidad de `.htaccess` SPA fallback). Si no aplica, omitir.

### (e) Artefactos del ciclo

Siete artefactos SDD estándar: `explore.md` (listo), `proposal.md` (listo), `design.md` (este archivo), `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md`. No hay `spec.md`.

## Estructura de la entrega

| Archivo | Acción | Descripción |
|---|---|---|
| `openspec/changes/f3-05-build-para-certificados/explore.md` | Crear | Listo — exploración del ciclo. |
| `openspec/changes/f3-05-build-para-certificados/proposal.md` | Crear | Listo — propuesta con criterios de aceptación. |
| `openspec/changes/f3-05-build-para-certificados/design.md` | Crear | Este documento. |
| `openspec/changes/f3-05-build-para-certificados/tasks.md` | Crear | Downstream — `sdd-tasks`. |
| `openspec/changes/f3-05-build-para-certificados/apply-progress.md` | Crear | Downstream — `sdd-apply`. |
| `openspec/changes/f3-05-build-para-certificados/verify-report.md` | Crear | Downstream — `sdd-verify`. |
| `openspec/changes/f3-05-build-para-certificados/archive-report.md` | Crear | Downstream — `sdd-archive`. |
| `docs/frontend/04-build-validacion-f3-05.md` | Crear | Downstream — `sdd-apply`; reporte principal (~150 líneas). |
| `docs/frontend/00-angular20-port-v0.md` | Patch menor | En `sdd-archive`: 1-2 líneas de referencia al reporte. |
| `docs/deploy/00-cpanel-certificados.md` | Patch opcional | En `sdd-archive`: solo si el build revela notas de servidor. |
| `openspec/changes/archive/2026-06-30-f3-05-build-para-certificados/` | Mover | En `sdd-archive`: todo el change dir. |

## Plan de validación

| Comando / Check | Resultado esperado | Acceptance criterion cubierto |
|---|---|---|
| `git status --short` | Solo untracked dentro del change dir + el nuevo build report. | Working tree limpio, sin cambios tracked no esperados. |
| `git diff --name-only` | 0 tracked changes (solo untracked). | F3-05 no modifica archivos versionados en apply. |
| `git rev-parse --abbrev-ref HEAD` | `qa/frontend-release-readiness` | Rama correcta de trabajo. |
| `git rev-parse HEAD` | `ca2f9c3` | Sin commits nuevos del agente antes de verify. |
| `git remote get-url origin` | URL conteniendo `ifts14` | Repo correcto. |
| `Select-String "^## "` en `04-build-validacion-f3-05.md` | 8 secciones | Estructura del reporte completa. |
| `Select-String "ng build"` en reporte | ≥ 1 match | Comando de build documentado. |
| `Select-String "base-href"` en reporte | ≥ 1 match | Base href mencionada. |
| `Select-String "dist/"` en reporte | ≥ 1 match | Artefactos de `dist/` documentados. |
| `Select-String "secreto|dump|credencial|real.*DNI"` en reporte | 0 matches | Sin filtración de secretos. |
| `git diff --stat apps/frontend-angular/` | 0 líneas modificadas | F3-05 no toca código de producto. |
| `git diff --stat dist/` | 0 líneas | `dist/` no versionado. |
| `Select-String "baseHref"` en `angular.json` | Confirma `"/certificados/"` en production | Configuración de base href verificada. |
| Spec delta acceptance | No aplica (ciclo operacional) | Los 13 success criteria del proposal son los targets de verify. |
| Output literal del build (sección 3) | `Select-String "Build at:\|complete\.\$"` ≥ 1 en el reporte | Confirma que el output verbatim está presente. |
| `public_html` y `cPanel` no modificados | `Test-Path public_html` → unchanged; `git diff --stat public_html/` → 0 líneas | Confirma que F3-05 no tocó el servidor. |
| Marcos's active change | Sin tocar | `openspec/changes/backend-public-endpoint-hardening/` intacto. |
| Working tree final | 2 untracked (build report + change dir), 0 modified, 0 staged, HEAD `ca2f9c3` | Estado consistente post-verify. |

## Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|---|---|---|
| `node_modules` no instalado — build imposible sin `npm ci` previo. | CRÍTICO | Mati ejecuta `npm ci` antes del build; documentar como blocker en el reporte si no se resuelve. |
| `docs/frontend/03-qa-manual-f3-04.md` no existe en este árbol (commit `70008f0` solo en `frontend/v0-design-system`). | MEDIO | Documentar la discrepancia en el reporte; F3-05 es ortogonal a F3-04. |
| `--base-href` CLI redundante con `angular.json:41` (mismo valor). | BAJO | Documentar en el reporte que el flag coincidió con la config, no que la sobreescribió. |
| Warnings de budget CSS esperados (12,41 kB y 14,31 kB < 16 kB error). | BAJO | Reportar como carry-forward conocidos desde F4-02. |
| `dist/` no versionado — riesgo de stage accidental. | BAJO | Verificar explícitamente que `git add` no incluye `dist/` ni `node_modules/`. |
| Auto-commit trap — Git requiere aprobación de Mati + diff-confirmation gate. | BAJO | El verify-report lista comandos Git solo como propuesta; no se ejecutan sin aprobación. |
| Primer push de `qa/frontend-release-readiness` puede necesitar `--set-upstream`. | BAJO | Incluir `git push -u origin qa/frontend-release-readiness` en comandos propuestos. |
| Off-limits: Marcos's active change, F0 unmerged branches, `muestra_pagina/`, `material_privado_no_versionar/`. | BAJO | Exclusión explícita en out-of-scope y verificación de diff. |

## Fuera de alcance

- F3-06+ (handoff a Marcos).
- Deploy real a servidor o modificación de `public_html`.
- Modificación de configuración `cPanel`.
- Agregar nuevas dependencias.
- Auto-fix de errores de build (F3-05 documenta; ciclos futuros corrigen).
- Versionar artefactos de `dist/`.
- Tocar contenido de `muestra_pagina/` (solo lectura).
- Modificar el cambio activo de Marcos (`openspec/changes/backend-public-endpoint-hardening/`).

## Preguntas abiertas resueltas

- **Q1 — Nombre del reporte**: `docs/frontend/04-build-validacion-f3-05.md`.
- **Q2 — Build command**: Sí, ejecutar `ng build --configuration production --base-href /certificados/`.
- **Q3 — Dist artifacts**: Listar archivos de `dist/frontend-angular/browser/` con tamaños; no versionarlos.
- **Q4 — Commit message**: `build(frontend): validar build certificados`.
- **Q5 — Push command**: `git push -u origin qa/frontend-release-readiness` (rama nueva, requiere `--set-upstream`).
