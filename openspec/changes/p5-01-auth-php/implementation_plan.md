# Plan de implementación: P5-01 Autenticación PHP con sesión

Este plan es exclusivamente para revisión. Deriva de `proposal.md`, las seis delta specs finales y `design.md` corregido. No autoriza cambios de producto, infraestructura, base de datos, deploy, secretos ni Git. `tasks.md` es la lista ejecutable de autoridad; este documento aporta el detalle para la revisión.

## Decisión de entrega aprobada

Se aprobó conservar un único PR mediante `size:exception`, aunque el riesgo canónico de 400 líneas sea Alto. El pronóstico es de 1.450–1.850 líneas y el presupuesto máximo es 2.000. La excepción no reduce los gates ni autoriza despliegue.

## Orden obligatorio

1. Ejecutar Task 0A local en Docker PHP 8.4, sin modificar fuente.
2. Solo con `PASS LOCAL` completo, iniciar RED → GREEN mínimo → Refactor.
3. Migrar consumidores, ejecutar regresión y sincronizar documentación dentro del único PR aprobado.
4. Ejecutar Task 0B con evidencia sanitizada de PHP-FPM/cPanel real antes de deploy o activación browser en staging/producción.

La evidencia cPanel no es requisito para implementar localmente. Es un requisito fail-closed para desplegar o activar el login browser en staging/producción. El gate local no sustituye ni permite inferir evidencia del entorno real.

## Task 0A: PASS/STOP local exacto

Ejecutar en el contenedor descartable actual `ifts14-php84` y registrar imagen, versión, comandos, salida sanitizada, timestamp y operador. El gate solo pasa si todos los checks procedurales terminan con código `0`.

| Check local | Evidencia `PASS LOCAL` exacta | `STOP LOCAL` |
|---|---|---|
| API/config | `session_*` nativo disponible; `files`; `ini_set`/`ini_get` confirma strict `1`, cookies `1`, trans-SID `0`, GC `28800`. | API ausente o algún valor no efectivo. |
| Path descartable | Directorio privado montado solo para la prueba, existente, escribible y no accesible por otros. | Path ausente, compartido, no escribible o permisos inseguros. |
| Cookies | Parámetros exactos: lifetime `0`, host-only, `HttpOnly`, `Secure`, `SameSite=Strict`; paths `/certificados/` y `/certificados_staging/`. | Cualquier atributo o path difiere. |
| Ciclo de sesión | Test procedural crea, lee, regenera ID eliminando el anterior, aplica expiración y destruye sesión y cookie con iguales atributos. | Alguna transición falla o deja sesión/cookie utilizable. |
| CSRF | Token de 32 bytes base64url; comparación segura; mutación ausente/incorrecta retorna `403` antes de side effects; token válido continúa. | Token débil, comparación incorrecta o side effect previo. |
| Errores y privacidad | Login/config inválidos devuelven error genérico; salida capturada no contiene credenciales, hash, ID/cookie, CSRF, DNI, token ni SQL. | Diferencia causas o filtra material sensible. |
| Resultado procedural | Todos los scripts/aserciones son repetibles y finalizan `0`. | Cualquier fallo, omisión o evidencia parcial. |

Este gate no evalúa ni certifica PHP-FPM, cPanel, Apache, TLS, vhosts, límites, reloj o anti-fuerza-bruta.

## Task 0B: PASS/STOP de despliegue

Registrar evidencia sanitizada, timestamp, entorno y operador desde producción y staging reales.

| Gate real | Evidencia `PASS DESPLIEGUE` exacta | `STOP DESPLIEGUE` |
|---|---|---|
| Sesiones | PHP-FPM efectivo usa `files`; path privado, existente, escribible y no world-readable. | Handler/path/permisos incorrectos o inaccesibles. |
| Runtime | Ini efectivo confirma strict `1`, cookies `1`, trans-SID `0`, GC `28800`. | Algún valor no está efectivo. |
| HTTPS/rutas | HTTPS sin downgrade y cada base llega a su front controller correcto. | Downgrade, HTML estático común, base o routing incorrecto. |
| Cookies | Respuesta real confirma atributos exactos y path aislado por entorno. | Cualquier atributo o path difiere. |
| Límites/reloj | Header ≥8 KiB, body ≥64 KiB y desvío UTC ≤60 s. | Algún límite o reloj falla. |
| Fuerza bruta | Control efectivo documentado para login en ambos entornos. | Falta control o evidencia: cambio de infraestructura separado. |

La evidencia vigente continúa **STOP DESPLIEGUE**: HTTPS/rutas está en `FAIL` y los demás checks contienen `UNAVAILABLE`. No se reinterpreta como `PASS`.

## Secuencia TDD y archivos

1. **RED de política:** `tests/AdminSessionAuthTest.php` cubre `admin_username`, `admin_password_hash`, `hash_equals`, `password_verify`, 401 genérico por config inválida, inactividad 30 minutos, duración absoluta 8 horas, `createdAt` inmutable, `lastSeen` solo tras autorización, CSRF y privacidad. `tests/AuthPrivacyTest.php` cubre filtración completa o parcial de secretos, sesión, cookie, CSRF, DNI, token, SQL y credenciales.
2. **GREEN mínimo:** crear `src/AdminSessionAuth.php` y modificar solo `src/Config.php` para auth/TTL/cookies/legacy externos. Usar `session_*`, `random_bytes` y `password_verify`; sin dependencia, DB, migración ni `SessionStore`. Refactorizar después de pasar RED.
3. **RED HTTP:** `tests/AdminAuthHttpTest.php` cubre `POST /admin/auth/login`, `GET /admin/auth/session`, `POST /admin/auth/logout`, sobres/códigos, estado sin crear sesión, regeneración de ID, destrucción/expiración, cookies y CSRF en logout activo y mutaciones.
4. **GREEN mínimo:** modificar `index.php` y `src/AuthGate.php`. `adminConfig()` es el único seam compartido. HTTP nunca evalúa `HTTP_X_ADMIN_KEY`. GET no exige CSRF; POST/PUT/PATCH/DELETE autenticados por cookie lo exigen antes de servicios/DB.
5. **RED de matriz:** `tests/AdminAuthorizationMatrixTest.php` enumera las 18 rutas/métodos del diseño con ruta literal, resultado 401/403/permitido y verificador de efectos laterales. Debe reconciliar la cantidad con `index.php`, sin inventar ni omitir sitios. Incluye cursos, alumnos, fechas, asistencias, certificados, configuración institucional, revocación, PDF, QR y entrega manual.
6. **GREEN/refactor:** migrar `AdminMasterDataHttpTest.php`, `AdminCertificadosConsultaHttpTest.php`, `HttpContractTest.php`, `HttpEmissionE2eTest.php` y `PdfResilienceTest.php` a fixtures de login/cookie/CSRF. `AuthGateTest.php` queda CLI. Migrar o discontinuar `scripts/test-alto-c-interactive.sh` con evidencia.

## Legacy, regresión y documentación

`requireLegacyCli(providedKey, config, now)` debe comenzar con `PHP_SAPI === 'cli'`, exigir opt-in externo, clave ≥16, expiración UTC futura y comparación en tiempo constante. Default y producción quedan deshabilitados. Antes de GREEN se buscan todos los consumidores de `X-Admin-Key`; después se prueba que no existe consumidor HTTP y que legacy deshabilitado falla cerrada. La eliminación del seam y sus tests ocurre solo después de migrar/discontinuar consumidores y antes de habilitar login browser en producción; nunca se amplía a HTTP.

Ejecutar luego tests procedurales enfocados, suite PHP existente y `bash scripts/php-docker-lint.sh`. No ejecutar deploy, migraciones ni cambios de infraestructura. Sincronizar `docs/backend/` y la trazabilidad OpenSpec durante `sdd-archive`; no tocar el blob histórico P0-P9. La suite local no habilita staging/producción sin `PASS DESPLIEGUE`.

## Estados que gobiernan el avance

- `PASS LOCAL`: habilita RED y edición de fuente; no habilita despliegue.
- `STOP LOCAL`: bloquea RED y edición de fuente.
- `PASS DESPLIEGUE`: habilita deploy/activación browser del entorno validado.
- `STOP DESPLIEGUE`: bloquea staging/producción, aunque exista `PASS LOCAL`.

Estado actual: gate local pendiente de ejecución completa; gate de despliegue en **STOP**. La `size:exception` para un único PR está aprobada.
