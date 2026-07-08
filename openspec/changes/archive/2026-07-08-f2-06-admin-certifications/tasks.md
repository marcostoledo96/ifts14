# Tareas — F2-06 Certificaciones admin (mock)

## Pronóstico de carga de revisión

| Campo | Valor |
|-------|-------|
| Líneas estimadas (add+del) | 1100–1800 |
| Budget revisor (orquestador) | 5000 |
| Riesgo budget 400 líneas | Bajo |
| Chained PRs recomendado | No |
| Split sugerido | Single PR (single-pr-default) |
| Estrategia de entrega | single-pr-default |
| Estrategia de chain | N/A (single PR, no chain) |
| Excepción de tamaño | No requerida |

Decisión necesaria antes de apply: No
Chained PRs recomendado: No
Estrategia de chain: N/A
Riesgo budget 400 líneas: Bajo

Notas: 1100–1800 < 5000 → single PR, no se usa chain, no requiere `size:exception`. Forecasts previos (F2-04 ~3800, F2-05 ~2870) cierran OK dentro del budget actual. Split solo si el diff real supera 5000 o si una gate de riesgo de revisión detecta alto riesgo; no se gatilla a 2500. Si durante `sdd-apply` el diff efectivo cruza 5000, reabrir este forecast antes de mergear.

## Fase 1: Base — modelos, servicio in-memory y checks

- [x] 1.1 Crear `apps/frontend-angular/src/app/features/admin/certifications/certifications.models.ts` con `EstadoCertificado` (`borrador|vigente|revocado|vencido`), `Certificacion`, `CertificacionDetalle`, `CertificacionesFiltros`, `AuditEvent`. Sin campos DNI/token/email/matrícula/legajo.
- [x] 1.2 Crear `certifications.service.ts` con interfaz (`listar`, `obtener`, `contar`) y `CERTIFICATIONS_SOURCE = InjectionToken<CertificationsService>`.
- [x] 1.3 RED: `certifications.service.spec.ts` cubre `listar`/`obtener`/`contar`, id inválido, clone defensivo, filtros por estado.
- [x] 1.4 GREEN: `in-memory-certifications.service.ts` con seed 3-6 ficticios; `documentMasked` patrón `XX****XX`; `tokenPrefix` tipo `prefijo_demo_xxx`; `publicValidationUrl` truncado a 60 chars sin token completo. Hace pasar 1.3. Comentario `ponytail:` sobre seed estático + clone en ctor.
- [x] 1.5 Crear `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` (espejo de `courses/__checks__`): sin `X-Admin-Key`, HTTP/fetch/HttpClient, storage/cookies/IndexedDB, DNI/token/email, UUID plausible, URL pública con token completo en código o seed.

## Fase 2: Sidebar y dashboard activos

- [x] 2.1 `sidebar-admin.{ts,html,spec.ts}`: ítem "Certificaciones" con `route: '/admin/certificaciones'`; extender `isActive()` con prefijo `/admin/certificaciones` antes de la igualdad exacta; spec cubre link, active y no-fallback a placeholder.
- [x] 2.2 `admin-dashboard-page.{ts,html,spec.ts}`: reemplazar tarjeta "Próximamente: Certificaciones" por `<a routerLink="/admin/certificaciones">` con conteo ficticio desde `CERTIFICATIONS_SOURCE.contar()` (`inject` opcional); quitar copy "F2-06"/"handoff" del bloque Certificaciones.
- [x] 2.3 Asserts runtime (component + `app.routes.spec.ts`): dashboard navega a `/admin/certificaciones`; sidebar marca activo en `/admin/certificaciones*`; conteo ficticio visible; no llama `fetch`; tarjeta Certificaciones no contiene "Próximamente" ni "F2-06".

## Fase 3: Listado y previsualización (component + runtime)

- [x] 3.1 RED: `pages/list/certifications-list-page.spec.ts` con banner demo, `input[type="search"]`, `<select>` por estado, 3-6 `<article>`, empty state `<output aria-live="polite">`, enlaces a `/admin/certificaciones/:id`.
- [x] 3.2 GREEN: `pages/list/certifications-list-page.{ts,html,css}` con copy "Datos de demostración — No persiste al recargar"; filtro por estado; búsqueda libre sobre nombre/curso/alumno; `<section>` + `<article>`; sin token completo.
- [x] 3.3 RED: `pages/preview/certification-preview-page.spec.ts` con `<dl>` seguro (`documentMasked`, `tokenPrefix`, URL truncada, `attendedDates`, `auditEvents`); CTAs PDF/entrega/revocación/listado real `disabled` con copy "Disponible en F4-01/F4-02/F5-04/F6-01"; id inválido "Certificación no encontrada" sin excepción; enlace retorno a `/admin/certificaciones`.
- [x] 3.4 GREEN: `pages/preview/certification-preview-page.{ts,html,css}` con URL truncada a 60 chars en UI; CTAs `disabled` con `aria-disabled="true"`; sin token completo en DOM; banner "Disponible en F4/F5/F6"; sin emisión, sin PDF, sin revocación, sin listado real.

## Fase 4: Rutas y provider runtime

- [x] 4.1 `app.routes.ts`: registrar `CERTIFICATIONS_SOURCE` en `providers` de la ruta `admin`; agregar `certificaciones` (estática) y `certificaciones/:id` (con parámetro) en orden seguro, antes del catch-all admin y después de `dashboard`; no alterar `cursos/*` ni `asistencias*` ni rutas públicas.
- [x] 4.2 `app.routes.spec.ts`: casos para orden de children, sesión mock con/sin, runtime `CERTIFICATIONS_SOURCE` con `RouterTestingHarness` + `withComponentInputBinding()`, id inválido `/admin/certificaciones/abc` sin `NullInjectorError`, regresión sin provider (debe fallar).

## Fase 5: Verificación, archive y docs

- [x] 5.1 `npm run test:ci` en `apps/frontend-angular/` — esperado 100% verde; incluye nuevas specs y `__checks__` (sin `X-Admin-Key`, sin storage, sin HTTP, sin DNI/token/email).
- [x] 5.2 `npm run build` en `apps/frontend-angular/` — esperado sin warnings; reportar tamaños de chunks nuevos vs F2-05.
- [x] 5.3 `docs/frontend/00-angular20-port-v0.md`: agregar bloque "Estado F2-06 — Certificaciones admin (mock)" siguiendo patrón F2-04/F2-05 (archivos creados/modificados, límites, verificación, handoff a F4-01/F4-02/F5-01/F5-04/F6-01).
- [x] 5.4 `openspec/specs/admin-foundation/spec.md`: actualizar `Requirement: Rutas administrativas aisladas` para incluir `/admin/certificaciones*`; ajustar `Login y shell simulados` (Certificaciones como ruta navegable mock), `Shell accesible` y `Documentación y límites` con handoff a F4-F6.
- [x] 5.5 `sdd-archive` sobre `f2-06-admin-certifications`: sincronizar deltas a `openspec/specs/` (nuevo `admin-certifications-frontend`, update `admin-foundation`); emitir `verify-report` con resultados reales de `test:ci` y `build`, escenarios cubiertos, escenarios `partial` y `needs-verify`, y riesgos abiertos. Cierre ejecutado por `sdd-archive`: spec canónica `admin-certifications-frontend/spec.md` creada (4 requirements, 8 escenarios), `admin-foundation/spec.md` ya sincronizada durante apply, `docs/frontend/00-angular20-port-v0.md` reconciliado (394/394 SUCCESS, initial 313.84 kB / transfer 90.36 kB), change folder movido a `openspec/changes/archive/2026-07-08-f2-06-admin-certifications/`, `archive-report.md` emitido en OpenSpec y Engram (`sdd/f2-06-admin-certifications/archive-report`). Veredicto verify: PASS, 0 CRITICAL.
