# Archive Report — f1-02-v0-design-system

**Change**: f1-02-v0-design-system
**Phase**: sdd-archive
**Mode**: hybrid (OpenSpec + Engram)
**Branch**: frontend/v0-design-system-f1-02
**Archived at**: 2026-07-07
**Archive path**: `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/`

## Status

Cerrado. Verdict del verify-report: **PASS WITH WARNINGS** (sin issues CRITICAL). Tarea 5.4 `sdd-archive` ejecutada en este pase.

## Specs Sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `frontend-design-system-readiness` | **Creada** | 4 requirements (Tokens, Primitivos, Validación D0, Documentación), 8 escenarios Given/When/Then. Spec fuente de verdad en `openspec/specs/frontend-design-system-readiness/spec.md`. |

La spec destino no existía: el delta se promovió a spec fuente de verdad con `## Purpose` extraído de la propuesta. No se aplicaron deltas `MODIFIED`/`REMOVED`/`RENAMED` porque el dominio es nuevo y no hay conflictos con specs vigentes.

## Contenido del Archivo

- `proposal.md` ✅
- `exploration.md` ✅
- `design.md` ✅
- `specs/frontend-design-system-readiness/spec.md` ✅ (delta, queda en archive como audit trail)
- `tasks.md` ✅ (21/21 tasks `[x]`; 5.4 archivada en este pase)
- `apply-progress.md` ✅
- `verify-report.md` ✅
- `archive-report.md` ✅ (este archivo)

## Lineage Engram (trazabilidad)

Observaciones referenciadas en el reporte (todas `project: ifts14`, `scope: project`):

| Artefacto | Engram ID | sync_id |
|---|---|---|
| apply-progress | #5147 | `obs-5031ffbeff0d33ca` |
| verify-report | #5150 | `obs-656eaecf0a65cfff` |

Los artefactos previos (`explore`, `proposal`, `spec`, `design`, `tasks`) viven principalmente como filesystem en `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/`; la trazabilidad de la fase `archive` se cierra con la observación nueva del archive-report en Engram.

## Verificación del Cierre

- [x] Spec principal actualizada y sin requisitos duplicados.
- [x] Carpeta del cambio movida a `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/`.
- [x] Archive contiene propuesta, exploración, diseño, delta specs, tareas, progreso de apply y verify-report.
- [x] `tasks.md` archivado no contiene tareas de implementación sin completar (5.4 archivada en este pase).
- [x] Directorio `openspec/changes/` activo solo contiene `archive/`.

## Advertencias Preservadas (no bloqueantes)

- **Presupuesto de revisión 1500**: el diff de producto + docs queda dentro del presupuesto; si el PR incluye todos los artefactos OpenSpec y el verify-report, el delta puede superar las 1500 líneas. Estrategia de entrega `single-pr-default` confirmada en `apply-progress.md`.
- **QA visual no pixel-perfect**: el verify-report documenta comparación estática contra `muestra_pagina/app/globals.css` y medición de contraste mínima 5.19:1, sin capturas guardadas ni diff visual exhaustivo. La regresión visual queda cubierta por specs unitarios + Playwright en `127.0.0.1:4420/certificados/validar/demo-valido`.
- **`FolioShell` creado/testeado pero no integrado en página pública**: el primitivo existe y pasa specs como standalone; la integración real en `public-validation-page` queda para F2/F4 (folio completo con aside/sello/QR es scope de F4-01).
- **`CampoDato` desviado a directiva**: el diseño original preveía componente `app-campo-dato`; el gate W2 detectó violación del content model de `<dl>` con `display: contents` y se convirtió a directiva `[appCampoDato]` sobre `<dt>`/`<dd>` nativos con estilos `.campo-*` compartidos en `styles.css`. Desvío justificado, probado y documentado en `apply-progress.md` y `verify-report.md`.

## Coherencia con el Scope Declarado

- La fase `sdd-archive` no modificó código de producto: solo tocó artefactos de archive, spec y este reporte (vía `mv` filesystem puro, sin `git mv`).
- El ciclo F1-02 sí modificó código de producto frontend (tokens en `styles.css`, primitivos en `shared/ui`, `public-validation-page` y `app.{html,css}`) durante `sdd-apply`; esos cambios ya estaban verificados en `verify-report.md` antes del archive.
- No se modificó backend, deploy, base de datos, material privado ni dependencias en ninguna fase del ciclo.
- No se ejecutaron operaciones Git en el archive (`mv` filesystem puro, sin commit, sin push).
- `docs/frontend/02-sistema-visual-v0-f1-02.md`, `docs/frontend/00-angular20-port-v0.md` y `docs/00-indice-general.md` ya estaban parcheados durante `sdd-apply` (tareas 5.2/5.3). El preflight instruyó no volver a tocarlos.

## Próximo Paso

Ciclo SDD completo. El sistema visual v0 queda disponible como base para los ciclos F2-F6. No hay fase siguiente obligatoria; el próximo cambio debe iniciar con `/sdd-new` o `sdd-explore`.
