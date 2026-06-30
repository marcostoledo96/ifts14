# Tasks: M3-06 checkpoint integración Angular/API

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 130–180 |
| 800-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending (single PR, no chain) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Smoke local Angular↔PHP con proxy | PR 1 | env + http source + proxy + tests + docs |

## Phase 1: Conmutación local mock/API real

- [x] 1.1 En `apps/frontend-angular/src/environments/environment.ts`, reemplazar `useMockApi` por `useRealApi: false` y agregar `apiBaseUrl: '/certificados/api'`. Spec: "Modo API real habilitado en local" y "Modo mock preservado por defecto".
- [x] 1.2 En `apps/frontend-angular/src/environments/environment.development.ts`, mantener `useRealApi: false` (mock por defecto) y documentar en comentario el toggle manual a `true` para smoke.
- [x] 1.3 En `apps/frontend-angular/src/app/app.config.ts`, invertir la selección a `environment.useRealApi ? HttpValidationSource : MockValidationSource`. Spec: "Conmutación sin cambio de pantalla".

## Phase 2: HttpValidationSource usa apiBaseUrl

- [x] 2.1 En `apps/frontend-angular/src/app/shared/certificates/http-validation.source.ts`, importar `environment` y construir URL `${environment.apiBaseUrl}/certificados/${encodeURIComponent(token)}/verificacion`. Conservar `encodeURIComponent` y mapeo de errores. Spec: "Frontera única para mock y real".

## Phase 3: Proxy local Angular

- [x] 3.1 Crear `apps/frontend-angular/proxy.conf.json` con `"/certificados/api": { "target": "http://127.0.0.1:8080", "secure": false, "logLevel": "warn", "changeOrigin": false }`. Spec: "Preflight no requerido".
- [x] 3.2 En `apps/frontend-angular/angular.json`, agregar `"proxyConfig": "proxy.conf.json"` al `architect.serve.options`. Spec: "Smoke local con base URL separada".

## Phase 4: Tests unit + integración

- [x] 4.1 En `apps/frontend-angular/src/app/shared/certificates/http-validation.source.spec.ts`, agregar caso "URL usa `environment.apiBaseUrl`" (stub `apiBaseUrl: '/api-prueba'` y esperar esa base). Spec: "Frontera única para mock y real".
- [x] 4.2 Crear `apps/frontend-angular/src/app/app.config.spec.ts` que confirme `useRealApi: true` selecciona `HttpValidationSource` y `useRealApi: false` selecciona `MockValidationSource`. Spec: "Cambio a API PHP real en local".
- [x] 4.3 Verificar que los escenarios 404/revocado/expirado/500/red siguen pasando sin cambios. Spec: "HTTP 404 no verificable" + "Falla técnica".

## Phase 5: Smoke manual documentado

- [x] 5.1 Crear `scripts/m3-06-smoke.sh`: arranca `php -S 127.0.0.1:8080 -t apps/backend-php apps/backend-php/index.php` con `CERTIFICADOS_CONFIG_PATH=/tmp/cfg.php` ficticio; `curl` a `/certificados/api/health` y `/certificados/api/certificados/{token}/verificacion` con token ficticio BIEN formado (32–128 chars, sin datos reales); sale 0 si health=200 con JSON esperado y verificación=200 DTO público o 404 `CERTIFICATE_NOT_FOUND`; 400, 404 genérico y 500 = FAIL conforme a spec. Spec: "Smoke de health exitoso" + "Smoke de verificación con token ficticio" + "HTTP 404 no verificable".
- [x] 5.2 En `apps/frontend-angular/src/environments/environment.development.ts`, dejar comentario con flujo de smoke: toggle `useRealApi: true`, `ng serve`, abrir `http://localhost:4200/certificados/validar/demo-valido`, capturar evidencia sin datos reales.

## Phase 6: Documentación

- [x] 6.1 Actualizar `docs/frontend/00-angular20-port-v0.md` con nota "Checkpoint M3-06" (apiBaseUrl, baseHref/apiBaseUrl separados, evidencia de smoke con placeholders). Spec: "Smoke local con base URL separada" + "Separación `base href` vs `apiBaseUrl`".
- [x] 6.2 Actualizar `docs/backend/01-contrato-api-certificados.md`: registrar CORS/preflight como excepción local resuelta y mantener gaps diferidos (body size, rate limit distribuido, observabilidad, `ultimo_uso_en`). Spec: "Gaps explícitos restantes" + "CORS abierto prohibido en producción".
- [x] 6.3 Actualizar `docs/deploy/00-cpanel-certificados.md`: documentar separación `base href /certificados/` vs `apiBaseUrl` para `ng serve` y cPanel; `.htaccess` no captura `/api/`. Spec: "cPanel con `/certificados/` y `/api/` separados" + "Rutas profundas y API".

## Phase 7: Verificación final

- [x] 7.1 `cd apps/frontend-angular && npm test -- --watch=false` (35/35 esperado + nuevos).
- [x] 7.2 `cd apps/frontend-angular && npm run build` (presupuestos OK).
- [x] 7.3 `bash scripts/m3-06-smoke.sh` si PHP disponible; marcar bloqueado si no.
- [x] 7.4 `bash scripts/php-docker-lint.sh` (sin errores; si bloqueado, registrar).

## Out of scope (recordatorio)

- No tocar `material_privado_no_versionar/`, cPanel real, ni `public_html`.
- No agregar CORS abierto en producción.
- No avanzar a UI final, admin, PDF, QR, migraciones nuevas ni envío/reenvío.
