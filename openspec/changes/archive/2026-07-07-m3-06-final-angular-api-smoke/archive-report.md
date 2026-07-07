# Archive Report — m3-06-final-angular-api-smoke

**Change**: `m3-06-final-angular-api-smoke`
**Archived**: 2026-07-07
**Verdict**: PASS WITH WARNINGS (preservadas por decisión del orquestador)
**Mode**: Artifact store híbrido (OpenSpec + Engram)

## Resumen

Cierre documental del checkpoint M3-06 final: convergencia Angular↔API PHP post-merge (PR #30 + PR #31) sin cambios de runtime de producto. El ciclo deja checklist compartido Angular/API registrado en `docs/frontend/00-angular20-port-v0.md` y `docs/backend/01-contrato-api-certificados.md`, evidencia reproducible (Angular test/build, backend Docker 6/6 unit + 4/4 E2E) y bloqueo local de `scripts/m3-06-smoke.sh` documentado. No se detectaron brechas contractuales durante apply.

## Validación

| Métrica | Valor |
|---|---|
| Tasks en `tasks.md` | 17/17 completas |
| Apply progress declarado | 13/13 (discrepancia documentada) |
| Frontend tests | 74/74 SUCCESS (Karma + Chrome Headless 149) |
| Frontend build | OK (`npm run build`, base href `/certificados/`, 253.46 kB initial / 72.04 kB transfer) |
| Backend unit (Docker) | 6/6 OK |
| Backend E2E (Docker + MariaDB 10.6) | 4/4 OK |
| Smoke local Angular↔PHP | ⚠️ BLOCKED exit 2 (falta `php` CLI en PATH) |
| Coverage | No disponible (no se configuró comando en el ciclo) |
| CRITICAL issues | Ninguno |

> Discrepancia `apply-progress` (13/13) vs `tasks.md` (17/17): el reporte de apply consolidó las tareas por fase; las 17 checkboxes del artefacto `tasks.md` quedaron marcadas y son la fuente de verdad para completitud.

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `backend-contrato-api-certificados` | ADDED | `Checklist compartido post-merge Angular/API` (2 escenarios: privacidad preservada, invariantes D0 preservados) |
| `frontend-api-readiness` | ADDED | `Checkpoint final de consumo Angular/API` (2 escenarios: evidencia reproducible sin datos reales, bloqueo local documentado) |
| `frontend-public-validation` | ADDED | `Confirmación pública D0 sin cambio visual` (2 escenarios: certificado D0 verificable, no verificable por 404) |

No hubo MODIFIED, REMOVED ni RENAMED en este ciclo. La merge preservó íntegramente los requisitos previos de los tres dominios.

## Archivos de producto

No se modificaron archivos de runtime. Sólo docs + artefactos OpenSpec:

- `docs/backend/01-contrato-api-certificados.md` (anexo checklist D0)
- `docs/frontend/00-angular20-port-v0.md` (anexo checkpoint M3-06 final)
- `openspec/changes/m3-06-final-angular-api-smoke/{exploration,proposal,design,tasks,verify-report}.md`
- `openspec/changes/m3-06-final-angular-api-smoke/specs/**/spec.md`
- `openspec/specs/{backend-contrato-api-certificados,frontend-api-readiness,frontend-public-validation}/spec.md` (merge)

Sin cambios en `apps/frontend-angular/`, `apps/backend-php/`, `database/`, `public_html`, `material_privado_no_versionar/`, `vendor/` ni `.github/workflows/`.

## Lineage Engram

| Artefacto | Observation ID | topic_key |
|---|---|---|
| explore | 5067 | `sdd/m3-06-final-angular-api-smoke/explore` |
| proposal | 5068 | `sdd/m3-06-final-angular-api-smoke/proposal` |
| spec | 5069 | `sdd/m3-06-final-angular-api-smoke/spec` |
| design | 5070 | `sdd/m3-06-final-angular-api-smoke/design` |
| tasks | 5072 | `sdd/m3-06-final-angular-api-smoke/tasks` |
| apply-progress | 5074 | `sdd/m3-06-final-angular-api-smoke/apply-progress` |
| verify-report | 5078 | `sdd/m3-06-final-angular-api-smoke/verify-report` |
| archive-report | (este save) | `sdd/m3-06-final-angular-api-smoke/archive-report` |

Observaciones de soporte registradas durante el ciclo: `Passed m3-06 final design gate` (#5071, discovery) y `SDD tasks chain-strategy guard consistency` (#5073, pattern).

## Advertencias preservadas (no bloquean el archive)

1. **Smoke local bloqueado por falta de PHP CLI**: `bash scripts/m3-06-smoke.sh` → exit 2. Se documenta la fuente alternativa Docker/MariaDB + Angular test/build como evidencia reproducible. Riesgo operativo: mientras no se instale PHP CLI o un runner equivalente, el smoke end-to-end Angular↔PHP queda fuera de la corrida local. Sugerido para ciclo futuro (no para este cambio).
2. **`.codegraph/daemon.sock` en build context**: `docker build` incluye el socket y Docker avisa "sockets not supported"; el build no falla. Sugerido: revisar `.dockerignore` en otro ciclo si molesta o ralentiza el build.
3. **Discrepancia `apply-progress` 13/13 vs `tasks.md` 17/17**: el reporte de apply consolidó por fase y el artefacto de tareas quedó con 17 checkboxes marcadas. La fuente de verdad para completitud es `tasks.md` (17/17). Sin acción adicional en este ciclo.
4. **`HttpContractTest.php` notices no fatales**: `file_get_contents()` sin `Content-type` emite notices PHP; la suite 6/6 sigue verde. Sin acción adicional en este ciclo.

## Cumplimiento de invariantes D0

- Token/QR permanente: confirmado; el reenvío normal NO rota.
- DNI completo sólo en DTO/UI pública: confirmado; admin usa `documentMasked` y `tokenPrefix`.
- `X-Admin-Key` temporal: confirmado; sin login real ni admin Angular en scope.
- Sin email, SMTP, PHPMailer ni vendor versionado: confirmado.
- Sin deploy, cPanel, staging ni lectura de material privado: confirmado.

## Política Git

No se ejecutaron operaciones Git. Sin `git add/commit/push`, sin PR, sin merge, sin rebase, sin switch/checkout. El cierre queda propuesto para revisión de Marcos; las acciones de Git requieren aprobación explícita en el mismo turno con el comando exacto, según `AGENTS.md` del proyecto.

## Próximo ciclo sugerido

- `M4-07` (staging cPanel real) y admin Angular `F4-F6`, fuera de alcance de este ciclo.
- En un ciclo independiente, considerar: instalación local de PHP CLI, ajuste de `.dockerignore` para excluir `.codegraph/`, y reconciliación de la métrica de `apply-progress` con el conteo final de `tasks.md`.
