# Evidencia Task 4.1: gate runtime de staging P5-01

## Veredicto

**PASS para el candidato aislado de staging el 2026-07-15.** La evidencia corresponde únicamente a `/certificados_staging/` en su host aislado. Producción bajo `/certificados/` permanece sin activar; este documento no autoriza ni infiere una activación productiva.

La evidencia anterior de `STOP`, `FAIL` y `UNAVAILABLE` permanece preservada en `task-0-runtime-gate.md` como estado histórico. El resultado actual documenta la progresión posterior, no reescribe ese antecedente.

## Evidencia sanitizada verificada

| Área | Resultado |
|---|---|
| Runtime PHP | PHP CGI/FastCGI 8.4.22 en el host aislado de staging. El host principal mantuvo PHP 8.1. |
| Sesiones | Handler `files`; almacenamiento configurado y escribible; modo estricto, cookies y solo-cookies habilitados; trans-SID desactivado; GC de 28.800 segundos; round-trip correcto. |
| Paquete y exposición | Integridad del paquete verificada; health `200`; accesos directos a `src`, `vendor`, manifiestos Composer, binarios Composer y `.user.ini` devolvieron `403`. |
| Configuración CGI | El hosting no tiene `mod_env`; `SetEnv` causó un `500` determinista y fue revertido. La configuración compatible usa `.user.ini` protegido con `auto_prepend_file` a un bootstrap privado fuera del webroot; `.user.ini` devuelve `403`. |
| Base de datos | Esquema dedicado y vacío: diez tablas `cert_*`, migraciones `001` a `010` y sin filas de negocio sembradas. |
| Permisos | Configuración privada con modo `0600`; directorios de configuración, runtime y PDF con modo `0700`. Las credenciales y claves se generaron localmente y no se registraron. |
| Autenticación | Login `200`; cookie con `Secure`, `HttpOnly`, `SameSite=Strict` y `Path=/certificados_staging/`; sesión autenticada; logout sin CSRF `403`; logout con CSRF `200`; estado posterior no autenticado. |
| Rate limit | Los primeros cinco intentos inválidos respondieron `401`; el sexto respondió `429`; el archivo runtime quedó restringido después de la prueba. |
| Readiness CLI | OpenSSL, GD, mbstring, autoload, zona horaria, configuración, sesión administrativa, almacenamiento de sesión, claves externas, almacenamiento PDF, limitador, PDO/MariaDB y migraciones aprobaron; código de salida `0`. |
| Limpieza | El cron temporal fue eliminado y la configuración local generada fue borrada. Staging sigue aislado y no hubo activación de producción. |

## Evidencia de unidad de trabajo

| Evidencia | Resultado |
|---|---|
| Prueba focalizada | Smoke externo de autenticación en staging: login, atributos de cookie, sesión, CSRF, logout e invalidación posterior: **PASS**. No se conservan credenciales, cookies, CSRF, IDs ni el comando autenticado. |
| Arnés runtime | Readiness CLI temporal contra staging: dependencias, configuración, almacenamiento, base y migraciones: **PASS**, código de salida `0`. El cron temporal se eliminó al finalizar. |
| Límite de reversión | Revertir el candidato de staging y su configuración externa aislada; no afecta producción. El cron y la configuración local temporal ya no existen. |

## Alcance pendiente

- Producción no fue activada ni validada por esta evidencia.
- La entrega manual con datos de negocio es un seguimiento separado y no P5-01: no se sembraron datos de negocio en staging.
- Este registro no contiene rutas privadas, credenciales, hashes, valores de cookie o CSRF, identificadores de request ni datos personales.
