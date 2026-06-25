# Archive report — actualizar-plan-matias-v0

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-25-actualizar-plan-matias-v0/` y spec promovido a `openspec/specs/actualizar-plan-matias-v0/spec.md` (creación, no merge: no existía spec principal para el dominio).

Veredicto del ciclo: `PASS WITH WARNINGS`. Cero issues CRITICAL. SDD cycle complete.

## Qué cambió

Actualización de la planificación frontend de Matías porque `muestra_pagina/` ya contiene una referencia v0 utilizable para prompts 4-10 y quedaban 12 prompts pendientes (11-22). La guía F0-F3 se sincronizó con el estado real, se creó una guía operativa de Fase 2, `docs/frontend/00-angular20-port-v0.md` quedó como fuente de verdad del port visual, y `muestra_pagina/README.md` y `docs/00-indice-general.md` se actualizaron para descubrimiento y advertencia de uso.

Archivos tocados (todos documentales, ningún producto):

| Archivo | Estado | Alcance |
|---|---|---|
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificado (trackeado) | 43 inserciones, 17 eliminaciones. Ruta rápida, uso de `muestra_pagina/` (7/12), tabla de prompts pendientes, F3-06 con handoff explícito a Fase 2, troubleshooting F2-F3 menciona Fase 2. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Creado (no trackeado) | ~115 líneas. Guía operativa de prompts 11-22 agrupados en F4 (detalle certificación, PDF, cursos), F5 (listados, alumnos, envío), F6 (revocación, carga masiva, auditoría, configuración institucional). Cada ciclo exige spec previa si depende de API, PDF, QR, permisos o config no aprobada. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado (trackeado) | 87 inserciones, 19 eliminaciones. Fuente de verdad del port visual: estado v0, inventario 7+12, tokens (paleta, tipografía, layout folio), componentes candidatos, estados UX, riesgos, regla "extraer intención visual, no código React/Next". |
| `muestra_pagina/README.md` | Modificado (trackeado) | 22 inserciones, 8 eliminaciones. Estado actual: referencia v0 activa, 7 pantallas listas, 12 pendientes, uso permitido solo como referencia visual/funcional, derivación al documento frontend. |
| `docs/00-indice-general.md` | Modificado (trackeado) | 2 inserciones, 1 eliminación. Enlace breve a `MATIAS_PROMPTS_SDD_FASE2.md` en "Prompts operativos vigentes", sin replicar contenido. |

Total documental intencional trackeado: 199 líneas. Total con nuevo documento: ~314 líneas. Bien dentro del presupuesto de 800 líneas.

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `actualizar-plan-matias-v0` | Creada | 5 requisitos, 7 escenarios Given/When/Then. Es un contrato documental, no de producto. |

Nota: el proposal explícitamente declara "New Capabilities: None" y "Modified Capabilities: None". Se sigue la convención OpenSpec de crear el spec principal en `openspec/specs/` para mantener la trazabilidad del cambio, aunque el "contrato" sea de documentación y no de capacidad de producto. El source-of-truth durable del estado post-cambio son los documentos modificados, no este spec.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen | Engram obs |
|---|---|---|
| `exploration.md` | `openspec/changes/actualizar-plan-matias-v0/` (ahora archivado) | #3851 |
| `proposal.md` | id. | #3852 |
| `specs/actualizar-plan-matias-v0/spec.md` | id. | #3853 |
| `design.md` | id. | #3854 |
| `tasks.md` | id. | #3858 |
| `apply-progress` (Engram) | observation only | #3861 |
| `verify.md` | `openspec/changes/actualizar-plan-matias-v0/` | #3870 |
| Design gate (fresh-context) | observation | #3857 |
| Dirty worktree observations | observation | #3859, #3862, #3863 |
| Session summaries | observation | #3855, #3856, #3860, #3865, #3871 |

Skills cargadas: `sdd-archive`, `cognitive-doc-design`.

## Archivos modificados durante el archivado

| Archivo | Acción | Alcance |
|---|---|---|
| `openspec/specs/actualizar-plan-matias-v0/spec.md` | Creado | Spec principal, copia del delta del cambio. |
| `openspec/changes/actualizar-plan-matias-v0/` → `openspec/changes/archive/2026-06-25-actualizar-plan-matias-v0/` | Movido | Carpeta completa: exploration, proposal, design, specs, tasks, verify. No había `apply-progress.md` en disco (vivía en Engram). |

No se modificaron `apps/frontend-angular/`, `apps/backend-php/`, `database/`, `deploy/`, `package.json`, `composer.json` ni configuración de producto.

## Evidencia de verificación

| Comando / chequeo | Resultado |
|---|---|
| `git diff --check` | PASS (sin warnings de whitespace). |
| `git diff --stat` | PASS WITH WARNINGS: 5 archivos trackeados, 154 inserciones, 838 bajas; la baja grande es de `muestra_pagina/revision_y_parches_prompts_stitch_v0_ifts14.md`, fuera de alcance de este cambio. |
| `git status --short` | PASS WITH WARNINGS: cambios esperados de docs + ruido preexistente (baja fuera de alcance + v0 no trackeado en `muestra_pagina/` + change no trackeado `openspec/changes/backend-validacion-publica-certificados/`). |
| Tareas | 12/12 marcadas `[x]` (1.3 cancelada explícitamente por restricción de no mutar Git en sesión documental). |
| Spec → docs | 7/7 escenarios cubiertos (matriz en `verify.md`). |
| Coherencia con diseño | 5/5 decisiones de diseño confirmadas. |
| Correctitud documental | PASS (sin secretos, sin material privado, sin backend/DB, sin Git automático, sin deps no aprobadas, sin invención de contratos). |
| `git status --short -- apps/frontend-angular apps/backend-php database deploy package.json composer.json` | PASS (sin cambios en producto). |

## Warnings y notas

### WARNING — Baja fuera de alcance en `muestra_pagina/revision_y_parches_prompts_stitch_v0_ifts14.md`

El `git diff --stat` reporta una baja de 793 líneas en `muestra_pagina/revision_y_parches_prompts_stitch_v0_ifts14.md` que no fue realizada por este cambio. Es ruido preexistente del working tree. No se restauró ni se modificó en este archivado. Decisión humana pendiente antes de cualquier commit o PR.

### WARNING — Material v0 no trackeado bajo `muestra_pagina/`

Hay ~9 entradas `??` bajo `muestra_pagina/` (carpetas `app/`, `capturas/`, `components/`, `lib/`, `public/`, archivos `package.json`, `tsconfig.json`, `next.config.mjs`, `prompts_stitch_v0_ifts14.md`, etc.) que pertenecen a la descarga v0 de Stitch. No son parte de este cambio. Deben aislarse antes de cualquier commit.

### WARNING — Otro change no trackeado en `openspec/changes/`

`openspec/changes/backend-validacion-publica-certificados/` aparece como `??` y no forma parte de este archivado. Debe aislarse antes de cualquier commit.

### SUGGESTION

- Si se decide versionar este cambio, partir en 4 work units (PR stacked) como sugiere `tasks.md`: docs/frontend → muestra_pagina+indice → F0-F3 → Fase 2.
- Aislar explícitamente la baja fuera de alcance y los `??` antes de `git add`.
- Considerar que `openspec/specs/actualizar-plan-matias-v0/spec.md` refleja un contrato documental (no de producto). Es consistente con el patrón de specs documentales previos (`guia-matias-angular-windows`, `repo-precommit`, `repo-limpio`).

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Copia literal de React/Next a Angular | Media | Documentado en `docs/frontend/00-angular20-port-v0.md`: extraer intención visual, no código. |
| Desactualización si v0 cambia antes del portado | Media | Documentar versión de referencia y revisar al inicio de cada ciclo F4-F6. |
| Scope creep en prompts complejos (PDF, QR, config) | Media | `MATIAS_PROMPTS_SDD_FASE2.md` exige spec previa antes de ejecutar cada ciclo si depende de API, PDF, QR, permisos o config no aprobada. |
| Fragmentación documental | Baja | Centralizado en `docs/frontend/00-angular20-port-v0.md`; el índice y F0-F3/Fase 2 solo enlazan. |
| Ruido preexistente del working tree | Baja | Aislar antes de commitear. No es responsabilidad de este cambio resolverlo. |

## Comandos Git propuestos (no ejecutar)

Estos son los comandos sugeridos a Marcos. NO se ejecutaron en este archivado:

```bash
# 1. Revisar el estado actual antes de cualquier add
git status --short --untracked-files=all
git diff --stat

# 2. Stagiar la spec principal nueva
git add openspec/specs/actualizar-plan-matias-v0/spec.md

# 3. Stagiar la carpeta archivada del cambio
git add openspec/changes/archive/2026-06-25-actualizar-plan-matias-v0/

# 4. Stagiar los 4 archivos documentales modificados por el change
git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git add docs/frontend/00-angular20-port-v0.md
git add muestra_pagina/README.md
git add docs/00-indice-general.md

# 5. Stagiar el nuevo documento no trackeado
git add MATIAS_PROMPTS_SDD_FASE2.md

# 6. Mensaje de commit sugerido (estilo conventional commits del repo)
git commit -m "docs(plan-matias): sincronizar plan F0-F3 con v0 y crear fase 2 F4-F6"
```

> Los comandos anteriores son **propuestas**. La regla de Marcos en `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, por lo que ninguno se ejecutó durante este ciclo.

## Estado

SDD cycle complete. La guía F0-F3 queda sincronizada con el estado real, la guía de Fase 2 queda preparada para prompts 11-22, y la fuente de verdad del port visual está consolidada. Próximo ciclo recomendado: definir contrato de API/PDF/QR pendiente de Fase 2 o iniciar un change de backend (`backend-validacion-publica-certificados`) que prepare esos contratos.
