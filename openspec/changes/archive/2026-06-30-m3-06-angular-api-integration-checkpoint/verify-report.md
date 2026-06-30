## Verification Report

**Change**: `m3-06-angular-api-integration-checkpoint`  
**Version**: N/A — cambio OpenSpec activo  
**Mode**: Standard SDD verify (`strict_tdd` no activo)  
**Artifact store**: Hybrid — OpenSpec + Engram  
**Fecha**: 2026-06-30

### Completeness

| Metric | Value |
|---|---:|
| Tasks total | 18 |
| Tasks complete | 18 |
| Tasks incomplete | 0 |
| Proposal/spec/design/tasks read | Sí |
| Apply-progress Engram read | Sí — `#4411` |
| Engram tasks read | Sí — `#4410` |

### Build & Tests Execution

**Build**: ✅ Passed

```text
cd apps/frontend-angular && npm run build
Resultado: OK. Initial total 253.42 kB / estimated transfer 72.00 kB.
Presupuestos Angular dentro de límite.
```

**Frontend tests**: ✅ 70 passed / ❌ 0 failed / ⚠️ 0 skipped

```text
cd apps/frontend-angular && npm test -- --watch=false
Resultado: TOTAL: 70 SUCCESS en Chrome 149.
```

**Smoke local Angular↔PHP**: ⚠️ BLOCKED por entorno

```text
bash scripts/m3-06-smoke.sh
Resultado: [m3-06-smoke] BLOCKED: php CLI no disponible en PATH.
Exit: 2.
```

La falta de `php` CLI bloquea la ejecución runtime del smoke en este entorno. No se observó falla de código de producto; queda como caveat de evidencia runtime.

**PHP lint wrapper**: ⚠️ Wrapper bloqueado; fallback Docker directo OK

```text
bash scripts/php-docker-lint.sh
Resultado: sudo: A terminal is required to authenticate

docker run --rm --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" --workdir /workspace ifts14-php84 find apps/backend-php -type f -name '*.php' -exec php -l '{}' +
Resultado: 13/13 archivos PHP sin errores de sintaxis.
```

**OpenSpec CLI**: ⚠️ No disponible

```text
openspec validate m3-06-angular-api-integration-checkpoint --strict
Resultado: /bin/bash: openspec: orden no encontrada
```

**Coverage**: ➖ Not available — no se ejecutó reporte de cobertura en este ciclo.

### Focused Read-only Checks

| Check | Result |
|---|---|
| Conteo de tasks | ✅ `checked=18 unchecked=0` |
| Política del smoke | ✅ token ficticio con patrón `[A-Za-z0-9_-]{32,128}`, prueba `/certificados/api/...`, valida JSON de health/404/200 y no acepta `400`, `404` genérico ni `500` como éxito |
| CORS abierto en backend | ✅ No se detectaron headers `Access-Control-*` ni soporte `OPTIONS` agregado; el diseño usa proxy local |
| Archivos backend modificados | ✅ Ninguno en el diff de producto |

### Spec Compliance Matrix

| Requirement | Scenario | Runtime/Test Evidence | Result |
|---|---|---|---|
| Conmutación local mock/API real | Modo API real habilitado en local | `http-validation.source.spec.ts` cubre `HttpValidationSource` con `HttpTestingController`; `app.config.ts` usa `environment.useRealApi ? HttpValidationSource : MockValidationSource`. Smoke E2E bloqueado por falta de PHP CLI. | ⚠️ PARTIAL |
| Conmutación local mock/API real | Modo mock preservado por defecto | `environment.ts` y `environment.development.ts` mantienen `useRealApi:false`; `app.config.spec.ts` pasó y verifica `MockValidationSource` por defecto. | ✅ COMPLIANT |
| Conmutación local mock/API real | Conmutación sin cambio de pantalla | `ValidationService` consume `VALIDATION_SOURCE`; tests de servicio/página siguen verdes dentro de los 70 tests. | ✅ COMPLIANT |
| Smoke local de integración con datos ficticios | Smoke de health exitoso | `scripts/m3-06-smoke.sh` consulta `/certificados/api/health` y valida `data.status=ok`/`data.service=certificados-api`; ejecución runtime bloqueada por `php` CLI ausente. | ⚠️ BLOCKED |
| Smoke local de integración con datos ficticios | Smoke de verificación con token ficticio | Script usa token ficticio bien formado, consulta `/certificados/api/certificados/{token}/verificacion` y solo acepta `200` con DTO público o `404 CERTIFICATE_NOT_FOUND`; ejecución runtime bloqueada por `php` CLI ausente. | ⚠️ BLOCKED |
| Servicio reemplazable de validación | Mocks ficticios durante el desbloqueo | Tests de `MockValidationSource`, `ValidationService` y página pública pasaron dentro de los 70 tests. | ✅ COMPLIANT |
| Servicio reemplazable de validación | Cambio a API PHP real en local | `HttpValidationSource` probado con `HttpTestingController`; provider real por entorno verificado por inspección estática. Smoke E2E bloqueado. | ⚠️ PARTIAL |
| Servicio reemplazable de validación | Frontera única para mock y real | `validation-source.ts`, `ValidationService` y `http-validation.source.spec.ts` prueban la frontera común y URL desde `apiBaseUrl`. | ✅ COMPLIANT |
| Mapeo seguro de errores HTTP futuros | HTTP 404 no verificable | `http-validation.source.spec.ts`, `result-mapper.spec.ts` y `validation.service.spec.ts` cubren `CERTIFICATE_NOT_FOUND → not-verifiable`. | ✅ COMPLIANT |
| Mapeo seguro de errores HTTP futuros | Falla técnica | `http-validation.source.spec.ts`, `result-mapper.spec.ts` y `validation.service.spec.ts` cubren `500`/red/error null → `technical-error`. | ✅ COMPLIANT |
| Soporte de consumo browser local seguro | Preflight local exitoso | No aplica en la implementación elegida: proxy local evita CORS/preflight. Sin headers CORS agregados. | ➖ SCOPED |
| Soporte de consumo browser local seguro | CORS abierto prohibido en producción | Inspección de `Response.php`/`index.php` y búsqueda enfocada: no hay `Access-Control-Allow-Origin:*`. | ✅ COMPLIANT |
| Soporte de consumo browser local seguro | Preflight no requerido | `proxy.conf.json` + `angular.json serve.options.proxyConfig`; smoke runtime bloqueado por `php` CLI ausente. | ⚠️ PARTIAL |
| Pendientes de hardening documentados | Gaps explícitos restantes | `docs/backend/01-contrato-api-certificados.md` lista CORS/preflight local por proxy y difiere body size, rate limiting distribuido, observabilidad y `ultimo_uso_en`. | ✅ COMPLIANT |
| Compatibilidad `/certificados/` + `/api/` previa al deploy | Smoke local con base URL separada | `environment.apiBaseUrl`, `baseHref` y proxy están separados; smoke runtime bloqueado por `php` CLI ausente. | ⚠️ PARTIAL |
| Compatibilidad `/certificados/` + `/api/` previa al deploy | cPanel con `/certificados/` y `/api/` separados | `docs/deploy/00-cpanel-certificados.md` documenta `.htaccess` con exclusión `^api(/.*)?$`. | ✅ COMPLIANT |
| Rutas `.htaccess` para API | Rutas profundas y API | Documentación de deploy conserva fallback SPA fuera de `/api/` y API bajo `/certificados/api/`. | ✅ COMPLIANT |
| Rutas `.htaccess` para API | Separación `base href` vs `apiBaseUrl` | `angular.json`, environments, docs frontend y docs deploy distinguen `baseHref` de `apiBaseUrl`. | ✅ COMPLIANT |

**Compliance summary**: 13 compliant / 4 partial-blocked / 1 scoped. No hay escenario con test fallido; los parciales dependen del smoke bloqueado por entorno.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| `environment.useRealApi` + `apiBaseUrl` | ✅ Implemented | Producción y desarrollo quedan en `useRealApi:false`; `apiBaseUrl:'/certificados/api'`. |
| `HttpValidationSource` usa `apiBaseUrl` | ✅ Implemented | URL construida desde `${environment.apiBaseUrl}/certificados/${encodeURIComponent(token)}/verificacion`. |
| Proxy local Angular | ✅ Implemented | `proxy.conf.json` apunta `/certificados/api` a `127.0.0.1:8080`; `angular.json` registra `serve.options.proxyConfig`. |
| Mapeo 404/500/red | ✅ Implemented | `404 CERTIFICATE_NOT_FOUND` conserva envelope; mapper lo colapsa a `not-verifiable`; `500`/red → `technical-error`. |
| Smoke script seguro | ✅ Implemented with blocked runtime | Token ficticio bien formado; config ficticia bajo `/tmp`; no datos reales; éxito solo `200` con DTO público o `404 CERTIFICATE_NOT_FOUND`. |
| Documentación de frontend/backend/deploy | ✅ Implemented | Docs actualizadas con límites, proxy, separación de rutas y caveat de PHP CLI. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Reusar `ValidationSource` y `HttpValidationSource` | ✅ Yes | No se creó cliente API nuevo ni wrapper genérico. |
| `useRealApi` + `apiBaseUrl` en `environment` | ✅ Yes | Separación explícita de `baseHref` y URL de API. |
| Proxy Angular para `/certificados/api` | ✅ Yes | No se abrió CORS en backend. |
| No tocar cPanel ni DB real | ✅ Yes | No se tocaron `public_html`, cPanel real, dumps, logs ni material privado. |
| No modificar backend salvo necesidad de CORS | ✅ Yes | No hay cambios en `apps/backend-php/`; lint Docker directo OK. |

### Issues Found

**CRITICAL**: None.

**WARNING**:
- Runtime smoke `bash scripts/m3-06-smoke.sh` quedó **BLOCKED** porque `php` CLI no está disponible en `PATH` (`exit 2`). Los escenarios de smoke quedan parcialmente verificados por inspección/script y deben ejecutarse en un entorno con PHP CLI + MariaDB ficticia local.
- `bash scripts/php-docker-lint.sh` quedó bloqueado por `sudo` sin TTY (`sudo: A terminal is required to authenticate`). El fallback Docker directo sin `sudo` sí validó `php -l` en 13/13 archivos.
- `openspec` CLI no está instalado en este entorno, por lo que no se pudo ejecutar `openspec validate --strict`.
- La rama `environment.useRealApi:true` no queda probada vía `fileReplacements` en Karma; se cubre con `HttpTestingController` + inspección del provider y debe quedar confirmada por smoke runtime cuando haya PHP CLI.

**SUGGESTION**:
- Ejecutar `bash scripts/m3-06-smoke.sh` en una máquina con PHP CLI 8.4+ y MariaDB ficticia local antes de archivar si se requiere evidencia E2E completa.
- Considerar una variante no interactiva de `scripts/php-docker-lint.sh` o documentar el fallback sin `sudo` cuando el usuario ya pertenece al grupo Docker.

### Verdict

PASS WITH WARNINGS

La implementación cumple tareas, diseño y la mayor parte de los escenarios con tests Angular y checks estáticos. La única evidencia runtime incompleta es el smoke local Angular↔PHP, bloqueado por falta de `php` CLI en el entorno actual; no se observó falla de producto.
