# Diseño: Guía ejecutable de Matías para Angular en Windows

## Enfoque técnico

El cambio es una reescritura documental de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`. La guía debe seguir siendo un único punto de entrada para Matías, pero con arquitectura interna de manual ejecutable: ruta rápida, fundamentos mínimos, ciclos autocontenidos y referencias al final. Se aplica divulgación progresiva: primero qué hacer y cómo verificarlo; después contexto, troubleshooting y límites.

La solicitud actual del usuario supersede explícitamente el shorthand de la propuesta (“3 semanas × 3 ciclos”). Por eso el diseño DEBE implementar el mapa expandido del spec: ciclos `F0-01` a `F3-06`. `F0` cubre preparación Windows/onboarding antes de tocar frontend; `F3-04`, `F3-05` y `F3-06` cierran QA, build/documentación de entrega y handoff revisable.

El diseño responde al spec `guia-matias-angular-windows`: contexto operativo, entorno Windows, flujo SDD, uso de `muestra_pagina/`, QA frontend, errores comunes, ciclos F0-01 a F3-06 y reporte final. Es solo documental: no autoriza código, Angular, PHP, base de datos, instalación de dependencias, acceso a `material_privado_no_versionar/` ni operaciones Git.

Trazabilidad: pedido del usuario → spec Requirement “Ciclos F0-01 a F3-06” → este diseño obliga a reemplazar la grilla abreviada por ciclos autocontenidos y verificables.

## Decisiones de arquitectura documental

| Decisión | Alternativa descartada | Rationale |
|---|---|---|
| Mantener un archivo principal único. | Dividir en varios documentos nuevos. | Reduce fricción para Matías y evita romper el mapa vigente; se enlaza documentación fuente en lugar de duplicarla. |
| Estructura híbrida: onboarding + ciclos F0-F3 + referencia. | Solo ampliar la grilla actual de 3 semanas. | La grilla actual orienta, pero quedó superada; F0 prepara entorno y F3-04..F3-06 cierran QA/build/handoff sin agrandar la guía innecesariamente. |
| Cada ciclo usa la misma plantilla. | Redactar ciclos libres. | La repetición baja carga cognitiva y permite revisar completitud: objetivo, rama, lectura, prompt, comandos, validación, QA, archive y commit sugerido. |
| QA y seguridad aparecen dentro de cada ciclo y como checklist final. | Dejar QA solo al final. | Si QA queda lejos del punto de ejecución, se saltea; el checklist final funciona como control de cierre. |
| Troubleshooting breve por ciclo + referencia general. | Manual exhaustivo de errores Windows. | Mantiene el documento ejecutable sin convertirlo en enciclopedia; los errores comunes quedan donde se necesitan. |

## Flujo de información

```txt
Fuentes de verdad
AGENTS.md / GUIA.md / docs/frontend/00-angular20-port-v0.md / spec
        │
        ▼
MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
        │
        ├─ Inicio rápido: misión, límites, ruta de trabajo
        ├─ Preparación Windows: instalar/verificar herramientas
        ├─ Manual SDD: qué pedirle a OpenCode en cada fase
        ├─ Ciclos F0-01..F3-06: F0 onboarding, F1-F2 ejecución, F3 QA/build/handoff
        └─ Referencias: comandos, troubleshooting, reporte final
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | Reescribir como guía ejecutable en español argentino formal. |
| `docs/00-indice-general.md` | Modificar si aplica | Solo ajustar título o descripción si la guía cambia su función en el índice. |
| `openspec/changes/mejorar-guia-matias-angular-windows/design.md` | Modificar | Alinear alcance con el mapa expandido requerido. |

## Contratos documentales

Cada ciclo debe usar esta plantilla mínima:

```markdown
### Ciclo <ID> — <nombre>

Objetivo: <resultado observable>.
Rama sugerida: `<prefijo>/<tema>`.
Leer antes: <rutas concretas>.
Pedir a OpenCode: <prompt exacto o plantilla>.
Ejecutar/verificar: <comandos PowerShell o validación manual>.
QA manual: <checklist específico>.
No hacer: <límites del ciclo>.
Archive: <documentos a actualizar>.
Commit sugerido: `<mensaje>`.
```

Reglas de longitud: priorizar tablas y checklists, comandos concretos, secciones cortas y enlaces a fuentes vigentes. No duplicar contratos API ni documentación frontend extensa; referenciar `docs/frontend/00-angular20-port-v0.md`.

El contenido de cada ciclo debe ser operativo pero breve. La guía final no debe transformarse en curso completo de Angular ni manual exhaustivo de Windows; debe permitir ejecutar, verificar y reportar cada ciclo.

## Estrategia de validación

| Capa | Qué validar | Enfoque |
|---|---|---|
| Documental | Requisitos del spec cubiertos. | Checklist contra cada requirement y scenario. |
| Seguridad | No se habilitan commits/push/merge automáticos ni material privado. | Revisión textual de límites y comandos. |
| Alcance | El mapa F0-01..F3-06 reemplaza la grilla abreviada. | Trazar pedido → spec → secciones de la guía. |
| Usabilidad | Matías puede ejecutar un ciclo sin contexto externo. | Verificar que cada ciclo tenga lectura, prompt, comandos, QA y salida esperada. |
| Consistencia | No contradice `AGENTS.md`, `GUIA.md` ni frontend docs. | Comparación manual de reglas repetidas o enlazadas. |

## Migración / rollout

No hay migración técnica. Aplicar como reemplazo documental en un único PR o slice documental. Si el diff supera el presupuesto de 800 líneas, dividir por cadena: primero estructura y secciones base; después ciclos F0-F1; finalmente ciclos F2-F3 y referencias.

## Preguntas abiertas

- Ninguna bloqueante. Si durante apply aparece que la guía supera el presupuesto, usar la cadena documental indicada sin cambiar el alcance.
