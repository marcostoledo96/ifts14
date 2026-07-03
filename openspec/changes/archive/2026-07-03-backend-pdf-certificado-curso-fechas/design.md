# Diseño: PDF institucional de certificado de curso con fechas y firmantes

## Enfoque técnico

Implementar el cambio en dos servicios existentes, sin modificar contratos HTTP ni agregar endpoints. `AdminCertificateService::emitir()` leerá una única fila de `cert_configuracion_institucional` dentro del flujo de emisión y pasará un DTO simple al render. `CertificatePdfService::generate()` mantendrá la generación sincrónica con TCPDF y el QR al `publicValidationUrl`, pero renderizará institución, texto certificado, fechas snapshot y firmantes. Si no existe configuración institucional, se usarán valores seguros por defecto.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Leer configuración en `AdminCertificateService` | Suma una consulta al flujo transaccional, pero evita API nueva y conserva el contrato. | Elegida: helper privado `loadInstitutionalConfig()` con `SELECT ... WHERE id = 1 LIMIT 1` y prepared statement. |
| DTO como array asociativo | Menos tipo explícito que una clase, pero coincide con `generate()` y tests actuales. | Elegida: `institutionalConfig` dentro de `viewData`, sin clase nueva. |
| Validar PDF parseando texto binario o con subclass | Parser frágil; subclass imposible porque `CertificatePdfService` es `final` y se inyecta concretamente. | Rechazada: tests procedurales verifican DB, archivo `%PDF`, tamaño y descarga; sin dobles del PDF. |
| Cambiar endpoints o respuesta admin | Ampliaría alcance y contrato. | Rechazada: emisión, descarga y entrega manual quedan iguales. |

## Flujo de datos

```txt
POST /admin/certificados
  → AdminCertificateService::emitir()
  → alumno + curso + asistencias activas
  → cert_configuracion_institucional id=1 (fallback si falta)
  → cert_certificados + token + cert_certificado_fechas
  → CertificatePdfService::generate(code, viewData, publicValidationUrl)
  → PDF persistido + commit
```

Las fechas del PDF salen de `$attendedDates`, el mismo snapshot que luego se persiste en `cert_certificado_fechas`; no se recalculan desde asistencias vivas después de emitir.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/src/AdminCertificateService.php` | Modificar | Agregar lectura de configuración institucional, fallback y envío al PDF. |
| `apps/backend-php/src/CertificatePdfService.php` | Modificar | Ajustar firma lógica del `viewData`, layout horizontal, texto institucional, fechas y firmantes. |
| `apps/backend-php/tests/SnapshotEmissionTest.php` | Modificar | Cubrir configuración existente y ausente verificando snapshot, DTO estable y PDF persistido. |
| `apps/backend-php/tests/HttpEmissionE2eTest.php` | Modificar | Asegurar emisión, descarga PDF, validación y entrega manual sin regresión de contrato. |
| `apps/backend-php/tests/PdfResilienceTest.php` | Modificar opcional | Mantener check binario mínimo (`%PDF`, tamaño) si conviene centralizar generación PDF. |

## Interfaces / contratos internos

`CertificatePdfService::generate(string $certificateCode, array $viewData, string $validationUrl): string` conserva firma para minimizar blast radius. `viewData` suma:

```php
[
  'institutionalConfig' => [
    'institutionName' => 'IFTS N.° 14',
    'certificateText' => 'Se certifica que la persona indicada participó del curso...',
    'rectorName' => '', 'rectorRole' => 'Rector/a',
    'advisorName' => '', 'advisorRole' => 'Asesor/a Pedagógica',
  ],
]
```

Fallback: institución `IFTS N.° 14`, texto genérico de certificado de curso, cargos por defecto y nombres vacíos. El render debe escapar/normalizar por contexto PDF usando strings simples, `trim()` y límites de DB; no imprime token completo como texto.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Servicio | Configuración existente y fallback ausente. | Procedural: emitir contra DB/storage temporal y afirmar side effects; no subclass porque `CertificatePdfService` es `final`. |
| Integración DB | Emisión mantiene snapshot, rollback y PDF persistido. | Extender `SnapshotEmissionTest.php` con seed de `cert_configuracion_institucional` y escenario sin fila. |
| HTTP | Contrato admin estable. | `HttpEmissionE2eTest.php`: `201`, descarga PDF `200`, validación pública, entrega manual y `/reenviar` `404`. |
| Binario PDF | PDF generado y descargable. | Verificar archivo existente, tamaño `> 0`, headers de descarga; no parsear texto salvo necesidad puntual. |

## Migración / rollout

No requiere migración, assets ni configuración nueva. Usa `cert_configuracion_institucional` existente de migración `003`. No incluye regeneración de PDFs ni recuperación de tokens legacy; eso queda diferido a otro ciclo si se aprueba. Rollback: revertir servicios y tests; certificados ya emitidos, snapshots, tokens permanentes y PDFs existentes no se invalidan.

## Implicancias de archive

Actualizar `openspec/specs/certificate-pdf-qr-generation/spec.md`, `openspec/specs/admin-certificate-emission/spec.md`, `openspec/specs/backend-contrato-api-certificados/spec.md` y documentación backend (`docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/backend/API.md`) para reflejar PDF institucional sin cambios de endpoint.

## Preguntas abiertas

Ninguna bloqueante.
