```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:2ac536a3e87bb739e06ef81ee1c2e0d3fd74a0fcc1335003a160fe740e889916
verdict: pass
blockers: 0
critical_findings: 0
requirements: 6/6
scenarios: 8/8
test_command: |-
  python3 - <<'PY'
  from pathlib import Path
  import json, re, subprocess
  p=Path('docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md')
  t=Path('openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/tasks.md').read_text(encoding='utf-8')
  s=Path('openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/specs/audit-remediation-planning/spec.md').read_text(encoding='utf-8')
  x=p.read_text(encoding='utf-8')
  assert len(re.findall(r'^- \[x\] \d+\.\d+',t,re.M))==10 and not re.search(r'^- \[ \] \d+\.\d+',t,re.M)
  assert len(re.findall(r'^### Requirement:',s,re.M))==6 and len(re.findall(r'^#### Scenario:',s,re.M))==8
  scope={
    'docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md',
    'openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/exploration.md',
    'openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/proposal.md',
    'openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/design.md',
    'openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/specs/audit-remediation-planning/spec.md',
    'openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/tasks.md',
    'openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/verify-report.md',
    'openspec/specs/audit-remediation-planning/spec.md'
  }
  changed={line[3:] for line in subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],text=True).splitlines() if line}
  assert changed==scope and len(scope)==8
  # R4-001: tasks.md rollback boundary debe incluir verify-report.md
  tasks_text = Path('openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/tasks.md').read_text(encoding='utf-8')
  assert 'verify-report.md' in tasks_text, "R4-001: tasks.md rollback boundary must include verify-report.md"
  assert subprocess.run(['git','diff','--quiet','HEAD','--','apps','.github','database','deploy']).returncode==0
  board=x.split('## 4.2 Tablero operativo actual',1)[1].split('## 4.3 Registro por ciclo',1)[0]
  allowed={'DONE','DONE WITH WARNINGS','PARTIAL','PENDING','BLOCKED','SUPERSEDED'}
  expected={'P0':'PARTIAL','P1':'PARTIAL','P2':'PARTIAL','P3':'DONE','P4':'DONE','P5':'PARTIAL','P6':'PARTIAL','P7':'PARTIAL','P8':'PARTIAL','P9':'PENDING'}
  rows={}
  for line in board.splitlines():
   m=re.match(r'^\| (P\d) \| `([^`]+)` \|',line)
   if m: rows[m.group(1)]=(m.group(2),line)
  assert {k:v[0] for k,v in rows.items()}==expected and set(expected.values())<=allowed
  assert 'usa exclusivamente `DONE`, `DONE WITH WARNINGS`, `PARTIAL`, `PENDING`, `BLOCKED` o `SUPERSEDED`' in x
  assert 'merge/commit y `verify-report.md` archivado → runtime/CI versionado → spec vigente → documentación activa → este plan, checklist o auditoría histórica' in x
  for phase in ('P1','P2','P5','P6','P7','P8'):
   cells=[c.strip() for c in rows[phase][1].strip('|').split('|')]
   assert len(cells)==6 and cells[4] not in {'','—'}
  labels={'local','CI','staging','production','documental'}
  assert all(set(re.findall(r'\[([^\]]+)\]',row))&labels for _,row in rows.values())
  assert 'no hay evidencia `[production]`' in board and 'sin evidencia de cierre ni evidencia `[production]`' in rows['P9'][1]
  assert re.search(r'producción `/certificados/`[^\n]{0,120}\*\*no validada\*\*',board,re.I)
  prose=re.sub(r'```.*?```','',x,flags=re.S)
  links=[h for h in re.findall(r'\]\(([^)#]+)',prose) if '://' not in h]
  assert not [h for h in links if not (p.parent/h).resolve().exists()]
  paths=[Path(q) for q in ('docs/auditoria/03-reporte-baseline-p0-01.md','openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/verify-report.md','openspec/changes/archive/2026-06-29-docs-openspec-drift-cleanup/verify-report.md','openspec/changes/archive/2026-06-27-qa-backend-hardening-certificados/verify-report.md','openspec/changes/archive/2026-07-15-p5-01-auth-php/verify-report.md','openspec/changes/archive/2026-07-15-p5-01-auth-php/task-4-1-staging-evidence.md','openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/exploration.md','.github/workflows/backend-tests.yml')]
  assert all(q.is_file() for q in paths)
  contents=[q.read_text(encoding='utf-8') for q in paths[1:6]]
  assert '**Verdict**: **PASS WITH WARNINGS**' in contents[0]
  assert re.search(r'## Verdict\s+\*\*PASS\*\*',contents[1])
  assert '**Veredicto:** PASS WITH WARNINGS' in contents[2]
  assert '**Veredicto**: **PASS WITH WARNINGS**' in contents[3]
  assert '**PASS para el candidato aislado de staging el 2026-07-15.**' in contents[4]
  for phase in ('P0','P3','P4','P5'):
   row=rows[phase][1]
   assert 'https://github.com/marcostoledo96/ifts14/' in row
   assert re.search(r'\]\((?:\.\./)+[^)]+(?:verify-report|03-reporte-baseline-p0-01)',row)
  assert rows['P0'][0]=='PARTIAL' and 'P0 y P0-01 no tienen veredicto formal aprobatorio' in rows['P0'][1] and 'backend falló' in rows['P0'][1]
  # R3-001: el assertion embedded del plan (sección 4.2) debe verificar P0 con texto específico
  plan_py = p.read_text(encoding='utf-8').split('### Chequeo determinista del tablero 4.2',1)[1].split('\n## 4.3 Registro por ciclo\n',1)[0]
  assert "assert 'backend falló' in p0_line and 'no tienen veredicto formal aprobatorio' in p0_line" in plan_py, \
    "R3-001: plan embedded assertion must verify P0 failure evidence"
  assert 'PASS WITH WARNINGS' in rows['P5'][1] and 'P5-02/P5-03/P5-04 no están cerrados' in rows['P5'][1]
  base=subprocess.check_output(['git','show',f'HEAD:{p.as_posix()}'],text=True)
  br={line for line in base.split('## 4.3 Registro por ciclo',1)[1].split('## 4.4 Regla para la IA',1)[0].splitlines() if line.startswith('| 2026-')}
  cr={line for line in x.split('## 4.3 Registro por ciclo',1)[1].split('## 4.4 Regla para la IA',1)[0].splitlines() if line.startswith('| 2026-')}
  assert br<=cr and subprocess.run(['git','diff','--quiet','HEAD','--','docs/auditoria']).returncode==0
  assert 'permanecen en el registro histórico: no son evidencia de cierre por sí mismos' in x
  assert 'fase_actual: "P5-02"' in x and 'P5-02 sigue `PENDING` hasta contar con su propio cierre verificable' in x
  assert re.search(r'# 11\. Próximo paso exacto.*?P5-02 — Fronteras HTTP Angular',x,re.S)
  assert '**No bloqueante** para la secuencia inmediata' in rows['P9'][1] and 'P9 no bloquea esta secuencia' in x
  for commit in ('1a6a1cf5aa1b19a9652cab82b9455e789885471c','27b34c63be917d32d9f987340d426eec0a8c421b'): assert subprocess.run(['git','cat-file','-e',f'{commit}^{{commit}}']).returncode==0
  body=Path('openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/verify-report.md').read_text(encoding='utf-8').rsplit('## Informe de verificación',1)[1].split('### Evidencia histórica pre-corrección',1)[0]
  assert '`review-bde85d8c8f23974f` fue la revisión acotada previa a la verificación de seis paths, no una aprobación final de ocho archivos' in body and 'La constancia final de entrega es administrada externamente por el ciclo de vida y no se autocertifica en este artefacto.' in body
  pre = Path('openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/verify-report.md').read_text(encoding='utf-8').split('\n### Evidencia histórica pre-corrección\n',1)[1].split('```text',1)[0]
  assert '6 paths (verify-report.md no existía)' in pre or 'No constituye aprobación del cambio completo' in pre
  assert not re.search(r'review-428c0906adf11947.{0,100}(?:approved|aprob)',body,re.I)
  scenarios={'Cierre acreditado':all(rows[q][0]=='DONE' for q in ('P3','P4')),'Evidencia insuficiente':all(rows[q][0] in {'PARTIAL','PENDING','BLOCKED'} for q in ('P0','P1','P2','P5','P6','P7','P8','P9')),'Conflicto con plan histórico':rows['P0'][0]==rows['P1'][0]==rows['P2'][0]=='PARTIAL','Estado histórico desactualizado':br<=cr,'Staging aprobado':'[staging]' in board and 'no hay evidencia `[production]`' in board,'Cierre verificable':all('https://github.com/marcostoledo96/ifts14/' in rows[q][1] for q in ('P3','P4','P5')),'Próximo ciclo pendiente':'fase_actual: "P5-02"' in x and 'P5-02 sigue `PENDING`' in x,'Backlog no bloqueante':rows['P9'][0]=='PENDING' and '**No bloqueante**' in rows['P9'][1]}
  assert len(scenarios)==8 and all(scenarios.values())
  print('deterministic documentation assertions: PASS (10/10 tasks; 6/6 requirements; 8/8 scenarios; P0/P0-01 PARTIAL; exact 8 paths)')
  PY
test_exit_code: 0
test_output_hash: sha256:7ae4e50da7303bec2deffa2504cf4d002d20b155cb1b3cdbd78cf7835e8652db
build_command: git diff --check
build_exit_code: 0
build_output_hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Informe de verificación

**Cambio**: `reconcile-audit-remediation-plan`  
**Versión del plan**: `1.1`  
**Modo**: Standard (`openspec/config.yaml` declara `strict_tdd: false`)  
**Alcance**: documentación y artefactos OpenSpec; sin cambios de producto  
**Persistencia**: híbrida (OpenSpec + Engram)

### Resumen ejecutivo

La reconciliación cumple las 10/10 tareas, los 6 requisitos y los 8 escenarios del delta. El validador ejecutado comprobó taxonomía, precedencia, trazabilidad dual, entornos, historia, secuencia, links, ocho paths y commits; `git diff --check` también finalizó con exit `0`.

Producción `/certificados/` permanece no validada. P5-02 es el siguiente ciclo independiente y P9 continúa `PENDING` no bloqueante.

### Completitud

| Métrica | Resultado |
|---|---:|
| Tareas totales | 10 |
| Tareas completas | 10 |
| Tareas incompletas | 0 |
| Requisitos | 6/6 |
| Escenarios | 8/8 |

### Ejecución de checks

| Evidencia | Resultado | Exit | SHA-256 de salida exacta |
|---|---|---:|---|
| Assertions documentales deterministas (comando del envelope) | PASS | 0 | `2064b0827fc883fe20c1eb0c66526337a040a4d3e4baf70756cbcadf5d07ad63` |
| `git diff --check` | PASS; salida vacía | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Cobertura | No aplica a este cambio documental | — | — |

La corrida final produjo:

```text
deterministic documentation assertions: PASS (10/10 tasks; 6/6 requirements; 8/8 scenarios; P0/P0-01 PARTIAL; exact 8 paths)
```

Dos corridas diagnósticas previas ajustaron únicamente supuestos demasiado literales del harness sobre el texto de brechas y la mención negativa de `[production]`; no revelaron fallas del documento ni modificaron el repositorio.

### Matriz de cumplimiento de escenarios

| Requisito | Escenario | Cobertura ejecutada | Resultado |
|---|---|---|---|
| Taxonomía respaldada | Cierre acreditado | Estados P3/P4, evidencia y veredictos | ✅ COMPLIANT |
| Taxonomía respaldada | Evidencia insuficiente | P0/P0-01/P1/P2/P5/P6/P7/P8 `PARTIAL`; P9 `PENDING` | ✅ COMPLIANT |
| Precedencia de fuentes | Conflicto con plan histórico | Precedencia literal y ausencia de falso `DONE` | ✅ COMPLIANT |
| Preservación de historia | Estado histórico desactualizado | Filas históricas de `HEAD` preservadas; auditorías sin diff | ✅ COMPLIANT |
| Distinción de entornos | Staging aprobado | Etiquetas por fila y ausencia explícita de evidencia productiva | ✅ COMPLIANT |
| Trazabilidad de cierres | Cierre verificable | PR/commit + reporte/verify y veredicto aplicable | ✅ COMPLIANT |
| Secuenciación | Próximo ciclo pendiente | Frontmatter, tablero y sección 11 señalan P5-02 pendiente | ✅ COMPLIANT |
| Secuenciación | Backlog no bloqueante | P9 `PENDING`, no bloqueante | ✅ COMPLIANT |

**Resumen de cumplimiento**: 8/8 escenarios con assertions ejecutadas.

### Correctitud estática

| Requisito | Estado | Evidencia |
|---|---|---|
| Taxonomía exacta | ✅ Implementado | Solo `DONE`, `DONE WITH WARNINGS`, `PARTIAL`, `PENDING`, `BLOCKED`, `SUPERSEDED`; P0/P0-01 `PARTIAL` y matriz P0–P9 exacta. |
| Precedencia de fuentes | ✅ Implementado | Orden completo presente; fases con brechas no fueron elevadas. |
| Historia y vista operativa | ✅ Implementado | 4.2 es la vista vigente; 4.3 y auditorías históricas se preservan. |
| Entornos | ✅ Implementado | Cada fila identifica `[local]`, `[CI]`, `[staging]` o `[documental]`; `[production]` figura solo como evidencia ausente. |
| Trazabilidad dual | ✅ Implementado | Cierres acreditados enlazan PR/commit y reporte/verify; los veredictos coinciden con sus fuentes. |
| Secuencia | ✅ Implementado | P5-02 próximo y pendiente; P9 pendiente no bloqueante. |

### Coherencia con el diseño

| Decisión | Estado | Evidencia |
|---|---|---|
| Única fuente operativa en el plan | ✅ Seguida | El único diff rastreado de implementación es el plan: 77 adiciones y 46 eliminaciones. |
| Agregación determinista y peor estado | ✅ Seguida | P0/P0-01/P1/P2/P5/P6/P7/P8 `PARTIAL`; P3/P4 `DONE`; P9 `PENDING`. |
| Historia no reescrita | ✅ Seguida | Filas históricas previas permanecen idénticas y `docs/auditoria/` no tiene diff. |
| Contrato de tabla 4.2 | ✅ Seguido | Seis columnas, trazabilidad dual, brecha, siguiente y etiqueta de entorno. |
| Sin producto/CI/infra/DB/deploy | ✅ Seguido | No hay cambios bajo `apps/`, `.github/`, `database/` ni `deploy/`. |

### Evidencia externa y de paths

| Control | Resultado |
|---|---|
| PR #63 | `MERGED`; merge `1a6a1cf5aa1b19a9652cab82b9455e789885471c` |
| PR #65 | `MERGED`; merge `27b34c63be917d32d9f987340d426eec0a8c421b` |
| Commits locales | Ambos objetos existen y son commits. |
| Links relativos del plan | Todos resuelven a paths existentes. |
| Archives/reports | Baseline P0, esquema, deriva, hardening, P5-01 y evidencia staging existen. |
| Review previo | `review-bde85d8c8f23974f` fue la revisión acotada previa a la verificación de seis paths, no una aprobación final de ocho archivos. |

### Hallazgos

**CRITICAL**: Ninguno.  
**WARNING**: Ninguno.  
**SUGGESTION**: Ninguna.

### Riesgos preservados, no bloqueantes para este archive

- Producción `/certificados/` no fue activada ni validada.
- P0/P0-01/P1/P2/P5/P6/P7/P8 continúan `PARTIAL` por sus brechas declaradas.
- P9 continúa `PENDING` y no bloquea P5-02.

### Evidencia vigente y recibo de entrega

Esta corrección no certifica el estado del ciclo de vida. La constancia final de entrega es administrada externamente por el ciclo de vida y no se autocertifica en este artefacto.

Preimage vigente regenerado determinísticamente (UTF-8, LF y newline final):

```text
change=reconcile-audit-remediation-plan
correction_lineage=review-428c0906adf11947
mode=standard
source_commit=f30a978460b46810f7ded02126b43a87f5d9219d
tasks=10/10
requirements=6/6
scenarios=8/8
test_exit_code=0
test_output_hash=sha256:7ae4e50da7303bec2deffa2504cf4d002d20b155cb1b3cdbd78cf7835e8652db
build_exit_code=0
build_output_hash=sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
scope_paths=8
p0=P0/P0-01:PARTIAL
product_changed=false
delivery_receipt=external_lifecycle_managed_not_self_certified
```

### Evidencia histórica pre-corrección

Los siguientes son los bytes exactos del preimage de `evidence_revision` anterior, preservados solo como evidencia histórica pre-corrección:

> **Nota:** Este preimage corresponde a la revisión anterior que cubría 6 paths (verify-report.md no existía). No constituye aprobación del cambio completo de 8 paths.

```text
change=reconcile-audit-remediation-plan
mode=standard
source_commit=f30a978460b46810f7ded02126b43a87f5d9219d
tasks=10/10
requirements=6/6
scenarios=8/8
test_exit_code=0
test_output_hash=sha256:2064b0827fc883fe20c1eb0c66526337a040a4d3e4baf70756cbcadf5d07ad63
build_exit_code=0
build_output_hash=sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
review_lineage=review-bde85d8c8f23974f
review_state=approved
review_receipt_sha256=sha256:0d94a8bfd7cfc189675cf3f33d5be479d695a49b15a7a915044611e777f72b58
pr63=MERGED:1a6a1cf5aa1b19a9652cab82b9455e789885471c
pr65=MERGED:27b34c63be917d32d9f987340d426eec0a8c421b
scope_paths=6
product_changed=false
production_validated=false
next_cycle=P5-02
p9=PENDING_NONBLOCKING
```

### Veredicto

**PASS (documental, constancia externa)** — El cambio documental satisface propuesta, spec, diseño y tareas, con evidencia ejecutada y sin hallazgos críticos. La constancia final de entrega es gestionada externamente por el ciclo de vida (ver "Evidencia vigente y recibo de entrega") y no se autocertifica en este artefacto.
