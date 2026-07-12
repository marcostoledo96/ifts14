# Handoff a Marcos — F3-06

**Ciclo**: F3-06 — Handoff a Marcos  
**Rama**: `qa/frontend-release-readiness`  
**HEAD**: `e8b3f56`  
**Fecha**: 2026-07-12  
**Autor del handoff**: Matías (cierre de Fase 3)  
**Destinatario**: Marcos (release/admin de `/certificados/`)

---

## Resumen ejecutivo

Fase 3 del módulo `/certificados/` queda cerrada con este handoff: F3-04 (QA manual) y F3-05 (build de producción) están documentados, la rama `qa/frontend-release-readiness` contiene el build verificado y el roadmap F4-F6 está listo para que Marcos defina prioridades y acciones de merge. Se requieren decisiones explícitas de Marcos antes de iniciar F4-01.

---

## Estado de Mati en Fase 3

### Entregables cerrados

| Ciclo | Resultado | Evidencia principal | Ubicación permanente |
|---|---|---|---|
| F2-04 — Cursos y fechas admin | PASS (con warnings documentales) | 239 tests, build verde | `apps/frontend-angular/src/app/features/admin/courses/`, archive `2026-07-07-f2-04-admin-courses-dates/` |
| F2-05 — Asistencias admin | PASS WITH WARNINGS | 315 tests, build verde | `apps/frontend-angular/src/app/features/admin/attendances/`, archive `2026-07-08-f2-05-admin-attendance/` |
| F2-06 — Certificaciones admin | PASS | 394 tests, build verde | `apps/frontend-angular/src/app/features/admin/certifications/`, archive `2026-07-09-f2-06-admin-certifications/` |
| F3-04 — QA manual completo | Cerrado con 5 placeholders "Pendiente" | QA manual transversal | Commit `70008f0` en `frontend/v0-design-system`; no mergeado a `qa/frontend-release-readiness` |
| F3-05 — Build para `/certificados/` | PASS con 2 warnings CSS budget | Build 6.256 s, 30 archivos, `<base href="/certificados/">` | `docs/frontend/04-build-validacion-f3-05.md`, archive `2026-07-12-f3-05-build-para-certificados/` |
| F3-06 — Handoff a Marcos | En cierre | Este documento | `docs/frontend/05-handoff-marcos-f3-06.md` |

### Estado de los 7 PRs en cola para Marcos

| PR / ciclo | Estado | Rama / ubicación | Acción requerida de Marcos |
|---|---|---|---|
| F0-02 — Verificar OpenCode/Gentle-AI | Mergeado a `main` | `main` | Ninguna — referencia histórica. |
| F0-03 — Leer documentación mínima y misión | Mergeado a `main` | `main` | Ninguna — referencia histórica. |
| F1-01 — Auditar `muestra_pagina/` | Mergeado a `main` | `main` | Ninguna — referencia histórica. |
| F1-02 — v0 design system | Mergeado a `main` | `main` | Ninguna — referencia histórica. |
| Policy commits (permitir commit / switch con aprobación) | Mergeados a `main` | `main` | Ninguna — referencia histórica. |
| F3-04 — QA manual completo | Cerrado en archive, **NO mergeado** | `frontend/v0-design-system` | Decidir: ¿mergea `70008f0` + reporte F3-04, o re-corre QA sobre `qa/frontend-release-readiness`? |
| F3-05 — Build para `/certificados/` | Cerrado, commit `e8b3f56` en `qa/frontend-release-readiness` | `qa/frontend-release-readiness` | Decidir: ¿crea PR ahora, o acepta PR combinado con F3-06? |

**Resumen**: 5 PRs ya mergeados, **2 pendientes de merge** (F3-04 y F3-05). F3-05 es el único commit adelante de `origin/main` (`ca2f9c3`) en la rama de trabajo.

---

## Resumen de F3-04

F3-04 fue un QA manual transversal sobre la app Angular 20. El reporte completo vive en el commit `70008f0` de la rama `frontend/v0-design-system` y fue archivado en `openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/` (referencia histórica).

### Qué se verificó (resumen abstracto)

- **Responsive**: revisión en 360 px, 390 px, 430 px, tablet y desktop.
- **Teclado y foco**: navegación por tab, foco visible, skip link, landmarks.
- **Contraste y legibilidad**: tokens de color institucional, texto legible.
- **Estados de carga/vacío/error/éxito/no encontrado**: mensajes claros sin datos sensibles.
- **Consola del navegador**: sin errores nuevos en flujos tocados.

### 5 placeholders pendientes de Mati

El reporte F3-04 dejó intencionalmente 5 secciones con el estado **"Pendiente"**, a completar por Mati con una pasada visual en navegador antes de declarar release-readiness completo:

| Sección | Pendiente | Cómo cerrarlo |
|---|---|---|
| Responsive final | Pendiente | Abrir cada pantalla admin y pública en los viewports definidos. |
| Teclado y foco | Pendiente | Recorrer con `Tab`, `Shift+Tab`, `Enter` y verificar foco visible. |
| Contraste | Pendiente | Revisar badges, botones disabled y estados de error. |
| Estados empty/error | Pendiente | Forzar ids inválidos y datos vacíos en cada listado/detalle. |
| Consola | Pendiente | Ejecutar build dev, navegar todos los flujos y revisar logs. |

Esta deuda no bloquea el cierre de F3-06, pero sí el merge definitivo a `main` si se exige release-readiness completo.

---

## Resumen de F3-05

El ciclo F3-05 verificó que la app Angular 20 buildee correctamente para producción bajo `/certificados/`. El reporte completo está en `docs/frontend/04-build-validacion-f3-05.md`.

### Comando ejecutado

```powershell
cd apps/frontend-angular
npm run build -- --configuration production --base-href /certificados/
```

### Resultado clave

| Métrica | Valor |
|---|---:|
| Tiempo de build | 6.256 s |
| Archivos generados en `dist/frontend-angular/` | 30 |
| Bundle inicial (raw / transfer gzip) | 314.03 kB / 90.41 kB |
| `<base href>` verificada | `/certificados/` (línea 6 de `index.html`) |
| Errores | 0 |
| Warnings | 2 (CSS budget) |

### Warnings de CSS budget (carry-forward)

| Archivo CSS | Tamaño | Budget warning | Estado |
|---|---|---:|---|
| `certification-preview-page.css` | 14.31 kB | 8.00 kB | ⚠️ Warning, dentro de 16 kB error |
| `certification-pdf-preview-page.css` | 13.70 kB | 8.00 kB | ⚠️ Warning, dentro de 16 kB error |

Ambos warnings provienen de los ciclos F4-01 y F4-02 y fueron aceptados como trade-off de paridad visual. La mitigación (code-splitting o ajuste de budget) queda para un ciclo futuro.

### Pendientes documentados en F3-05

- Investigar los 2 chunks unnamed grandes (`chunk-JQPWM6M7.js` 141.49 kB, `chunk-7EIYO3ES.js` 114.56 kB).
- Validar `.htaccess` SPA fallback para deep links en cPanel.
- Decidir si el patch a `docs/frontend/00-angular20-port-v0.md` se aplica en este ciclo o en `sdd-archive`.

---

## Roadmap F4-F6

Los ciclos F4-F6 cubren los flujos 11-22 de `muestra_pagina/` y están definidos en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 1485-1755). F3-06 solo los documenta; no los inicia.

| Ciclo | Objetivo one-liner | Rama sugerida | Estado | Decisión humana |
|---|---|---|---|---|
| F4-01 | Detalle administrativo de certificación (expediente con estado, trazabilidad, acciones). | `frontend/certificate-detail-pdf` | Habilitado | ¿Incluir historial/QR/revocación real o dejarlo mock-only? |
| F4-02 | Vista previa PDF complementaria del certificado (A4 apaisado, impresión nativa). | `frontend/certificate-detail-pdf` | Habilitado | ¿Acoplar a F4-01 en la misma rama o PR separado? |
| F4-03 | Listado administrativo de cursos con filtros, fechas y estados. | `frontend/admin-courses` | Habilitado | ¿Usar mocks o requerir contrato de datos aprobado? |
| F4-04 | Detalle administrativo de curso (fechas, asistencias, certificaciones asociadas). | `frontend/admin-courses` | Habilitado | ¿Agregar aquí `.htaccess` SPA fallback? |
| F5-01 | Listado administrativo de certificaciones (filtros, paginación, estados). | `frontend/admin-certifications` | Habilitado | ¿Contrato de filtros y paginación antes de implementar? |
| F5-02 | Listado administrativo de alumnos (datos visibles por spec). | `frontend/admin-students` | Habilitado | ¿DNI completo en contexto privado/administrativo? |
| F5-03 | Detalle administrativo de alumno (datos personales permitidos). | `frontend/admin-students` | Habilitado | ¿Spec previa de datos visibles? |
| F5-04 | Entrega manual de certificación (copiar link / descargar PDF, sin email). | `frontend/admin-certifications` | Pendiente por prioridad | ¿Prioridad respecto a F4-01/F4-02? |
| F6-01 | Revocar certificación (confirmación clara, efecto irreversible). | `frontend/admin-certifications` | Bloqueado por spec | ¿Spec de permisos y estado irreversible antes de F4-01? |
| F6-02 | Placeholder de carga masiva (sin importación real). | `frontend/admin-bulk-config` | Pendiente por alcance | ¿Placeholder visual o omitir hasta MVP posterior? |
| F6-03 | Auditoría básica (eventos auditables, permisos por spec). | `frontend/admin-certifications` | Bloqueado por spec | ¿Contrato de eventos y permisos antes de F4-01? |
| F6-04 | Configuración institucional (firmantes, datos no sensibles). | `frontend/admin-bulk-config` | Bloqueado por spec | ¿Configuración aprobada antes de F4-02/PDF? |

**Nota**: F4-01 y F4-02 ya están implementados en la rama actual (archives `2026-07-12-f4-01-certificate-detail/` y `2026-07-12-f4-02-certificate-pdf-preview/`). El resto del roadmap es trabajo pendiente.

---

## Riesgos y pendientes

| Severidad | Ítem | Descripción | Mitigación / próximo paso |
|---|---|---|---|
| Media | CSS budget warning | `certification-preview-page.css` (14.31 kB) y `certification-pdf-preview-page.css` (13.70 kB) exceden el warning de 8 kB. | Code-splitting CSS o ajuste de budget en ciclo futuro. |
| Media | Chunks unnamed | `chunk-JQPWM6M7.js` (141.49 kB) y `chunk-7EIYO3ES.js` (114.56 kB) no tienen nombre de feature. | Investigar origen (probablemente vendor Angular); documentar en ciclo de optimización. |
| Media | `.htaccess` SPA fallback | Deep links como `/admin/login` fallarán en cPanel si no se configura rewrite a `index.html`. | Decisión de Marcos: F4-04 o ciclo dedicado. |
| Media | F3-04 placeholders | 5 secciones de QA manual quedaron "Pendiente"; Mati debe completar la pasada visual. | No bloquea F3-06; sí bloquea release-readiness completo. |
| Baja | `node_modules` | El build de F3-05 requirió `npm ci` previo; cualquier build futuro debe repetirlo. | Documentar en cada ciclo que ejecute build. |
| Baja | `dist/` no versionado | El output de build no se commitea salvo decisión explícita. | Mantiene `.gitignore`; no requiere acción. |
| Baja | PR combinado | Si F3-05 no se mergea antes, el PR de F3-06 incluirá F3-05 + F3-06. | Marcos decide: merge primero o PR combinado. |
| Baja | Cambio activo de Marcos | `openspec/changes/backend-public-endpoint-hardening/` está activo; F3-06 no lo toca. | Seguir respetando off-limits. |

---

## Comandos Git propuestos (NO ejecutados por OpenCode)

Estos comandos son una propuesta para que Marcos o Mati ejecuten tras revisar el diff y aprobar el commit. OpenCode no los corrió.

```powershell
# 1. Verificar estado y diff
git status --short
git diff --stat

# 2. Si el diff es correcto y Mati aprueba, stage
git add docs/frontend/05-handoff-marcos-f3-06.md openspec/changes/f3-06-handoff-a-marcos/
# Si se aplica el patch opcional de port-v0 en este commit:
# git add docs/frontend/00-angular20-port-v0.md

# 3. Commit
git commit -m "docs(frontend): preparar handoff a marcos"

# 4. Push (rama ya tracked en origin; no requiere --set-upstream)
git push origin qa/frontend-release-readiness
```

### Pre-push safety (obligatorio por AGENTS.md)

```powershell
# Rama ya existe en origin; comparar contra remoto
git log origin/qa/frontend-release-readiness..qa/frontend-release-readiness --oneline
git diff origin/qa/frontend-release-readiness..qa/frontend-release-readiness --stat
```

El diff esperado es:

- 1 archivo nuevo: `docs/frontend/05-handoff-marcos-f3-06.md`.
- 1 directorio nuevo: `openspec/changes/f3-06-handoff-a-marcos/` (7 artefactos SDD).
- Opcionalmente 1 archivo modificado: `docs/frontend/00-angular20-port-v0.md` (si se aplica el patch de "Ver también" ahora).

---

## Decisiones requeridas de Marcos

Antes de iniciar F4-01, Marcos debe responder las siguientes decisiones:

1. **Merge de F3-05**: ¿crea el PR de F3-05 ahora y lo mergea antes del handoff, o prefiere un PR combinado F3-05 + F3-06?
2. **F3-04 en el árbol actual**: ¿mergea el commit `70008f0` desde `frontend/v0-design-system`, o prefiere que Mati re-corra F3-04 sobre `qa/frontend-release-readiness`?
3. **Pasada visual F3-04**: ¿Mati completa los 5 placeholders de QA manual en navegador antes del merge a `main`, o se acepta la deuda documentada?
4. **Acoplamiento F4-01 + F4-02**: ¿se mantienen como un solo PR (rama `frontend/certificate-detail-pdf`) o se separan en PRs independientes?
5. **Prioridad de F5-04 vs. F4-01/F4-02**: ¿Marcos prioriza terminar detalle/PDF de certificación antes de habilitar la entrega manual?
6. **`.htaccess` SPA fallback**: ¿se aborda como parte de F4-04 (detalle de curso) o como ciclo dedicado antes del deploy?
7. **Patch de `docs/frontend/00-angular20-port-v0.md`**: ¿se aplica ahora en el mismo commit, o se deja para `sdd-archive`? (Recomendado: aplicar en `sdd-archive` con 3 sub-entradas para F3-04, F3-05 y F3-06.)

Sin estas decisiones, F4-01 puede iniciar con alcance no acordado o con deuda técnica no planificada.

