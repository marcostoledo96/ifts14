# Exploración: mejorar-guia-marcos-ciclos-sdd

## Estado actual

`MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (101 líneas) es una guía esquemática para Marcos: backend PHP 8.4.21, MariaDB 10.6.27, integración, deploy cPanel en `/certificados/` y seguridad. Enumera 9 ciclos en 3 semanas pero no explica **cómo** ejecutarlos, **cuándo detenerse para validar manualmente**, ni **qué hacer después** de cada ciclo. Comparada con la guía de Matías (1.354 inserciones), esta apenas lista objetivos.

A diferencia de Matías, Marcos ya tiene lo esencial configurado (no requiere onboarding Windows) y el repo `ifts14` ya completó 4 commits previos con specs de auditoría, modelo de datos y contrato API. Por eso el rediseño debe ser **más compacto y operativo**, no más básico:

| Dimensión | Matías (Windows, sin experiencia) | Marcos (Linux, con experiencia) |
|---|---|---|
| Entorno | Winget, PowerShell, instalación guiada | Ya listo; quizá falta skills/agents |
| Comandos | Pasos a paso y troubleshooting | Referencia concisa |
| Bloqueos | Educación sobre cada riesgo | Recordatorio y acción concreta |
| Cierre | Reporte final detallado | Resumen breve + comandos Git propuestos |
| Énfasis | Implementación guiada | Cuándo detenerse para QA manual y cómo seguir |

## Áreas afectadas

- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — reescritura ampliada (no desde cero: mantener el esqueleto M1-01..M3-03).
- `docs/00-indice-general.md` — sin cambios esperados; ruta y función se mantienen.
- `AGENTS.md`, `GUIA.md` — fuentes de verdad que la guía refuerza, no duplica.
- `openspec/specs/backend-contrato-api-certificados/` y `backend-modelo-datos-certificados/` — referenciadas desde M2-01, M2-02 y M3-01 cuando apliquen.

## Enfoques considerados

1. **Solo ampliar la grilla actual** (mantener 9 ciclos tal cual con un párrafo extra por ciclo).
   - Pros: cambio mínimo, riesgo bajo.
   - Cons: la guía sigue sin explicar el flujo de QA manual entre ciclos, que es la queja principal.
   - Esfuerzo: Bajo.

2. **Diátaxis puro** (separar en tutorial / how-to / referencia / explicación).
   - Pros: estructura pedagógica ideal.
   - Cons: sobrado para un usuario experimentado; fricción para encontrar el ciclo activo.
   - Esfuerzo: Alto.

3. **Híbrido: esqueleto M1-M3 + secciones operativas + énfasis en QA manual**.
   - Pros: familiar (mantiene IDs M1-01..M3-03), añade el "cuándo parar y qué validar" que falta, y deja skills/agents como anexo breve.
   - Cons: requiere disciplina para no sobredocumentar.
   - Esfuerzo: Medio.

## Recomendación

**Opción 3 (híbrida compacta).** Estructura objetivo:

1. **Ruta rápida** + **rol y límites** (recordatorio, no educación).
2. **Cuándo detener el ciclo para QA manual** — tabla de hitos y comandos de verificación concretos (PHP -l, php -m, mysqldump --no-data, curl, `git status --ignored --short`).
3. **Plantilla de ciclo** — objetivo, rama, lectura mínima, pedir a OpenCode, ejecutar/verificar, QA manual, qué no hacer, archive, commit sugerido.
4. **9 ciclos M1-01..M3-03** con la plantilla aplicada, cada uno con checkpoint explícito de parada manual.
5. **Handoff a OpenCode/Matías** — qué espera Marcos al cerrar cada ciclo.
6. **Anexo breve de skills/agents** si quedó pendiente (verificar `~/.config/opencode/opencode.json` y `.atl/skill-registry.md`).
7. **Comandos Git propuestos** sin ejecución automática.

Límite duro: **objetivo ≤ 600 líneas modificadas** (por debajo del presupuesto de 800 declarado por el orchestrador), para que la revisión quepa en un solo PR o se divida en 2 work units si se prefiere.

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Sobredocumentación para un usuario experimentado. | Media | Borrador compacto, tablas en vez de prosa, sin tutoriales de Git. |
| Contradicción con `AGENTS.md` o `GUIA.md`. | Baja | Citar explícitamente como fuentes de verdad y no duplicar reglas. |
| Pérdida de la trazabilidad M1-01..M3-03. | Baja | Mantener IDs como encabezados, sin renumerar. |
| Diff > 800 líneas. | Baja | Plantilla compacta por ciclo; si se acerca al límite, dividir en 2 WU (estructura + ciclos). |
| Skills/agents desactualizados. | Media | Solo listar lo verificable desde `opencode.json` y `.atl/skill-registry.md`; marcar "pendiente de validar" si no se verifica. |

## Listo para proposal

**Sí.** El alcance es claro: mejorar `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con la estructura recomendada, sin tocar código ni specs de producto, dejando el presupuesto de revisión en ≤ 600 líneas modificadas y dividido en 2 work units encadenadas si supera ~400 líneas.
