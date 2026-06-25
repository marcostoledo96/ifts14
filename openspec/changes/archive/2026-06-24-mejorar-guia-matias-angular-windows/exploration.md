## Exploration: mejorar-guia-matias-angular-windows

### Current State

El archivo `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` es una guía de alto nivel que enumera ciclos, objetivos y resultados esperados, pero no explica **cómo** ejecutar cada paso. Para un usuario con poca experiencia en Windows, es insuficiente:

- No hay sección de prerequisitos ni instalación de herramientas (Node.js, Angular CLI, Git for Windows, VS Code).
- Los comandos Git aparecen aislados, sin contexto de cuándo usarlos ni qué hacen.
- No hay pasos concretos por ciclo (ej.: no dice cómo crear la app Angular, cómo estructurar features, cómo levantar `ng serve`).
- No hay sección de troubleshooting ni problemas comunes en Windows.
- No explica en términos prácticos qué significa cada fase SDD (`explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`).
- No hay protocolo de comunicación con Marcos sobre contratos API, mocks o dependencias bloqueadas.
- La referencia a Tailwind aparece sin instrucciones de instalación ni configuración.

### Affected Areas

- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — archivo principal a reescribir/ampliar.
- `docs/frontend/00-angular20-port-v0.md` — contiene reglas de build y expectativas de API que deberían estar referenciadas desde la guía de Matías.
- `AGENTS.md` — reglas de metodología y seguridad que la guía debe reforzar, no duplicar.
- `GUIA.md` — define roles y flujo SDD; la guía de Matías debe alinearse con esa estructura.
- `docs/00-indice-general.md` — sirve como mapa de documentación; la guía mejorada debe apuntar a los docs relevantes por ciclo.

### Approaches

1. **Ampliación in-place** — Mantener la estructura actual de 3 semanas × 3 ciclos, pero expandir cada ciclo con pasos concretos, comandos Windows, checklists y troubleshooting.
   - Pros: Familiar para quien ya leyó la guía; mínima reorganización.
   - Cons: El archivo puede volverse muy largo y denso; la estructura actual no está pensada para progresive disclosure.
   - Effort: Medium

2. **Reestructuración por tipo de documento (Diátaxis)** — Separar en: Tutorial (paso a paso), How-to (recetas), Referencia (comandos), Explicación (contexto SDD). Mantener el índice semanal como tabla de contenido.
   - Pros: Más fácil de mantener; cada sección tiene un propósito claro; mejor para usuarios con poca experiencia.
   - Cons: Requiere reescribir el archivo casi desde cero; más trabajo de redacción.
   - Effort: High

3. **Híbrido: estructura mejorada + contenido expandido** — Conservar el índice semanal como esqueleto, pero añadir secciones previas (prerequisitos, glosario SDD, comunicación con Marcos) y expandir cada ciclo con bloques "Qué hacer", "Cómo hacerlo", "Verificar", "Si algo falla".
   - Pros: Balance entre familiaridad y usabilidad; el esfuerzo es manejable.
   - Cons: Requiere disciplina para no volverse un muro de texto.
   - Effort: Medium

### Recommendation

**Opción 3 (híbrida)** es la más adecuada para este proyecto. El usuario (Matías) necesita una guía operativa que no asuma conocimientos previos de Angular CLI, Git avanzado ni SDD, pero tampoco necesita un manual enciclopédico. La estructura híbrida permite:

1. **Antes de empezar** — prerequisitos Windows, instalaciones, verificación de entorno.
2. **Glosario rápido SDD** — qué significa cada fase en la práctica de Matías.
3. **Protocolo con Marcos** — cómo y cuándo pedir el contrato API, cómo usar mocks, qué hacer si `muestra_pagina/` está vacía.
4. **Por cada ciclo** — objetivo (ya existe), pasos concretos con comandos, verificación, checklist y problemas frecuentes.
5. **Referencia de comandos** — tabla de comandos Git y Angular más usados.

### Risks

- **Riesgo de sobredocumentación**: si se expande demasiado, la guía puede volverse intimidante. Mitigación: usar progressive disclosure (resumen primero, detalles en secciones colapsables o sub-secciones claras).
- **Riesgo de obsolescencia**: comandos de Angular CLI o versiones de Node pueden cambiar. Mitigación: documentar la versión objetivo (Angular 20, Node 22 LTS) y agregar nota de "verificar versión".
- **Riesgo de contradicción con AGENTS.md o GUIA.md**: la guía mejorada debe reforzar, no contradecir, las reglas del proyecto. Mitigación: citar explícitamente `AGENTS.md` y `GUIA.md` como fuente de verdad.
- **Riesgo de scope creep**: este cambio es "solo documentación", pero puede escalar a reescribir toda la documentación del proyecto. Mitigación: limitar el scope explícitamente a `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- **Riesgo de que Matías no tenga `muestra_pagina/` lista**: la guía debe contemplar el bloqueo y qué hacer mientras tanto (documentar, preparar estructura, leer contratos).

### Ready for Proposal

**Sí.** El scope está claro: mejorar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` para que sea usable por una persona con poca experiencia en Windows, sin modificar código ni dependencias del proyecto.

Lo que el orchestrador debe indicar al usuario:

- Confirmar si Matías ya tiene instalado Node.js, Angular CLI y Git for Windows, o si la guía debe incluir esos pasos.
- Confirmar si prefiere que la guía se mantenga como un solo archivo o si acepta dividirse en varios (ej. `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` + `MATIAS_GUIA_WINDOWS.md`).
- Confirmar si hay algún conocimiento previo de Angular o Git que se pueda asumir (para no ser demasiado básico).
