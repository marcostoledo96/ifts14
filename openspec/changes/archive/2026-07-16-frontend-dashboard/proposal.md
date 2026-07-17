# Proposal: Dashboard admin — mesa de trabajo

## Intent

Reemplazar el placeholder de 4 cards en `/admin/dashboard` por la **mesa de trabajo de Bedelía** alineada a v0: acciones principales, bandeja de pendientes, actividad reciente y resumen operativo. Priorizar acciones sobre métricas. Datos solo donde existan seams/APIs; placeholders honestos donde no.

## Scope

### In Scope
- Reescritura de `AdminDashboardPage` (standalone, OnPush, signals).
- Acciones (5 tiles): Nueva certificación, Nuevo curso, Alumnos, Configuración, Carga masiva (disabled + tooltip).
- Resumen operativo: cursos / alumnos / emitidas / revocadas derivados de `COURSES_SOURCE`, `STUDENTS_SOURCE`, `CERTIFICATIONS_SOURCE`; fallo → "—" + indicador.
- Bandeja y actividad: UI estructural con placeholders honestos (sin números inventados que parezcan reales; sin PII).
- Eliminar las 4 cards placeholder.
- Specs TDD y ajuste mínimo de título de ruta.
- Actualizar contrato `admin-foundation` (dejar de exigir 4 cards ficticias).

### Out of Scope
- Endpoints nuevos (`/actividad`, `/pendientes`, `/metricas`).
- Shell topbar v0 (buscador, campana, avatar, “Sincronizado”).
- Carga masiva real; email alumno; estado “entregado”; feed de auditoría global.
- N+1 de fechas por curso; wording “Reenviar” (D0: entrega manual fuera de estas 5 acciones).
- Backend, migraciones, auth.

## Capabilities

### New Capabilities
- `admin-dashboard-workbench`: mesa de trabajo Angular con paridad visual v0 y honestidad de datos.

### Modified Capabilities
- `admin-foundation`: dashboard deja de ser 4 cards con conteos ficticios.

## Approach

**Mesa de trabajo honesta** (explore Approach 2): layout v0; `routerLink` a rutas existentes; resumen vía `listar`/`contar` en paralelo (un `listar` de certificados para emitidas/revocadas); bandeja/actividad con copy explícito de “sin fuente de datos”; Carga masiva `disabled` + `title`/`aria-disabled`. Identifiers EN; copy UI ES-AR.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `admin-dashboard-page.*` | Rewrite | Página + CSS + specs |
| `features/admin/dashboard/` (opcional) | New | Subcomponentes presentacionales si reduce tamaño |
| `app.routes.ts` | Modified | Título dashboard |
| `openspec/specs/admin-foundation` | Modified | Contrato dashboard |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs viejos de 4 cards | High | Reescribir specs en el mismo apply |
| Números fake en bandeja | Medium | Solo "—" / copy honesto |
| N+1 fechas | Medium | No derivar “cursos sin fechas” en este ciclo |
| Presupuesto ~400 líneas | Medium | Single-cycle apply aceptado por orquestador |

## Rollback Plan

Revertir archivos del dashboard y el delta de `admin-foundation`. Sin DB/API.

## Dependencies

- Rutas: `/admin/certificaciones/nueva`, `/admin/cursos/nuevo`, `/admin/alumnos`, `/admin/configuracion`.
- Seams: `COURSES_SOURCE`, `STUDENTS_SOURCE`, `CERTIFICATIONS_SOURCE`.
- Visual: `muestra_pagina` dashboard + capturas `admin-*.png` (jerarquía; wording de acciones según este proposal).

## Success Criteria

- [ ] Layout mesa de trabajo (sin 4 cards).
- [ ] 4 acciones navegan; Carga masiva disabled con tooltip.
- [ ] Resumen hidrata desde seams; fallo muestra "—".
- [ ] Bandeja/actividad sin PII ni conteos inventados.
- [ ] Specs focalizados en verde.
