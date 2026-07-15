# Propuesta: Reconciliar el plan de remediación de auditoría

## Intención

Restablecer el plan P0–P9 como tablero operativo confiable: reflejar evidencia posterior a los PR [#63](https://github.com/marcostoledo96/ifts14/pull/63) y [#65](https://github.com/marcostoledo96/ifts14/pull/65), sin reescribir la auditoría histórica ni inferir validación de producción.

## Alcance

### Incluido
- Actualizar frontmatter, tablero actual, registro de ciclos y checklists de `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md`.
- Enlazar PR #63/#65 y verificaciones archivadas de [esquema](../archive/2026-07-02-database-cursos-alumnos-asistencias/verify-report.md), [deriva documental](../archive/2026-06-29-docs-openspec-drift-cleanup/verify-report.md), [hardening](../archive/2026-06-27-qa-backend-hardening-certificados/verify-report.md) y [P5-01](../archive/2026-07-15-p5-01-auth-php/verify-report.md).
- Registrar P0/P0-01 `PARTIAL` por falta de veredicto formal y fallo backend; P3/P4 `DONE`; P5-01 `DONE WITH WARNINGS`; P1/P2/P5/P6/P7/P8 `PARTIAL`; P9 `PENDING` no bloqueante.
- Secuenciar ciclos futuros y declarar P5-02 como próximo ciclo independiente.

### Excluido
- Implementar P5-02 o modificar producto, CI, infraestructura, deploy o base de datos.
- Alterar texto histórico de auditorías o declarar producción `/certificados/` validada.
- Corregir deriva documental fuera del plan.

## Capacidades

### Nuevas capacidades
Ninguna.

### Capacidades modificadas
Ninguna; es una reconciliación documental sin cambio de requisitos funcionales.

## Taxonomía y precedencia

`DONE` exige evidencia vigente; `DONE WITH WARNINGS` cierra con advertencias explícitas; `PARTIAL` acredita solo parte; `PENDING` carece de cierre; `BLOCKED` tiene impedimento; `SUPERSEDED` fue reemplazado formalmente. Los estados históricos de ejecución se conservan como historia, separados del tablero actual.

Precedencia: merge/commit y `verify-report.md` archivado → evidencia runtime/CI versionada → spec canónica vigente → documentación activa → plan, checklist o auditoría histórica. Una fuente inferior no eleva un estado sin respaldo superior.

## Enfoque y áreas afectadas

| Área | Impacto |
|---|---|
| Plan P0–P9 | Reconciliar metadatos, estados, enlaces, checklists y secuencia |
| `proposal.md` | Documentar límites y criterio de evidencia |

Entrega en un único PR; presupuesto de revisión: 2000 líneas modificadas.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Convertir planificación en falsa evidencia | Citar fuente y veredicto exactos |
| Confundir staging con producción | Mantener “producción no validada” visible |
| Borrar contexto histórico | Editar solo vistas operativas y añadir separación explícita |

## Reversión

Revertir únicamente el commit documental del plan y este ciclo OpenSpec; los archives enlazados permanecen intactos.

## Criterios de aceptación

- [ ] Frontmatter, tablero, registro y checklists coinciden entre sí y con la matriz explorada.
- [ ] PR #63/#65 y archives relevantes tienen enlaces verificables.
- [ ] Historia y estado actual se distinguen; P9 continúa no bloqueante.
- [ ] P5-02 figura como siguiente ciclo independiente, sin implementación.
- [ ] Producción consta como no validada y el diff no toca producto/CI/infra/DB.
