# Tareas: P5-01 Autenticación PHP con sesión

## Pronóstico de carga de revisión

| Campo | Valor |
|---|---|
| Cambios estimados | 1.450–1.850 líneas; presupuesto 2.000 |
| Riesgo del presupuesto | Medio; riesgo canónico de 400 líneas: Alto |
| Se recomiendan PR encadenadas | Sí, por unidades de revisión |
| División sugerida | U1 gate/pruebas; U2 auth; U3 matriz/consumidores; U4 documentación |
| Estrategia de entrega | Un único PR aprobado con `size:exception` |
| Estrategia de cadena | No aplica por excepción aprobada |

Decision needed before apply: No; falta únicamente `PASS` del gate local
Chained PRs recommended: Yes
Chain strategy: no aplica; `size:exception` aprobada
400-line budget risk: High

**Decisión vigente:** se aprobó conservar un único PR mediante `size:exception`. El riesgo de revisión sigue siendo Alto y el presupuesto máximo sigue siendo 2.000 líneas.

### Unidades de trabajo

| Unidad | Objetivo | PR prevista | Prueba | Arnés runtime | Límite de reversión |
|---|---|---|---|---|---|
| 1 | Gate local, config y política | PR única | `php tests/AdminSessionAuthTest.php` | Docker PHP 8.4; gate A obligatorio | Nuevos seams/tests de auth |
| 2 | HTTP, cookie y CSRF | PR única | `php tests/AdminAuthHttpTest.php` | Docker procedural | Rutas auth y `AdminSessionAuth.php` |
| 3 | 18 rutas y consumidores | PR única | `php tests/AdminAuthorizationMatrixTest.php` | Docker procedural; sin equivalencia cPanel | `AuthGate.php`, `index.php`, tests |
| 4 | Privacidad, legacy y docs | PR única | Suite procedural + `php -l` | Gate B externo antes del despliegue | Seam legacy y docs |

## Fase 0A: Gate local de implementación

- [x] 0A.1 En `ifts14-php84`, crear un path de sesión privado, descartable, escribible y exclusivo de la prueba; verificar `session.save_handler=files` y aceptación efectiva de strict mode, cookies-only, trans-SID off y `gc_maxlifetime=28800`.
- [x] 0A.2 Con tests PHP procedurales, verificar parámetros exactos de cookie para producción/staging; creación, regeneración, lectura, expiración y destrucción de sesión/cookie; CSRF válido/inválido antes de efectos; errores genéricos y ausencia de datos sensibles en salida.
- [x] 0A.3 Registrar `PASS LOCAL` solo si todas las aserciones terminan con código `0`. Evidencia parcial o fallo = `STOP LOCAL`; no iniciar RED ni editar fuente. Este PASS no afirma equivalencia con cPanel.

## Fase 1: RED → GREEN mínimo → Refactor

- [x] 1.1 RED `tests/AdminSessionAuthTest.php`: credenciales/config externas inválidas, 401 genérico, `password_verify`, `hash_equals`, TTL 30m/8h, CSRF base64url de 32 bytes y ausencia de datos sensibles.
- [x] 1.2 GREEN/refactor: crear `src/AdminSessionAuth.php`; ampliar `src/Config.php` para auth/TTL/cookie/legacy externo; conservar falla cerrada.
- [x] 1.3 RED/GREEN/refactor `tests/AuthGateTest.php`: sesión, CSRF GET/mutación, expiración/logout y legacy CLI válido/deshabilitado/vencido/clave corta.

## Fase 2: HTTP y autorización centralizada

- [x] 2.1 RED `tests/AdminAuthHttpTest.php`: login/session/logout, regeneración, cookies, TTL, errores genéricos y CSRF sin efectos laterales.
- [x] 2.2 GREEN/refactor `index.php`, `src/AuthGate.php`: rutas auth y seam único `adminConfig()`; HTTP nunca lee `HTTP_X_ADMIN_KEY`; CSRF antes de servicios.
- [x] 2.3 RED `tests/AdminAuthorizationMatrixTest.php`: inventariar las 18 rutas/métodos; header-only 401, GET permitido, mutación sin/incorrecta CSRF 403, CSRF válida llega al negocio; reconciliar diferencias antes de GREEN.
- [x] 2.4 GREEN/refactor las 18 rutas; migrar `AdminMasterDataHttpTest`, `AdminCertificadosConsultaHttpTest`, `HttpContractTest`, `HttpEmissionE2eTest`, `PdfResilienceTest`; `AuthGateTest` queda CLI.

## Fase 3: Migración, privacidad y aprobación

- [x] 3.1 RED/GREEN `tests/AuthPrivacyTest.php`: respuestas/logs/auditoría/errores sin credenciales, hash, sesión/cookie/CSRF, DNI/token/SQL; header HTTP nunca autoriza.
- [x] 3.2 Inventariar `X-Admin-Key`; migrar o discontinuar `scripts/test-alto-c-interactive.sh`; retirar legacy antes de habilitar login browser en producción y probar falla cerrada.
- [x] 3.3 Ejecutar suite procedural, tests y `bash scripts/php-docker-lint.sh`; sincronizar `docs/backend/`, trazabilidad OpenSpec y este plan.

## Fase 4: Gate de despliegue

- [x] 4.1 Evidencia sanitizada obtenida para el candidato de staging: runtime PHP/CGI, sesiones, ruta/cookie, front controller, protección de paquete, configuración privada, esquema aislado, autenticación, rate limit y readiness. Producción permanece sin activar; ver `task-4-1-staging-evidence.md`.
- [x] 4.2 Se preservó el `STOP DESPLIEGUE` histórico ante `FAIL`, `UNAVAILABLE` o evidencia incompleta. El candidato aislado de staging pasó posteriormente con evidencia propia; producción continúa sin activar.
