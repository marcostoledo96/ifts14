```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:b003b15e8498fc9f7732a098873a4e967488c4e645116c6c93497f414337764e
verdict: fail
blockers: 1
critical_findings: 0
requirements: 16/16
scenarios: 52/52
test_command: >-
  rtk docker run --rm --volume "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 sh -lc 'php tests/AuthGateTest.php && php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php && php tests/AdminAuthorizationMatrixTest.php && php tests/AuthPrivacyTest.php && php tests/NormalizePathTest.php && php tests/EntregaManualTest.php && php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php && php tests/PdfResilienceTest.php && php tests/AdminMasterDataServiceTest.php && php tests/QrImageTest.php'
test_exit_code: 0
test_output_hash: sha256:929856e05349a3710065e70d736f470435782d1844963008d377108b7d7cd5aa
build_command: >-
  rtk docker run --rm --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" --workdir /workspace ifts14-php84 find apps/backend-php -path '*/vendor' -prune -o -type f -name '*.php' -exec php -l '{}' +
build_exit_code: 0
build_output_hash: sha256:11dfae66f74f231bb88d629e7ee37e68729b89d9a9d1eb4a69fa8c33c5014989
```

# Informe de verificación

**Cambio**: `p5-01-auth-php`  
**Modo**: estándar; `strict_tdd: false`  
**Persistencia**: híbrida  
**Lineage consumido**: `review-eccb6ae3a7cdce7d`, finalizado `approved`; no se inició otra revisión.  
**Veredicto local**: **PASS**  
**Veredicto de despliegue**: **BLOCKED / STOP DESPLIEGUE**  
**Estado global del cambio**: **BLOCKED**

La remediación dirigida resolvió el único defecto local previo. Auth, readiness positivo/negativo, regresión procedural, MariaDB E2E, privacidad y lint pasan sobre el árbol actual. El envelope global conserva `fail` porque existe un blocker obligatorio y una tarea incompleta de despliegue; no describe una falla de la implementación local.

## Alcance y completitud

Se relevaron el `apply-progress` fusionado de Engram, proposal, seis delta specs, diseño, tasks, plan, gates locales/runtime, diff actual y código/tests vigentes.

| Métrica | Resultado |
|---|---:|
| Declaraciones delta de requirement | 16: 15 contratos + 1 rename |
| Escenarios | 52 |
| Tareas | 15 |
| Tareas completas | 14 |
| Tareas incompletas | 1 (`4.1`, evidencia real PHP-FPM/cPanel) |
| Invocaciones centralizadas `adminConfig()` | 18 |
| Auth scripts incorporados al CI explícito | 4/4 |
| Diff tracked previo al informe | 17 archivos; 384 inserciones, 339 eliminaciones |
| Archivos untracked relevantes previos al informe | 19 |
| Snapshot fuente | `sha256:ec9413549e059fd994093a486fcde72893ff6822be08073b783cba2e2bd5b2a7` |

La implementación local está completa. El cambio integral y `sdd-archive` permanecen bloqueados porque `tasks.md` conserva `4.1` sin completar y la definición del cambio exige ese gate real antes del cierre de despliegue.

## Ejecución actual

| Evidencia | Comando ejecutado | Exit | Hash SHA-256 de salida exacta | Resultado |
|---|---|---:|---|---|
| Foco auth/readiness | `rtk docker run --rm --volume "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 sh -lc 'php tests/ReadinessTest.php && php tests/AdminSessionAuthTest.php && php tests/AuthGateTest.php && php tests/AdminAuthHttpTest.php && php tests/AdminAuthorizationMatrixTest.php && php tests/AuthPrivacyTest.php'` | 0 | `55ac763cd76272623446723f4c5e38c5016dbe4b11b30885bc1f3918b56bf974` | PASS, 6 scripts |
| Suite procedural/CI-equivalent completa | Comando declarado en el envelope; incluye los cuatro scripts auth agregados al workflow y dos checks locales adicionales | 0 | `929856e05349a3710065e70d736f470435782d1844963008d377108b7d7cd5aa` | PASS, 12 scripts |
| MariaDB 10.6 descartable | `docker run --rm --network "$network" --volume "$PWD:/workspace:ro" --workdir /workspace -e 'IFTS14_TEST_DB_DSN=mysql:host=db;dbname=ifts14_test' -e IFTS14_TEST_DB_USER=root -e IFTS14_TEST_DB_PASS=test_root_only -e IFTS14_TEST_DB_ALLOW_RESET=1 ifts14-php84 sh -lc 'php apps/backend-php/tests/SnapshotEmissionTest.php && php apps/backend-php/tests/HttpEmissionE2eTest.php && php apps/backend-php/tests/AdminMasterDataHttpTest.php && php apps/backend-php/tests/AdminCertificadosConsultaHttpTest.php && php apps/backend-php/tests/ReadinessTest.php && php apps/backend-php/tests/CertificateRevisionMigrationTest.php && php apps/backend-php/tests/AttendanceRevisionTest.php && php apps/backend-php/tests/CourseDateRevisionTest.php'` | 0 | `c50f83e3789db5d48e1e92ff73060b39ec5ce63351403c22c23c6bc7e022bc1b` | PASS, 8 scripts; recursos eliminados por `trap` |
| Readiness positivo integral | Config sintética válida + MariaDB migrada + `php -d output_buffering=0 -d session.save_path=/tmp/readiness-sessions apps/backend-php/bin/readiness.php` | 0 | `8f2986c8192aa29e62be4495cdc2b806c467530b8b66c5a546cd0a14bf9ad5bb` | PASS; todos los checks `OK` |
| Readiness negativo integral | Misma config válida + `php -d output_buffering=0 -d session.save_path=/tmp/readiness-missing apps/backend-php/bin/readiness.php` | 1 esperado | `f3fe9a73eb11e9e642f8db3123a61206aac2f815ef3c75434fcad14715dc4fe6` | PASS contractual; solo session storage queda `FAIL` |
| Probes de seguridad auth | Regeneración, ambos límites y rate-limit fail-closed sobre `AdminSessionAuth` real | 0 | `c57fd6b9f0515a7cc63943d6a132580e2980799427b9f2bdd27f655dc0357c3a` | PASS |
| No-secrets Angular focalizado | `rtk npm run test:ci -- --include='src/app/features/admin/**/__checks__/no-secrets.spec.ts'` | 0 | `948cd180f601dbc15a1d08b7baae53a17f31e3292a283ac02a8170b17e0ebea7` | PASS, 11 specs ChromeHeadless |
| Privacy headers | `bash scripts/test-privacy-headers.sh` | 0 | `f6cdebff3e621e0a5e1b30f42b5cd6e65360bb74adb3a6c3882f5af0a250b73b` | PASS |
| Lint Docker sin sudo interactivo | Comando declarado en el envelope | 0 | `11dfae66f74f231bb88d629e7ee37e68729b89d9a9d1eb4a69fa8c33c5014989` | PASS |
| Diff whitespace | `rtk git diff --check` | 0 | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` | PASS |
| Legacy smoke discontinuado | `bash scripts/test-alto-c-interactive.sh` | 2 esperado | `b7ce5b9a139d363bdcbaa6a8d8fc605e368694d19f23a76dfda30418938756ef` | PASS contractual |

La invocación Docker directa equivalente al lint, sin depender del wrapper `sudo` interactivo no disponible, es:

```bash
docker run --rm \
  --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" \
  --workdir /workspace \
  ifts14-php84 \
  find apps/backend-php -path '*/vendor' -prune -o -type f -name '*.php' -exec php -l '{}' +
```

No hay cobertura porcentual configurada; el threshold vigente es `0`.

## Resolución del blocker previo

| Evidencia | Antes | Ahora | Veredicto |
|---|---|---|---|
| Readiness positivo con `output_buffering=0` | warning `headers already sent`, `PHP Session Storage: FAIL`, exit `1` | `PHP Session Storage: OK`, exit `0` | ✅ RESUELTO |
| Readiness con path inexistente | `FAIL`, exit no cero | `FAIL`, exit `1` esperado | ✅ Falla cerrada preservada |
| Regresión versionada | Solo caso negativo | `ReadinessTest.php` exige caso positivo y negativo | ✅ CUBIERTO |
| CI explícito | No incluía los cuatro auth scripts | Incluye los cuatro | ✅ RESUELTO |

La causa fue corregida con buffering del output de CLI antes de emitir bytes. No se encontró regresión ni defecto nuevo.

## Matriz de cumplimiento de specs

| Delta / requirement | Escenarios | Evidencia runtime actual | Resultado |
|---|---:|---|---|
| `admin-auth` rename de autorización | 0 | Diff y búsqueda de consumidores | ✅ Implementado |
| Autorización por sesión o compatibilidad CLI | 3 | `AuthGateTest`, matriz, privacidad | ✅ 3/3 COMPLIANT |
| Ciclo de sesión nativa | 3 | `AdminAuthHttpTest` | ✅ 3/3 COMPLIANT |
| Protección y vigencia | 3 | Tests auth + probe runtime | ✅ 3/3 COMPLIANT |
| CSRF para mutaciones | 2 | Matriz + consumers DB-backed | ✅ 2/2 COMPLIANT |
| Retiro de legacy | 2 | Tests auth + smoke discontinuado | ✅ 2/2 COMPLIANT |
| `admin-certificate-consulta` | 2 | `AdminCertificadosConsultaHttpTest` | ✅ 2/2 COMPLIANT |
| `admin-certificate-delivery` | 6 | E2E, entrega manual, no-secrets Angular | ✅ 6/6 COMPLIANT |
| `admin-master-data-api`: cursos | 2 | `AdminMasterDataHttpTest` | ✅ 2/2 COMPLIANT |
| Seguridad/envelopes/auditoría | 2 | Master data, matriz, privacidad | ✅ 2/2 COMPLIANT |
| Contrato mínimo de certificados | 9 | E2E, contrato, PDF, entrega | ✅ 9/9 COMPLIANT |
| Contrato de datos maestros | 6 | Master data + revisiones | ✅ 6/6 COMPLIANT |
| Preservación durante PDF institucional | 4 | E2E, PDF, entrega | ✅ 4/4 COMPLIANT |
| QR PNG administrativo | 3 | `QrImageTest`, contrato HTTP | ✅ 3/3 COMPLIANT |
| Checklist Angular/API | 2 | MariaDB E2E, privacidad, no-secrets | ✅ 2/2 COMPLIANT |
| Descarga administrativa de PDF | 3 | PDF + contrato HTTP | ✅ 3/3 COMPLIANT |

**Resumen**: 16/16 requirements y 52/52 escenarios cumplen con evidencia runtime actual.

## Aceptación local

| Criterio | Estado |
|---|---|
| Login / session / logout | ✅ PASS |
| Cookie segura prod/staging y fijación | ✅ PASS |
| Idle 30 min / absoluta 8 h | ✅ PASS |
| CSRF previo a side effects | ✅ PASS |
| Seam central de 18 sitios | ✅ PASS |
| Rechazo HTTP de `X-Admin-Key` | ✅ PASS |
| Legacy CLI acotado/deshabilitado | ✅ PASS |
| Rate limiting previo a `password_verify` y fail-closed | ✅ PASS |
| Configuración, privacidad y no leakage | ✅ PASS |
| Logout ante falla de config | ✅ PASS |
| Readiness round-trip positivo y falla negativa | ✅ PASS |
| Consumidores DB-backed migrados | ✅ PASS |
| Cuatro scripts auth en CI explícito | ✅ PASS |

**LOCAL IMPLEMENTATION: PASS.** No quedan defectos locales abiertos en el alcance verificado.

## Despliegue y archive

**DEPLOYMENT: BLOCKED / STOP DESPLIEGUE**:

- sesiones PHP-FPM/cPanel: `UNAVAILABLE`;
- ini efectivo: `UNAVAILABLE`;
- HTTPS/front controllers: `FAIL` histórico, ambos paths servían el mismo HTML;
- cookies reales por entorno: `UNAVAILABLE`;
- límites header/body: `UNAVAILABLE`;
- control anti-fuerza-bruta real: `UNAVAILABLE`.

No se desplegó, no se llamó cPanel autenticado, no se accedió a secretos y no se editó infraestructura. `sdd-archive` permanece bloqueado por la tarea `4.1` incompleta. La implementación local puede considerarse terminada, pero no se puede declarar el cambio integral listo para despliegue o archivo.

## Hallazgos

### CRITICAL

Ninguno.

### WARNING

1. No se ejecutó GitHub-hosted CI; la lista versionada fue inspeccionada y su comando equivalente pasó localmente.
2. `.playwright-mcp/` continúa no versionado y ajeno al cambio; no debe incluirse en un stage P5-01.

### SUGGESTION

Ninguna. No corresponde ampliar el cambio local.

## Evidencia canónica preservada

```text
change=p5-01-auth-php
source_snapshot_sha256=sha256:ec9413549e059fd994093a486fcde72893ff6822be08073b783cba2e2bd5b2a7
focused_tests=exit:0,sha256:55ac763cd76272623446723f4c5e38c5016dbe4b11b30885bc1f3918b56bf974
procedural_ci=exit:0,sha256:929856e05349a3710065e70d736f470435782d1844963008d377108b7d7cd5aa
mariadb_e2e=exit:0,sha256:c50f83e3789db5d48e1e92ff73060b39ec5ce63351403c22c23c6bc7e022bc1b
readiness_positive=exit:0,sha256:8f2986c8192aa29e62be4495cdc2b806c467530b8b66c5a546cd0a14bf9ad5bb
readiness_negative=exit:1(expected),sha256:f3fe9a73eb11e9e642f8db3123a61206aac2f815ef3c75434fcad14715dc4fe6
auth_security_probes=exit:0,sha256:c57fd6b9f0515a7cc63943d6a132580e2980799427b9f2bdd27f655dc0357c3a
frontend_no_secrets=exit:0,sha256:948cd180f601dbc15a1d08b7baae53a17f31e3292a283ac02a8170b17e0ebea7
privacy_headers=exit:0,sha256:f6cdebff3e621e0a5e1b30f42b5cd6e65360bb74adb3a6c3882f5af0a250b73b
direct_docker_lint=exit:0,sha256:11dfae66f74f231bb88d629e7ee37e68729b89d9a9d1eb4a69fa8c33c5014989
git_diff_check=exit:0,sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b
legacy_smoke=exit:2(expected),sha256:b7ce5b9a139d363bdcbaa6a8d8fc605e368694d19f23a76dfda30418938756ef
```

El hash SHA-256 de esos bytes es el `evidence_revision` del envelope.

## Veredicto

**LOCAL PASS / DEPLOYMENT BLOCKED / GLOBAL BLOCKED**. La remediación de readiness está verificada y la implementación local cumple. El cambio no puede archivarse ni desplegarse hasta completar `4.1` con evidencia autorizada del entorno real.

**Próximo paso recomendado**: obtener evidencia sanitizada y autorizada de PHP-FPM/cPanel para el gate `4.1`; después ejecutar una verificación final limitada al gate de despliegue y, si pasa, `sdd-archive`.
