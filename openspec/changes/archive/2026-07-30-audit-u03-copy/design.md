# Design: U3 — glosario UI + unificación de copy visible

## Technical Approach

Cerrar PLAN §U3 con Approach 1 (proposal): glosario canónico breve + pass quirúrgico de **strings visibles** en certificaciones admin. Sin helper compartido, sin cambios de lógica/API/DTO (`estado === 'vigente'` permanece), sin rediseño UX, sin folio público, sin hub asistencias (DEFER), sin tocar archive U2. Specs lean en paralelo: ADDED `frontend-angular-shell`, MODIFIED `admin-certifications-frontend`. Checkboxes PLAN §U3 se marcan en **apply**.

## Architecture Decisions

| Decisión | Opción | Tradeoff | Decisión |
|----------|--------|----------|----------|
| Estrategia | Glosario + strings vs helper `etiquetaEstado*` vs solo doc | Helper toca más archivos; solo doc no cierra U3 | **Glosario + pass quirúrgico** |
| Label DNI expediente | Documento vs DNI | Delivery/revoke ya usan DNI; new usa Documento | **Documento** (sacar «mascarado»); valor sigue `documentMasked` completo (D0) |
| Badge revocado | Revocado vs Revocada | Asimetría Válida/Revocado = PLAN | **Revocado** (igual listado/guía) |
| Copy estado cert | válidas/Válida vs vigentes | API sigue `vigente` | Solo **copy visible** → válidas/Válida |
| Hub Activo/Inactivo | Incluir vs DEFER | Drift cursos 4-chips es doc; riesgo scope | **DEFER** |
| Pública VÁLIDO | Paridad literal vs nota glosario | Folio ceremonial distinto | **Nota breve** en glosario; no tocar HTML público |
| Enlace glosario | Solo archivo vs índice | Descubribilidad | Link liviano en `docs/00-indice-general.md` (+ mención corta en `00-angular20-port-v0.md` si cabe) |
| «vigente» no-estado | Sustituir todo vs filtrar | «config vigente» ≠ estado cert | **No tocar** usos operativos no-estado (p. ej. config institucional vigente) |

## Data Flow

```
PLAN §U3 / glosario.md  ──(canon)──►  strings UI admin certs
         │                                    │
         │                                    ▼
         └──► specs shell+certs      tests que afirman copy viejo
API/DTO `vigente`/`revocado`  ──────────►  sin cambio
```

No hay flujo runtime nuevo: solo documentación + literales en plantillas/TS de presentación.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `docs/frontend/04-glosario-ui.md` | Create | Términos PLAN: Válida/Revocado, Activo/Inactivo, Programada/Realizada, expediente, entrega manual; tono AR; nota VÁLIDO público ≠ Válida admin |
| `docs/00-indice-general.md` | Modify | Añadir glosario a fila Frontend |
| `docs/frontend/00-angular20-port-v0.md` | Modify | Enlace corto al glosario (1 línea) |
| `.../preview/certification-preview-page.ts` | Modify | `estadoToLabel`: Revocado; mensaje «válidas» |
| `.../preview/certification-preview-page.html` | Modify | dt **Documento**; copy «válidas» |
| `.../delivery/certification-delivery-page.ts` | Modify | mensaje «válidas» |
| `.../revoke/certification-revoke-page.html` | Modify | copy «válidas» |
| `.../new/certification-new-page.html` | Modify | aviso «válida» |
| `.../new/certification-new-page.ts` | Modify | errorEmit visible «válida» (no lógica 409) |
| `.../in-memory-certifications.service.ts` | Modify | mensaje Error mock alineado al copy visible |
| `.../revoke/*.spec.ts`, `.../new/*.spec.ts` | Modify | Aserciones de copy viejo |
| `openspec/changes/audit-u03-copy/specs/frontend-angular-shell/spec.md` | Create* | ADDED lean (sdd-spec) |
| `openspec/changes/audit-u03-copy/specs/admin-certifications-frontend/spec.md` | Create* | MODIFIED lean (sdd-spec) |
| `docs/qa/PLAN-...§U3` checkboxes | Modify | Solo en **apply** |

\*Escritos por sdd-spec; apply mergea a `openspec/specs/` al archive.

**No tocar**: `openspec/changes/archive/2026-07-30-audit-u02-perf-fe/`; hub attendances/courses; pública; soft-errors U5; CSS/layout; commits.

## Interfaces / Contracts

Sin interfaces nuevas. Contratos existentes:

- Modelo: `EstadoCertificado = 'vigente' | 'revocado'` (sin cambio).
- UI canónica (glosario): `vigente`→**Válida**, `revocado`→**Revocado**.
- Campo UI DNI: propiedad `documentMasked` (nombre interno); label visible **Documento**.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Badge expediente Revocado; mensajes «válidas»/«válida»; sin «Documento (mascarado)» | Actualizar specs preview/revoke/new; añadir assert puntual si falta |
| Unit | Listado ya afirma Válida/Revocado | Regresión: no romper `certifications-list-page.spec.ts` |
| Typecheck | Compilación FE | `npx tsc --noEmit -p tsconfig.app.json` en apply/verify |
| Manual | Expediente revocado + label Documento + avisos new/revoke | Smoke visual bedelía (opcional verify) |

## Threat Matrix

N/A — sin routing, shell, subprocess, VCS/PR automation, clasificación de ejecutables ni process-integration.

## Migration / Rollout

Sin migración DB/API. Rollout = merge del PR FE+docs. Rollback = revert del commit. Checkboxes PLAN §U3 al cerrar apply. Sin commit en fases SDD previas a apply.

## Open Questions

Ninguna bloqueante — locks del orchestrator resuelven Documento, hub DEFER, nota pública y pass de «vigentes» de estado.
