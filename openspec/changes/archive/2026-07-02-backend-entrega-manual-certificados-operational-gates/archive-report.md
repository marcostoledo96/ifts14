# Archive Report — backend-entrega-manual-certificados-operational-gates

**Change**: `backend-entrega-manual-certificados-operational-gates`
**Branch**: `backend/entrega-manual-operational-gates`
**Artifact store**: hybrid (OpenSpec + Engram)
**Fecha de archive**: 2026-07-02
**Veredicto del verify**: PASS WITH WARNINGS
**Tipo de archive**: intencional-con-advertencias (no destructivo)

## Resumen ejecutivo

Cierre operacional parcial del ciclo `backend-entrega-manual-certificados` antes de M4-02. Tres deltas `ADDED` sincronizados a specs canónicas; ningún contrato nuevo, ninguna migración SQL activa, ningún endpoint nuevo. Checks estáticos seguros pasaron en Docker (`composer validate --strict`, `composer install --dry-run`, `php -l`, runtime tests procedurales). Cinco operator gates quedan explícitos y no simulados: migración `002` real, confirmación de `token_encryption_key`, smoke DB-backed `200` recuperable, smoke DB-backed `409` legacy y, de manera auxiliar, regeneración operativa de `vendor/` sin versionarlo.

## Specs sincronizados

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-certificate-delivery` | Updated | 1 ADDED (`Validación operativa DB-backed de entrega manual`, 4 escenarios: Smoke recuperable 200, Smoke legacy 409, Gate sin DB/config, Sin reintroducción de email). Purpose cleanup editorial aplicado en apply. Estilo preservado: `### Requirement:` / `#### Scenario:`. |
| `backend-modelo-datos-certificados` | Updated | 1 ADDED (`Migración \`002\` verificada para token recuperable`, 3 escenarios: Migración aplicada y verificada, Migración pendiente por falta de acceso, Rollback seguro de datos). Estilo preservado: `### Requirement:` / `#### Scenario:`. |
| `deploy-cpanel-certificados` | Updated | 1 ADDED (`Gate operativo previo a deploy de entrega manual`, 4 escenarios: Evidencia DB real o gate documentado, Sin acceso aprobado, Composer y vendor operativos, Clave externa obligatoria). Estilo preservado: `### Requisito:` / `#### Escenario:`. |

0 MODIFIED, 0 REMOVED, 0 RENAMED. Solo append al final de cada canónica; no se alteraron requirements existentes.

## Contenido del archivo

| Artefacto | Estado | Notas |
|---|---|---|
| `proposal.md` | ✅ preservado | Intención, alcance, criterios de éxito, riesgos, rollback. |
| `exploration.md` | ✅ preservado | Estado actual, áreas afectadas, recomendación. |
| `design.md` | ✅ preservado | Decisiones, flujo de gates, archivos esperados, estrategia de verificación. |
| `tasks.md` | ✅ preservado | 22/22 agent-owned tasks `[x]`; 5 operator gates `[ ]` con autorización explícita. |
| `apply-progress.md` | ✅ preservado | Comandos ejecutados, evidencia, archivos cambiados, desviaciones, handoff. |
| `verify-report.md` | ✅ preservado | `PASS WITH WARNINGS`, 0 CRITICAL, 6/11 compliant + 5/11 partial (operator-gated). |
| `specs/admin-certificate-delivery/spec.md` | ✅ preservado | Delta ADDED puro, sync aplicado. |
| `specs/backend-modelo-datos-certificados/spec.md` | ✅ preservado | Delta ADDED puro, sync aplicado. |
| `specs/deploy-cpanel-certificados/spec.md` | ✅ preservado | Delta ADDED puro, sync aplicado. |

## Task Completion Gate

`tasks.md` revisado antes de archivar. Estado final:

- 22/22 agent-owned tasks completas (`[x]`).
- 5 tasks `[ ]` intencionales: `3.2`, `3.3`, `3.5`, `4.2`, `4.3`. Todas marcadas con prefijo `[operator]` y replicadas en `apply-progress.md` (`Tareas pendientes de operador`) y `verify-report.md` (`Pending operator gates`). El verify documenta cada una como `⚠️ PARTIAL — operator-gated`.
- 0 tasks `[ ]` por error, drift o cierre incompleto del agente.
- `apply-progress` y `verify-report` prueban que cada task abierta requiere credenciales reales (`CERTIFICADOS_CONFIG_PATH`, `CERTIFICADOS_SMOKE_BASE_URL`, DB staging/prod con backup aprobado) que este ciclo no podía leer ni simular.

Autorización explícita del orquestador: *"Archive after PASS WITH WARNINGS: carry warnings, real DB migration/token key/HTTP smokes remain operator gates before deploy; no fake evidence."* Cierre aceptado.

## Source of truth actualizado

Las siguientes specs ahora reflejan el nuevo comportamiento (capacidades operativas, no funcionales):

- `openspec/specs/admin-certificate-delivery/spec.md` — validación DB-backed + gate exacto si falta acceso
- `openspec/specs/backend-modelo-datos-certificados/spec.md` — migración `002` como gate, rollback no destructivo
- `openspec/specs/deploy-cpanel-certificados/spec.md` — gates previos a deploy (Composer/vendor, `002`, smoke, `token_encryption_key`)

`openspec/specs/{admin-certificate-emission,admin-certificate-revocation,admin-auth,api-rate-limiting,auditoria-material-original,backend-base-php-certificados,backend-contrato-api-certificados,backend-validacion-publica-certificados,certificate-pdf-qr-generation,frontend-angular-shell,frontend-api-readiness,frontend-public-validation,guia-marcos-ciclos-sdd,guia-matias-angular-windows,opencode-eficiencia-token,repo-limpio,repo-precommit,repo-seguro,actualizar-plan-matias-v0}/spec.md` — sin tocar.

## Resumen de advertencias del verify

`PASS WITH WARNINGS` con 3 advertencias explícitas, 0 CRITICAL:

1. **DB real/staging pendiente** — `002` no aplicada, `SHOW COLUMNS` no ejecutado, `token_encryption_key` no confirmada. Bloquea evidencia de deploy-readiness, no la corrección de documentar el gate.
2. **HTTP smoke DB-backed pendiente** — `200` recuperable y `409 TOKEN_NOT_RECOVERABLE` no corridos; comandos y redacciones documentados, no simulados.
3. **Drift editorial histórico** — búsquedas amplias en `docs/`/`apps/` siguen encontrando menciones históricas a SMTP/PHPMailer/reenvío. El backend activo, manifests Composer y specs canónicas describen el MVP como email-free.

Advertencias auxiliares (no bloqueantes): warnings no fatales de Composer por mount Docker (`safe.directory`, root-version default) y exclusiones esperadas por la naturaleza gated de los smokes.

## Riesgos abiertos (carry-over)

- **Migración `002` no aplicada**: `cert_tokens_verificacion.token_cifrado` puede no existir en DB destino. Operador con backup aprobado y acceso debe aplicar `database/migrations/002_token_cifrado_entrega_manual.sql` antes de cualquier deploy de `/entrega-manual`. Rollback: no dropear la columna sin backup; preferir revertir docs/OpenSpec y dejar columna sin uso.
- **`token_encryption_key` externa**: presencia y decode a 32 bytes obligatorios; ausencia vuelve los certificados existentes no recuperables. No registrar el valor real bajo ningún canal.
- **HTTP smoke 200/409**: pendiente con `X-Admin-Key` real fuera de Git; evidencia redactada, comandos en `docs/backend/00-php84-api.md`.
- **Vendor regenerable**: `vendor/` no versionado; PHPMailer removido de manifests pero la regeneración operativa puede traerlo si alguien corre `composer install` sin lock verificado. `composer.lock` está alineado (content-hash actualizado) y `apps/backend-php/README.md` documenta el flujo.
- **Drift histórico en material archivado**: aceptable; el material archivado es evidencia y no se sanitiza retroactivamente.

## Files no tocados / seguridad

- `material_privado_no_versionar/`, `.env`, secretos, dumps, logs — sin cambios.
- `public_html`, cPanel real, DB real, SMTP real — sin cambios.
- `apps/backend-php/vendor/` — ignorado, no versionable, no leído.
- `apps/backend-php/composer.lock` — modificado en apply (content-hash), versionable, dentro de `.gitignore` para el lock como excepción documentada.
- Cambios archivados previos en `openspec/changes/archive/` — sin tocar.
- No se ejecutó `git add`, `git commit`, `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` ni `git branch`.

## Spec compliance (resumen)

| Requirement (canónica, ya mergeada) | Compliance |
|---|---|
| Validación operativa DB-backed de entrega manual | ⚠️ PARTIAL — operator gates pendientes |
| Migración `002` verificada para token recuperable | ⚠️ PARTIAL — operator gates pendientes |
| Gate operativo previo a deploy de entrega manual | ⚠️ PARTIAL — operator gates pendientes |

3/3 requirements nuevos tienen el bloque documental cerrado; los 3 quedan como PARTIAL hasta que el operador corra los 5 gates con credenciales reales. No hay requirement en FAIL.

## Estado del ciclo SDD

- Phase 1 (propose) → ✅ cerrada
- Phase 2 (explore) → ✅ cerrada
- Phase 3 (spec) → ✅ cerrada (3 dominios, solo ADDED)
- Phase 4 (design) → ✅ cerrada
- Phase 5 (tasks) → ✅ cerrada (22 tasks agent-owned)
- Phase 6 (apply) → ✅ cerrada (estática + lock + docs)
- Phase 7 (verify) → ✅ cerrada (PASS WITH WARNINGS, 0 CRITICAL)
- Phase 8 (archive) → ✅ cerrada (este reporte)

**SDD cycle complete** para `backend-entrega-manual-certificados-operational-gates`. Listo para el próximo cambio (`database-cursos-alumnos-asistencias` u otro roadmap M4).

## Next steps post-archive

1. Operador corre los 5 gates pendientes con credenciales aprobadas y registra evidencia redactada en `docs/database/01-modelo-datos-certificados.md`, `docs/backend/00-php84-api.md` y `docs/deploy/00-cpanel-certificados.md`.
2. Operador regenera `vendor/` en hosting con `composer install --no-dev --no-interaction`; valida que TCPDF es la única dependencia activa.
3. Próximo ciclo SDD recomendado: `database-cursos-alumnos-asistencias` (M4-02), o cualquiera de los roadmap M4 una vez cerrado el gate de `002`.

## Traceability — Engram observation IDs

| Artefacto | Observation ID | Sync ID |
|---|---|---|
| `proposal` | #4786 | `obs-6129e2dd259b5eb3` |
| `spec` | #4787 | `obs-4fe88b77e2d484f1` |
| `design` | #4789 | `obs-1f684c2447a58935` |
| `tasks` | #4791 | `obs-1fe4484c95cbb46a` |
| `apply-progress` | #4792 | `obs-7b94458b983b352d` |
| `verify-report` | #4794 | `obs-93ebcc8f37c6fabc` |
| `archive-report` | #4795 | `obs-b181871c828343a8` |
