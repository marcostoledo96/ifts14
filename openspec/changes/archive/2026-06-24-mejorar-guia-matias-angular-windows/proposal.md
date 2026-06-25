# Proposal: Reescribir la guía de Matías como manual ejecutable en Windows

## Intent

Transformar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` en una guía operativa que Matías pueda seguir paso a paso desde Windows, sin asumir conocimientos previos de Angular CLI, Git avanzado ni SDD. Hoy el documento enumera objetivos pero no explica cómo ejecutarlos.

## Scope

### In Scope
- Reescribir `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- Agregar prerequisitos e instalación de herramientas en Windows (Node.js, Angular CLI, Git for Windows, VS Code).
- Explicar cada fase SDD en términos prácticos para Matías.
- Definir protocolo de comunicación con Marcos sobre contratos API, mocks y bloqueos.
- Expandir cada ciclo con bloques: qué hacer, cómo hacerlo, verificar, si algo falla.
- Incluir troubleshooting de problemas comunes en Windows.
- Mantener referencias a `AGENTS.md`, `GUIA.md` y `docs/frontend/00-angular20-port-v0.md`.
- Actualizar `docs/00-indice-general.md` solo si es necesario para reflejar la guía mejorada.

### Out of Scope
- Cambios de código, dependencias o configuración de Angular/PHP/DB.
- Modificar `muestra_pagina/` o `material_privado_no_versionar/`.
- Commit, push, merge o deploy.
- Reescribir `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.

## Capabilities

> Este cambio es puramente documental. No modifica capabilities de producto ni contratos de comportamiento.

### New Capabilities
- None

### Modified Capabilities
- None

## Approach

Aplicar la opción híbrida recomendada en la exploración:

1. Conservar el esqueleto de 3 semanas × 3 ciclos.
2. Anteponer secciones de prerequisitos, glosario SDD y protocolo con Marcos.
3. Expandir cada ciclo con comandos concretos de Windows, checklist de verificación y problemas frecuentes.
4. Agregar una referencia rápida de comandos Git y Angular.
5. Aplicar progressive disclosure: resumen primero, detalles después.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | Reescritura completa como guía ejecutable. |
| `docs/00-indice-general.md` | Possible minor update | Referenciar la guía mejorada si cambia su ubicación o título. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sobredocumentación: guía intimidante. | Med | Progressive disclosure, resúmenes y checklists. |
| Obsolescencia de comandos o versiones. | Med | Documentar versiones objetivo y nota de verificación. |
| Contradicción con `AGENTS.md` o `GUIA.md`. | Low | Citar fuentes de verdad y no duplicar reglas. |
| Scope creep hacia otros documentos. | Med | Limitar explícitamente el scope a la guía de Matías. |

## Rollback Plan

Restaurar la versión anterior de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` desde Git con:

```bash
git checkout -- MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
```

Si se tocó `docs/00-indice-general.md`, restaurarlo del mismo modo.

## Dependencies

- Contenido actual de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- `AGENTS.md`, `GUIA.md`, `docs/frontend/00-angular20-port-v0.md` y `docs/00-indice-general.md` como fuentes de verdad.

## Success Criteria

- [ ] Matías puede instalar y verificar el entorno Windows siguiendo solo la guía.
- [ ] Cada fase SDD tiene una explicación de qué hace Matías en la práctica.
- [ ] Cada ciclo incluye objetivo, pasos concretos, comandos, verificación y troubleshooting.
- [ ] Existe una sección clara de comunicación con Marcos sobre contratos API, mocks y bloqueos.
- [ ] La guía no contradice `AGENTS.md`, `GUIA.md` ni `docs/frontend/00-angular20-port-v0.md`.
- [ ] El documento final no supera las 800 líneas modificadas de presupuesto.
