# Archive Report — admin-certificate-delivery

**Change**: `admin-certificate-delivery`
**Branch**: `backend/admin-certificate-delivery`
**Artifact store**: hybrid (OpenSpec + Engram)
**Fecha de archive**: 2026-06-30
**Veredicto del verify**: PASS WITH WARNINGS
**Tipo de archive**: intencional-con-advertencias (no destructivo)

## Resumen ejecutivo

El ciclo `admin-certificate-delivery` quedó archivado tras cumplir 22/22 tasks, verify `PASS WITH WARNINGS` (sin CRITICAL) y apply-progress con corrección post-verify documentada. La entrega administrativa de certificados por email quedó habilitada con transporte configurable `stub|smtp`, PHPMailer vía Composer, `composer.lock` versionable, `vendor/` ignorado, rotación de token en cada reenvío y trazabilidad segura en `cert_eventos_auditoria`.

Tres dominios de spec actualizados: `admin-certificate-delivery` (nueva), `backend-contrato-api-certificados` (MODIFIED + REMOVED), `backend-modelo-datos-certificados` (ADDED + MODIFIED). El endpoint `POST /certificados/api/admin/certificados/{id}/reenviar` queda documentado y operativo; la exclusión previa del reenvío (`Reenvío administrativo excluido`) se removió formalmente con razón y migración.

## Specs sincronizados

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-certificate-delivery` | Creado | Spec nueva. 6 requisitos, 13 escenarios. Define reenvío, privacidad del token, adaptador configurable, contenido limitado a enlace, bloqueo sin SMTP, rollback. |
| `backend-contrato-api-certificados` | Updated | 1 MODIFIED (`Contrato administrativo mínimo de certificados` + 2 escenarios nuevos "Reenvío documentado" y "Reenvío sin transporte configurado") + 1 REMOVED (`Reenvío administrativo excluido`, Reason + Migration documentados en el delta). Purpose actualizado: ya no declara el reenvío fuera de alcance. |
| `backend-modelo-datos-certificados` | Updated | 1 ADDED (`Persistencia de entrega con reutilización de tablas cert_`, 3 escenarios) + 1 MODIFIED (`Auditoría sin datos sensibles` con detalle de reenvío y `destinatario_enmascarado`, 1 escenario nuevo "Reenvío auditable"). |

## Contenido del archivo

| Artefacto | Estado | Notas |
|---|---|---|
| `proposal.md` | ✅ preservado | Intención, alcance, capacidades, áreas afectadas, riesgos, rollback. |
| `exploration.md` | ✅ preservado | Estado actual, áreas afectadas, enfoques evaluados, recomendación. |
| `design.md` | ✅ preservado | Decisiones, flujo de datos, cambios de archivos, contratos, estrategia de pruebas. |
| `tasks.md` | ✅ preservado | 22/22 tasks completas; pronóstico size-exception aceptado por el mantenedor. |
| `apply-progress.md` | ✅ preservado | Implementación completa + corrección post-verify FAIL. |
| `verify-report.md` | ✅ preservado | Veredicto PASS WITH WARNINGS; 20/20 spec compliance; CRITICAL previo resuelto. |
| `specs/admin-certificate-delivery/spec.md` | ✅ preservado | Delta efectivo (es spec nueva, sin delta formal). |
| `specs/backend-contrato-api-certificados/spec.md` | ✅ preservado | Delta con 1 MODIFIED + 1 REMOVED. |
| `specs/backend-modelo-datos-certificados/spec.md` | ✅ preservado | Delta con 1 ADDED + 1 MODIFIED. |

**No hay tareas pendientes** en el artefacto persistido. Las 22 tasks mantienen `[x]` en `tasks.md`; el Engram `sdd/admin-certificate-delivery/tasks` (#4539) conserva un snapshot anterior con checkboxes vacíos por la naturaleza upsert de Engram, pero el archivo en disco es la fuente de verdad y muestra el cierre completo.

## Source of truth actualizado

Las siguientes specs ahora reflejan el nuevo comportamiento:

- `openspec/specs/admin-certificate-delivery/spec.md` — capacidad nueva operativa
- `openspec/specs/backend-contrato-api-certificados/spec.md` — contrato admin ampliado con reenvío
- `openspec/specs/backend-modelo-datos-certificados/spec.md` — modelo de datos formalizado para entrega

## Resumen de advertencias del verify

El verify reportó PASS WITH WARNINGS con tres advertencias explícitas, ninguna bloqueante:

1. **Evidencia positiva acotada a fake PDO/fake transport** — el flujo exitoso de reenvío se cubre con `ResendFlowTest.php` (fake PDO en memoria + `CapturingTransport`) en lugar de MariaDB/SMTP reales. Suficiente para el gate SDD de este slice; el envío SMTP real queda como `MAY` y requiere credenciales externas no versionadas. Smoke opcional con MariaDB demo + endpoint real queda sugerido para un ciclo posterior.

2. **Wrappers Docker con `sudo`** — los scripts documentados (`scripts/php-docker-*.sh`) usan `sudo docker` y requieren TTY interactivo. Se ejecutaron equivalentes directos sin `sudo`; ambos pasaron. Sugerencia: documentar/crear variantes sin `sudo` si OpenCode debe ejecutarlos.

3. **Sin coverage formal** — no hay runner de coverage PHP configurado. La verificación se hizo por matriz escenario → test runtime (6 tests procedurales OK). Defense-in-depth: como revalidación menor, podría castear `smtp_port` numérico-string dentro de `Config::requireDeliveryConfig()`; el flujo actual ya falla cerrado en `SmtpEmailDeliveryTransport::assertConfigured()`.

## Riesgos abiertos

- **SMTP real no probado**: la entrega real a mailbox real queda como `MAY` y depende de configuración externa no versionada. Si la primera ejecución real en cPanel revela issues de SPF/DKIM/seguridad SMTP, la rotación y la máscara de email siguen siendo los controles vigentes.
- **`composer.lock` versionable**: el ciclo cierra la advertencia de reproducibilidad Composer; cualquier dependencia nueva en otro ciclo debe mantener `vendor/` ignorado.
- **Smoke end-to-end pendiente**: el flujo 200 con SMTP real + MariaDB con certificado vigente queda diferido a un ciclo posterior o a `sdd-verify` con un entorno demo.

## Traceability — Engram observation IDs

| Artefacto | Observation ID | Sync ID |
|---|---|---|
| `proposal` | #4518 | `obs-05343a81ad56c6c2` |
| `spec` | #4520 | `obs-4462097126a17af3` |
| `design` | #4521 | `obs-4368c63ae11fe016` |
| `tasks` | #4539 | `obs-7f83096f900554e3` |
| `verify-report` | #4548 | `obs-2cfe355fa1fc3473` |
| `archive-report` | #4557 | `obs-db9dcc8f38b23cb5` |
| bugfix post-verify | #4542 | `obs-3ae94c840a9788a9` |

## Spec compliance (resumen)

| Requirement | Compliance |
|---|---|
| Reenvío administrativo por email | ✅ COMPLIANT |
| Privacidad del token en el canal de entrega | ✅ COMPLIANT |
| Adaptador de transporte configurable | ✅ COMPLIANT |
| Contenido del email limitado a enlace | ✅ COMPLIANT |
| Bloqueo de envío real sin configuración confirmada | ✅ COMPLIANT |
| Rollback documentado | ✅ COMPLIANT |
| Persistencia de entrega con reutilización de tablas `cert_` | ✅ COMPLIANT |
| Auditoría sin datos sensibles (reenvío) | ✅ COMPLIANT |
| Contrato admin (reenvío documentado / 503) | ✅ COMPLIANT |

20 compliant / 0 partial / 0 failing.

## Files no tocados / seguridad

- `material_privado_no_versionar/` — sin cambios
- `.env`, secretos, dumps, logs — sin cambios
- `public_html`, cPanel real — sin cambios
- `apps/backend-php/vendor/` — ignorado, no versionable
- `apps/backend-php/composer.lock` — exceptuado por `.gitignore`, versionable
- Cambios archivados previos en `openspec/changes/archive/` — sin tocar

## Estado del ciclo SDD

- Phase 1 (propose) → ✅ cerrada
- Phase 2 (spec) → ✅ cerrada (3 dominios)
- Phase 3 (design) → ✅ cerrada (re-gate PASSED)
- Phase 4 (tasks) → ✅ cerrada (22 tasks)
- Phase 5 (apply) → ✅ cerrada (implementación + corrección post-verify)
- Phase 6 (verify) → ✅ cerrada (PASS WITH WARNINGS)
- Phase 7 (archive) → ✅ cerrada (este reporte)

**SDD cycle complete** para `admin-certificate-delivery`. Listo para el próximo cambio.
