```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:0c97e678a78261229e0239683ab888b605534d77e1d7da116729ac300fca7f41
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 16/16
scenarios: 52/52
test_command: >-
  docker run --rm --volume "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 sh -lc 'php tests/AuthGateTest.php && php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php && php tests/AdminAuthorizationMatrixTest.php && php tests/AuthPrivacyTest.php && php tests/NormalizePathTest.php && php tests/EntregaManualTest.php && php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php && php tests/PdfResilienceTest.php'
test_exit_code: 0
test_output_hash: sha256:d22ebd51e02bb982efeb5c09d39d55901301d12ceae55cd21d17b622d6bc549e
build_command: >-
  docker run --rm --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" --workdir /workspace ifts14-php84 find apps/backend-php -path '*/vendor' -prune -o -type f -name '*.php' -exec php -l '{}' +
build_exit_code: 0
build_output_hash: sha256:11dfae66f74f231bb88d629e7ee37e68729b89d9a9d1eb4a69fa8c33c5014989
```

# Informe final independiente de verificación

**Cambio**: `p5-01-auth-php`
**Modo**: estándar (`strict_tdd: false`)
**Persistencia**: híbrida
**Código verificado**: `9d1948e6d2704eed8f9eca3109f6aeff1c1728ce`
**PR verificado**: [#63](https://github.com/marcostoledo96/ifts14/pull/63), abierto como borrador
**Veredicto**: **PASS WITH WARNINGS**

La implementación, la regresión local/CI y el gate del candidato aislado de staging cumplen los requisitos P5-01. No hay bloqueos ni hallazgos críticos. Producción no fue activada ni validada por este resultado.

## Artefactos y alcance inspeccionados

Se leyeron la propuesta, las seis delta specs, el diseño, las tareas, el plan, `apply-progress` de Engram, los gates local e histórico/runtime, `task-4-1-staging-evidence.md`, el informe anterior, el código y los tests vigentes, el workflow CI y la documentación backend/deploy pertinente. No se inició una revisión adicional ni se modificaron producto, cPanel, base, configuración o secretos.

## Completitud

| Métrica | Resultado |
|---|---:|
| Declaraciones de requirement | 16/16 |
| Requirements de comportamiento | 15/15 |
| Rename contractual | 1/1, sin escenarios propios |
| Escenarios | 52/52 |
| Tareas | 15/15 |
| Tareas pendientes | 0 |
| Sitios administrativos centralizados | 18/18 |

El conteo actual surge de los encabezados de las seis delta specs y de las casillas de `tasks.md`. Las fases contienen 3 tareas de gate local, 3 de política, 4 de HTTP/autorización, 3 de migración/privacidad y 2 de gate de despliegue.

## Revisión del código candidato

| Evidencia | Resultado |
|---|---|
| `HEAD` | Coincide con `9d1948e6d2704eed8f9eca3109f6aeff1c1728ce`. |
| Árbol de producto/tests | `apps/backend-php`, workflow, scripts, Docker y database no tienen diferencias respecto de `9d1948e`. |
| Fix Codex | `e5606e5d5402282d01a0998daac4560ad1fcc3f8` es ancestro de `HEAD`; endurece el rechazo de contraseña vacía y completa fixtures de privacidad. |
| Aislamiento OPcache | `9d1948e` inicia el servidor de `AdminMasterDataHttpTest.php` con `opcache.enable=0`; el E2E MariaDB pasó. |
| Autorización HTTP | `index.php` usa `AuthGate::requireHttpSession()` mediante `adminConfig()`; no lee `HTTP_X_ADMIN_KEY`. Las únicas apariciones ejecutables del header en PHP son pruebas negativas. |
| Matriz | `AdminAuthorizationMatrixTest.php` ejercitó los 18 sitios: header legacy rechazado, sesión válida en GET y CSRF previo a mutaciones. |

## Ejecución local y CI

| Evidencia | Comando | Exit | SHA-256 de salida exacta | Resultado |
|---|---|---:|---|---|
| Auth/readiness focalizado | `docker run --rm --volume "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 sh -lc 'php tests/ReadinessTest.php && php tests/AdminSessionAuthTest.php && php tests/AuthGateTest.php && php tests/AdminAuthHttpTest.php && php tests/AdminAuthorizationMatrixTest.php && php tests/AuthPrivacyTest.php'` | 0 | `55ac763cd76272623446723f4c5e38c5016dbe4b11b30885bc1f3918b56bf974` | PASS, 6 scripts |
| Backend unit CI-equivalent | Comando `test_command` del envelope | 0 | `d22ebd51e02bb982efeb5c09d39d55901301d12ceae55cd21d17b622d6bc549e` | PASS, lista exacta del workflow |
| MariaDB 10.6 E2E | Red y contenedor descartables; ejecución de `SnapshotEmissionTest`, `HttpEmissionE2eTest`, `AdminMasterDataHttpTest`, `AdminCertificadosConsultaHttpTest`, `ReadinessTest`, `CertificateRevisionMigrationTest`, `AttendanceRevisionTest` y `CourseDateRevisionTest` con DSN al contenedor | 0 | `c50f83e3789db5d48e1e92ff73060b39ec5ce63351403c22c23c6bc7e022bc1b` | PASS, 8 scripts; recursos eliminados por `trap` |
| Privacy headers | `bash scripts/test-privacy-headers.sh` | 0 | `f6cdebff3e621e0a5e1b30f42b5cd6e65360bb74adb3a6c3882f5af0a250b73b` | PASS |
| Lint PHP Docker | Comando `build_command` del envelope | 0 | `11dfae66f74f231bb88d629e7ee37e68729b89d9a9d1eb4a69fa8c33c5014989` | PASS |
| Whitespace | `git diff --check` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | PASS; salida vacía |
| Smoke legacy discontinuado | `bash scripts/test-alto-c-interactive.sh` | 2 esperado | `b7ce5b9a139d363bdcbaa6a8d8fc605e368694d19f23a76dfda30418938756ef` | PASS contractual; no ejecutó HTTP |

No existe cobertura porcentual configurada; el umbral vigente es `0`.

### GitHub PR #63

La consulta read-only informó `headRefOid=9d1948e6d2704eed8f9eca3109f6aeff1c1728ce`, estado abierto, borrador y `MERGEABLE`.

| Job | Estado | Conclusión |
|---|---|---|
| `php-tests` | COMPLETED | SUCCESS |
| `frontend-tests` | COMPLETED | SUCCESS |

Los tres commits del PR son `c67c4d8`, `e5606e5` y `9d1948e`; por lo tanto, la ejecución verde contiene ambos fixes solicitados.

## Matriz de cumplimiento de specs

| Delta / requirement | Escenarios trazados | Evidencia runtime aprobada | Resultado |
|---|---:|---|---|
| `admin-auth`: rename de autorización | 0 | Código y búsqueda de consumidores | ✅ COMPLIANT |
| Autorización por sesión o compatibilidad CLI | 3: CLI válido; falla cerrada; secreto no observable | `AuthGateTest`, matriz, privacidad | ✅ 3/3 |
| Ciclo de sesión nativa | 3: login/estado; falla genérica; logout | `AdminAuthHttpTest`, smoke staging | ✅ 3/3 |
| Protección y vigencia | 3: cookie/fijación; expiración; config inválida | `AdminSessionAuthTest`, `AdminAuthHttpTest`, staging | ✅ 3/3 |
| CSRF para mutaciones | 2: válido; ausente/incorrecto | Matriz, HTTP y smoke staging | ✅ 2/2 |
| Retiro de legacy | 2: header HTTP; retiro del smoke | `AuthGateTest`, matriz, smoke discontinuado | ✅ 2/2 |
| `admin-master-data-api`: cursos | 2: alta/consulta; cambio de estado | `AdminMasterDataHttpTest` | ✅ 2/2 |
| Seguridad, envelopes y auditoría | 2: sin autorización; JSON/media type inválido | Master data HTTP, matriz, privacidad | ✅ 2/2 |
| `admin-certificate-consulta` | 2: listado vigente; filtro inválido | `AdminCertificadosConsultaHttpTest` | ✅ 2/2 |
| `admin-certificate-delivery` | 6: entrega; token conservado; token irrecuperable; sin auth; no secreto browser; DTO seguro | `HttpEmissionE2eTest`, `EntregaManualTest`, `AuthPrivacyTest`, job frontend | ✅ 6/6 |
| Contrato mínimo de certificados | 9: autorización, emisión, duplicado, PDF, revocación, entrega y reenvío removido | E2E MariaDB, `HttpContractTest`, `PdfResilienceTest`, entrega manual | ✅ 9/9 |
| Contrato administrativo de datos maestros | 6: cursos, alumno seguro, clave DNI, fechas, asistencia y anulación | `AdminMasterDataHttpTest`, tests de revisiones | ✅ 6/6 |
| Preservación durante PDF institucional | 4: emisión, PDF, entrega y reenvío fuera de alcance | E2E, contrato, PDF y entrega | ✅ 4/4 |
| Descarga QR PNG | 3: descarga, errores seguros y token irrecuperable | `HttpContractTest`, regresión CI previa incluida en el candidato | ✅ 3/3 |
| Checklist Angular/API | 2: privacidad e invariantes D0 | E2E MariaDB, privacidad y job frontend | ✅ 2/2 |
| Descarga administrativa de PDF | 3: autorizada, sin autorización e inexistente | `HttpContractTest`, `PdfResilienceTest`, E2E | ✅ 3/3 |

**Resumen**: 16/16 declaraciones contractuales y 52/52 escenarios trazados a evidencia runtime aprobada.

## Gate de staging Task 4.1

La evidencia combinada de `task-4-1-staging-evidence.md`, `task-0-runtime-gate.md`, el runbook de staging y `apply-progress` es suficiente para el alcance actual de Task 4.1 y está sanitizada.

| Área | Evidencia | Veredicto |
|---|---|---|
| PHP/runtime | CGI/FastCGI 8.4.22 aislado; sesiones `files`, storage escribible, strict/cookies-only, trans-SID desactivado, GC 28.800 y round-trip | PASS |
| DB aislada | Esquema dedicado vacío, diez tablas `cert_*`, migraciones `001`–`010`, sin filas de negocio | PASS |
| Configuración privada | Config `0600`; directorios de config/runtime/PDF `0700`; valores no registrados | PASS |
| Health/routing/paquete | Health `200`; front controller del candidato; accesos directos a `src`, `vendor`, Composer y `.user.ini` con `403` | PASS |
| Cookie/sesión | `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/certificados_staging/`; login y estado autenticado | PASS |
| CSRF/logout | Logout sin CSRF `403`; con CSRF `200`; estado posterior no autenticado | PASS |
| Rate limit | Cinco intentos inválidos `401`; sexto `429`; storage restringido | PASS |
| Readiness CLI | Extensiones, autoload, timezone, configuración, sesión, storage, claves, PDF, limiter, PDO/MariaDB y migraciones; exit `0` | PASS |
| Limpieza/reversión | Cron temporal y configuración local eliminados; rollback limitado al candidato/config aislados | PASS |

### `SetEnv` y `.user.ini`

El `500` producido por `SetEnv` está documentado como incompatibilidad del hosting por ausencia de `mod_env`, no como falla de la aplicación. El cambio fue revertido. La solución vigente usa `.user.ini` con `auto_prepend_file` hacia un bootstrap privado fuera del webroot; el acceso HTTP a `.user.ini` devolvió `403`, el archivo externo no se versionó y la evidencia no revela su ruta ni su contenido. No se observó exposición de configuración.

### Límite de release

El resultado es **PASS de staging**, no release productivo. `/certificados/` no fue activado ni validado; cualquier activación productiva requiere su propia autorización y comprobación operativa.

### Entrega manual con datos de negocio

No es blocker de P5-01. Ningún escenario P5 exige sembrar un certificado de negocio en staging y el gate B de autenticación no incorpora ese smoke. Los comportamientos de entrega manual sí tienen cobertura local/CI aprobada. El smoke remoto con datos ficticios queda como seguimiento no P5, separado del esquema vacío de staging.

## Coherencia con el diseño

| Decisión | Estado | Evidencia |
|---|---|---|
| Sesión PHP nativa, sin framework ni `SessionStore` | ✅ | `AdminSessionAuth`, tests y runtime staging |
| Cookies aisladas por base | ✅ | Producción local `/certificados/`; staging real `/certificados_staging/` |
| CSRF previo a side effects | ✅ | Matriz de 18 sitios y tests DB-backed |
| Seam único de autorización | ✅ | `adminConfig()` → `AuthGate::requireHttpSession()` |
| HTTP no acepta `X-Admin-Key` | ✅ | Código y pruebas negativas |
| Compatibilidad CLI acotada | ✅ | Opt-in, expiración, longitud y producción deshabilitada |
| Sin cambios de producto fuera del commit candidato | ✅ | Árbol de producto/tests coincide con `9d1948e` |
| Staging separado de producción | ✅ | Evidencia y rollback aislados |

## Hallazgos

### CRITICAL

Ninguno.

### WARNING

1. El tópico Engram `sdd/p5-01-auth-php/tasks` todavía conserva el estado histórico 14/15, mientras `tasks.md` y el `apply-progress` más reciente confirman 15/15. La autoridad actual es coherente entre archivo y progreso final, pero queda deriva híbrida a normalizar durante el cierre.
2. La documentación base aún contiene referencias históricas a `X-Admin-Key` HTTP, `STOP DESPLIEGUE` y al smoke remoto de entrega como gate (`docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md` y secciones operativas de staging). No refleja por completo el delta P5-01 y debe sincronizarse en `sdd-archive` antes de usarla como guía productiva.
3. El diseño histórico de Gate B mencionaba además límites de header/body y reloj. La evidencia final de Task 4.1 no los vuelve a enumerar. No son requisitos funcionales de P5-01 ni bloquean el PASS de staging solicitado, pero no deben inferirse como aprobados para producción.

### SUGGESTION

Registrar durante archive que staging ejecutó PHP 8.4.22, mientras la documentación general todavía nombra 8.4.21, para evitar una equivalencia de patch no documentada.

## Evidencia canónica preservada

Los siguientes bytes constituyen el preimage exacto de `evidence_revision`:

```text
change=p5-01-auth-php
source_commit=9d1948e6d2704eed8f9eca3109f6aeff1c1728ce
product_test_tree_matches_source_commit=true
codex_fix=e5606e5d5402282d01a0998daac4560ad1fcc3f8
opcache_fix=9d1948e6d2704eed8f9eca3109f6aeff1c1728ce
tasks=15/15
requirements=16/16
scenarios=52/52
focused_auth_readiness=exit:0,sha256:55ac763cd76272623446723f4c5e38c5016dbe4b11b30885bc1f3918b56bf974
backend_unit_ci=exit:0,sha256:d22ebd51e02bb982efeb5c09d39d55901301d12ceae55cd21d17b622d6bc549e
mariadb_e2e=exit:0,sha256:c50f83e3789db5d48e1e92ff73060b39ec5ce63351403c22c23c6bc7e022bc1b
privacy_headers=exit:0,sha256:f6cdebff3e621e0a5e1b30f42b5cd6e65360bb74adb3a6c3882f5af0a250b73b
docker_lint=exit:0,sha256:11dfae66f74f231bb88d629e7ee37e68729b89d9a9d1eb4a69fa8c33c5014989
git_diff_check=exit:0,sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
legacy_smoke=exit:2(expected),sha256:b7ce5b9a139d363bdcbaa6a8d8fc605e368694d19f23a76dfda30418938756ef
github_pr=63
github_head=9d1948e6d2704eed8f9eca3109f6aeff1c1728ce
github_php_ci=success
github_frontend_ci=success
staging_gate=pass
production_activated=false
```

## Veredicto final

**PASS WITH WARNINGS.** P5-01 cumple 15/15 tareas, 16/16 declaraciones de requirement y 52/52 escenarios. El candidato de staging aprobó con evidencia sanitizada; producción permanece fuera del resultado. Las advertencias son de sincronización documental/híbrida y no representan defectos funcionales ni bloqueos del cambio.

**Próximo paso recomendado**: ejecutar `sdd-archive`, sincronizando las specs vigentes con la documentación base y preservando explícitamente que producción no está activada.
