# Delta para planificación de remediación de auditoría

Este delta rige únicamente la documentación operativa del plan P0–P9; no modifica capacidades de producto.

## ADDED Requirements

### Requirement: Taxonomía de estados respaldada por evidencia

El tablero DEBE usar únicamente `DONE`, `DONE WITH WARNINGS`, `PARTIAL`, `PENDING`, `BLOCKED` o `SUPERSEDED`. `DONE` DEBE tener evidencia vigente y `DONE WITH WARNINGS` DEBE exhibir sus advertencias.

#### Scenario: Cierre acreditado

- GIVEN evidencia vigente con veredicto verificable
- WHEN se actualiza un ciclo
- THEN el tablero PUEDE asignar `DONE` o `DONE WITH WARNINGS`

#### Scenario: Evidencia insuficiente

- GIVEN una checklist sin evidencia de cierre
- WHEN se reconcilia el ciclo
- THEN el tablero DEBE conservar `PARTIAL`, `PENDING` o `BLOCKED`

### Requirement: Precedencia de fuentes

El estado DEBE derivarse, en orden, de merge/commit y `verify-report.md` archivado, evidencia runtime/CI versionada, spec canónica, documentación activa y, por último, plan, checklist o auditoría histórica. Una fuente inferior NO DEBE elevar un estado.

#### Scenario: Conflicto con plan histórico

- GIVEN un plan histórico que declara un cierre
- WHEN la evidencia superior no lo respalda
- THEN el tablero NO DEBE declarar `DONE`

### Requirement: Preservación de historia y vista operativa

La reconciliación DEBE conservar el texto histórico de auditorías y separar explícitamente esa historia del tablero actual.

#### Scenario: Estado histórico desactualizado

- GIVEN una auditoría previa con un estado antiguo
- WHEN existe evidencia posterior
- THEN la auditoría DEBE preservarse y el tablero DEBE mostrar el estado actual con su fuente

### Requirement: Distinción de entornos

La documentación DEBE identificar el entorno de toda evidencia. Una validación de staging NO DEBE implicar validación de producción `/certificados/`.

#### Scenario: Staging aprobado

- GIVEN evidencia PASS en `/certificados_staging/`
- WHEN se registra el resultado
- THEN producción DEBE permanecer como no validada salvo evidencia propia

### Requirement: Trazabilidad de cierres

Todo cierre actualizado DEBE enlazar el PR o commit mergeado y el archive o reporte de verificación aplicable, incluyendo su veredicto exacto cuando exista.

#### Scenario: Cierre verificable

- GIVEN un ciclo cerrado por un merge y un reporte archivado
- WHEN se publica su estado
- THEN el lector DEBE poder acceder a ambos enlaces desde el plan

### Requirement: Secuenciación sin falso DONE

El plan DEBE declarar P5-02 como próximo ciclo independiente y conservar P9 como `PENDING` no bloqueante. Un ciclo futuro, una tarea planificada o una evidencia parcial NO DEBEN marcarse `DONE`.

#### Scenario: Próximo ciclo pendiente

- GIVEN P5-02 sin implementación ni verificación de cierre
- WHEN se actualiza la secuencia
- THEN P5-02 DEBE figurar como próximo ciclo y NO como `DONE`

#### Scenario: Backlog no bloqueante

- GIVEN un ítem P9 sin evidencia de cierre
- WHEN se actualiza el tablero
- THEN DEBE permanecer `PENDING` y no bloquear la secuencia inmediata
