# Diseño: Reconciliar el plan de remediación de auditoría

## Enfoque técnico/editorial

Se actualizará una única fuente operativa: `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md`. La matriz de evidencia de la exploración se traducirá a un tablero actual; los criterios, decisiones y registros anteriores permanecerán como historia. No se modificarán producto, CI, infraestructura, deploy, base de datos ni specs funcionales.

## Decisiones de arquitectura editorial

| Opción | Compensación | Decisión y fundamento |
|---|---|---|
| Reescribir fases/checklists | Borra historia y duplica estados | Rechazada: 4.2 será la única vista vigente. |
| Cerrar desde checkboxes/specs | Genera falsos positivos | Rechazada: regirán evidencia y agregación determinista. |
| Editar documentos relacionados | Amplía el riesgo | Rechazada: la deriva externa quedará enlazada. |

## Flujo de datos

```text
merge/commit + verify archivado
          ↓
runtime/CI versionado → spec vigente → doc activa → historia/checklist
          ↓
derivación por ciclo → agregación por fase → tablero 4.2
```

Una fuente inferior no elevará un estado. Cada ciclo se derivará así:

| Estado | Regla determinista |
|---|---|
| `SUPERSEDED` | Una decisión formal y enlazada identifica el sucesor. |
| `BLOCKED` | Un impedimento vigente evita completar o verificar. |
| `PENDING` | No hay cierre acreditado ni bloqueo. |
| `PARTIAL` | Hay avance, pero falta requisito, cierre o trazabilidad. |
| `DONE WITH WARNINGS` | Cierre completo y trazado; advertencia aplicable, vigente, no bloqueante y visible. |
| `DONE` | Cierre completo y trazado; veredicto aprobatorio sin advertencias vigentes. |

Precedencia del peor estado: resolver `SUPERSEDED` (todos reemplazados → `SUPERSEDED`); cualquier `BLOCKED` → `BLOCKED`; todos `PENDING` → `PENDING`; cualquier mezcla con `PENDING`/`PARTIAL` → `PARTIAL`; todos cerrados con alguna advertencia → `DONE WITH WARNINGS`; todos `DONE` → `DONE`. Una advertencia que invalide requisitos produce `PARTIAL` o `BLOCKED`.

## Secciones exactas del plan

| Sección | Actualización |
|---|---|
| Frontmatter | Subir versión; conservar origen histórico; agregar fecha/commits reconciliados y estado derivado. |
| 4.1 | Separar estados históricos de la taxonomía vigente. |
| 4.2 | Usar `Fase/ciclo | Estado | PR/commit | Archive/verify + veredicto | Brecha/advertencia | Siguiente`. Ningún estado preliminar supera la derivación. |
| 4.3 | Preservar filas; anexar P5-01/PR #63 y alcance parcial de PR #65. |
| 7 / checklists | Conservar criterios; agregar una nota que remita a 4.2. |
| 10 | Mantener el gate futuro y producción no validada. |
| 11 | Declarar P5-02 como próximo ciclo independiente. |
| 13 | Anexar versión, fecha, alcance y PR #63/#65. |

## Impacto de archivos

| Archivo | Acción | Impacto |
|---|---|---|
| `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` | Modificar | Única fuente operativa reconciliada. |
| `openspec/changes/reconcile-audit-remediation-plan/design.md` | Crear | Diseño del cambio. |
| `proposal.md`, `exploration.md`, archives, specs, `apps/`, `.github/`, `database/`, `deploy/` | Sin cambios | Evidencia o áreas explícitamente excluidas. |

## Contrato de tabla y enlaces

Cada cierre actualizado citará (1) PR absoluto o commit enlazable y (2) archive o `verify-report.md`, con veredicto textual exacto. Si el segundo artefacto realmente no existe: `NO EXISTE — verificado`; la fila no podrá ser `DONE` ni `DONE WITH WARNINGS`.

Cada evidencia llevará `[local]`, `[CI]`, `[staging]`, `[production]` o `[documental]`. No acreditará otro entorno; producción exige evidencia `[production]` propia. Enlaces locales: relativos al plan; PR: URL absoluta.

## Estrategia de validación

```bash
git diff --check
git diff --name-only -- .
git cat-file -e 1a6a1cf^{commit} && git cat-file -e 27b34c6^{commit}
gh pr view 63 --repo marcostoledo96/ifts14 --json number,state,mergeCommit
gh pr view 65 --repo marcostoledo96/ifts14 --json number,state,mergeCommit
python3 - <<'PY'
from pathlib import Path
import re
p=Path('docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md')
bad=[x for x in re.findall(r'\]\(([^)#]+)',p.read_text()) if '://' not in x and not (p.parent/x).resolve().exists()]
assert not bad, bad
PY
```

| Control automático sobre la tabla 4.2 | Condición de fallo |
|---|---|
| Taxonomía | Estado no permitido. |
| Advertencias | `DONE WITH WARNINGS` sin advertencia visible/veredicto exacto. |
| Trazabilidad | Falta PR/commit o archive/verify; `NO EXISTE` con `DONE`. |
| Entorno | Falta etiqueta o existe inferencia cruzada. |
| Falso `DONE` | Brecha, requisito abierto, warning o fuente faltante. |

Además del chequeo de enlaces mostrado, verify ejecutará un validador Python sobre 4.2 para estos cinco controles. También comprobará metadatos, P5-02, producción no validada y diff limitado.

## Threat Matrix

N/A — no se modifican routing, shell, subprocess, automatización VCS/PR, clasificación de ejecutables ni integración de procesos.

## Migración, despliegue y reversión

No hay migración ni despliegue. La reversión consiste en restaurar únicamente el plan y los artefactos activos de este ciclo; la evidencia archivada permanece intacta.

## Preguntas abiertas

Ninguna.
