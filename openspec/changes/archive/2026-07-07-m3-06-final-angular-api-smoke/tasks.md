# Tasks: M3-06 final — smoke Angular/API

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas (original de planificación) | 80–110 |
| Líneas tracked del PR actual (medición real del ciclo acumulado M3-06) | ~304 insertions / 21 deletions (diff producto/docs/spec) |
| Artefactos OpenSpec archivados (untracked) | ~1,245 líneas adicionales (evidencia de archivo, no en diff tracked) |
| Riesgo 400 líneas | Bajo: dentro del presupuesto SOLO si el diff tracked producto/docs/spec se cuenta separado de la evidencia de archivo OpenSpec |
| Chained PRs recomendados | No |
| Estrategia de entrega | single-pr (presupuesto 1000 líneas) |
| Chain strategy | N/A (single PR, no chain) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A (single PR, no chain)
400-line budget risk: Low

Nota: la estimación original de 80–110 líneas NO fue precisa; el diff tracked
real del PR actual del ciclo acumulado M3-06 es ~304 insertions / 21 deletions
(producto/docs/spec), más ~1,245 líneas de artefactos OpenSpec archivados que
quedan como untracked y forman evidencia de archivo, no código de producto. El
conjunto cabe en el presupuesto de 1000 líneas únicamente si se cuenta el diff
tracked producto/docs/spec por separado de la evidencia de archivo OpenSpec.
La explicación del PR debe usar el valor tracked real (~304/21), no el
estimado.

### Suggested Work Units

| Unidad | Objetivo | PR probable | Notas |
|--------|----------|-------------|-------|
| 1 | Checkpoint documental M3-06 | PR 1 | Documentos + verificación reproducible, sin código de producto salvo brecha condicional |

## Phase 1: Documentación compartida Angular/API

- [x] 1.1 Agregar anexo "Checkpoint M3-06 final" en `docs/frontend/00-angular20-port-v0.md` con checklist Angular/API.
- [x] 1.2 Listar comandos Angular: `cd apps/frontend-angular && npm test --watch=false` y `npm run build` con base href `/certificados/`.
- [x] 1.3 Documentar estado smoke/manual con `scripts/m3-06-smoke.sh` y bloqueo local por falta de PHP CLI / sudo Docker / MariaDB.
- [x] 1.4 Agregar checklist D0 en `docs/backend/01-contrato-api-certificados.md`: DTO público, DTO admin, errores, privacidad.
- [x] 1.5 Documentar invariantes D0: token/QR permanente, sin rotación normal, sin email/SMTP/PHPMailer, `X-Admin-Key` temporal.
- [x] 1.6 Vincular evidencia CI backend: `.github/workflows/backend-tests.yml` (Docker + MariaDB 10.6) sin modificar el workflow.

## Phase 2: Verificación reproducible

- [x] 2.1 Referenciar resultado de `.github/workflows/backend-tests.yml`: Docker PHP + MariaDB 10.6, unit y E2E. (Reproducido localmente con red Docker aislada: 6/6 unit + 4/4 E2E OK.)
- [x] 2.2 Ejecutar `cd apps/frontend-angular && npm test --watch=false` y registrar resultado. (74/74 SUCCESS.)
- [x] 2.3 Ejecutar `cd apps/frontend-angular && npm run build` y confirmar artefacto Angular con base href `/certificados/`. (253.46 kB initial / 72.04 kB transfer; lazy 5.18 kB.)
- [x] 2.4 Registrar estado de `scripts/m3-06-smoke.sh` con token ficticio (sin datos reales) y bloqueo local documentado. (BLOCKED exit 2: `php` CLI no instalado.)
- [x] 2.5 Dejar evidencia consolidada en `openspec/changes/m3-06-final-angular-api-smoke/verify-report.md` para `sdd-verify`.

## Phase 3: Brecha de contrato (condicional)

- [x] 3.1 SI surge contradicción concreta entre specs y código, documentar la brecha y DETENER el track documental hasta resolver. (Sin brecha detectada: verificación local 74/74 + 10/10 OK; inspección `dto.ts`, `result-mapper.ts`, `http-validation.source.ts`, `CertificateValidator.php`, `Response.php`, `index.php`, `CertificatePdfService.php` confirma alineación D0.)
- [x] 3.2 Implementar arreglo mínimo SOLO en archivo afectado: `dto.ts`, `result-mapper.ts`, `http-validation.source.ts`, `CertificateValidator.php`, `Response.php` o `index.php`. (N/A: sin brecha.)
- [x] 3.3 Actualizar ÚNICAMENTE el test existente asociado; no crear tests, endpoints, migraciones ni dependencias nuevas. (N/A: sin brecha.)

## Phase 4: Cierre del ciclo

- [x] 4.1 Confirmar que no se modificó runtime de producto salvo la brecha condicional resuelta. (Sin cambios de runtime; sólo docs + tasks + verify-report.)
- [x] 4.2 Verificar que no se rotó token/QR, no se activó email/SMTP/PHPMailer, no se deployó ni se tocó `public_html`. (Confirmado.)
- [x] 4.3 Preparar resumen para `sdd-verify` y luego `sdd-archive` (sin commit/push/PR/merge/rebase sin aprobación explícita de Marcos).
