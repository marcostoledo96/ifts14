---
titulo: "IFTS14 — Plan de correcciones preproducción con SDD y TDD"
version: "2.1"
fecha_plan: "2026-07-16"
repositorio: "marcostoledo96/ifts14"
commit_auditado: "1a6a1cf5aa1b19a9652cab82b9455e789885471c"
rama_fuente: "main"
estado_general: "PARTIAL"
fase_actual: "P8-04"
ultimo_ciclo_cerrado: "P8-03"
responsable_coordinacion: "Marcos"
metodologia: "Gentle AI + OpenSpec + SDD + TDD"
---

# IFTS14 — Plan de correcciones preproducción con SDD y TDD

## 0. Propósito del documento

Este documento transforma la auditoría técnica del repositorio `ifts14` en un plan de ejecución por fases y ciclos pequeños.

Está diseñado para:

- Marcos, responsable de backend, MariaDB, integración, seguridad y deploy.
- Matías, responsable de UI/UX y frontend Angular.
- OpenCode, Cursor, Antigravity u otro agente configurado con Gentle AI.
- Modelos accesibles o económicos que necesiten instrucciones explícitas y poco contexto por ciclo.

La intención no es hacer una refactorización masiva. La intención es corregir primero los riesgos que pueden producir datos inconsistentes, una demostración engañosa o un deploy inseguro.

> **Regla central:** ejecutar un solo ciclo SDD por vez. No comenzar el siguiente hasta cerrar `verify`, realizar los altos manuales correspondientes y completar `sdd-archive`.

---

# 1. Decisiones confirmadas — fuente de verdad D1

Estas decisiones reemplazan cualquier documento anterior que las contradiga.

| ID | Tema | Decisión vigente |
|---|---|---|
| D1-01 | Migración `003` | No fue aplicada en ninguna base conocida. Cuando llegue el momento, la IA debe detenerse y guiar a Marcos paso a paso. |
| D1-02 | Meta del 15 de julio | Presentar la mejor versión segura disponible. El desarrollo puede continuar después. No forzar producción por cumplir la fecha. |
| D1-03 | Validación no verificable | Revocado, vencido e inexistente continúan colapsados en `404 CERTIFICATE_NOT_FOUND`. La diferenciación pública se difiere. |
| D1-04 | Auth admin | Elegir la solución segura más simple. Recomendación: sesión PHP simple con cookie `HttpOnly`; `X-Admin-Key` puede continuar para smokes CLI, pero no debe estar en Angular. |
| D1-05 | Modificar asistencias | Se permite modificar asistencias después de emitir. El certificado conserva la misma URL y el mismo QR. |
| D1-06 | Cantidad de fechas | No se fija un máximo funcional. La UI y los contratos deben soportar todas las fechas necesarias. |
| D1-07 | Firmas | En el futuro serán imágenes. No son prioridad actual. No afirmar “firma digital verificada”. |
| D1-08 | Prioridad de entrega | Prioridad: URL pública permanente y descarga de QR. El PDF queda como artefacto secundario y puede mejorarse después. |
| D1-09 | Vigencia | El certificado es permanente. `vence_en` permanece nullable por compatibilidad, pero el flujo nuevo no debe exigir vencimiento. |
| D1-10 | Email de alumno | Puede existir como dato opcional y nullable, pero no se usa para envío automático. No es prioridad inmediata. |
| D1-11 | Entrega manual | No hace falta un estado obligatorio “entregado”. Si se incorpora en el futuro, debe ser nullable y explícitamente manual. |
| D1-12 | DNI público | El DNI completo visible cuenta con aprobación institucional. No debe filtrarse en logs, auditoría, errores ni DTOs administrativos. |
| D1-13 | cPanel | Se supone acceso amplio, pero Composer, GD, Terminal, permisos y configuración se verificarán manualmente durante la fase de staging. |
| D1-14 | Email automático | Fuera del MVP. No SMTP, no PHPMailer, no reenvío automático. |
| D1-15 | QR/token | Permanente. Cambiar asistencias o regenerar un artefacto no rota el token. Solo una revocación explícita invalida la verificación. |

## 1.1 Decisiones técnicas recomendadas que este plan adopta

Estas reglas pueden revisarse mediante SDD, pero son el punto de partida recomendado:

1. Solo fechas `realizada` deben entrar en un certificado nuevo.
2. Una modificación de asistencias actualiza el snapshot del certificado vigente, conserva token/QR y marca el PDF como desactualizado.
3. Mientras el PDF esté desactualizado, no se debe entregar silenciosamente un PDF viejo.
4. El estado “entregado” se elimina de la UI mock hasta que exista una necesidad y persistencia reales.
5. El email opcional se difiere hasta que exista una pantalla o proceso que realmente lo use.
6. La build productiva nunca puede usar fuentes mock.
7. La build de demostración puede usar mocks únicamente si muestra un banner persistente e inequívoco.

---

# 2. Cómo usar este documento

## 2.1 Ubicación recomendada dentro del repo

Ruta vigente de este archivo:

```txt
docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md
```

## 2.2 Lectura mínima por ciclo

El agente debe leer únicamente:

1. `AGENTS.md`.
2. Este documento:
   - tablero general;
   - fase activa;
   - ciclo activo.
3. `AGENTS.md` de la carpeta afectada.
4. La spec canónica afectada.
5. Como máximo, los archivos de código indicados en el ciclo.

Si necesita leer cuatro o más archivos para entender el flujo, debe usar una fase `explore` enfocada o delegar la exploración. Gentle AI recomienda no mantener una sesión monolítica cuando aumenta la complejidad.

## 2.3 Inicio de una sesión

Desde la raíz del repositorio:

```bash
git status --short
git branch --show-current
git log -1 --oneline
gentle-ai doctor
gentle-ai skill-registry refresh
```

La primera vez, o cuando cambien frameworks/tests:

```txt
/sdd-init
```

Después, indicarle al agente:

```txt
Usá SDD para ejecutar únicamente el ciclo <ID>.
Aplicá Strict TDD: primero test RED, después implementación mínima GREEN,
después refactor y regresión. Leé solamente los archivos autorizados por el ciclo.
```

## 2.4 Uso con modelos económicos

Para reducir errores y tokens:

- Un ciclo debe modificar como máximo entre 2 y 6 archivos de producto, salvo migración o integración justificada.
- No pedir “arreglá todo el proyecto”.
- No cargar todos los archivos OpenSpec históricos.
- Usar un modelo económico para `explore`, tests mecánicos y documentación.
- Reservar un modelo más fuerte, si está disponible, para:
  - diseño de migraciones;
  - autenticación;
  - seguridad;
  - revisión adversarial del diff.
- Al final de cada ciclo, iniciar una revisión con contexto fresco.
- No aceptar “todo pasó” sin comandos, exit codes y resumen de evidencia.

Gentle AI permite perfiles por fase en OpenCode. La configuración de perfiles se realiza fuera de este plan; el ciclo solo debe indicar qué tipo de modelo requiere.

---

# 3. Reglas obligatorias de SDD y TDD

## 3.1 Secuencia SDD

Cada ciclo sustancial debe seguir:

```txt
explore
→ propose
→ spec
→ design
→ tasks
→ apply
→ verify
→ archive
```

Para cambios pequeños, el orquestador puede combinar artefactos, pero no puede omitir:

- criterio de aceptación;
- test RED;
- implementación GREEN;
- verificación;
- actualización documental.

## 3.2 Secuencia TDD estricta

### RED

Antes de modificar código de producto:

1. Crear o modificar el test que representa el bug/requisito.
2. Ejecutarlo.
3. Confirmar que falla por la razón esperada.
4. Guardar evidencia mínima:

```txt
Comando:
Exit code:
Test fallido:
Mensaje relevante:
Por qué demuestra el problema:
```

No aceptar como RED:

- fallo por sintaxis del test;
- dependencia ausente;
- ruta incorrecta;
- DB no iniciada;
- error de permisos;
- test que ya pasa.

### GREEN

1. Implementar el cambio mínimo.
2. No refactorizar módulos no relacionados.
3. Ejecutar primero el test nuevo.
4. Ejecutar la suite del módulo.
5. Confirmar exit code `0`.

### REFACTOR

1. Mejorar nombres o duplicación solo dentro del alcance.
2. No añadir features.
3. Volver a ejecutar la suite.
4. Revisar diff.

### VERIFY

El agente debe verificar:

- criterios de spec;
- tests RED/GREEN documentados;
- regresión;
- seguridad;
- secretos;
- cambios de contratos;
- documentación;
- árbol Git.

### ARCHIVE

`sdd-archive` debe actualizar:

- este tablero;
- docs del área;
- spec canónica;
- evidencia resumida;
- riesgos pendientes;
- siguiente ciclo desbloqueado.

---

# 4. Regla obligatoria de seguimiento

## 4.1 Estados vigentes y estados históricos

La vista operativa actual usa exclusivamente `DONE`, `DONE WITH WARNINGS`, `PARTIAL`, `PENDING`, `BLOCKED` o `SUPERSEDED`. Los estados de ejecución como `EN_RED`, `EN_VERIFY` y `ARCHIVADO` permanecen en el registro histórico: no son evidencia de cierre por sí mismos.

La precedencia de evidencia es: merge/commit y `verify-report.md` archivado → runtime/CI versionado → spec vigente → documentación activa → este plan, checklist o auditoría histórica. Una fuente inferior no eleva un estado.

## 4.2 Tablero operativo actual

Este tablero es la vista vigente. Las auditorías, checklists y registros posteriores conservan su valor histórico, pero no cambian estos estados sin evidencia superior. Cada evidencia identifica su entorno; no hay evidencia `[production]` para producción `/certificados/`, que permanece **no validada**.

| Fase | Estado | PR/commit | Evidencia dual, entorno y veredicto exacto | Brecha/advertencia vigente | Siguiente |
|---|---|---|---|---|---|
| P0 | `PARTIAL` | [PR #57](https://github.com/marcostoledo96/ifts14/pull/57) / [`9bc0dbd`](https://github.com/marcostoledo96/ifts14/commit/9bc0dbd) | [documental] [reporte P0-01](../auditoria/03-reporte-baseline-p0-01.md): frontend `543 SUCCESS`; backend `Fallo unexpected EOF`. P0 y P0-01 no tienen veredicto formal aprobatorio. | El backend falló y el baseline no acredita cierre; `ARCHIVADO` en 4.3 es solo historia. | P1 residual. |
| P1 | `PARTIAL` | Sin cierre terminal de P1-03 | [local] [verify de esquema](../../openspec/changes/archive/2026-07-02-database-cursos-alumnos-asistencias/verify-report.md): **PASS WITH WARNINGS**; MariaDB 10.6 efímero aprobó. | P1-03 no acredita de forma directa las dos variantes históricas de `003` convergiendo al mismo resultado. | Prueba de upgrade o decisión formal `SUPERSEDED`. |
| P2 | `PARTIAL` | Sin cierre terminal de P2-02 | [documental] [verify de deriva](../../openspec/changes/archive/2026-06-29-docs-openspec-drift-cleanup/verify-report.md): **PASS**. | Persisten warnings P5-01 sobre referencias operativas históricas; esta reconciliación corrige solo este plan. | Sincronización acotada posterior. |
| P3 | `DONE` | [`c67c4d8`](https://github.com/marcostoledo96/ifts14/commit/c67c4d85f51e6d5ea365da1daab0292e65815153) | [local] [verify de hardening](../../openspec/changes/archive/2026-06-27-qa-backend-hardening-certificados/verify-report.md): **PASS WITH WARNINGS**; [CI] [verify P5-01](../../openspec/changes/archive/2026-07-15-p5-01-auth-php/verify-report.md): tests/lint exit `0`. | Advertencias históricas de archive/documentación ya no invalidan los requisitos P3; no implican producción validada. | P5-04. |
| P4 | `DONE` | [`c337def`](https://github.com/marcostoledo96/ifts14/commit/c337deffe5d217ba56e53da6ca81e31ab4ec2219) | [local] [verify P5-01](../../openspec/changes/archive/2026-07-15-p5-01-auth-php/verify-report.md): **PASS WITH WARNINGS**, con E2E MariaDB de revisiones; [CI] mismo verify: MariaDB E2E exit `0`. | No se infiere regeneración automática de PDF ni validación de producción. | P5-04. |
| P5 | `DONE` | [PR #63](https://github.com/marcostoledo96/ifts14/pull/63) / [`1a6a1cf`](https://github.com/marcostoledo96/ifts14/commit/1a6a1cf5aa1b19a9652cab82b9455e789885471c) | [local] [verify P5-01](../../openspec/changes/archive/2026-07-15-p5-01-auth-php/verify-report.md): **PASS WITH WARNINGS**, 16/16 requirements y 52/52 escenarios; [staging] [evidencia Task 4.1](../../openspec/changes/archive/2026-07-15-p5-01-auth-php/task-4-1-staging-evidence.md): **PASS para el candidato aislado de staging**; [local] [verify P5-03](../../openspec/changes/archive/2026-07-15-p5-03-environments/verify-report.md): **PASS** 6/6 requirements, 597/597 tests y guarda de CI activa; [local] [verify P5-04](../../openspec/changes/archive/2026-07-15-p5-04-login-angular-real/verify-report.md): **PASS** 8/8 requirements, 605/605 tests y 0 blockers. | No se infiere regeneración automática de PDF ni validación de producción. P5-01 conserva su warning W1 histórico; la producción `/certificados/` no está validada. | P6-01. |
| P6 | `DONE` | [PR #65](https://github.com/marcostoledo96/ifts14/pull/65) / [`27b34c6`](https://github.com/marcostoledo96/ifts14/commit/27b34c63be917d32d9f987340d426eec0a8c421b) | [CI] PR #65 mergeado: revocación limitada a certificados `vigente`; [documental] [exploración de reconciliación](../../openspec/changes/archive/2026-07-15-reconcile-audit-remediation-plan/exploration.md): sin verify de cierre P6 global; [local] [verify P6-01](../../openspec/changes/archive/2026-07-15-p6-01-entrega-manual-funcional/verify-report.md): **PASS** 7/7 requirements, 617/617 tests, 0 blockers y 0 warnings — entrega manual real con URL canónica, descarga QR Blob con filename semántico, clipboard fallback, detección de PDF `outdated` y botón "Entrega manual" habilitado desde preview; [local] [verify P6-02](../../openspec/changes/archive/2026-07-15-p6-02-reenvio-automatico/verify-report.md): **PASS** 4/4 requirements (REQ-REGEN-001 a REQ-REGEN-004), 621/621 tests, 0 blockers y 1 warning (W1 backend test no ejecutable sin PHP local) — regeneración real de PDF con mismo token, rechazo de PDF vigente, botón en preview que dispara endpoint y auditoría `pdf_regenerado`; [local] [verify P6-03](../../openspec/changes/archive/2026-07-15-p6-03-estados-no-sustentados/verify-report.md): **PASS** 4/4 requirements (REQ-CLEAN-001 a REQ-CLEAN-004), 619/619 tests, 0 blockers y 0 warnings — modelo sin `TipoEnvio`/`envio`, listado sin chips ni columna "Entrega", sin "firma digital verificada" ni "validez legal" en preview/PDF preview; [local] [verify P6-04](../../openspec/changes/archive/2026-07-15-p6-04-validacion-publica-refinada/verify-report.md): **PASS** 6/6 requirements (REQ-VAL-001 a REQ-VAL-006), 626/626 tests, 0 blockers y 0 warnings — layout folio con sidebar, membrete IFTS N.° 14 — Bedelía, datos completos (alumno, DNI, curso, código, tabla de fechas), sidebar con trazabilidad y sello `aria-hidden`, cuerpo editorial en `not-verifiable` y `technical-error`, sin QR decorativo; [local] [verify P6-05](../../openspec/changes/archive/2026-07-15-p6-05-css-accesibilidad/verify-report.md): **PASS**, 0 blockers y 0 warnings, 626/626 tests — 10 fixes quirúrgicos de CSS y accesibilidad (custom properties en `:root`, `prefers-reduced-motion: reduce`, focus ring duplicado eliminado, z-index consistente en revoke, focus trap en diálogos, `inert` en drawer mobile, `overflow-x` en tabla de validación, CSS formateado, `focus-visible` excluido del reset de animaciones) sin nuevas dependencias. P6 cierra con 5/5 ciclos archivados (P6-01 a P6-05). | No se infiere envío automático por email ni validación de producción. P6-02 deja el backend test `RegenerarPdfTest.php` pendiente de corrida en CI/entorno con PHP 8.4.21 + TCPDF (W1); la producción `/certificados/` no está validada. | P7-01. |
| P7 | `DONE` | Sin cierre terminal de P7 (P7-01, P7-02, P7-03 y P7-04 archivados) | [CI] `.github/workflows/backend-tests.yml`: tests backend/MariaDB/frontend con P7-01 (tsc --noEmit, build staging, mock guard), P7-02 (composer validate --strict, composer audit, php -l), P7-03 (paso `database-setup` con 10 migraciones 001–010, suite E2E sin SKIP, schema contract, upgrade test) y P7-04 (job `security-docs-gates` con gitleaks, git diff --check, ci-link-check, ci-obsolete-terms, ci-openspec-orphan-check) activos; [local] [verify P7-01](../../openspec/changes/archive/2026-07-16-p7-01-frontend-ci/verify-report.md): **PASS** 6/6 requirements (REQ-CI-001 a REQ-CI-006), 636/636 tests, 0 blockers; [local] [verify P7-02](../../openspec/changes/archive/2026-07-16-p7-02-backend-ci/verify-report.md): **PASS** 5/5 requirements (REQ-BE-001 a REQ-BE-005), 8/8 scenarios, 0 blockers y 0 critical findings — composer validate/audit y php -l activos, 12/12 unit tests y 11/11 E2E tests en CI; [local] [verify P7-03](../../openspec/changes/archive/2026-07-16-p7-03-mariadb-ci/verify-report.md): **PASS** 5/5 requirements (REQ-MDB-001 a REQ-MDB-005), 8/8 scenarios, 0 blockers y 0 critical findings — paso `database-setup` aplica 10/10 migraciones 001–010 en orden numérico, 7/7 tests E2E con DB reemplazan el patrón `SKIP` por `exit(1)` + `STDERR`, schema contract (`DatabaseSchemaContractTest.php`, 201 líneas) valida 10 tablas/columnas/enums/versiones 007–010, upgrade test (`scripts/test-database-upgrade.sh`, 53 líneas) compara variantes históricas vs actuales y converge tras 006–010, suite E2E encadenada 11/11 con `&&`; [local] [verify P7-04](../../openspec/changes/archive/2026-07-16-p7-04-seguridad-docs/verify-report.md): **PASS** 7/7 requirements (REQ-SEC-001 a REQ-SEC-007), 2/2 scenarios, 0 blockers y 0 critical findings — gitleaks (`gitleaks/gitleaks-action@v2` + `.gitleaks.toml` con allowlist de 3 paths: `muestra_pagina/`, tests, migraciones SQL) activo, `git diff --check origin/main...HEAD` exit `0`, `scripts/ci-link-check.sh` exit `0` (50/50 enlaces válidos en `docs/` y `openspec/specs/`), `scripts/ci-obsolete-terms.sh` exit `0` (0 finds sobre términos obsoletos), `scripts/ci-openspec-orphan-check.sh` exit `0` (0 huérfanos activos), 3 carpetas huérfanas movidas a `archive/` con prefijo de fecha (`m4-01a-*`, `m4-02-*`, `p5-03-environments`), 2 términos residuales corregidos (`pendiente-entrega` → `no_emitido` en `frontend-http-services/spec.md:174`; "último entregado por el instituto" → "el emitido por el instituto" en `public-validation-page.html:256`). | Branch protection del check `frontend-tests` debe configurarse manualmente en GitHub. ESLint diferido. | P8-01 (staging en cPanel). |
| P8 | `PARTIAL` | Subdominio staging [`certificados-qa.ifts14.com.ar`](https://certificados-qa.ifts14.com.ar/certificados_staging/) / [`875e3dc`](https://github.com/marcostoledo96/ifts14/commit/875e3dc) (fix envelope auth) | [staging] [P8-01](#p8-01--investigación-manual-de-capacidades): **DONE** — entorno real documentado; [staging] [P8-02](#p8-02--db-staging): **DONE** — seed aplicado (3 alumnos, 2 cursos, 7 fechas, 9 asistencias, 3 certificados, 3 tokens, 4 eventos auditoría); [local+staging] [P8-03](#p8-03--build--deploy): **DONE** — build staging OK, deploy funcional, login verificado local y staging, fix envelope (`res.data.*`) commiteado, `.user.ini` + `auto_prepend_file` funcional, lecciones documentadas (CERTIFICADOS_CONFIG_PATH, TTL 1800/28800, rate-limit, envelope API). | Faltan smoke remoto completo (P8-04) y QA manual (P8-05). Producción `/certificados/` no validada. | P8-04 (smoke remoto). |
| P9 | `PENDING` | Sin PR/commit de cierre | [documental] este plan: backlog posterior; sin evidencia de cierre ni evidencia `[production]`. | **No bloqueante** para la secuencia inmediata. | Backlog posterior a P8. |

### Chequeo determinista del tablero 4.2

Ejecutar desde la raíz; falla ante estado inválido, falta de etiqueta de entorno, trazabilidad incompleta, falso `DONE`, tablero P5/P9 desactualizado o cualquier sub-ciclo de P6 ausente cuando P6 está `DONE`.

```bash
python3 - <<'PY'
from pathlib import Path
import re

p = Path('docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md')
text = p.read_text(encoding='utf-8')
board = text.split('## 4.2 Tablero operativo actual', 1)[1].split('## 4.3 Registro por ciclo', 1)[0]
expected = {'P0': 'PARTIAL', 'P1': 'PARTIAL', 'P2': 'PARTIAL', 'P3': 'DONE', 'P4': 'DONE', 'P5': 'DONE', 'P6': 'DONE', 'P7': 'DONE', 'P8': 'PARTIAL', 'P9': 'PENDING'}
allowed = {'DONE', 'DONE WITH WARNINGS', 'PARTIAL', 'PENDING', 'BLOCKED', 'SUPERSEDED'}
rows = {}
for phase, status in re.findall(r'^\| (P[0-9]) \| `([^`]+)` \| (?:.+)$', board, re.M):
    assert status in allowed, (phase, status)
    rows[phase] = status
assert rows == expected, rows
# R3-001: P0 debe evidenciar fallo backend y falta de veredicto
p0_line = next(line for line in board.splitlines() if line.startswith('| P0 |'))
assert 'backend falló' in p0_line and 'no tienen veredicto formal aprobatorio' in p0_line
for phase in expected:
    row = next(line for line in board.splitlines() if line.startswith(f'| {phase} |'))
    assert re.search(r'\[(?:local|CI|staging|production|documental)\]', row), row
for phase in ('P3', 'P4', 'P6'):
    row = next(line for line in board.splitlines() if line.startswith(f'| {phase} |'))
    assert 'https://github.com/marcostoledo96/ifts14/' in row and '](' in row, row
    assert 'verify' in row.lower() or 'reporte P0-01' in row, row
    assert not re.search(r'\bbrecha\b|\bfalta\b', row, re.I), row
p5 = next(line for line in board.splitlines() if line.startswith('| P5 |'))
p6 = next(line for line in board.splitlines() if line.startswith('| P6 |'))
p9 = next(line for line in board.splitlines() if line.startswith('| P9 |'))
for cid in ('P6-01', 'P6-02', 'P6-03', 'P6-04', 'P6-05'):
    assert cid in p6, (cid, p6[:200])
assert 'P5-04' in p5, p5
assert 'P6-01' in p5, p5
assert 'No bloqueante' in p9 and 'PENDING' in p9, p9
assert re.search(r'producción.*\*\*no validada\*\*', board, re.I), 'missing production boundary'
prose = re.sub(r'```.*?```', '', text, flags=re.S)
bad = [href for href in re.findall(r'\]\(([^)#]+)', prose) if '://' not in href and not (p.parent / href).resolve().exists()]
assert not bad, bad
print('dashboard assertions: PASS')
PY
```

## 4.3 Registro por ciclo

Al cerrar cada ciclo, agregar una fila:

| Fecha | Ciclo | Estado final | Tests RED | Tests GREEN/regresión | Alto manual | Archivos | Commit/PR | Pendiente |
|---|---|---|---|---|---|---|---|---|
| 2026-07-14 | P0-01 | ARCHIVADO | N/A | Front: 543 OK / Back: No Docker | UI Demo Validada | Reporte | 9bc0dbd | P1 |
| 2026-07-14 | P1-01 | ARCHIVADO | `test-database-schema-contract.sh` | Tests 006+007 OK | Script RED/GREEN | 006, 007 | — | P2 |
| 2026-07-14 | P1-03 | ARCHIVADO | Upgrade Test RED | Upgrade Test GREEN | Script convergencia | 006 | — | P2 |
| 2026-07-14 | P2-01 | ARCHIVADO | N/A | N/A | — | specs | 6003884 | P2 |
| 2026-07-14 | P2-02 | ARCHIVADO | N/A | N/A | — | README | — | P3 |
| 2026-07-14 | P3-01 | ARCHIVADO | `HttpContractTest.php` | Tests PHP OK | N/A | `index.php`, `HttpContractTest.php` | — | P3-02 |
| 2026-07-14 | P3-02 | ARCHIVADO | `test-privacy-headers.sh` | Tests Headers OK | N/A | `index.html`, `Response.php`, `.htaccess` | — | P3-03 |
| 2026-07-14 | P3-03 | ARCHIVADO | `ReadinessTest.php` | Tests PHP OK | N/A | `readiness.php`, `ReadinessTest.php` | — | P3-04 |
| 2026-07-14 | P3-04 | ARCHIVADO | `AdminCertificateServiceTest.php`, `SnapshotEmissionTest.php` | Tests PHP OK | N/A | `AdminCertificateService.php`, Tests | — | P4-01 |
| 2026-07-14 | P4-01 | ARCHIVADO | `CertificateRevisionMigrationTest.php` | Test PHP OK | N/A | `008`, Tests | — | P4-02 |
| 2026-07-14 | P4-02 | ARCHIVADO | `AttendanceRevisionTest.php` | Test PHP OK | N/A | `AdminMasterDataService.php`, Tests | — | P4-03 |
| 2026-07-14 | P4-03 | ARCHIVADO | `AttendanceRevisionTest.php` | Test PHP OK | N/A | `AdminMasterDataService.php`, Tests | — | P4-04 |
| 2026-07-14 | P4-04 | ARCHIVADO | `CourseDateRevisionTest.php` | Test PHP OK | Confirmación de cancelación | `AdminMasterDataService.php`, Tests | — | P4-05 |
| 2026-07-14 | P4-05 | ARCHIVADO | `HttpEmissionE2eTest.php` | E2E + Regresión OK | ALTO-C OK | `index.php`, Tests | — | P5-01 |
| 2026-07-15 | P5-01 | DONE WITH WARNINGS | Evidencia RED preservada | 16/16 requirements, 52/52 escenarios; tests/lint exit `0` | Staging aislado PASS | Auth PHP, tests y docs | [PR #63](https://github.com/marcostoledo96/ifts14/pull/63) / `1a6a1cf` | P5-04 |
| 2026-07-15 | P5-03 | DONE | environment.guard.spec.ts | 597/597 SUCCESS | N/A | environment.ts, environment.guard.spec.ts, app.config.spec.ts, app.routes.spec.ts | — | P5-04 |
| 2026-07-15 | P5-04 | DONE | admin-auth.service.spec.ts | 605/605 SUCCESS | N/A | 21 archivos (3 nuevos, 16 mod, 2 elim) | — | P6-01 |
| 2026-07-15 | P6-02 (parcial) | PARTIAL | Tests de estados no revocables | PR #65 protege revocación solo `vigente` | No aplica | Frontend de revocación | [PR #65](https://github.com/marcostoledo96/ifts14/pull/65) / `27b34c6` | No cierra P6; depende de P5-04 |
| 2026-07-15 | P6-01 | DONE | `certification-delivery-page.spec.ts` | 617/617 SUCCESS | N/A | 8 archivos (7 mod, 1 reescrito) | — | P6-02 |
| 2026-07-15 | P6-02 (reenvío) | DONE | Tests de estados no regenerables (vigente) | 621/621 SUCCESS Front; 5 tests PHP no ejecutables localmente (W1) | N/A | 14 archivos (3 backend + 11 frontend) | — | P6-03 (eliminar estados no sustentados) / P6-05 (CSS/a11y) |
| 2026-07-15 | P6-03 | DONE | Tests de `TipoEnvio`/`envio` y copy "firma digital verificada" / "validez legal" | 619/619 SUCCESS Front; `npm run test:ci` exit `0`; grep 0 matches residuales | N/A | Frontend de cleanup (modelos, list, preview, PDF preview) | `archive/2026-07-15-p6-03-estados-no-sustentados/` | P6-04 (validación pública) / P6-05 (CSS/a11y) |
| 2026-07-15 | P6-04 | DONE | Tests de layout folio, membrete, tabla de fechas, sidebar con sello `aria-hidden` y sin QR decorativo | 626/626 SUCCESS Front; `npm run test:ci` exit `0` | N/A | Frontend de validación pública (template, CSS, TS, spec) | `archive/2026-07-15-p6-04-validacion-publica-refinada/` | P6-05 (CSS/a11y) |
| 2026-07-15 | P6-05 | DONE | 10 fixes de CSS/a11y sin delta de spec; tests `npm run test:ci` | 626/626 SUCCESS Front; `npm run test:ci` exit `0`; 0 blockers y 0 warnings | N/A | 10 archivos (styles.css, certification-delivery-page, certification-revoke-page, admin-shell, public-validation-page, certifications-list-page) | `archive/2026-07-15-p6-05-css-accesibilidad/` | P7-01 (CI frontend) |
| 2026-07-16 | P7-01 | DONE | 9/9 tareas; gates previos de `test:ci` y `environment.guard.spec.ts` | 6/6 requirements (REQ-CI-001 a REQ-CI-006); 14/14 escenarios; 636/636 SUCCESS Front; `npm run test:ci`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`, `npm run build -- --configuration production-staging` y `node scripts/ci-mock-guard.mjs` exit `0`; 0 blockers y 2 warnings no bloqueantes (CSS budget) | N/A | `apps/frontend-angular/scripts/ci-mock-guard.mjs` (nuevo), `.github/workflows/backend-tests.yml`, `openspec/config.yaml` | `archive/2026-07-16-p7-01-frontend-ci/`; spec canónica `frontend-ci-quality-gates` | P7-02 (backend CI) / P7-04 (seguridad/docs); branch protection manual de `frontend-tests` pendiente |
| 2026-07-16 | P7-02 | DONE | 7/7 tareas; gates previos de composer validate/audit y php -l | 5/5 requirements (REQ-BE-001 a REQ-BE-005); 8/8 scenarios; `docker build -t ifts14-php84` exit `0`; `composer validate --strict` → `./composer.json is valid`; `composer audit` → `No security vulnerability advisories found`; `php -l` sobre 41 archivos backend (excluyendo `vendor/`) y sobre los 5 tests huérfanos (AdminMasterDataServiceTest, SessionHttpTest, QrImageTest, RegenerarPdfTest, fault-injection-audit) → 0 errores; 12/12 unit tests y 11/11 E2E tests con MariaDB exit `0`; 0 blockers y 0 warnings | N/A | `.github/workflows/backend-tests.yml`, `openspec/config.yaml` | `archive/2026-07-16-p7-02-backend-ci/`; spec canónica `backend-ci-quality-gates` (5 requirements) | P7-03 (MariaDB CI) / P7-04 (seguridad/docs) |
| 2026-07-16 | P7-03 | DONE | 13/13 tareas; gates previos de composer validate/audit y php -l, schema contract y upgrade test | 5/5 requirements (REQ-MDB-001 a REQ-MDB-005); 8/8 scenarios; `php -l` sobre 8 archivos de test (DatabaseSchemaContract, SnapshotEmission, HttpEmissionE2e, AdminMasterDataHttp, AdminCertificadosConsultaHttp, AttendanceRevision, CertificateRevisionMigration, CourseDateRevision) → 8/8 "No syntax errors detected"; `python3 -c "import yaml; yaml.safe_load(...)"` sobre `.github/workflows/backend-tests.yml` exit `0`; `bash -n scripts/test-database-upgrade.sh` exit `0`; paso `database-setup` aplica 10/10 migraciones 001–010 vía `mariadb` CLI; 7/7 tests E2E con DB reemplazan `echo "SKIP..."; return;` por `fwrite(STDERR, "FATAL: ..."); exit(1);`; `DatabaseSchemaContractTest.php` valida 10 tablas/columnas/enums/versiones 007–010; `scripts/test-database-upgrade.sh` crea 2 contenedores MariaDB y converge variantes históricas y actuales tras 006–010 con `diff` exit `0`; suite E2E encadenada 11/11 con `&&`; 0 blockers y 0 critical findings | N/A | `.github/workflows/backend-tests.yml`, `apps/backend-php/tests/DatabaseSchemaContractTest.php`, `apps/backend-php/tests/{SnapshotEmissionTest,HttpEmissionE2eTest,AdminMasterDataHttpTest,AdminCertificadosConsultaHttpTest,AttendanceRevisionTest,CertificateRevisionMigrationTest,CourseDateRevisionTest}.php`, `scripts/test-database-upgrade.sh`, `openspec/config.yaml` | `archive/2026-07-16-p7-03-mariadb-ci/`; spec canónica `mariadb-ci-quality-gates` (5 requirements) | P7-04 (seguridad/docs) |
| 2026-07-16 | P7-04 | DONE | 17/17 tareas; gates previos de CI scripts (`bash -n scripts/ci-*.sh`) y YAML workflow válido | 7/7 requirements (REQ-SEC-001 a REQ-SEC-007); 2/2 scenarios; `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/backend-tests.yml'))"` exit `0`; `bash scripts/ci-link-check.sh` → 50 enlaces chequeados, 0 broken, exit `0`; `bash scripts/ci-obsolete-terms.sh` → FINDS=0, exit `0`; `bash scripts/ci-openspec-orphan-check.sh` → 1 active change chequeado, 0 orphans, exit `0`; `git diff --check` exit `0`; gitleaks (`gitleaks/gitleaks-action@v2`) activo con `.gitleaks.toml` (allowlist de 3 paths: `muestra_pagina/`, tests, migraciones SQL); 3 carpetas huérfanas movidas a `archive/` con prefijo de fecha; 2 términos residuales corregidos (`pendiente-entrega` → `no_emitido`, "último entregado" → "emitido"); 0 blockers y 0 critical findings | N/A | `.github/workflows/backend-tests.yml`, `.gitleaks.toml` (nuevo), `scripts/ci-link-check.sh`, `scripts/ci-obsolete-terms.sh`, `scripts/ci-openspec-orphan-check.sh`, `openspec/specs/frontend-http-services/spec.md`, `public-validation-page.html` | `archive/2026-07-16-p7-04-seguridad-docs/`; spec canónica `security-docs-ci-gates` (7 requirements) | P8-01 (staging en cPanel) — P7 cierra como DONE |
| 2026-07-16 | P8-01 | DONE | Investigación manual de capacidades cPanel ejecutada por Marcos | [staging] PHP 8.4.22 (ea-php84, CGI/FastCGI); 7/7 extensiones OK; sin Terminal/Composer/SSH/mod_env; subdominio certificados-qa.ifts14.com.ar creado; DB staging con migraciones 001–010; `.user.ini` + `auto_prepend_file` funcional. | Esquema sin seed; SetEnv NO funciona → usar `.user.ini`. Producción intacta. | P8-02 (seed) y P8-03 (deploy). |
| 2026-07-16 | P8-02 | DONE | Seed SQL ejecutado por Marcos en phpMyAdmin | 3 alumnos, 2 cursos, 7 fechas, 9 asistencias, 3 certificados (2 vigentes + 1 borrador), 3 tokens, 4 eventos auditoría. | Datos ficticios con placeholders binarios (`X'D4...'`). | P8-03 (build + deploy). |
| 2026-07-16 | P8-03 | DONE | Build staging local + deploy cPanel + fix envelope auth | Build staging OK (`npm run build -- --configuration production-staging`); vendor generado vía Docker Composer; ZIPs subidos a File Manager; login verificado local (`curl 200`) y staging (browser OK); fix envelope `res.data.*` commiteado (`875e3dc`); proxy.conf.json + router.php agregados para dev local; `.user.ini` + `.htaccess` limpio funcional. | 5 lecciones documentadas: CERTIFICADOS_CONFIG_PATH, TTL 1800/28800, rate-limit 5/300s, envelope API, db_port no soportado. | P8-04 (smoke remoto). |

## 4.4 Regla para la IA

Antes de responder “terminado”, el agente debe:

1. Cambiar el estado del ciclo a `EN_VERIFY`.
2. Mostrar tests y exit codes.
3. Declarar si hubo test manual.
4. Ejecutar revisión fresca.
5. Ejecutar `sdd-archive`.
6. Marcar el ciclo `ARCHIVADO`.
7. Actualizar “Siguiente ciclo habilitado”.

Si no puede actualizar este documento, debe entregar el bloque exacto que Marcos debe pegar.

---

# 5. Tipos de ALTO obligatorio

## ALTO-A — Decisión humana

Detenerse cuando haya más de una solución válida que cambie producto, seguridad o datos.

Salida requerida:

```txt
ALTO-A — Decisión requerida
Decisión:
Opciones:
Recomendación:
Riesgo de cada opción:
Archivos que cambiarían:
```

## ALTO-B — Base de datos manual

No aplicar migraciones en una DB persistente automáticamente.

Salida requerida:

```txt
ALTO-B — Acción manual de base de datos
Entorno:
Backup requerido:
SQL a inspeccionar:
Comando/paso exacto:
Consulta de verificación:
Rollback:
Datos que NO deben copiarse al chat:
```

## ALTO-C — QA manual

Detenerse para pruebas visuales, teclado, responsive, PDF, QR o flujo operativo.

## ALTO-D — cPanel/deploy

No subir, extraer, mover, editar `.htaccess` ni ejecutar migraciones remotas sin Marcos.

## ALTO-E — Seguridad

Detenerse si encuentra:

- secreto versionado;
- token real;
- DNI real;
- config real;
- dump;
- acceso inesperado a `material_privado_no_versionar/`;
- cambio de auth no documentado.

---

# 6. Milestone de presentación — 15 de julio

## 6.1 Objetivo realista

Presentar una demostración segura, no una producción falsa.

Se puede mostrar:

- diseño Angular administrativo marcado como demo;
- backend real ejecutándose localmente con Docker;
- creación ficticia de curso/alumno/asistencia;
- emisión real en DB descartable;
- URL pública permanente;
- validación pública;
- descarga de QR;
- explicación de que integración admin y staging continúan.

## 6.2 Qué no intentar a último momento

No realizar antes de la presentación, salvo que ya esté verificado:

- deploy productivo;
- migraciones en DB institucional;
- auth nueva improvisada;
- refactor masivo;
- firma digital;
- email;
- integración Angular admin completa.

## 6.3 Checklist de presentación

```txt
[ ] El admin muestra “ENTORNO DE DEMOSTRACIÓN”.
[ ] No se afirma que la sesión mock sea seguridad real.
[ ] No se afirma que exista firma digital.
[ ] La validación pública usada en demo consulta una DB ficticia real o se declara mock.
[ ] El link de validación abre correctamente.
[ ] El QR descargado valida el mismo link.
[ ] No se exhiben claves, tokens completos en consola ni datos reales.
[ ] Tests principales ejecutados el mismo día.
[ ] Se dispone de plan B: capturas o video local si falla el entorno.
```

---

# 7. Fases y ciclos

> **Estado operativo vigente:** los criterios y checklists siguientes se preservan como planificación histórica. Para el estado acreditado y los gaps actuales, consultar exclusivamente el tablero 4.2; una casilla no marcada o marcada no constituye evidencia de cierre.

# P0 — Baseline y congelamiento seguro

## Objetivo

Crear una fotografía confiable del estado actual antes de corregir código.

## Rama

```txt
audit/preproduction-baseline
```

## Ciclos

### P0-01 — Baseline Git, tests y fuentes de verdad

**Alcance**

- No modificar producto.
- Registrar commit, ramas, PRs recientes, tests disponibles y docs vigentes.
- Confirmar por escrito que ninguna DB persistente ejecutó la migración `003`.

**Lectura mínima**

```txt
AGENTS.md
README.md
GUIA.md
docs/00-indice-general.md
apps/frontend-angular/package.json
apps/backend-php/composer.json
database/migrations/
```

**Tareas**

1. Crear rama desde `main` limpio.
2. Ejecutar:
   ```bash
   git status --short
   git log -1 --oneline
   git diff --check
   ```
3. Inventariar migraciones `001–005`.
4. Registrar:
   ```txt
   003 aplicada en DB persistente: NO
   ```
5. Ejecutar suites disponibles sin modificar producto.
6. Crear reporte baseline.
7. Actualizar tablero.

**Verificación recomendada**

Frontend:

```bash
cd apps/frontend-angular
npm ci
npm run test:ci
npm run build -- --configuration production
npm run build -- --configuration production-staging
```

Backend, usando Docker del proyecto:

```bash
bash scripts/php-docker-build.sh
bash scripts/php-docker-modules-check.sh
bash scripts/php-docker-lint.sh
```

Si los scripts fallan únicamente por `sudo`, ejecutar la variante Docker directa y documentar la sustitución.

**ALTO-C**

Marcos revisa:

- que la UI demo tenga banner;
- que no haya credenciales;
- que la rama sea correcta.

**Criterios de aceptación**

```txt
[ ] Baseline archivado.
[ ] No se tocó producto.
[ ] Tests con resultados reales registrados.
[ ] Estado de migración 003 registrado.
[ ] Fase P1 habilitada.
```

**Commit sugerido**

```txt
docs(audit): registrar baseline preproduccion
```

**Prompt corto para el agente**

```txt
Usá SDD para P0-01 de
docs/planificacion/PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md.
Solo auditoría y evidencia. No modifiques producto, migraciones ni dependencias.
Actualizá el tablero, ejecutá verify y archive.
```

---

# P1 — Reconciliación de migraciones y esquema

## Objetivo

Garantizar que toda instalación fresca termine con un esquema compatible con el backend y que las migraciones ya publicadas no vuelvan a modificarse.

## Dependencia

P0 archivada.

## Rama

```txt
database/reconcile-m4-02-schema
```

## Decisión canónica propuesta

La spec deberá confirmar:

- `cert_cursos.estado`: `borrador|activo|cerrado|archivado`.
- `cert_curso_fechas.estado`: `programada|realizada|cancelada`.
- Autoridades: nullable hasta que se configure el instituto.
- `institucion_nombre`: obligatorio.
- Texto certificado: nullable con fallback de aplicación.
- Collation explícita `utf8mb4_unicode_ci`.
- Índices para estados, nombres, fechas y FKs.
- Timestamps consistentes.
- `cert_schema_migrations` para versiones/checksums.
- No editar nuevamente `001–005`; corregir mediante `006+`.

## Ciclos

### P1-01 — Spec y test de contrato de esquema

**TDD: RED primero**

Crear un test de esquema que levante MariaDB 10.6 descartable, aplique `001–005` y falle actualmente si:

- DB no acepta `archivado`;
- configuración vacía produce incompatibilidad;
- faltan índices/timestamps acordados;
- schema migration registry no existe;
- SQL y enums PHP no coinciden.

Archivo sugerido:

```txt
apps/backend-php/tests/DatabaseSchemaContractTest.php
```

o script:

```txt
scripts/test-database-schema-contract.sh
```

**Casos RED detallados**

1. `archivado`:
   ```sql
   INSERT curso activo;
   UPDATE estado='archivado';
   ```
   Resultado esperado futuro: éxito.

2. configuración institucional nullable:
   ```sql
   INSERT id=1, institucion_nombre, autoridades NULL, texto NULL;
   ```
   Resultado esperado futuro: éxito y fallback de aplicación.

3. descripción opcional:
   ```sql
   INSERT fecha descripcion NULL;
   ```
   Debe funcionar.

4. asistencia:
   - primera asistencia activa: éxito;
   - segunda activa igual: unique conflict;
   - anular primera y crear nueva: éxito.

5. snapshot:
   - no duplicar `curso_fecha_id` en un mismo certificado;
   - orden estable.

6. migraciones:
   - tabla `cert_schema_migrations` presente;
   - versiones únicas.

**ALTO-A**

Antes de escribir `006`, el agente presenta diseño y espera aprobación de Marcos.

### P1-02 — Migración aditiva `006`

Crear:

```txt
database/migrations/006_reconciliar_esquema_m4_02.sql
```

La migración debe:

- ser idempotente solo donde MariaDB lo permita de forma segura;
- incluir preflight;
- no borrar datos;
- incluir rollback comentado;
- modificar enums/nullable/índices según spec;
- no sembrar placeholders institucionales.

Crear después:

```txt
database/migrations/007_schema_migrations.sql
```

o incorporar registry en `006`, según diseño aprobado.

**GREEN**

Ejecutar el test de contrato hasta pasar.

**Regresión**

```txt
001→002→003→004→005→006→007
```

en MariaDB 10.6 descartable.

### P1-03 — Test de upgrade

Aunque `003` no fue aplicada en bases persistentes, agregar dos fixtures de esquema:

- variante histórica anterior de `003`;
- variante actual.

El test debe demostrar que ambas llegan al mismo esquema final tras `006/007`.

No aplicar a cPanel.

## ALTO-B obligatorio

Después de tests locales:

```txt
No aplicar migraciones a phpMyAdmin ni cPanel todavía.
Esperar a P8.
```

## Criterios de aceptación de P1

```txt
[ ] Migraciones históricas no se editaron.
[ ] Test RED documentado.
[ ] Fresh install MariaDB 10.6 verde.
[ ] Upgrade desde variantes 003 verde.
[ ] Backend y enums DB coinciden.
[ ] OpenSpec actualizado.
[ ] P1 archivada.
```

## Commit sugerido

```txt
fix(database): reconciliar esquema de cursos y certificados
```

---

# P2 — Sincronización de documentación y OpenSpec

[x] **P2-01:** Sincronización de documentación y OpenSpec (Fuente de verdad).

## Objetivo

Eliminar contradicciones que hacen que una IA económica implemente reglas viejas.

## Rama

```txt
docs/sync-preproduction-source-of-truth
```

## Ciclos

### P2-01 — Specs backend/database

Corregir:

- referencias a reenvío/email;
- estados de curso;
- migración `003`;
- snapshot;
- QR permanente;
- DNI público;
- entrega manual;
- PDF secundario;
- `404` unificado;
- email opcional diferido.

Archivos probables:

```txt
openspec/specs/backend-modelo-datos-certificados/spec.md
openspec/specs/backend-contrato-api-certificados/spec.md
docs/backend/00-php84-api.md
docs/backend/01-contrato-api-certificados.md
docs/database/01-modelo-datos-certificados.md
database/docs/003-cursos-alumnos-asistencias.md
```

### P2-02 — Docs humanas y staging

Corregir:

- README que todavía habla de no implementar producto;
- comentario PHPMailer;
- checklist SMTP;
- claves faltantes;
- migraciones `001–007`;
- requisito GD;
- readiness real;
- `muestra_pagina` como referencia, no producto.

### Tests documentales RED/GREEN

Crear script:

```txt
scripts/docs-contract-check.sh
```

Debe fallar si encuentra en docs vigentes:

```txt
SMTP stub
PHPMailer activo
reenvío automático
firma digital verificada
M4-01B pendiente cuando ya está implementado
```

No buscar en archivos históricos archivados, salvo que estén marcados como fuente vigente.

Verificar enlaces internos.

## Criterios de aceptación

```txt
[ ] Una sola fuente de verdad por decisión.
[ ] Specs no exigen email.
[ ] Docs reflejan código actual.
[ ] Ciclo M4-02 correctamente archivado.
[ ] Índice actualizado.
```

## Commit sugerido

```txt
docs(project): sincronizar decisiones y contratos preproduccion
```

---

# P3 — Hardening backend y privacidad

## Objetivo

Cerrar riesgos baratos antes de integrar el frontend real.

## Rama

```txt
security/backend-preproduction-hardening
```

## Ciclos

### P3-01 — Límite de body y contrato HTTP

**RED**

Agregar tests:

1. JSON mayor a 64 KiB → `413 PAYLOAD_TOO_LARGE`.
2. `Content-Length` inválido → error seguro.
3. JSON malformado → `400`.
4. Content-Type incorrecto → `415`.
5. No debe abrir DB ni mutar datos en errores previos.

**GREEN**

Modificar `readJsonBody()` para:

- verificar `CONTENT_LENGTH`;
- leer con límite;
- responder `413`;
- mantener envelope seguro.

### P3-02 — Noindex, no-referrer y headers

**RED**

Tests que inspeccionen:

- `src/index.html`;
- plantillas `.htaccess`;
- respuestas públicas.

Requerir:

```txt
Referrer-Policy: no-referrer
X-Robots-Tag: noindex, nofollow, noarchive
Content-Security-Policy compatible
```

Meta tags:

```html
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="referrer" content="no-referrer">
```

**GREEN**

Aplicar sin romper Angular ni QR.

Mantener por ahora token en path. La alternativa fragment+POST queda en P9.

### P3-03 — Readiness y configuración

Crear un chequeo protegido o script CLI que verifique, sin revelar valores:

- PDO/MariaDB;
- migraciones;
- OpenSSL;
- GD;
- mbstring;
- Composer autoload;
- storage PDF;
- storage rate limiter;
- timezone;
- claves requeridas presentes y con longitud correcta.

No devolver rutas ni secretos.

### P3-04 — Fechas, emisión y vigencia

**Tests RED**

1. Fecha `cancelada` nunca certifica.
2. Fecha `programada` no certifica según regla recomendada.
3. `issuedAt` futuro → `400`.
4. Código usa año de `issuedAt`.
5. Certificado nuevo sin vencimiento → permanente.
6. Listado calcula estado efectivo si un legacy venció.
7. Un único token activo por certificado.

**ALTO-A**

Confirmar con Marcos la regla “solo realizada” antes de GREEN. Si la rechaza, actualizar D1 y specs.

## Criterios de aceptación

```txt
[ ] Body limitado.
[ ] Noindex/no-referrer.
[ ] Readiness seguro.
[ ] Emisión temporal coherente.
[ ] Token único activo.
[ ] Sin secretos ni PII en logs.
```

---

# P4 — Modificar asistencias manteniendo URL y QR

## Objetivo

Implementar D1-05 correctamente: una corrección de asistencia modifica lo que muestra el certificado, conserva la misma URL/QR y no entrega silenciosamente un PDF obsoleto.

## Rama

```txt
backend/certificate-content-revisions
```

## Diseño recomendado

Agregar a `cert_certificados` mediante nueva migración:

```txt
contenido_revision INT UNSIGNED NOT NULL DEFAULT 1
contenido_actualizado_en DATETIME NULL
pdf_estado ENUM('vigente','desactualizado','no_generado') NOT NULL
pdf_generado_revision INT UNSIGNED NULL
```

No modificar token ni `token_hash`.

Cuando se modifica una asistencia o fecha relevante:

1. abrir transacción;
2. modificar dato vivo;
3. localizar certificado vigente de alumno+curso;
4. reconstruir `cert_certificado_fechas`;
5. incrementar `contenido_revision`;
6. marcar `pdf_estado='desactualizado'`;
7. registrar auditoría segura;
8. commit.

La validación pública lee el snapshot actualizado.

El endpoint QR usa el token existente, por lo que no cambia.

El PDF, por ser secundario, debe:

- responder `409 PDF_OUTDATED` si su revisión no coincide;
- o mostrar claramente que debe regenerarse.

No regenerar automáticamente en este ciclo.

## Ciclos

### P4-01 — Spec y migración de revisión

**ARCHIVADO**

**RED**

Test DB que falle porque las columnas no existen.

**GREEN**

Crear migración y tests.

### P4-02 — Anular asistencia

**ARCHIVADO**

**RED detallado**

Escenario:

1. crear alumno, curso y tres fechas realizadas;
2. registrar tres asistencias;
3. emitir certificado;
4. guardar:
   - token hash/cifrado/prefijo;
   - URL;
   - QR PNG;
   - snapshot;
5. anular una asistencia;
6. esperar:
   - snapshot con dos fechas;
   - URL idéntica;
   - token idéntico;
   - QR generado con misma URL;
   - revisión incrementada;
   - PDF desactualizado;
   - auditoría sin DNI/token.

### P4-03 — Agregar/restaurar asistencia

**ARCHIVADO**

Repetir el patrón:

- agregar una presencia a certificado vigente;
- snapshot se actualiza;
- URL/QR no cambian.

### P4-04 — Editar/cancelar fecha

**ARCHIVADO**

Definir:

- cambiar descripción actualiza snapshot;
- cambiar fecha actualiza snapshot;
- cancelar una fecha elimina esa fecha del snapshot si el producto lo aprueba;
- cambiar orden reordena snapshot.

**ALTO-A**

Antes de implementar cancelación, el agente pide aprobación del comportamiento exacto.

### P4-05 — PDF desactualizado

**ARCHIVADO**

Tests:

1. PDF revisión actual → `200`.
2. modificar asistencia → `409 PDF_OUTDATED`.
3. QR y URL siguen `200`.
4. entrega manual devuelve URL/QR, pero marca:
   ```json
   "pdfAvailable": false,
   "pdfStatus": "outdated"
   ```

## ALTO-C obligatorio

Marcos prueba manualmente:

- link antes y después;
- mismo QR;
- cantidad/listado de fechas;
- error PDF entendible;
- no rotación.

## Criterios de aceptación

```txt
[ ] Correcciones actualizan snapshot.
[ ] Token no cambia.
[ ] URL no cambia.
[ ] QR no cambia semánticamente.
[ ] PDF viejo no se entrega como vigente.
[ ] Todas las fechas soportadas.
[ ] Auditoría segura.
```

---

# P5 — Autenticación simple e integración admin real

## Objetivo

Reemplazar la sesión mock y los servicios in-memory en staging/producción sin exponer `X-Admin-Key` en Angular.

## Solución recomendada

Sesión PHP simple:

```txt
POST /admin/auth/login
GET  /admin/auth/session
POST /admin/auth/logout
```

La contraseña/usuario inicial viven en config externa, no DB.

Cookie:

```txt
HttpOnly
Secure
SameSite=Strict
Path=/certificados/
```

Mantener `X-Admin-Key` solo para CLI y smokes durante transición.

Agregar CSRF para métodos mutantes si se usan cookies.

## Rama

```txt
integration/admin-session-http
```

## Ciclos

### P5-01 — Auth PHP TDD

**RED**

1. login correcto → 204/200 + cookie segura;
2. login incorrecto → 401 genérico;
3. endpoint admin sin sesión → 401;
4. cookie expirada → 401;
5. logout invalida sesión;
6. regeneración de session ID al login;
7. no credenciales en logs;
8. método mutante sin CSRF → 403;
9. método mutante con CSRF → permitido.

### P5-02 — Fronteras HTTP Angular

Crear implementaciones:

```txt
HttpCoursesService
HttpStudentsService
HttpAttendanceService
HttpCertificationsService
HttpInstitutionalConfigService
```

No cambiar UI todavía.

Tests de mapeo con `HttpTestingController`.

### P5-03 — Environments

- `development`: mocks.
- `staging`: API real.
- `production`: API real.
- build productivo falla si usa mock.

### P5-04 — Login Angular real

- no guardar password;
- no guardar admin key;
- sesión vía cookie;
- estado 401 redirige a login;
- logout real.

## ALTO-C

QA manual de login:

- refresh;
- pestaña nueva;
- logout;
- back button;
- expiración;
- cookies en DevTools;
- ausencia de clave en bundle.

## Criterios de aceptación

```txt
[ ] Sin X-Admin-Key en Angular.
[ ] Admin real en staging.
[ ] Mocks solo desarrollo.
[ ] CSRF cubierto.
[ ] Cookie segura.
```

**Estado actual:** P5 cerró `DONE`. P5-01 cerró `DONE WITH WARNINGS` con evidencia local/CI y staging aislado; P5-02 (fronteras HTTP Angular) y P5-03 (environments, 597/597 tests) cerraron; P5-04 (login Angular real, 605/605 tests) cerró con `PASS` 8/8 requirements y 0 blockers. La producción `/certificados/` no está validada.

---

# P6 — Correcciones frontend, integración y diseño

## Objetivo

Corregir bugs visibles y alinear la UI con contratos reales.

## Rama por ciclos

```txt
frontend/manual-delivery-fixes
frontend/public-validation-v0-parity
frontend/admin-contract-alignment
```

## Ciclos

### P6-01 — Entrega manual funcional

**RED**

1. URL copiada es exactamente la del endpoint entrega manual.
2. No contiene `…`.
3. No concatena dominio hardcodeado.
4. clipboard falla → no muestra éxito.
5. PDF desactualizado → botón deshabilitado/mensaje.
6. QR PNG se descarga del backend.
7. ruta entrega accesible desde detalle.
8. backdrop cierra.
9. focus trap funciona.
10. Escape devuelve foco.

**GREEN**

- eliminar `VALIDACION_HOST`;
- obtener entrega manual real;
- separar URL canónica/display;
- Blob download para QR;
- PDF según estado;
- manejo de errores.

### P6-02 — Eliminar estados no sustentados

Eliminar de la UI activa:

```txt
entregado
pendiente-entrega
requiere-nueva-entrega
```

hasta que exista persistencia real.

No mostrar “firma digital verificada”.

No mostrar “validez legal” sin copy aprobado.

### P6-03 — Contratos de cursos/alumnos/certificados

Alinear modelos frontend con DTO backend.

No inventar:

- cuatrimestre;
- email;
- cantidad de certificaciones;
- ingreso;
- estado de entrega.

Agregar campos solo cuando el backend los exponga.

### P6-04 — Validación pública refinada

Mantener tres estados técnicos:

```txt
valid
not-verifiable
technical-error
```

No diferenciar revocado.

Aplicar el diseño v0 refinado:

- folio;
- alumno;
- DNI completo;
- curso;
- todas las fechas;
- código;
- consulta;
- trazabilidad;
- responsive.

No mostrar un QR decorativo falso si no aporta. La validación pública no necesita volver a dibujar el QR para ser válida.

### P6-05 — CSS y accesibilidad

Corregir:

- variables CSS indefinidas;
- focus trap;
- `inert`;
- z-index;
- tablas mobile;
- 360/390/430 px;
- reduced motion;
- contraste;
- textos largos;
- lista de muchas fechas.

## QA manual obligatorio — ALTO-C

Checklist por pantalla:

```txt
[ ] 1440×900
[ ] 1024×768
[ ] 768×1024
[ ] 430×932
[ ] 390×844
[ ] 360×800
[ ] Zoom 200 %
[ ] Solo teclado
[ ] Focus visible
[ ] Screen reader básico
[ ] Sin overflow horizontal
[ ] Consola limpia
[ ] Red sin tokens en logs de frontend
[ ] Estados loading/error/vacío
[ ] Clipboard permitido y denegado
```

## Criterios de aceptación

```txt
[ ] Entrega manual real.
[ ] QR real descargable.
[ ] Sin mensajes falsos.
[ ] Sin estados inventados.
[ ] Validación pública con paridad visual.
[ ] Accesibilidad verificada.
```

---

# P7 — CI y gates automáticos

## Objetivo

Impedir que un modelo económico o un merge rápido reintroduzca errores conocidos.

## Rama

```txt
ci/preproduction-quality-gates
```

## Ciclos

### P7-01 — Frontend CI

**Estado (2026-07-16)**: DONE. Spec canónica `openspec/specs/frontend-ci-quality-gates/spec.md`. Verify archivado en `openspec/changes/archive/2026-07-16-p7-01-frontend-ci/verify-report.md` con **PASS** 6/6 requirements, 636/636 tests, 0 blockers.

GitHub Actions:

```txt
npm ci
npm run test:ci
npm run build -- --configuration production
npm run build -- --configuration production-staging
```

Agregar check que inspeccione bundle/config y falle si producción usa mocks.

Agregar ESLint en ciclo separado si el diff se agranda.

### P7-02 — Backend CI

**Estado (2026-07-16)**: DONE. Spec canónica `openspec/specs/backend-ci-quality-gates/spec.md`. Verify archivado en `openspec/changes/archive/2026-07-16-p7-02-backend-ci/verify-report.md` con **PASS** 5/5 requirements (REQ-BE-001 a REQ-BE-005), 8/8 scenarios, 0 blockers y 0 warnings.

```txt
composer validate --strict
composer audit
php -l
tests unitarios/procedurales
```

### P7-03 — MariaDB CI

**Estado (2026-07-16)**: DONE. Spec canónica `openspec/specs/mariadb-ci-quality-gates/spec.md`. Verify archivado en `openspec/changes/archive/2026-07-16-p7-03-mariadb-ci/verify-report.md` con **PASS** 5/5 requirements (REQ-MDB-001 a REQ-MDB-005), 8/8 scenarios, 0 blockers y 0 critical findings.

Servicio MariaDB 10.6:

- aplicar migraciones;
- schema contract;
- E2E emisión;
- modificación de asistencias;
- URL/QR permanente;
- PDF stale;
- revocación;
- upgrade tests.

El E2E no puede hacer `SKIP` en este job.

### P7-04 — Seguridad/docs

**Estado (2026-07-16)**: DONE. Spec canónica `openspec/specs/security-docs-ci-gates/spec.md`. Verify archivado en `openspec/changes/archive/2026-07-16-p7-04-seguridad-docs/verify-report.md` con **PASS** 7/7 requirements (REQ-SEC-001 a REQ-SEC-007), 2/2 scenarios, 0 blockers y 0 critical findings.

- gitleaks (`gitleaks/gitleaks-action@v2` + `.gitleaks.toml` con allowlist de 3 paths: `muestra_pagina/`, tests, migraciones SQL);
- `git diff --check origin/main...HEAD`;
- enlaces internos (`scripts/ci-link-check.sh`, 50/50 válidos en `docs/` y `openspec/specs/`);
- términos obsoletos en docs vigentes (`scripts/ci-obsolete-terms.sh`, FINDS=0);
- OpenSpec activo mal archivado (`scripts/ci-openspec-orphan-check.sh`, 0 huérfanos);
- 3 carpetas huérfanas movidas a `archive/` con prefijo de fecha;
- 2 términos residuales corregidos (`pendiente-entrega` → `no_emitido`; "último entregado" → "el emitido").

## Criterios de aceptación

```txt
[ ] PR no puede mergear si falla CI.
[ ] MariaDB test obligatorio.
[ ] Producción mock detectado.
[ ] Secrets scan activo.
```

---

# P8 — Staging integrado en cPanel

## Objetivo

Instalar `/certificados_staging/` sin tocar producción.

## Regla

Esta fase contiene múltiples `ALTO-D`. La IA prepara y guía; Marcos ejecuta en cPanel.

## Ciclos

### P8-01 — Investigación manual de capacidades ✅ DONE

**Ejecutado por Marcos en cPanel — 2026-07-16.**

**ALTO-D resuelto.** El staging está creado y funcional:

| Recurso | Valor real |
|---|---|
| PHP | 8.4.22 (ea-php84, CGI/FastCGI). Dominio principal sigue en 8.1. |
| Extensiones | pdo_mysql, openssl, mbstring, curl, gd, zip, xml — todas OK |
| Terminal / SSH | No disponible |
| Composer | No instalado → vendor se genera local y se sube como ZIP |
| mod_env / SetEnv | **NO funciona** (error 500) → reemplazado por `.user.ini` + `auto_prepend_file` |
| Subdominio staging | `certificados-qa.ifts14.com.ar` |
| Document root | `/public_html/certificados_qa/` |
| Backend path | `/public_html/certificados_qa/certificados_staging/api/` |
| Config externa | `/home/ifts14c8/ifts14_config/` (0700) |
| Config files | `bootstrap-staging.php` (0600), `certificados-staging.php` (0600) |
| Sesiones | files handler, `strict_mode=1`, `use_only_cookies=1`, `use_trans_sid=0` |
| MariaDB | 10.6.27 |
| DB staging | `ifts14c8_cert_stg` (usuario exclusivo `ifts14c8_cert_stg_usr`) |
| Migraciones | 001–010 aplicadas, 10 tablas `cert_*` vacías |

**Lecciones aprendidas (NO repetir):**

1. **SetEnv NO funciona.** `mod_env` no está habilitado. Cualquier `SetEnv` en `.htaccess` produce error 500. Usar `.user.ini` + `auto_prepend_file`.
2. **PHP-FPM NO está disponible.** El hosting usa CGI/FastCGI. No asumir que se puede activar FPM.
3. **No hay Terminal.** No ejecutar `php -v`, `composer` ni comandos en el servidor. Todo se prepara local y se sube.
4. **Dominio principal usa PHP 8.1.** No cambiar la versión global. El staging usa su propio subdominio con PHP 8.4.
5. **El subdominio de staging es temporal.** Se puede eliminar sin afectar producción.
6. **Nunca compartir en el chat:** contraseñas, hashes, tokens CSRF, DNI, rutas privadas completas, IPs ni credenciales de DB.

### P8-02 — DB staging

**ALTO-B**

1. Crear DB y usuario ficticios.
2. Asignar permisos.
3. Backup si existe algo.
4. Aplicar migraciones en orden.
5. Ejecutar `SHOW TABLES`.
6. Ejecutar consultas de schema version.
7. Insertar únicamente seed ficticio válido generado por aplicación.
8. No usar seed con cifrado placeholder.

La IA entrega cada SQL por bloque y espera confirmación antes de continuar.

### P8-03 — Paquete y Composer

1. Build Angular staging.
2. Preparar backend.
3. Composer:
   - si existe en hosting, `composer install --no-dev --no-interaction`;
   - si no, generar `vendor` local y subir como artefacto operativo.
4. Nunca versionar `vendor`.
5. Config externa separada.
6. `.htaccess` corregidos.

### P8-04 — Smoke remoto

Orden:

1. health;
2. readiness;
3. ruta SPA;
4. internos bloqueados;
5. login;
6. crear curso demo;
7. crear alumno demo;
8. fecha;
9. asistencia;
10. emisión;
11. validación;
12. QR;
13. modificar asistencia;
14. misma URL/QR;
15. revocación;
16. 404 unificado.

No pegar respuestas con DNI/token en Git.

### P8-05 — QA manual

- Matías: UI/responsive.
- Marcos: backend, logs, permisos, rollback.
- Ambos: flujo operativo.

## Criterios de aceptación

```txt
[ ] Staging separado.
[ ] Producción intacta.
[ ] Config fuera de Git/webroot.
[ ] DB ficticia.
[ ] Composer/GD confirmados.
[ ] Flujo end-to-end real.
[ ] Rollback probado.
```

---

# P9 — Backlog posterior a la presentación

Estas tareas no deben bloquear el milestone inicial.

## P9-01 — PDF robusto

- múltiples páginas;
- todas las fechas;
- snapshot institucional;
- DNI snapshot;
- regeneración;
- golden tests;
- layout real.

## P9-02 — Imágenes de firma

- assets fuera de DB o storage protegido;
- MIME/size validation;
- no afirmar firma criptográfica;
- permisos;
- snapshot de la imagen usada.

## P9-03 — Email opcional

Solo si aparece un uso real:

- nullable;
- admin-only;
- cifrado o protección equivalente;
- nunca envío automático;
- no logs.

## P9-04 — Estado manual de entrega

Solo si el instituto lo pide:

```txt
entregado_en nullable
entregado_por
canal
nota segura
```

No inferir entrega por copiar link o descargar QR.

## P9-05 — Keyring y rotación

- key IDs;
- backup;
- rotación;
- recuperación;
- separación de claves.

## P9-06 — Token fuera del path

Evaluar:

```txt
/validar#TOKEN + POST /consulta
```

para reducir exposición en logs y Referer.

## P9-07 — Usuarios y roles

- usuarios DB;
- password hashing;
- roles;
- sesiones;
- auditoría con actor.

## P9-08 — Observabilidad y mantenibilidad

- logs estructurados;
- métricas;
- request correlation;
- separación de servicios;
- Composer autoload/PSR-4;
- evaluar reemplazo de TCPDF.

---

# 8. Plantilla universal para iniciar un ciclo

Copiar y reemplazar los campos:

```txt
Ejecutá exclusivamente el ciclo <ID> del archivo
docs/planificacion/PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md.

Metodología obligatoria:
- Gentle AI / SDD.
- Strict TDD.
- RED antes de modificar producto.
- GREEN mínimo.
- REFACTOR acotado.
- VERIFY con evidencia real.
- sdd-archive al final.

Rama:
<rama>

Lectura permitida:
- AGENTS.md
- la sección <ID> del plan
- AGENTS.md del área
- spec afectada
- archivos listados por el ciclo

Prohibido:
- leer todo el repo;
- tocar material_privado_no_versionar;
- modificar migraciones históricas salvo que el ciclo lo autorice;
- commit/push/merge sin aprobación;
- afirmar tests no ejecutados;
- continuar después de un ALTO MANUAL.

Antes de aplicar:
1. mostrá explore/proposal;
2. listá tests RED;
3. ejecutá RED;
4. informá exit code y causa.

Al finalizar:
1. tests del ciclo;
2. regresión;
3. revisión fresca;
4. diff;
5. docs/spec;
6. tablero actualizado;
7. sdd-archive;
8. commit sugerido.
```

---

# 9. Formato obligatorio de reporte del agente

```txt
Ciclo:
Rama:
Estado inicial:
Archivos leídos:
Spec:
Tests RED:
- comando
- exit code
- fallo esperado

Implementación:
Archivos modificados:

Tests GREEN:
- comando
- exit code

Regresión:
- comando
- exit code

Seguridad:
- secretos
- PII
- tokens
- auth
- logs

QA manual:
- requerido / no requerido
- resultado

ALTO:
- ninguno / tipo y motivo

Documentación actualizada:
OpenSpec archive:
Estado final:
Siguiente ciclo habilitado:
Commit sugerido:
```

---

# 10. Definition of Done global

Los criterios se conservan como gate futuro. No se declaran satisfechos por el historial de este plan: el tablero 4.2 mantiene P1/P2/P7/P8 `PARTIAL`, P5/P6 `DONE`, P9 `PENDING` no bloqueante y producción `/certificados/` no validada.

El proyecto solo puede considerarse candidato a producción cuando:

```txt
[ ] P0–P8 archivadas.
[ ] DB final reproducible.
[ ] Ninguna migración histórica mutable.
[ ] Build productiva usa API real.
[ ] Admin no usa sesión mock.
[ ] X-Admin-Key no está en Angular.
[ ] URL y QR permanentes sobreviven cambios de asistencia.
[ ] PDF viejo no se entrega como vigente.
[ ] 404 público unificado.
[ ] Noindex/no-referrer configurados.
[ ] CI obligatorio.
[ ] Staging E2E aprobado.
[ ] Rollback probado.
[ ] No secretos/datos reales en Git.
[ ] Documentación y OpenSpec coinciden con runtime.
```

---

# 11. Próximo paso exacto

Ejecutar únicamente:

```txt
P8-04 — Smoke remoto (16 checks en staging)
```

Alcance: P8-01, P8-02 y P8-03 están DONE. El staging está funcional con login verificado. P8-04 ejecuta 16 verificaciones end-to-end en `https://certificados-qa.ifts14.com.ar/certificados_staging/`: health, readiness, SPA, bloqueos, login, flujo de negocio completo (curso → alumno → fecha → asistencia → emisión → validación → QR → modificación → revocación). **ALTO-C:** QA manual. Marcos ejecuta los checks en el navegador. La IA prepara la checklist. P8-05 (QA manual Matías) se ejecuta después.

---

# 12. Fuentes de metodología

Este plan sigue el uso actual de Gentle AI:

- `/sdd-init` detecta stack y capacidades de testing.
- Strict TDD hace que `apply` trabaje test-first cuando está habilitado.
- `verify` revisa evidencia RED/GREEN y ejecuta verificación.
- OpenCode puede asignar modelos por fase.
- Antigravity funciona en modo solo-agente con SDD inline.
- Cursor admite subagentes SDD.
- Las fases deben mantenerse acotadas y delegarse cuando crece el contexto.

Fuente oficial:

- Gentle AI README.
- Gentle AI `docs/intended-usage.md`.
- Repositorio `Gentleman-Programming/gentle-ai`.

---

# 13. Historial de cambios de este plan

| Versión | Fecha | Cambio | Responsable |
|---|---|---|---|
| 1.0 | 2026-07-14 | Plan inicial posterior a auditoría y decisiones D1 | Marcos / auditoría técnica |
| 1.1 | 2026-07-15 | Reconciliación de tablero contra PR #63/#65 y evidencia archivada; no reescribe auditorías ni valida producción | Marcos / SDD documental |
| 1.2 | 2026-07-15 | Cierre de P5-04: P5 → `DONE`; tablero, sección 11, aserción Python e historial actualizados; spec canónica `admin-angular-auth` creada | Marcos / SDD documental |
| 1.3 | 2026-07-15 | Cierre de P6-01: P6 → `DONE`; tablero, sección 4.10, sección 11, aserción Python e historial actualizados; spec canónica `admin-certificate-delivery-frontend` creada | Marcos / SDD documental |
| 1.4 | 2026-07-15 | Cierre de P6-02 (reenvío/regeneración): P6 sigue `DONE`; tablero, sección 4.3, sección 11, aserción Python e historial actualizados; spec canónica `pdf-regeneration` creada; doc frontend `00-angular20-port-v0.md` actualizada con el cierre P6-02 | Marcos / SDD documental |
| 1.5 | 2026-07-15 | Cierre de P6-04 (validación pública refinada): P6 sigue `DONE`; tablero, sección 4.3, sección 11, aserción Python e historial actualizados; spec canónica `frontend-public-validation` ampliada con los 4 nuevos requirements (folio+sidebar, membrete, cuerpo editorial, sin QR decorativo); doc frontend `00-angular20-port-v0.md` actualizada con el cierre P6-04 | Marcos / SDD documental |
| 1.6 | 2026-07-15 | Cierre de P6-05 (CSS y accesibilidad): P6 sigue `DONE` con 5/5 ciclos archivados; tablero, sección 4.3, sección 11, aserción Python e historial actualizados; doc frontend `00-angular20-port-v0.md` actualizada con el cierre P6-05; sección 11 apunta a P7-01 | Marcos / SDD documental |
| 1.7 | 2026-07-16 | Cierre de P7-01 (Frontend CI): P7 sigue `PARTIAL` (P7-02/P7-04 pendientes); tablero, sección 4.3, sección 7 (P7-01 marcado DONE), sección 11, aserción Python e historial actualizados; spec canónica `frontend-ci-quality-gates` creada (6 requirements); doc deploy `00-cpanel-certificados.md` actualizada con la sección "Quality gates de CI (frontend)"; sección 11 apunta a P7-02 (Backend CI) | Marcos / SDD documental |
| 1.8 | 2026-07-16 | Cierre de P7-02 (Backend CI): P7 sigue `PARTIAL` (P7-04 pendiente); tablero, sección 4.3, sección 7 (P7-02 marcado DONE), sección 11, aserción Python e historial actualizados; spec canónica `backend-ci-quality-gates` creada (5 requirements); doc deploy `00-cpanel-certificados.md` actualizada con la sección "Quality gates de CI (backend)"; sección 11 apunta a P7-03 (MariaDB CI) | Marcos / SDD documental |
| 1.9 | 2026-07-16 | Cierre de P7-03 (MariaDB CI): P7 sigue `PARTIAL` (P7-04 pendiente); tablero, sección 4.3, sección 7 (P7-03 marcado DONE), sección 11, aserción Python e historial actualizados; spec canónica `mariadb-ci-quality-gates` creada (5 requirements); doc deploy `00-cpanel-certificados.md` actualizada con la sección "Quality gates de CI (MariaDB)"; sección 11 apunta a P7-04 (Seguridad/docs) | Marcos / SDD documental |
| 2.0 | 2026-07-16 | Cierre de P7-04 (Seguridad/docs): P7 → `DONE` con 4/4 sub-ciclos archivados (P7-01, P7-02, P7-03, P7-04); tablero, sección 4.3, sección 7 (P7-04 marcado DONE), sección 11, aserción Python (`P7: 'DONE'`) e historial actualizados; spec canónica `security-docs-ci-gates` creada (7 requirements REQ-SEC-001 a REQ-SEC-007); doc deploy `00-cpanel-certificados.md` actualizada con la sección "Quality gates de CI (security/docs)"; `fase_actual` y `ultimo_ciclo_cerrado` actualizados a P8-01 y P7-04; gap "P7-04 (seguridad/docs) sigue pendiente" removido del tablero y de la sección 11; sección 11 ahora apunta a P8-01 (Staging integrado en cPanel) | Marcos / SDD documental |
