# Especificación: Guía ejecutable de Matías para Angular en Windows

## Propósito

Definir los requisitos documentales para reescribir `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como una guía operativa, verificable y apta para ejecutar ciclos SDD desde Windows, sin modificar código ni dependencias del producto.

## Requirements

### Requirement: Contexto operativo y misión

La guía DEBE explicar la misión de Matías, el alcance frontend Angular 20, las fuentes de verdad y las prohibiciones: no tocar backend, base, deploy, `material_privado_no_versionar/`, commits, push, merge ni dependencias no aprobadas.

#### Scenario: Inicio correcto
- DADO que Matías abre la guía
- CUANDO lee la primera sección
- ENTONCES entiende objetivo, rol, alcance y restricciones antes de ejecutar comandos

### Requirement: Preparación de entorno Windows

La guía DEBE incluir comandos PowerShell para verificar Node.js, npm, Angular CLI, Git y VS Code, más orientación `winget` y alternativa manual cuando `winget` no esté disponible.

#### Scenario: Herramienta faltante
- DADO que una verificación falla
- CUANDO Matías consulta la guía
- ENTONCES encuentra instalación sugerida y validación posterior

### Requirement: Flujo OpenCode/Gentle-AI y SDD

La guía DEBE describir el flujo OpenCode/Gentle-AI con ciclos pequeños, TDD cuando haya implementación, `sdd-archive` obligatorio y reporte final; OpenCode PUEDE proponer comandos Git, pero Matías DEBE ejecutarlos manualmente.

#### Scenario: Cierre de ciclo
- DADO un ciclo terminado
- CUANDO Matías sigue la guía
- ENTONCES ejecuta validaciones, QA manual, `sdd-archive` y deja propuesta de commit sin hacer push ni merge

### Requirement: Uso de `muestra_pagina/`

La guía DEBE tratar `muestra_pagina/` como referencia visual y funcional; si está vacía, DEBE bloquear la implementación del frontend final y limitar el trabajo a estructura, documentación o preparación.

#### Scenario: Carpeta vacía
- DADO que `muestra_pagina/` no contiene diseño utilizable
- CUANDO un ciclo propone UI final
- ENTONCES la guía indica no inventar pantallas y reportar bloqueo

### Requirement: Política frontend, pruebas y QA

La guía DEBE cubrir política de dependencias frontend, pruebas automáticas mínimas y una checklist obligatoria de QA manual: responsive, accesibilidad, navegación, estados de carga/error/vacío, comparación con referencia, consola limpia y no regresión visual.

#### Scenario: Validación completa
- DADO un cambio frontend ejecutable
- CUANDO Matías valida el ciclo
- ENTONCES corre pruebas automáticas disponibles y completa QA manual detallado antes de cerrar

### Requirement: Errores comunes y límites

La guía DEBE listar errores comunes a evitar: trabajar en `main`, saltear SDD, copiar React/Next literalmente, instalar dependencias sin aprobación, inventar contratos API, ignorar `AGENTS.md`, tocar material privado o cerrar sin pruebas.

#### Scenario: Acción riesgosa
- DADO que Matías intenta una acción fuera de alcance
- CUANDO consulta “qué no hacer”
- ENTONCES identifica el riesgo y pide definición a Marcos

### Requirement: Ciclos F0-01 a F3-06

La guía DEBE reorganizar ciclos ejecutables F0-01 a F3-06. Cada ciclo DEBE incluir: objetivo, rama, archivos a leer, comandos, prompt exacto para OpenCode, validaciones automáticas, QA manual, documentación de `sdd-archive`, qué no hacer y mensaje de commit sugerido.

#### Scenario: Ciclo autocontenido
- DADO cualquier ciclo entre F0-01 y F3-06
- CUANDO Matías lo ejecuta sin contexto externo
- ENTONCES puede saber qué leer, qué pedir, cómo validar y cómo reportar

### Requirement: Reporte final y propuestas Git

La guía DEBE exigir un reporte final por ciclo con resumen, archivos tocados, pruebas, QA, bloqueos, documentación actualizada, riesgos y comandos Git propuestos sin ejecutarlos automáticamente.

#### Scenario: Entrega revisable
- DADO un ciclo listo para revisión
- CUANDO Matías prepara la entrega
- ENTONCES Marcos recibe evidencia suficiente para revisar y decidir commit, push o merge
