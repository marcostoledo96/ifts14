# Evidencia Task 0A: gate local P5-01

## Resultado

| Campo | Valor |
|---|---|
| Fecha UTC | 2026-07-15T00:26:54Z |
| Operador | OpenCode, ejecución local no autenticada |
| Imagen | `ifts14-php84:latest` |
| Image ID | `sha256:5f19dbdd079855be86a78ddf2d4015d5d89b75d0a2d5cefc04f351950e4c795a` |
| PHP | `8.4.22` |
| Resultado global | **PASS LOCAL** |
| Gate de despliegue | **STOP DESPLIEGUE**, sin cambios |

Todos los criterios locales aprobaron en una única ejecución procedural con código `0`. Esto habilita el inicio posterior de RED y edición de fuente según el plan, pero no autoriza despliegue ni activación browser en staging o producción.

## Evidencia sanitizada

| Criterio local | Estado | Evidencia observada |
|---|---|---|
| API y configuración nativa | PASS | PHP 8.4 cargó `session`; `session_start`, `session_regenerate_id` y `session_destroy` estuvieron disponibles. `session.save_handler=files`; strict mode `1`; cookies `1`; only-cookies `1`; trans-SID `0`; GC `28800`; todos los cambios fueron aceptados y releídos con los valores esperados. |
| Path descartable privado | PASS | Se creó un directorio aleatorio bajo `/tmp/opencode`, se fijó en `0700`, se montó exclusivamente como `/gate-sessions`, resultó existente y escribible, quedó vacío al terminar y fue eliminado mediante `trap`. |
| Cookies producción y staging | PASS | Producción aceptó nombre `ifts14_cert_admin` y path `/certificados/`; staging aceptó nombre `ifts14_cert_stg_admin` y path `/certificados_staging/`. Ambas formas usaron lifetime `0`, domain vacío host-only, `Secure`, `HttpOnly` y `SameSite=Strict`. |
| Ciclo y expiración | PASS | La sesión inició, persistió y se leyó; la regeneración produjo un ID distinto y eliminó el almacenamiento anterior; los límites de inactividad de 1.800 s y absoluto de 28.800 s pudieron evaluarse; destrucción eliminó el almacenamiento nuevo. Los atributos necesarios para expirar la cookie coincidieron con los de emisión. |
| Primitivas criptográficas | PASS | `random_bytes`, `password_verify` y `hash_equals` estuvieron disponibles y aprobaron comportamiento positivo y negativo sin imprimir valores. |
| CSRF | PASS | Se generó un token base64url de 32 bytes. Token ausente o incorrecto devolvió `403` con contador de efectos en cero; token válido continuó y produjo un único efecto. La comparación se realizó con `hash_equals`. |
| Errores y privacidad | PASS | El sobre genérico `401 UNAUTHORIZED` capturado no incluyó contraseña, hash, IDs de sesión, token CSRF, DNI de prueba, token público de prueba ni fragmento SQL. La salida registrada contiene solo etiquetas y metadatos sanitizados. |
| Ejecución procedural | PASS | El script autocontenido ejecutó todas las aserciones y terminó con código `0` y `RESULT: PASS LOCAL`. No se usaron Composer, PHPUnit ni Pest. |

## Comandos seguros

```text
docker image inspect ifts14-php84 --format <metadatos de imagen>
docker run --rm --mount type=bind,src=<directorio-temporal>,dst=/gate-sessions ifts14-php84 php -r <gate procedural autocontenido>
docker run --rm ifts14-php84 php -r <versión PHP>
```

La primera invocación del arnés terminó antes de ejecutar sesiones porque había emitido etiquetas antes de `ini_set`; PHP rechazó cambios posteriores a la emisión de salida. Se corrigió exclusivamente el arnés efímero mediante output buffering y se repitió desde cero. No fue una falla del runtime ni se usó como evidencia de PASS.

## Alcance y bloqueos

**Este PASS LOCAL NO prueba equivalencia con cPanel ni con PHP-FPM.** Tampoco valida Apache, TLS, vhosts, front controllers, límites de header/body, reloj del entorno objetivo ni control anti-fuerza-bruta. El gate B conserva su evidencia `FAIL`/`UNAVAILABLE` y permanece en **STOP DESPLIEGUE**.

No se editaron fuente de producto, infraestructura, base de datos, deploy, secretos ni estado Git. No se crearon pruebas RED.
