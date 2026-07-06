# Especificación: Actualizar plan de Matías tras disponibilidad de v0

## Propósito

Definir los requisitos documentales vigentes para reflejar el estado real de `muestra_pagina/` (referencia v0 final y completa para flujos 4-22) en la guía unificada de Matías y mantener `docs/frontend/00-angular20-port-v0.md` como fuente de verdad del port visual, sin modificar código ni dependencias del producto.

## Requirements

### Requirement: Guía unificada de Matías actualizada al estado real

La documentación DEBE mantener `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como guía única de Matías para F0-F6, indicando que `muestra_pagina/` contiene la referencia v0 final y completa para flujos 4-22.

#### Scenario: Estado real visible
- DADO que Matías abre la guía unificada
- CUANDO revisa la ruta rápida y el uso de `muestra_pagina/`
- ENTONCES ve que la referencia v0 está completa para flujos 4-22 y que los ciclos F4-F6 están en la misma guía

#### Scenario: Sin ampliación de alcance
- DADO que una tarea intenta reabrir una guía separada para F4-F6
- CUANDO se revisa el alcance documental
- ENTONCES la guía unificada conserva F0-F6 y no deriva a un documento operativo separado

### Requirement: Planificación F4-F6 integrada para flujos 11-22

La documentación DEBE integrar los flujos 11-22 en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, agrupados en ciclos F4-F6 trazables, con límites, lecturas mínimas, validaciones, QA y cierre SDD.

#### Scenario: Ejecución de un ciclo F4-F6
- DADO que Matías debe continuar con un prompt pendiente
- CUANDO consulta `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`
- ENTONCES identifica ciclo, objetivo, restricciones y evidencia esperada

#### Scenario: Contrato no definido
- DADO que un ciclo F4-F6 depende de API, PDF, QR o configuración no aprobada
- CUANDO se prepara el prompt del ciclo
- ENTONCES el documento DEBE exigir spec previa o bloqueo, sin inventar contrato

### Requirement: Fuente de verdad del port visual v0

`docs/frontend/00-angular20-port-v0.md` DEBE quedar como fuente de verdad del port visual: inventario de pantallas v0, tokens visuales, componentes candidatos, estados, riesgos y regla de no copiar React/Next literalmente.

#### Scenario: Consulta de referencia visual
- DADO que se planifica portar una pantalla a Angular 20
- CUANDO se consulta la documentación frontend
- ENTONCES el inventario y riesgos están disponibles sin leer archivos privados ni código sensible

### Requirement: Referencia `muestra_pagina/` sincronizada

`docs/frontend/00-angular20-port-v0.md` DEBE describir el estado actual de `muestra_pagina/` como referencia v0 final y completa, con uso permitido solo como referencia visual/funcional. Si `muestra_pagina/` no incluye README propio, el inventario se verifica contra listado seguro de carpeta.

#### Scenario: Carpeta ya no vacía
- DADO que una persona revisa la documentación frontend o el listado seguro de `muestra_pagina/`
- CUANDO revisa el estado de la referencia v0
- ENTONCES entiende que ya existe material v0 y que no debe copiar código literalmente

### Requirement: Índice general actualizado

`docs/00-indice-general.md` DEBE enlazar solo la guía unificada de Matías dentro de la planificación vigente, evitando duplicar contenido ya definido en documentos fuente.

#### Scenario: Descubrimiento del plan vigente
- DADO que Matías o Marcos buscan la planificación frontend vigente
- CUANDO consultan el índice general
- ENTONCES encuentran la guía unificada F0-F6 de Matías

#### Scenario: Sin duplicación documental
- DADO que el índice se actualiza
- CUANDO se agrega la nueva entrada
- ENTONCES solo enlaza la fuente vigente y no replica inventarios ni prompts completos

### Requirement: Copys de entrega manual para Matías/v0

La documentación y prompts de Matías DEBEN reemplazar el lenguaje de “enviar”, “enviar por email” y “reenviar certificado” por acciones de MVP manual: copiar link público, descargar PDF y entregar fuera del sistema. La UI NO DEBE prometer SMTP, PHPMailer, envío automático ni reenvío en el MVP. El copy DEBE mantener claro que Bedelía opera la entrega manual y que el QR/link es permanente.

#### Scenario: Botones principales del flujo administrativo

- DADO una pantalla administrativa basada en la referencia v0
- CUANDO se emite o consulta un certificado
- ENTONCES los CTAs DEBEN decir “Copiar link”, “Descargar PDF” o “Entrega manual”.
- Y NO DEBEN decir “Enviar por email” ni “Reenviar certificado”.

#### Scenario: Texto de ayuda del MVP

- DADO que Matías ajusta prompts o microcopy del flujo
- CUANDO describe la entrega al alumno
- ENTONCES DEBE indicar que Bedelía comparte el link/PDF por un canal externo.
- Y DEBE aclarar que el sistema no envía emails en el MVP.

#### Scenario: Coherencia con token permanente

- DADO que se muestra el resultado de emisión
- CUANDO la UI ofrece copiar link o descargar PDF
- ENTONCES DEBE comunicar que QR y link corresponden al mismo acceso permanente.
- Y NO DEBE sugerir rotación por reenvío normal.
