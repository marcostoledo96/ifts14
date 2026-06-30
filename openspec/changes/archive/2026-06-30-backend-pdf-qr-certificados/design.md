# Diseño: M4-01 generación PDF/QR de certificados

## Enfoque técnico

La emisión administrativa seguirá siendo sincrónica en `AdminCertificateService::emitir()`: se crea el certificado y el token dentro de una transacción, se genera el PDF horizontal con TCPDF antes del `commit`, y cualquier falla de generación o persistencia aborta la emisión con rollback. El PDF se guarda como `{certificateCode}.pdf` en `certificate_storage_path`; el token completo solo se usa en memoria para construir la URL del QR `{public_base_url}/validar/{token}` y no se devuelve ni persiste.

**Estado técnico**: desbloqueado. Marcos autorizó `tecnickcom/tcpdf` vía Composer para este ciclo.

## Decisiones de arquitectura

| Decisión | Opción elegida | Alternativas | Fundamento |
|---|---|---|---|
| PDF/QR | Usar `tecnickcom/tcpdf` vía Composer. | HTML descargable, SVG placeholder, generador PDF casero. | El spec exige PDF binario, hoja horizontal y QR real; TCPDF cubre página landscape y QR sin código propio riesgoso. |
| Persistencia | Archivo `{certificateCode}.pdf` en `certificate_storage_path`; sin nueva migración. | Guardar path en DB o usar token en nombre. | No hay migraciones en alcance; el código ya es único y no expone token. |
| Transacción | Generar y mover el PDF antes del `commit`; borrar temporal/archivo si hay rollback o falla posterior. | Generar bajo demanda o después del commit. | Evita certificados emitidos sin PDF y respeta que el token solo existe durante `emitir()`. |
| Descarga | Endpoint admin lee por `id`, consulta `codigo_certificado`, calcula path y emite headers PDF directo. | URL pública directa o servir desde webroot. | Mantiene PDFs no públicos y reutiliza `X-Admin-Key`. |
| DNI | Usar siempre `documentMasked` en PDF. | DNI completo configurable. | Default seguro y consistente con contrato vigente. |

## Flujo de datos

```txt
POST /admin/certificados
  └─ index.php valida JSON + X-Admin-Key
     └─ AdminCertificateService::emitir()
        ├─ valida payload y enmascara DNI
        ├─ genera token en memoria + token_hash
        ├─ beginTransaction()
        ├─ INSERT cert_certificados / cert_tokens_verificacion
        ├─ CertificatePdfService usa TCPDF: AddPage('L') + QR(URL pública)
        ├─ rename temp → {certificateCode}.pdf
        └─ commit() + DTO con pdfDownloadUrl

GET /admin/certificados/{id}/pdf
  └─ auth admin → query código → path seguro → stream application/pdf
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/composer.json` | Crear | Declarar dependencia `tecnickcom/tcpdf`; no agregar dependencias extra. |
| `apps/backend-php/composer.lock` | Crear | Archivo generado cuando implementación ejecute `composer install/update` para fijar versión. |
| `apps/backend-php/src/CertificatePdfService.php` | Crear | Servicio mínimo con TCPDF para hoja horizontal, QR, rutas seguras y persistencia con temporal + `rename()`. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificar | Inyectar `public_base_url`, `certificate_storage_path` y servicio PDF; generar PDF dentro de la transacción; agregar `pdfDownloadUrl`. |
| `apps/backend-php/index.php` | Modificar | Cargar `vendor/autoload.php`, registrar `GET /admin/certificados/{id}/pdf`; autenticar antes de emitir PDF; headers `application/pdf`, `attachment`, `Content-Length`. |
| `apps/backend-php/src/Config.php` | Modificar | Exigir `public_base_url` y `certificate_storage_path` como strings no vacíos para emisión/descarga. |
| `apps/backend-php/config/certificados-config.example.php` | Modificar | Agregar placeholders ficticios, sin rutas reales ni secretos. |
| `apps/backend-php/tests/AdminCertificateServiceTest.php` | Modificar | Cubrir DNI enmascarado, armado de URL PDF y rollback ante falla simulada de PDF si se puede aislar con stub. |
| `apps/backend-php/tests/HttpContractTest.php` | Modificar | Cubrir descarga sin autorización `401`, método no permitido y headers básicos del endpoint cuando haya fixture PDF. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar en archive | Documentar `pdfDownloadUrl`, endpoint PDF y errores `PDF_NOT_FOUND`. |
| `docs/deploy/00-cpanel-certificados.md` | Modificar en archive | Documentar storage fuera de webroot, `.htaccess` alternativo y rollback de PDFs ficticios. |

## Interfaces / contratos

```php
final class CertificatePdfService {
    public function generate(string $certificateCode, array $viewData, string $validationUrl): string;
    public function pathForCode(string $certificateCode): string;
}
```

`generate()` devuelve la ruta final del PDF o lanza excepción; no recibe ni devuelve el token completo, solo la URL ya armada para el QR. Internamente usa TCPDF con página horizontal y QR mediante la API de códigos de barras/2D.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit/script | Máscara de DNI, URL pública, nombre `{certificateCode}.pdf`, cleanup ante error. | Scripts PHP existentes con `Reflection`/stubs y directorio temporal. |
| HTTP contrato | `401` sin admin key, `404 PDF_NOT_FOUND`, `200` con headers PDF. | Extender `HttpContractTest.php`; fixture PDF ficticio temporal. |
| Integración DB | Emisión no confirma si falla PDF. | Prueba manual/demo con MariaDB ficticia; sin datos reales. |

## Migración / rollout

No requiere migraciones de base. Rollout: agregar Composer en `apps/backend-php/`, instalar `tecnickcom/tcpdf`, configurar placeholders ficticios/locales, probar storage fuera del webroot y documentar pasos cPanel en archive. Rollback: revertir dependencia/ruta/DTO y eliminar PDFs ficticios de prueba.

## Advertencias no bloqueantes

- Si cPanel no permite ejecutar Composer, la entrega deberá definir si se sube `vendor/` como artefacto de deploy o se instala fuera del servidor real.
- `certificate_storage_path` real se definirá fuera de Git; el diseño mantiene solo placeholders.
- El PDF debe mostrar DNI enmascarado y nunca token completo como texto visible.

## Preguntas abiertas

- [ ] Ninguna bloqueante para `sdd-tasks`.
