# Tasks: PDF institucional de certificado de curso con fechas y firmantes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 300–430 (services + tests + docs) |
| 400-line budget risk | Low (límite operativo 1000 con `size:exception` aprobada por Marcos) |
| Chained PRs recommended | No |
| Suggested split | Single PR (servicios + tests + docs) |
| Delivery strategy | single-pr-default — `size:exception` ya autorizada |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | PDF institucional + emisión + tests + docs | PR 1 | Base: `main`. Cobertura procedural, sin subclass de `CertificatePdfService::final` |

## Phase 1: Foundation — Configuración institucional en emisión

- [x] 1.1 Crear helper privado `loadInstitutionalConfig(PDO): array` en `apps/backend-php/src/AdminCertificateService.php` con prepared `SELECT institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado FROM cert_configuracion_institucional WHERE id = 1 LIMIT 1` (reusa el mismo PDO ya inyectado).
- [x] 1.2 Definir defaults seguros como constante de clase: `institutionName = 'IFTS N.° 14'`, `certificateText` genérico de curso, `rectorRole = 'Rector/a'`, `advisorRole = 'Asesor/a Pedagógica'`, nombres vacíos.
- [x] 1.3 Fusionar fila con defaults: si falta fila, columna NULL o vacía tras `trim()`, usar default; cortar con `mb_substr(..., 0, 255)` para alinearse con `VARCHAR(255)`.
- [x] 1.4 Pasar el resultado a `CertificatePdfService::generate()` bajo `viewData['institutionalConfig']` (forma DTO del design). Marcar con `// ponytail: DTO en array, no value object nuevo`.

## Phase 2: Core Implementation — Render PDF institucional

- [x] 2.1 En `apps/backend-php/src/CertificatePdfService.php::generate()` extraer `institutionalConfig` y aplicar el mismo fallback de Phase 1 (defensa en profundidad, sin acoplar al llamador).
- [x] 2.2 Reemplazar título fijo "Certificado de Aprobación" por encabezado con `institutionName` arriba y "Certificado de Curso" como subtítulo. Mantener orientación horizontal (`L`) y márgenes actuales.
- [x] 2.3 Renderizar `certificateText` como párrafo institucional central usando `htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8')` antes de pasarlo a TCPDF.
- [x] 2.4 Mantener bloque alumno/curso/DNI/fechas snapshot del PDF actual; recortar `Cell` widths para dar espacio a la columna de firmantes.
- [x] 2.5 Agregar bloque de firmantes al pie: `rectorName + rectorRole` y `advisorName + advisorRole` (omitir línea si `name` vacío tras `trim()`).
- [x] 2.6 Conservar QR en esquina inferior derecha con `$validationUrl`; mismo tamaño y posición que el actual.
- [x] 2.7 No imprimir token completo como texto visible ni recuperable. Si un string supera 255 chars visibles, cortar con `mb_substr(..., 0, 255)`.

## Phase 3: Verification — Tests procedurales y E2E

- [x] 3.1 Extender `apps/backend-php/tests/SnapshotEmissionTest.php`: hacer seed de `cert_configuracion_institucional` con `INSERT ... VALUES (1, ...)` antes de la emisión principal; asertar que el PDF se persiste (`is_file`, `filesize > 0`, firma `%PDF-`).
- [x] 3.2 En el mismo test, escenario "config ausente": omitir el INSERT, reemitir y asertar 201 + PDF persistido. Cumple escenario "Configuración institucional ausente" del delta `certificate-pdf-qr-generation`.
- [x] 3.3 En `apps/backend-php/tests/HttpEmissionE2eTest.php` añadir seed de `cert_configuracion_institucional` previo al `POST /admin/certificados`; asertar `201`, `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`, DTO sin `documentNumber` ni token completo, y descarga real del PDF con `200`, `Content-Type: application/pdf`, `Content-Disposition: attachment` y cuerpo `%PDF-`.
- [x] 3.4 En el mismo E2E, emitir sin fila de config y asertar 201 con misma forma de DTO. Mantener el assert `404` sobre `POST .../reenviar` ya presente.
- [x] 3.5 Si conviene centralizar, agregar check binario mínimo (`%PDF-`, `strlen > 100`, `is_readable`) en `apps/backend-php/tests/PdfResilienceTest.php` con un certificado de curso + config ficticia.
- [x] 3.6 Correr `apps/backend-php/tests/HttpContractTest.php` y `EntregaManualTest.php` para verificar que la entrega manual conserva DTO y no rota token.

## Phase 4: Documentation — Sync de specs y docs

- [x] 4.1 Actualizar `docs/backend/00-php84-api.md` y `docs/backend/01-contrato-api-certificados.md` con la sección "PDF institucional" (texto configurable, firmantes, fallback).
- [x] 4.2 Actualizar `docs/backend/API.md` con la nota de que el PDF incorpora contenido institucional sin cambios de endpoint.
- [x] 4.3 Dejar los deltas de `openspec/changes/backend-pdf-certificado-curso-fechas/specs/` listos para que `sdd-archive` los sincronice con `openspec/specs/`.

## Verificación final

```bash
# Lint PHP de los archivos tocados
php -l apps/backend-php/src/AdminCertificateService.php
php -l apps/backend-php/src/CertificatePdfService.php

# Suite procedural completa (Docker PHP 8.4 + MariaDB descartable)
IFTS14_TEST_DB_DSN='mysql:host=...;dbname=test' \
IFTS14_TEST_DB_USER=... IFTS14_TEST_DB_PASS=... \
IFTS14_TEST_DB_ALLOW_RESET=1 \
  php apps/backend-php/tests/SnapshotEmissionTest.php
php apps/backend-php/tests/HttpEmissionE2eTest.php
php apps/backend-php/tests/PdfResilienceTest.php
php apps/backend-php/tests/HttpContractTest.php
php apps/backend-php/tests/EntregaManualTest.php
```

## Trazabilidad spec → test

| Spec (delta) | Escenario clave | Cubierto en |
|--------------|-----------------|-------------|
| `certificate-pdf-qr-generation` MOD | Emisión con PDF institucional | T2.1–T2.7, T3.1 |
| `certificate-pdf-qr-generation` MOD | Config ausente | T1.3, T3.2 |
| `certificate-pdf-qr-generation` MOD | Falla PDF no confirma | tests existentes (no new) |
| `certificate-pdf-qr-generation` MOD | DNI visible PDF | T2.4 |
| `certificate-pdf-qr-generation` MOD | PDF conserva snapshot | T3.1 (assertion existente) |
| `certificate-pdf-qr-generation` ADDED | Verificación testable | T3.1, T3.2, T3.5 |
| `admin-certificate-emission` MOD | Emisión exitosa con config | T1.1–T1.4, T3.1 |
| `admin-certificate-emission` MOD | Config ausente | T1.3, T3.4 |
| `admin-certificate-emission` MOD | DTO estable | T3.3, T3.4 |
| `backend-contrato-api-certificados` ADDED | Conserva DTO admin | T3.3, T3.4 |
| `backend-contrato-api-certificados` ADDED | Descarga PDF | T3.3 |
| `backend-contrato-api-certificados` ADDED | Entrega manual sin rotación | T3.6 |
| `backend-contrato-api-certificados` ADDED | Reenvío sigue fuera | T3.4 (assert 404) |
