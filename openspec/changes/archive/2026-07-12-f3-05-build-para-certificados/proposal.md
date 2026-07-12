# Proposal: F3-05 — Build para `/certificados/`

## Intent

Verificar que el build de producción de la app Angular 20 compila correctamente con `base-href /certificados/` (requerido para deploy en cPanel) y documentar el resultado como reporte técnico. Es el quinto ciclo operativo de Fase 3, de carácter estrictamente documental: no introduce código de producto, no despliega al servidor y no modifica la spec base.

## Scope

### In Scope
- Ejecutar `ng build --configuration production --base-href /certificados/` (requiere `npm ci` previo).
- Documentar output literal, artefactos generados en `dist/`, tamaños y warnings.
- Confirmar que `baseHref: "/certificados/"` está en `angular.json` production (línea 41).
- Crear `docs/frontend/04-build-validacion-f3-05.md` con el reporte completo.
- Parchar `docs/frontend/00-angular20-port-v0.md` con referencia al nuevo reporte.
- Completar los 7 artefactos SDD estándar (explore, proposal, design, tasks, apply-progress, verify-report, archive-report).

### Out of Scope
- Deploy real a cPanel, copiar a `public_html`, modificar configuración del servidor.
- Código de producto, `apps/frontend-angular/src/**`, dependencias nuevas.
- `muestra_pagina/` (sólo referencia visual), `material_privado_no_versionar/`.
- `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Delta a `openspec/specs/` (ciclo operacional, no nueva capacidad).
- F3-06+ (handoff a Marcos, futuros ciclos).
- Versionar `dist/` o artefactos de build.

## Capabilities

> Este ciclo no introduce ni modifica capacidades a nivel de spec. Es operacional.

### New Capabilities
- None

### Modified Capabilities
- None

## Approach

1. **Setup**: `cd apps/frontend-angular && npm ci` (bloqueador crítico: `node_modules` no instalado).
2. **Build**: `ng build --configuration production --base-href /certificados/` — capturar salida literal.
3. **Análisis**: listar `dist/frontend-angular/browser/`, medir tamaños, confirmar `<base href="/certificados/">` en `index.html`.
4. **Documentación**: redactar `docs/frontend/04-build-validacion-f3-05.md` con secciones: Resumen ejecutivo, Comando ejecutado, Output del build, Artefactos generados, Tamaño del bundle, Errores y warnings, Base href verificada, Pendientes.
5. **Verify + Archive**: `sdd-verify` sobre los 7 artefactos, `sdd-archive` con handoff.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/frontend/04-build-validacion-f3-05.md` | Nuevo | Reporte de verificación del build (~200-300 líneas). |
| `docs/frontend/00-angular20-port-v0.md` | Patch menor | Referencia al reporte F3-05 en sección "Ver también" (~4 líneas). |
| `openspec/changes/f3-05-build-para-certificados/` | Nuevo | 7 artefactos SDD estándar, sin `spec.md`. |
| `apps/frontend-angular/node_modules/` | Generado (no versionado) | `npm ci` habilita el build. |
| `apps/frontend-angular/dist/` | Generado (no versionado) | Artefactos del build, inspección read-only. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **CRÍTICO**: `node_modules` no instalado — build imposible sin `npm ci` o `npm install`. | High | Ejecutar `npm ci` antes del build (read-only verification, no requiere aprobación Git). |
| **MEDIO**: `docs/frontend/03-qa-manual-f3-04.md` no está en este árbol (commit `70008f0` sólo en `frontend/v0-design-system`). | Medium | F3-05 es ortogonal a F3-04; documentar la discrepancia en el reporte. |
| **BAJO**: `--base-href` CLI redundante con `angular.json:41` (mismo valor `/certificados/`). | High | Documentar que el flag coincidió con la config, no que la sobreescribió. |
| **BAJO**: Warnings de budget CSS esperados (`certification-pdf-preview-page.css` 12,41 kB y `certification-preview-page.css` 14,31 kB < 16 kB error). | High | Reportar como carry-forward conocidos desde F4-02. |
| **BAJO**: `dist/` no se versiona — verificar que `git add` no lo incluya. | Low | Excluir `dist/` explícitamente en el stage. |
| **BAJO**: Auto-commit trap — Git requiere aprobación explícita de Mati + diff-confirmation gate. | Low | Seguir AGENTS.md del repo raíz. |
| **BAJO**: Primer push requiere `--set-upstream` en `qa/frontend-release-readiness`. | Low | Usar `git push -u origin qa/frontend-release-readiness`. |

## Rollback Plan

Ciclo documental sin código de producto. Si el build falla:
1. Documentar el error verbatim en el reporte.
2. Identificar causa probable (dependencia, TypeScript, etc.).
3. Proponer próximo paso (fix en ciclo futuro, no en F3-05).
4. No commitear `dist/` ni `node_modules/`.

Si el build pasa pero revela problemas de configuración:
1. Documentar hallazgos sin modificar `angular.json` ni `package.json`.
2. Proponer corrección en ciclo posterior con spec propia.

## Dependencies

- `npm ci` o `npm install` en `apps/frontend-angular/` (prerrequisito del build).
- `qa/frontend-release-readiness` como rama de trabajo (ya creada y pusheada a origin).

## Success Criteria

- [ ] `ng build --configuration production --base-href /certificados/` ejecuta o queda bloqueo verificable documentado.
- [ ] Reporte `docs/frontend/04-build-validacion-f3-05.md` existe con secciones: Resumen ejecutivo, Comando ejecutado, Output del build, Artefactos generados, Tamaño del bundle, Errores y warnings, Base href verificada, Pendientes.
- [ ] El reporte incluye la salida literal del build (sin resumir métricas finales).
- [ ] El reporte lista archivos de `dist/frontend-angular/browser/` con tamaños.
- [ ] El reporte confirma `<base href="/certificados/">` en `dist/.../index.html`.
- [ ] El reporte documenta warnings de budget CSS como carry-forward (no bloqueantes).
- [ ] No se modificó `public_html`, cPanel ni configuración real del servidor.
- [ ] `dist/` y `node_modules/` NO fueron versionados.
- [ ] El reporte no contiene secretos, DNI real ni credenciales de producción.
- [ ] `verify-report.md` confirma sdd-verify PASS sin hallazgos CRITICAL.
- [ ] El ciclo termina con propuesta de commit a Mati (no se ejecuta Git automáticamente).
- [ ] Mensaje de commit propuesto: `build(frontend): validar build certificados`.
- [ ] Push propuesto: `git push -u origin qa/frontend-release-readiness`.
