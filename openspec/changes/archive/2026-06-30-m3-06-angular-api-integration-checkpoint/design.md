# Diseño: M3-06 checkpoint integración Angular/API

## Enfoque técnico

Se valida la integración local usando la frontera existente `ValidationSource` + `ValidationService`, sin nueva capa. El cambio mínimo es configurar `HttpValidationSource` con `environment.apiBaseUrl`, permitir alternar mock/API real por `environment.useRealApi` y usar proxy de `ng serve` para evitar CORS. La API PHP queda sin cambios en el camino feliz; CORS/preflight solo se agrega si el proxy no cubre el smoke.

## Decisiones de arquitectura

| Decisión | Alternativas | Fundamento |
|---|---|---|
| Reusar `ValidationSource` y `HttpValidationSource` | Crear cliente API nuevo, interceptor o wrapper genérico | Ya existe la frontera mock/HTTP; agregar otra abstracción sería duplicar el patrón. |
| `useRealApi` + `apiBaseUrl` en `environment` | Mantener URL hardcodeada o derivarla de `baseHref` | La spec exige conmutación local y separación `base href`/API. `baseHref` resuelve rutas Angular, no endpoints. |
| Proxy Angular para `/certificados/api` | CORS backend por defecto | Angular CLI 20 soporta `proxyConfig`; evita abrir CORS y mantiene el backend productivo más cerrado. |
| No tocar cPanel ni DB | Smoke remoto o migraciones | El ciclo es checkpoint local con fixtures ficticios; deploy real y datos reales están fuera de alcance. |

## Flujo de datos

```txt
Ruta /validar/:token
  → ValidationService.verify(token)
  → VALIDATION_SOURCE según environment.useRealApi
      ├─ false: MockValidationSource
      └─ true: HttpValidationSource
            → {apiBaseUrl}/certificados/{token}/verificacion
            → Angular proxy /certificados/api → PHP local :8080
            → Response JSON → result-mapper → ValidationViewState
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/environments/environment.ts` | Modificar | Definir `useRealApi: false` y `apiBaseUrl: '/certificados/api'` como contrato seguro del checkpoint. |
| `apps/frontend-angular/src/environments/environment.development.ts` | Modificar | Mantener mocks por defecto; documentar cambio local a `useRealApi: true` para smoke. |
| `apps/frontend-angular/src/app/app.config.ts` | Modificar | Seleccionar `HttpValidationSource` cuando `environment.useRealApi` sea `true`. |
| `apps/frontend-angular/src/app/shared/certificates/http-validation.source.ts` | Modificar | Construir URL desde `environment.apiBaseUrl`; conservar `encodeURIComponent` y el mapeo actual. |
| `apps/frontend-angular/proxy.conf.json` | Crear | Proxy local de `/certificados/api` a `http://127.0.0.1:8080` con `secure:false`. |
| `apps/frontend-angular/angular.json` | Modificar | Agregar `proxyConfig` al `serve` development. |
| `apps/frontend-angular/src/app/shared/certificates/*.spec.ts` | Modificar | Ajustar tests de URL, conmutación y `404`/`500`/red. |
| `apps/backend-php/index.php`, `apps/backend-php/src/Response.php` | No modificar inicialmente | Solo agregar `OPTIONS`/headers CORS locales si el proxy falla y queda justificado por smoke. |
| `apps/backend-php/tests/HttpContractTest.php` | Modificar opcional | Solo si se implementa CORS local; cubrir preflight permitido y origen no autorizado. |
| `docs/frontend/00-angular20-port-v0.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/deploy/00-cpanel-certificados.md` | Modificar en archive | Registrar evidencia, separación `baseHref`/`apiBaseUrl` y límites. |

## Interfaces / contratos

```ts
export const environment = {
  useRealApi: false,
  apiBaseUrl: '/certificados/api',
};
```

`HttpValidationSource` debe pedir:

```txt
{apiBaseUrl}/certificados/{encodeURIComponent(token)}/verificacion
```

El contrato de vista no cambia: `ValidationService.verify()` sigue devolviendo `ValidationViewState` (`valid`, `not-verifiable`, `technical-error`).

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit frontend | Mapper y `ValidationService` preservan `404 CERTIFICATE_NOT_FOUND → not-verifiable` y `500`/red → `technical-error`. | `npm test -- --watch=false` o specs puntuales si el runner lo permite. |
| Integración frontend | `HttpValidationSource` usa `apiBaseUrl`, encodea token y conserva envelopes. | `HttpTestingController`. |
| Smoke local | `GET /health` y validación con token ficticio vía `ng serve` + proxy contra PHP local. | Backend con config example/ficticia, sin cPanel ni datos reales. |
| Backend | Sin CORS: lint/tests existentes. Con CORS: agregar caso `OPTIONS` local seguro. | `php -l`/`HttpContractTest.php` según runtime disponible. |

## Migración / rollout

No requiere migración. Reversión: volver `useRealApi` local a `false`, retirar proxy si no se usa y conservar producción sin cambios operativos en cPanel.

## Preguntas abiertas

- [ ] Ninguna bloqueante. Si el proxy de Angular no cubre el smoke en el entorno local, se habilitará CORS local explícito como fallback acotado.

## Estado de fase

- status: success
- next_recommended: sdd-tasks
- risks: CORS local puede requerir fallback acotado; evitar mezclar `baseHref` con `apiBaseUrl`; no ampliar hacia deploy, UI final ni datos reales.
- skill_resolution: paths-injected
