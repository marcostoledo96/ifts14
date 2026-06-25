# Proposal: Actualizar plan de Matías tras disponibilidad de v0

## Intent

Actualizar la planificación frontend de Matías porque `muestra_pagina/` ya contiene diseño v0 utilizable para 7 pantallas (prompts 4-10) y faltan 12 prompts (11-22). La guía actual F0-F3 asume que la carpeta puede estar vacía y no prevé el trabajo restante.

## Scope

### In Scope
- Actualizar estado y supuestos en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- Agregar sección de handoff a Fase 2 al final de F3-06.
- Crear `MATIAS_PROMPTS_SDD_FASE2.md` con planificación de prompts 11-22.
- Actualizar inventario, tokens y riesgos en `docs/frontend/00-angular20-port-v0.md`.
- Sincronizar `muestra_pagina/README.md` con el estado real.
- Actualizar `docs/00-indice-general.md` con la nueva entrada de planificación.

### Out of Scope
- Implementar código Angular/PHP/DB.
- Instalar dependencias.
- Generar nuevas pantallas en v0.
- Commits, push o merge.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None.

## Approach

Seguir la recomendación de exploración: mantener `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como guía de Fase 1 (F0-F3) y crear un documento separado para Fase 2. Esto evita que la guía vigente crezca indefinidamente y permite decidir posteriormente si se ejecutan los ciclos F4-F6.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | Estado real de `muestra_pagina/`, prompts pendientes y handoff a Fase 2. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | New | Planificación de prompts 11-22 agrupados en ciclos F4-F6. |
| `docs/frontend/00-angular20-port-v0.md` | Modified | Inventario de pantallas, tokens visuales, componentes y riesgos de portado. |
| `muestra_pagina/README.md` | Modified | Estado actual: referencia v0 activa, 7 pantallas listas, 12 pendientes. |
| `docs/00-indice-general.md` | Modified | Referencia al nuevo documento de Fase 2. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Copia literal de React/Next a Angular | Med | Reforzar en guía y docs que se extrae intención visual, no código. |
| Desactualización si v0 cambia antes del portado | Med | Documentar versión de referencia y revisar al inicio de cada ciclo. |
| Scope creep en prompts complejos (PDF, QR, config) | Med | Definir specs previas antes de cada ciclo F4-F6. |
| Fragmentación documental | Low | Centralizar estado en `docs/frontend/00-angular20-port-v0.md`. |

## Rollback Plan

Revertir los archivos modificados con `git checkout -- <archivo>` o eliminar `MATIAS_PROMPTS_SDD_FASE2.md` si aún no se commiteó. La guía F0-F3 original queda intacta salvo por la sección de handoff.

## Dependencies

- Contenido actual de `muestra_pagina/` ya auditado en `exploration.md`.
- Decisión de Marcos sobre prioridad de Fase 2.

## Success Criteria

- [ ] `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` refleja que `muestra_pagina/` tiene 7 pantallas y 12 pendientes.
- [ ] Existe `MATIAS_PROMPTS_SDD_FASE2.md` con prompts 11-22 agrupados en ciclos trazables.
- [ ] `docs/frontend/00-angular20-port-v0.md` documenta inventario, tokens y riesgos.
- [ ] `muestra_pagina/README.md` y `docs/00-indice-general.md` están sincronizados.
