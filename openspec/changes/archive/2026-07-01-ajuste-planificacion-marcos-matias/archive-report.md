# Archive Report — ajuste-planificacion-marcos-matias

**Change**: `ajuste-planificacion-marcos-matias`
**Project**: `ifts14`
**Branch**: `docs/ajuste-planificacion-marcos-matias`
**Archived on**: 2026-07-01
**Verdict**: PASS WITH WARNINGS (archive-time intentional sync; see Warnings)
**Archive path**: `openspec/changes/archive/2026-07-01-ajuste-planificacion-marcos-matias/`

## Resultado

Ciclo SDD cerrado. Deltas OpenSpec sincronizados contra `openspec/specs/`, change folder movido al archivo y reporte emitido. El código de producto (`apps/`, `database/migrations/`, `database/seeds/`, `deploy/`, `public_html/`, `vendor/`, `material_privado_no_versionar/`, `.codegraph/`) no se tocó en esta fase de archive.

## Specs sincronizados

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-certificate-delivery` | MODIFIED | Reenvío conserva token (no rota en flujo normal); adaptador de transporte con gate Composer/SMTP. |
| `backend-contrato-api-certificados` | MODIFIED | DTO público con DNI completo + `attendedDates`; admin con QR/token permanente. |
| `backend-modelo-datos-certificados` | MODIFIED | Token permanente (no rotación normal); exposición pública con DNI completo + `attendedDates`; tablas futuras `cert_*`. |
| `deploy-cpanel-certificados` | ADDED + MODIFIED | Requisito nuevo: gates documentados de Composer, SMTP y staging. Prefijos productivos reescritos con gates D0. |
| `frontend-api-readiness` | MODIFIED | DTO frontend con DNI completo + `attendedDates`; servicio reemplazable preserva contrato. |
| `frontend-public-validation` | MODIFIED | Pantalla pública con DNI completo y fechas asistidas. |
| `guia-marcos-ciclos-sdd` | MODIFIED | Bloque M4 (D0); rol y división operativa Marcos/Matías explícitos. |
| `guia-matias-angular-windows` | MODIFIED | Misión con decisiones D0; `muestra_pagina/` v0 con DNI completo, fechas, QR y prohibición de credenciales demo. |

Todos los requirements no afectados por la delta se preservaron exactamente como estaban.

## Artefactos archivados

- `proposal.md` (3.3 KB)
- `exploration.md` (10.1 KB)
- `design.md` (4.6 KB)
- `tasks.md` (5.0 KB) — 35/35 tareas marcadas, incluyendo la reconciliación mecánica de 8.7 documentada.
- `apply-progress.md` (9.3 KB)
- `verify-report.md` (10.8 KB) — verdict PASS WITH WARNINGS.
- `specs/{8 dominios}/spec.md` — deltas originales conservados.

## Reconciliación de task 8.7

`8.7 verify-report.md` figuraba como `[ ]` en `tasks.md` porque verify no edita archivos ajenos al reporte. El artefacto `verify-report.md` existe y registra PASS WITH WARNINGS. Por autorización explícita del orquestador, con evidencia cruzada en `apply-progress.md` (Phase 8 y Phase 9 completas) y `verify-report.md` (verdict + warnings), se marcó `[x]` en la copia archivada como reconciliación mecánica de checkbox stale. Motivo registrado en `tasks.md:67`.

## Source of truth actualizado

Los siguientes specs ahora reflejan el nuevo contrato D0:

- `openspec/specs/admin-certificate-delivery/spec.md`
- `openspec/specs/backend-contrato-api-certificados/spec.md`
- `openspec/specs/backend-modelo-datos-certificados/spec.md`
- `openspec/specs/deploy-cpanel-certificados/spec.md`
- `openspec/specs/frontend-api-readiness/spec.md`
- `openspec/specs/frontend-public-validation/spec.md`
- `openspec/specs/guia-marcos-ciclos-sdd/spec.md`
- `openspec/specs/guia-matias-angular-windows/spec.md`

## Warnings preservados del verify-report

1. **OpenSpec CLI no disponible en este entorno** — `openspec validate ... --strict` no se pudo correr. La verificación manual de deltas y los scans ejecutables (rtk grep, python path classifier) actuaron como sustitutos. La validación final sigue pendiente de una corrida con CLI cuando esté disponible.

2. **Spec compliance con la nota del verify** — los 8 dominios están sincronizados según lo que el verify marcó como COMPLIANT para docs/specs. La implementación de runtime queda fuera de este ciclo y se ejecutará en ciclos M4-01+ con código PHP/Angular.

3. **`muestra_pagina/` como referencia visual** — la unidad U1 (v0 reference) sigue marcada como referencia no portable. La metadata de `muestra_pagina/` (README, AGENTS, MANIFIESTO_V0) prohíbe compilar, ejecutar, portar credenciales demo e instalar dependencias.

## Comportamiento del ejecutor

- `git status` mostrará los 8 specs canónicos modificados y la carpeta `openspec/changes/ajuste-planificacion-marcos-matias/` ausente (reemplazada por `openspec/changes/archive/2026-07-01-ajuste-planificacion-marcos-matias/`).
- No se ejecutó `git add`, `git commit` ni `git push`. El diff queda en working tree para revisión y decisión humana.
- `.codegraph/` no se tocó y sigue en `.gitignore` raíz (verificado por el apply-phase, gate 6.1/6.2).
- `material_privado_no_versionar/`, dumps, logs, `.env*` y `vendor/` no se inspeccionaron ni versionaron.

## Próximo paso SDD

Ciclo cerrado. El equipo puede abrir un nuevo change con `sdd-new` o `sdd-ff` cuando haya una unidad de trabajo (ciclo M4-01+ sugerido: implementación de QR permanente + DNI completo público en backend PHP).

## Riesgos abiertos transferidos

- `openspec validate` no se ejecutó (CLI ausente). Una corrida con CLI puede encontrar issues que los scans manuales no detectaron.
- La implementación de runtime (código PHP/Angular/DB) sigue pendiente y debe respetar las decisiones D0 documentadas.
- El PR sigue siendo de gran tamaño (alto riesgo de presupuesto de revisión 400/800 líneas); la estrategia `size:exception` ya está aprobada pero conviene revisar el diff por unidad U1/U2 antes de stage.
