# Archive Report: qa-backend-hardening-certificados

## Resumen ejecutivo

Ciclo `qa-backend-hardening-certificados` archivado en modo híbrido. La verificación cerró en `PASS WITH WARNINGS` sin issues críticos. Se reconciliaron los checkboxes estancados de `tasks.md` (3.4 y 4.3) con evidencia runtime del `verify-report.md`, se sincronizaron los deltas de las 4 specs contra `openspec/specs/`, se actualizaron `docs/backend/00-php84-api.md` y `docs/backend/01-contrato-api-certificados.md` con el hardening aplicado y los gaps diferidos, y se movió la carpeta del cambio a `openspec/changes/archive/2026-06-27-qa-backend-hardening-certificados/`. SDD cycle completo.

## Cambio

| Campo | Valor |
|---|---|
| Change | `qa-backend-hardening-certificados` |
| Branch | `qa/backend-hardening-certificados` |
| Artifact store | hybrid (OpenSpec + Engram) |
| Strict TDD | Inactivo |
| Runtime verificado | PHP 8.4.22 sobre Docker `ifts14-php84` |
| Base de smoke | MariaDB 10.6 efímero, config ficticia |
| Veredicto | PASS WITH WARNINGS |
| Fecha de archivo | 2026-06-27 |

## Veredicto de verificación

`PASS WITH WARNINGS`. Sin issues críticos. Las advertencias restantes eran documentales y se cierran en este archive: specs estables actualizadas, docs backend actualizadas, y la regla contractual de revocar sin motivo enviando `{}` quedó registrada.

## Reconciliación de checkboxes estancados

El orquestador autorizó reconciliación mecánica de checkboxes estancados con prueba del `verify-report.md`. Se actualizó `openspec/changes/archive/2026-06-27-qa-backend-hardening-certificados/tasks.md`:

| ID | Estado previo | Estado final | Evidencia |
|---|---|---|---|
| 3.4 | `- [ ]` | `- [x]` | Smoke HTTP + MariaDB 10.6 efímero: `emit=201`, `revoke=200`, `tokens_revoked=1` con admin key 16+. |
| 4.3 | `- [ ]` | `- [x]` | Matriz de cumplimiento del `verify-report.md` cubre headers, `415`, `400`, regresión, fail-closed admin y rate-limit sin side effects. |
| 4.4 | `- [ ]` | `- [x]` | Cumplido por este archive (sincronización de specs y docs backend). |

Razón de la reconciliación: el `verify-report.md` documenta evidencia runtime suficiente para 3.4 y 4.3; los checkboxes quedaron sin actualizar por la fase `sdd-verify`. La corrección se hizo sin reescribir la evidencia ni agregar work posterior.

## Sincronización de specs

Deltas merged a `openspec/specs/`:

| Dominio | Acción | Detalle |
|---|---|---|
| `backend-contrato-api-certificados` | Appended | 4 requirements `ADDED`: headers de seguridad en JSON, validación `Content-Type` con `415`, JSON malformado con `400` antes de side effects, pendientes de hardening documentados. |
| `admin-certificate-emission` | Appended | 1 requirement `ADDED`: rechazo de JSON malformado en emisión con escenarios de body malformado y body parseable con payload inválido. |
| `admin-auth` | Replaced | 1 requirement `MODIFIED`: "Autorización administrativa por `X-Admin-Key`" — la clave configurada debe tener 16+ caracteres tras `trim`; clave corta, vacía, ausente, header faltante o valor no coincidente responden `401 UNAUTHORIZED`. |
| `backend-base-php-certificados` | Appended | 1 requirement `ADDED`: headers de seguridad centralizados en `Response` para éxitos y errores. |

Las requirements existentes no mencionadas en los deltas se preservaron sin tocar. Ningún delta removió requirements.

## Actualización de documentación

| Doc | Cambio |
|---|---|
| `docs/backend/00-php84-api.md` | Nueva sección "Hardening aplicado (ciclo `qa-backend-hardening-certificados`)" con tabla de comportamientos + subsección "Pendientes diferidos" (CORS, body size, rate limit distribuido, observabilidad, `ultimo_uso_en`). |
| `docs/backend/01-contrato-api-certificados.md` | Tabla de errores extendida con `415 UNSUPPORTED_MEDIA_TYPE`. Regla de `X-Admin-Key` actualizada (mínimo 16 caracteres). Sección "Revocación" indica que sin motivo se debe enviar `{}`. Nueva sección "Headers de seguridad y validación de request" con tabla de headers y reglas de `Content-Type`/JSON. Nueva sección "Hardening diferido" con los mismos gaps. |

## Auditoría del archivo

| Verificación | Estado |
|---|---|
| Specs estables sincronizadas | ✅ |
| Change folder movido a `archive/2026-06-27-qa-backend-hardening-certificados/` | ✅ |
| Archive contiene proposal, specs/, design, tasks, verify-report, exploration | ✅ |
| `tasks.md` archivado sin checkboxes `- [ ]` de implementación | ✅ |
| `openspec/changes/` activo no contiene `qa-backend-hardening-certificados` | ✅ |

## Contenido del archivo

- `proposal.md` ✅
- `exploration.md` ✅
- `specs/backend-contrato-api-certificados/spec.md` ✅
- `specs/admin-certificate-emission/spec.md` ✅
- `specs/admin-auth/spec.md` ✅
- `specs/backend-base-php-certificados/spec.md` ✅
- `design.md` ✅
- `tasks.md` ✅ (15/15 tareas marcadas)
- `verify-report.md` ✅
- `archive-report.md` ✅ (este archivo)

## Warnings heredados

- El script oficial `scripts/php-docker-lint.sh` quedó bloqueado por `sudo` sin TTY durante `sdd-verify`; se ejecutó el equivalente Docker directo y pasó. Sin impacto en archive.
- La revocación ahora exige body JSON válido; si no hay motivo, el cliente debe enviar `{}`. Quedó documentado en `01-contrato-api-certificados.md`.

## Privacidad

No se leyó material privado, `.env`, dumps, logs, ZIPs, credenciales, configuraciones reales ni bases reales. Los smokes usaron contenedores efímeros, configuración ficticia y datos ficticios; no se imprimieron DNI, tokens completos ni claves administrativas. El archive respeta la convención: las claves y tokens presentes en `verify-report.md` y `proposal.md` son solo descripciones operativas, no valores reales.

## SDD cycle status

**Complete.** El cambio fue planificado, propuesto, especfificado, diseñado, implementado, verificado y archivado. Listo para el próximo ciclo.
