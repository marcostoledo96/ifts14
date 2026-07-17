# Proposal: Nueva certificación Angular (emisión directa)

## Intent

Habilitar emisión administrativa desde Angular: Bedelía elige alumno y curso, revisa una preview sustentada y llama a `POST /admin/certificados`, sin inventar campos.

**No wizard de 3 pasos:** explore + v0 describen una pantalla única; el backend emite atómicamente (certificado + token + snapshot + PDF) sin borrador ni aprobación. Un wizard inventaría flujo no soportado por el contrato.

## Scope

### In Scope
- Página standalone/`OnPush`/signals en `/admin/certificaciones/nueva` (estática **antes** de `:id`).
- `CertificationsService.emitir()` + DTOs; HTTP e in-memory; body `{ alumnoId, cursoId, issuedAt, expiresAt }` vía `{ data, meta }`.
- Orquestar cursos/alumnos/asistencias/config para preview y avisos bloqueantes.
- Chrome visual tipo v0 (sin React literal); handoff `201` → `/admin/certificaciones/:id`.
- CTA desde listado; tests de servicio, página, ruta, doble submit y `400`/`409`/`500`.

### Out of Scope
- Wizard, borrador, aprobación; fechas en body; DNI completo, email, logos/firmas archivo, ciclo, horas, folio.
- Endpoint “preparar emisión”; cambios API/DB; email; fix amplio de `publicValidationUrl` histórico.

## Capabilities

### New Capabilities
- `admin-certificate-emission-frontend`: UI de emisión directa + preview sustentada.

### Modified Capabilities
- `admin-certifications-frontend`: ruta `nueva`, CTA, seam `emitir`.
- `frontend-http-services`: `HttpCertificationsService.emitir`; ajustes mínimos alumnos/asistencias.
- `admin-foundation`: ruta alcanzable bajo shell/guard.

## Approach

**Pantalla orquestadora** (Approach 1 explore): activos → presentes solo `realizada` (anti-stale) → avisos + `409` autoridad → `issuedAt` hoy BA, `expiresAt: null` → preview con `dniMostrar`/fechas/firmantes tipográficos → navegar al detalle. Identifiers EN; copy UI ES-AR.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `certifications/pages/new/` | New | Página + specs |
| `certifications.*` + HTTP/in-memory | Modified | `emitir` + DTOs |
| `app.routes.ts` (+ spec) | Modified | Ruta estática |
| Listado / detalle alumno | Modified | CTA |
| Adapters alumnos/asistencias | Modified | Elegibilidad |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Paridad v0 vs API incompleta | High | Scope explícito; verify TSX+prompt |
| `nueva` capturada por `:id` | Medium | Orden + test rutas |
| Carreras al cambiar selección | Medium | Generación/abort |
| `400` genérico / doble submit | Medium | Copy seguro; disable + manejar `409` |

## Rollback Plan

Revertir página, ruta, CTA, `emitir` y adapters. Sin migraciones ni backend.

## Dependencies

- `POST /admin/certificados` (`admin-certificate-emission`).
- Listados existentes + config institucional.
- Visual: TSX + prompt §10; capturas `cert-*.png` ausentes.

## Success Criteria

- [ ] Ruta `nueva` carga y no cae en `:id`.
- [ ] Preview/avisos solo con datos sustentados.
- [ ] `emitir` usa body real y `res.data`.
- [ ] Tras `201`, navega al detalle.
- [ ] `test:ci`, `tsc` y `build` OK.
