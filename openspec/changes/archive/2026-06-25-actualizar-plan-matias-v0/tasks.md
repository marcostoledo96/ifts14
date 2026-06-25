# Tasks: Actualizar plan de Matías tras disponibilidad de v0

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~620 (rango 550-720) |
| 800-line budget risk | Medium (cerca del techo) |
| Chained PRs recommended | Yes |
| Suggested split | 4 work units, uno por grupo de archivos |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
800-line budget risk: Medium

### Work units (stacked-to-main)

| # | Archivo | PR | Notas |
|---|---------|----|-------|
| 1 | `docs/frontend/00-angular20-port-v0.md` | PR 1 | ampliado a ~150 líneas; base = `main`. |
| 2 | `muestra_pagina/README.md` + `docs/00-indice-general.md` | PR 2 | depende de PR 1 (enlaza). |
| 3 | `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | PR 3 | ediciones quirúrgicas; depende de PR 1-2. |
| 4 | `MATIAS_PROMPTS_SDD_FASE2.md` (nuevo) | PR 4 | ~590 líneas; depende de PR 3 (link desde handoff). |

## Phase 1 — Verificación previa

- [x] 1.1 Confirmar inventario real (7 / 12) leyendo `exploration.md` del cambio; no abrir `material_privado_no_versionar/`.
- [x] 1.2 Verificar `openspec/config.yaml` por `rules.tasks` adicionales; respetar si existen.
- [x] 1.3 Cancelada por restricción del orquestador: la creación de rama se omite intencionalmente porque esta sesión es solo documentación y no permite mutaciones Git.

## Phase 2 — Núcleo documental

- [x] 2.1 Reescribir `docs/frontend/00-angular20-port-v0.md` como fuente de verdad: estado v0, inventario 7+12, tokens (paleta, tipografía, layout folio), componentes candidatos (`HeaderInstitucional`, `FolioCertificado`, `AdminShell`, `AccionesPrincipales`, `BandejaPendientes`), estados UX, riesgos de portado, regla "extraer intención visual, no código React/Next".
- [x] 2.2 Reemplazar `muestra_pagina/README.md`: estado actual (referencia v0 activa, 7 pantallas, 12 pendientes), uso permitido solo visual/funcional, derivación a `docs/frontend/00-angular20-port-v0.md`.
- [x] 2.3 Editar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con cambios quirúrgicos: `Ruta rápida` cita Fase 2, tabla "Uso de muestra_pagina/" (7/12), ciclo F1-01 refleja v0 real, nueva sección "Prompts pendientes post-F3" con tabla de 12 ítems y enlace a Fase 2, F3-06 con handoff explícito a `MATIAS_PROMPTS_SDD_FASE2.md`, troubleshooting F2-F3 menciona Fase 2.
- [x] 2.4 Crear `MATIAS_PROMPTS_SDD_FASE2.md` con plantilla F0-F3: encabezado, ruta rápida, reglas, F4 (prompts 11-14: detalle certificación, PDF, cursos), F5 (15-18: listados, alumnos, envío), F6 (19-22: revocación, carga masiva, auditoría, configuración), troubleshooting, fuentes de verdad, checklist. Cada ciclo exige spec previa si depende de API, PDF, QR, permisos o config no aprobada.
- [x] 2.5 Editar `docs/00-indice-general.md`: agregar fila para `MATIAS_PROMPTS_SDD_FASE2.md` en "Prompts operativos vigentes", sin duplicar contenido.

## Phase 3 — Verificación

- [x] 3.1 Matriz spec → documento: cada escenario de `specs/.../spec.md` cubierto por archivo tocado.
- [x] 3.2 Validar enlaces: `muestra_pagina/README.md` → `docs/frontend/...`; `docs/00-indice-general.md` → `MATIAS_PROMPTS_SDD_FASE2.md`; F0-F3 → Fase 2.
- [x] 3.3 Cumplir `docs/AGENTS.md` y `openspec/AGENTS.md`: español argentino formal, sin duplicación, sin material privado.
- [x] 3.4 `git diff --stat` para evidenciar líneas; total ~620, ningún archivo individual >800.

## Phase 4 — Cierre (sin commit)

- [x] 4.1 Mensajes sugeridos por archivo: `docs(frontend): fuente de verdad del port v0`, `docs(muestra-pagina): sincronizar estado real`, `docs(plan-matias): handoff a fase 2`, `docs(plan-matias-fase2): crear plan operativo F4-F6`, `docs(indice): enlazar plan fase 2`. NO commit, push, merge ni rebase.
- [x] 4.2 Reporte: archivos tocados, líneas por diff, escenarios cubiertos, enlaces verificados.
