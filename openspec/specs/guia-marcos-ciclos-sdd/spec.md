# Especificación: Guía operativa de Marcos para ciclos SDD

## Propósito

Definir los requisitos documentales para mejorar `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como guía operativa compacta: explica cómo ejecutar cada ciclo M1-01..M3-06, cuándo detenerse para QA manual y qué entregar al cierre, sin caer en el nivel pedagógico de la guía de Matías ni autorizar cambios de código, dependencias, deploy o Git automático.

## Requirements

### Requirement: Rol y límites

La guía DEBE recordar el rol de Marcos (PHP 8.4.21, MariaDB 10.6.27, integración, deploy cPanel, arquitectura, seguridad, modelo de datos y desbloqueos frontend técnicos) y la división operativa con Matías: Marcos lidera backend, MariaDB, integración, deploy, arquitectura, seguridad y desbloqueos frontend técnicos; Matías lidera UI/UX Angular 20, adaptación de `muestra_pagina/`, sistema visual, responsive, accesibilidad, admin y QA visual. La guía DEBE enumerar las prohibiciones explícitas: no tocar Angular fuera de los desbloqueos frontend autorizados o coordinación explícita, no modificar `material_privado_no_versionar/`, no exponer credenciales ni DNI completo en logs/auditoría/errores/respuestas administrativas, no ejecutar commit/push/merge/rebase automáticamente.

#### Scenario: Lectura inicial

- DADO que Marcos abre la guía
- CUANDO lee el inicio
- ENTONCES encuentra ruta rápida, rol y prohibiciones antes de cualquier comando

### Requirement: Cuándo detenerse para QA manual

La guía DEBE incluir una tabla de hitos de parada con el comando concreto a ejecutar en cada uno: `php -l` para sintaxis, `php -m` para extensiones, `mysqldump --no-data` para validar esquema sin datos, `curl` contra el endpoint público con token ficticio, `git status --ignored --short` antes de cualquier commit, y verificación de `.htaccess` antes de deploy.

#### Scenario: Hito de validación

- DADO un ciclo en ejecución
- CUANDO Marcos llega a un hito de la tabla
- ENTONCES sabe qué comando correr, qué salida esperar y qué hacer si falla

### Requirement: Plantilla de ciclo repetible

La guía DEBE definir una plantilla única aplicada a los 12 ciclos, con los campos: objetivo, rama sugerida, archivos a leer, prompt para OpenCode, ejecutar/verificar, QA manual específico, qué no hacer, archive, commit sugerido.

#### Scenario: Ciclo autocontenido

- DADO cualquier ciclo entre M1-01 y M3-06
- CUANDO Marcos lo abre
- ENTONCES encuentra los nueve campos de la plantilla sin tener que leer otra sección

### Requirement: Ciclos M1-01 a M3-06 sin renumerar y bloque M4 de sincronización D0

La guía DEBE mantener los identificadores vigentes de Marcos sin bloquear backend por Angular: M1/M2 para seguridad, auditoría, modelo, contrato API, base PHP y validación pública; M3 para hardening backend/base, endpoints administrativos, seguridad/logs, deploy cPanel e integración Angular/API solo como checkpoint final. La guía DEBE agregar un bloque M4 para sincronización D0 que codifique: QR/token permanente, DNI completo público, certificado de curso con fechas asistidas, auth admin simple temporal (`X-Admin-Key`), firmantes PDF (Rector/a y Asesor/a Pedagógica), Composer/SMTP como gates, staging bajo `/certificados_staging/` y coordinación con Matías sobre v0 actualizada. Cada uno de los 12 ciclos M1-M3 DEBE quedar alineado con la plantilla repetible y con al menos un checkpoint de QA manual concreto; el bloque M4 no habilita implementación fuera de ciclo.

#### Scenario: Trazabilidad preservada

- DADO el archivo actual de Marcos
- CUANDO se compara con la versión ajustada
- ENTONCES los IDs y el orden de los ciclos M1-01 a M3-06 siguen siendo los mismos
- **Y** el bloque M4 aparece como planificación D0 sin habilitar implementación fuera de ciclo.

#### Scenario: Decisiones D0 visibles

- DADO que Marcos inicia un ciclo backend o deploy
- CUANDO consulta la guía
- ENTONCES encuentra QR/token permanente, DNI completo público, fechas asistidas, auth admin simple temporal y gates Composer/SMTP.
- **Y** distingue documentación de implementación runtime.

### Requirement: Handoff al cierre de ciclo

La guía DEBE especificar qué entrega Marcos a OpenCode antes de pedir el siguiente ciclo: archivos tocados, comandos ejecutados, resultado de QA manual, documentación actualizada, bloqueos, riesgos y comandos Git propuestos (sin ejecución automática).

#### Scenario: Cierre revisable

- DADO un ciclo terminado
- CUANDO Marcos prepara el siguiente
- ENTONCES OpenCode recibe un handoff con archivos, validaciones, bloqueos y comandos Git solo como propuesta

### Requirement: Anexo breve de skills/agents

La guía DEBE incluir, si están verificables desde `~/.config/opencode/opencode.json` y `.atl/skill-registry.md`, una lista corta de skills/agents relevantes para Marcos (`sdd-apply`, `sdd-verify`, `sdd-archive`, `karpathy-guidelines`, `ponytail`); si no se pueden verificar, DEBE declarar explícitamente "pendiente de validar" y enlazar las fuentes.

#### Scenario: Configuración pendiente

- DADO que faltan skills por confirmar
- CUANDO Marcos revisa el anexo
- ENTONCES ve solo lo verificable o un aviso de pendiente de validar, sin inventar contenido

### Requirement: Comandos Git solo como propuesta

La guía DEBE proponer comandos Git (`git status --ignored --short`, `git add`, `git commit`, `git push -u origin`, `gh pr create`) como ejemplo al cierre de cada ciclo, sin afirmar que OpenCode los ejecuta sin aprobación. DEBE recordarse en cada bloque "no hacer" que commit, push y PR requieren aprobación explícita de Marcos, y que `git merge`, `git rebase`, `git push` a `main` y merge de PR quedan fuera de OpenCode.

#### Scenario: Comando propuesto

- DADO un ciclo cerrado
- CUANDO Marcos lee el cierre
- ENTONCES ve el bloque de comandos Git como propuesta, la regla de aprobación explícita para commit/push/PR y la prohibición de merge/rebase/push a `main` desde OpenCode
