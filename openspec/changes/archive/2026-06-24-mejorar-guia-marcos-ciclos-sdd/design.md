# Diseño: Guía operativa de Marcos para ciclos SDD

## Enfoque técnico

Reescritura documental compacta de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (101 → ~400-600 líneas) preservando IDs M1-01..M3-03. Único archivo en la raíz; arquitectura interna con divulgación progresiva: ruta rápida, tabla QA, plantilla, 9 ciclos, anexo skills, handoff, comandos Git. Aplica el patrón del ciclo archivado `mejorar-guia-matias-angular-windows` (híbrido + plantilla repetible) pero más compacto. Sigue la convención OpenSpec de crear spec principal en `openspec/specs/guia-marcos-ciclos-sdd/spec.md`.

## Decisiones de arquitectura documental

| Decisión | Alternativa descartada | Rationale |
|---|---|---|
| Un único archivo en la raíz. | Dividir en varios docs. | Marcos ya conoce la ruta; el archivo principal es el prompt raíz vigente de `AGENTS.md`. |
| Plantilla repetible para los 9 ciclos. | Redactar cada ciclo libre. | Reduce carga cognitiva y permite verificar completitud por campo. |
| Énfasis en "cuándo detenerse" con tabla y comandos. | Sección genérica de QA al final. | Es la queja principal: hoy la guía no dice dónde validar. |
| Anexo breve de skills/agents solo si es verificable. | Inventario completo. | Riesgo de obsolescencia; mejor avisar "pendiente de validar". |
| Comandos Git solo como propuesta. | Tutorial de Git. | Marcos es experimentado; el bloque de cierre ya alcanza. |
| División en 2 WU si el diff > 400 líneas. | WU único siempre. | Orchestrador configuró `force-chained`; conviene cortar en estructura + ciclos. |

## Flujo de información

```txt
Fuentes de verdad
AGENTS.md / GUIA.md / docs/00-indice-general.md
openspec/specs/backend-contrato-api-certificados
openspec/specs/backend-modelo-datos-certificados
        │
        ▼
MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
        ├─ Ruta rápida + rol + prohibiciones
        ├─ Cuándo detenerse (tabla QA con comandos)
        ├─ Plantilla de ciclo
        ├─ M1-01..M1-03 (limpieza, auditoría, modelo)
        ├─ M2-01..M2-03 (contrato API, base PHP, validación pública)
        ├─ M3-01..M3-03 (integración, deploy, hardening)
        ├─ Anexo skills/agents (verificables o "pendiente de validar")
        └─ Handoff y comandos Git propuestos (sin ejecución automática)
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | Ampliación operativa compacta; mantiene IDs M1-01..M3-03. |
| `docs/00-indice-general.md` | Modificar si aplica | Solo si cambia título o función de la guía. |
| `openspec/specs/guia-marcos-ciclos-sdd/spec.md` | Crear | Spec principal del contrato documental. |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/*` | Crear | Artefactos SDD del ciclo (no trackeados por defecto). |

## Contratos documentales

Plantilla de ciclo (idéntica para M1-01..M3-03):

```markdown
### Ciclo <ID> — <nombre>

Objetivo: <resultado observable>.
Rama sugerida: `<prefijo>/<tema>`.
Leer antes: <rutas concretas>.
Pedir a OpenCode: <prompt exacto>.
Ejecutar/verificar: <comandos o validación manual>.
QA manual (checkpoint de parada): <qué validar y con qué comando>.
No hacer: <límites del ciclo>.
Archive: <docs a actualizar durante sdd-archive>.
Commit sugerido: `<mensaje>`.
```

Reglas: tabla en vez de prosa, comandos concretos, sin tutoriales. Cada ciclo ~25-40 líneas; los 9 caben en ~300 líneas con la plantilla. Enlazar `AGENTS.md`, `GUIA.md` y specs sin duplicar.

## Estrategia de validación

| Capa | Qué validar | Enfoque |
|---|---|---|
| Documental | Requisitos del spec cubiertos. | Checklist contra cada requirement y scenario. |
| Trazabilidad | IDs M1-01..M3-03 sin renumerar. | Diff textual de encabezados `### Ciclo M...`. |
| Seguridad | Sin autorizaciones a commit/push/merge ni material privado. | Revisión textual de "qué no hacer". |
| Consistencia | No contradice `AGENTS.md`, `GUIA.md` ni specs backend/modelo. | Comparación manual de reglas. |
| Usabilidad | Marcos puede ejecutar un ciclo sin contexto externo. | Cada ciclo tiene los 9 campos. |
| Presupuesto | Diff ≤ 600 (objetivo) o ≤ 800 (techo). | `git diff --stat` antes de cerrar. |

## Migración / rollout

Sin migración técnica. Aplicar como reemplazo documental en uno o dos slices encadenados:

- WU1 — estructura y secciones base: ruta rápida, rol/prohibiciones, tabla QA, plantilla, anexo skills, handoff, comandos Git. (≈ 200-300 líneas)
- WU2 — 9 ciclos M1-01..M3-03 con la plantilla aplicada. (≈ 200-300 líneas)

Si el diff total ≤ 400 líneas, se aplica en una sola WU. Si supera ~400, se corta en WU1 + WU2 con `stacked-to-main` (conceptual; no se commitea en este ciclo).

## Preguntas abiertas

- ¿El anexo de skills/agents debe incluir solo lo presente en `opencode.json` o también lo listado en `.atl/skill-registry.md`? Resolver durante apply leyendo ambos; si difieren, registrar discrepancia.
- Si Marcos confirma que su `opencode.json` ya está alineado, el anexo puede reducirse a una línea o eliminarse.
