# Diseño: P5-01 — Autenticación PHP con sesión nativa

## Enfoque técnico

Mantener `index.php` como adaptador HTTP, `Config` como borde de configuración externa, `AdminSessionAuth` como política de sesión/CSRF y `AuthGate` como autorización. Se usan exclusivamente `session_*`, `$_SESSION`, `password_verify()` y `random_bytes()`; no habrá framework, dependencia, base ni `SessionStore`. Los deltas de este cambio son normativos; P0-P9 no lo es.

## Decisiones de arquitectura

| Tema | Decisión autoritativa | Fundamento |
|---|---|---|
| Credencial | `admin_username` y `admin_password_hash` externo, creado con `PASSWORD_DEFAULT`; comparación de usuario con `hash_equals()` y clave con `password_verify()`. | Sin secreto browser ni contraseña plana. |
| Vigencia | Inactividad: 30 min; absoluta: 8 h. `createdAt` no cambia; `lastSeen` avanza solo tras autorización. Config ausente/inválida: `401`. | Falla cerrada y jornada limitada. |
| Cookie | Producción: `ifts14_cert_admin`, `Path=/certificados/`; staging: `ifts14_cert_stg_admin`, `Path=/certificados_staging/`, derivado exclusivamente del application base de ese entorno. Siempre `HttpOnly; Secure; SameSite=Strict`, host-only, `lifetime=0`. Producción DEBE probar literalmente `/certificados/`. | Cumple spec y aísla staging sin alterar producción. |
| PHP | Antes de `session_start()`: strict mode, cookies-only, trans-SID off y `gc_maxlifetime=28800`. Login regenera ID con borrado del anterior; logout/expiración vacían, destruyen y expiran la cookie con iguales atributos. | Evita fijación y cookies residuales. |

## Contrato HTTP y flujo

Rutas externas definitivas: `POST /certificados/api/admin/auth/login`, `GET /certificados/api/admin/auth/session`, `POST /certificados/api/admin/auth/logout` (internamente `/admin/auth/*`). Login recibe JSON exacto `{username:string,password:string}`; éxito `200 data:{authenticated:true,csrfToken:string}`; credencial/config inválida `401 UNAUTHORIZED`. Estado siempre responde `200 data:{authenticated:boolean,csrfToken?:string}` y nunca crea autenticación. Logout responde `200 data:{authenticated:false}`; con sesión activa exige CSRF.

CSRF es base64url de 32 bytes, generado al login, almacenado en esa sesión y devuelto solo por login/estado autenticado. Toda mutación cookie-authenticated (`POST|PUT|PATCH|DELETE`, salvo login) debe enviar `X-CSRF-Token`; comparación `hash_equals()`. Ausente, vencido o distinto: `403 CSRF_INVALID`, sobre vigente, cero side effects. GET no lo exige.

```text
login → verificar → regenerar ID → sesión+CSRF → cookie
adminConfig → sesión/vigencia → CSRF si muta → servicio
logout/expiración → destruir sesión+cookie
```

Errores no distinguen causas ni registran usuario ingresado, contraseña/hash, clave, ID/cookie, CSRF, DNI o token. Fallas ocurren antes de servicios/DB.

## Seam compartido y retiro legacy

Las 18 invocaciones actuales continúan pasando por un único `adminConfig()`, que llama `AuthGate::requireHttpSession()`; `index.php` nunca lee `HTTP_X_ADMIN_KEY`. Legacy vive en `requireLegacyCli(providedKey, config, now)`, separado y con guard inicial `PHP_SAPI === 'cli'`; por lo tanto ningún HTTP —aunque omita Cookie/Origin/User-Agent— evalúa el header. Requiere `admin_legacy_key_enabled=true`, clave ≥16 y `admin_legacy_key_expires_at` UTC futuro; default false y producción false.

Inventario actual: `scripts/test-alto-c-interactive.sh` (curl HTTP) debe migrar a login/cookie/CSRF o discontinuarse; `AdminMasterDataHttpTest`, `AdminCertificadosConsultaHttpTest`, `HttpContractTest`, `HttpEmissionE2eTest` y `PdfResilienceTest` deben migrar a sesión; `AuthGateTest` queda como prueba CLI. Una tarea repetirá búsqueda de `X-Admin-Key` antes de GREEN. Legacy se elimina al migrar/discontinuar ese inventario y, como máximo, antes de habilitar login browser en producción. Evidencia: búsqueda sin consumidores HTTP, smoke con sesión, legacy disabled fallando y registro de cada consumidor migrado/discontinuado.

## Gate A: implementación local

Se ejecuta en el contenedor descartable actual `ifts14-php84`. Solo un `PASS` completo habilita RED y edición de fuente. Debe demostrar mediante scripts procedurales: API nativa de sesión y aceptación efectiva de strict mode, cookies-only, trans-SID off y GC; `session.save_handler=files`; path de sesión privado, descartable y montado solo para la prueba, existente y escribible; cookies exactas de producción y staging; creación, regeneración, lectura, expiración y destrucción de sesión/cookie; CSRF válido e inválido antes de side effects; errores genéricos; y ausencia de credenciales, hash, ID/cookie de sesión, CSRF, DNI, token y SQL en salida. Todo resultado debe ser repetible y terminar con código `0`.

El gate local no prueba PHP-FPM, cPanel, Apache, TLS, vhosts, límites, reloj ni controles anti-fuerza-bruta, y no puede declarar equivalencia con el entorno objetivo. Un fallo o evidencia incompleta mantiene `STOP LOCAL` y prohíbe RED/fuente.

## Gate B: despliegue PHP-FPM/cPanel

| Prerrequisito | Evidencia sanitizada real | PASS | Si falla |
|---|---|---|---|
| Sesiones | Desde el mismo PHP/FPM: handler/path y `is_dir/is_writable/fileperms`. | `files`, path privado/escribible, no world-readable. | STOP despliegue. |
| Runtime | Configuración efectiva PHP/FPM de strict/cookies/trans-SID/GC. | Todos los valores decididos están efectivos. | STOP despliegue. |
| HTTPS/rutas | Health prod/staging e inspección read-only TLS/vhost/front controller. | HTTPS sin downgrade; ambas bases llegan al controlador frontal correcto. | STOP despliegue. |
| Cookies | Respuesta real de cada entorno. | Atributos exactos; producción `Path=/certificados/`; staging aislado en `/certificados_staging/`. | STOP despliegue. |
| Límites/reloj | Inspección read-only de Apache/PHP y hora UTC. | Header ≥8 KiB, body ≥64 KiB, desvío ≤60 s. | STOP despliegue. |
| Fuerza bruta | Inspección read-only de ModSecurity/WAF/rate-limit vigente. | Control efectivo documentado para login en ambos entornos. | STOP; cambio separado, sin editar cPanel en P5-01. |

La evidencia vigente conserva `FAIL`/`UNAVAILABLE` y resultado **STOP**. Hasta un `PASS` completo del gate B quedan prohibidos deploy, activación en staging/producción y habilitación browser productiva, aunque el gate A haya pasado.

## Impacto, secuencia y pruebas

Crear `src/AdminSessionAuth.php`, `tests/AdminSessionAuthTest.php`, `tests/AdminAuthHttpTest.php` y `tests/AdminAuthorizationMatrixTest.php`; modificar `src/{Config,AuthGate}.php`, `index.php`, seis tests inventariados y el smoke solo con aprobación posterior. Secuencia: gate A `PASS` → RED política → servicio/gate → RED HTTP → matriz 18 sitios → migrar consumidores → lint/suite/smoke → gate B `PASS` antes de desplegar. Un único PR aprobado con `size:exception`, presupuesto 2000 líneas.

La matriz procedural ejecutará los 18 sitios: header-only siempre `401`; sesión válida permite cada GET; cada POST/PUT/PATCH/DELETE sin/incorrecto CSRF devuelve `403` antes de DB y con CSRF llega a negocio. Cubrirá cookie/path, regeneración, ambos TTL, logout, config inválida, privacidad y legacy CLI válido/deshabilitado/vencido. No hay frontend, infra, DB ni deploy.

## Matriz de amenazas y reversión

Las cinco filas de la matriz de referencia (paths ejecutables, selección Git, commit, push y PR) son N/A: no existe ejecución ni automatización VCS. Reversión: quitar rutas/clase, destruir sesiones activas y restaurar temporalmente el gate anterior solo mediante delta aprobado; sin migración de datos ni cambio cPanel.
