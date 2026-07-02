# Especificación: Actualizar plan de Matías tras disponibilidad de v0

## Propósito

Definir los requisitos documentales para reflejar el estado real de `muestra_pagina/` (referencia v0 utilizable para prompts 4-10, 12 pendientes) en la guía F0-F3, crear una guía operativa de Fase 2 para prompts 11-22 y mantener `docs/frontend/00-angular20-port-v0.md` como fuente de verdad del port visual, sin modificar código ni dependencias del producto.

## Requirements

### Requirement: Guía F0-F3 de Matías actualizada al estado real

La documentación DEBE actualizar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` para indicar que `muestra_pagina/` ya contiene una referencia v0 utilizable para prompts 4-10, que quedan pendientes prompts 11-22 y que F0-F3 cierra con handoff explícito a Fase 2.

#### Scenario: Estado real visible
- DADO que Matías abre la guía F0-F3
- CUANDO revisa la ruta rápida, uso de `muestra_pagina/` y cierre de F3-06
- ENTONCES ve 7 pantallas disponibles, 12 pendientes y el próximo documento a usar

#### Scenario: Sin ampliación de alcance
- DADO que una tarea intenta sumar F4-F6 dentro de la guía F0-F3
- CUANDO se revisa el alcance documental
- ENTONCES la guía mantiene F0-F3 y deriva Fase 2 al documento separado

### Requirement: Planificación Fase 2 para prompts 11-22

La documentación DEBE crear `MATIAS_PROMPTS_SDD_FASE2.md` como guía operativa para prompts 11-22, agrupada en ciclos F4-F6 trazables, con límites, lecturas mínimas, validaciones, QA y cierre SDD.

#### Scenario: Ejecución de un ciclo Fase 2
- DADO que Matías debe continuar con un prompt pendiente
- CUANDO consulta `MATIAS_PROMPTS_SDD_FASE2.md`
- ENTONCES identifica ciclo, objetivo, restricciones y evidencia esperada

#### Scenario: Contrato no definido
- DADO que un ciclo Fase 2 depende de API, PDF, QR o configuración no aprobada
- CUANDO se prepara el prompt del ciclo
- ENTONCES el documento DEBE exigir spec previa o bloqueo, sin inventar contrato

### Requirement: Fuente de verdad del port visual v0

`docs/frontend/00-angular20-port-v0.md` DEBE quedar como fuente de verdad del port visual: inventario de pantallas v0, tokens visuales, componentes candidatos, estados, riesgos y regla de no copiar React/Next literalmente.

#### Scenario: Consulta de referencia visual
- DADO que se planifica portar una pantalla a Angular 20
- CUANDO se consulta la documentación frontend
- ENTONCES el inventario y riesgos están disponibles sin leer archivos privados ni código sensible

### Requirement: README de `muestra_pagina/` sincronizado

`muestra_pagina/README.md` DEBE describir el estado actual de la carpeta como referencia v0 activa, con 7 pantallas disponibles, 12 pendientes y uso permitido solo como referencia visual/funcional.

#### Scenario: Carpeta ya no vacía
- DADO que una persona abre `muestra_pagina/README.md`
- CUANDO revisa el estado de la referencia
- ENTONCES entiende que ya existe material v0 y que no debe copiar código literalmente

### Requirement: Índice general actualizado

`docs/00-indice-general.md` DEBE enlazar `MATIAS_PROMPTS_SDD_FASE2.md` dentro de la planificación vigente de Matías, evitando duplicar contenido ya definido en documentos fuente.

#### Scenario: Descubrimiento del plan vigente
- DADO que Matías o Marcos buscan la planificación frontend vigente
- CUANDO consultan el índice general
- ENTONCES encuentran la guía F0-F3 y el plan Fase 2 con propósito diferenciado

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
