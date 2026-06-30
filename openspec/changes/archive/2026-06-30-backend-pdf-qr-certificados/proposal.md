# Propuesta: M4-01 generación PDF/QR de certificados

## Intención

Completar la emisión administrativa con un PDF horizontal descargable y QR de validación pública. El token completo solo existe durante `emitir()`, por lo que el PDF debe generarse y persistirse ahí; no se debe guardar el token en texto plano ni regenerarlo luego.

## Alcance

### Incluido
- Generar PDF/QR durante `POST /certificados/api/admin/certificados`.
- Persistirlo como `{certificateCode}.pdf`, nunca con token.
- Agregar `GET /certificados/api/admin/certificados/{id}/pdf` con `X-Admin-Key`.
- Documentar `public_base_url` y `certificate_storage_path` en configuración externa de ejemplo.

### Fuera de alcance
- Email, reenvío, frontend UI, deploy real/cPanel, dumps, datos privados o migraciones nuevas.
- Guardar token completo, cifrado de token o generación de PDF bajo demanda.

## Capabilities

### New Capabilities
- `certificate-pdf-qr-generation`: generación, persistencia segura y descarga administrativa de certificados PDF con QR.

### Modified Capabilities
- `admin-certificate-emission`: la emisión debe generar PDF/QR antes de confirmar la operación y devolver `pdfDownloadUrl` sin exponer token completo.
- `backend-contrato-api-certificados`: documentar endpoint de descarga PDF y DTO de emisión ampliado.
- `deploy-cpanel-certificados`: documentar almacenamiento protegido/fuera del webroot y configuración externa requerida.

## Enfoque

Generar el PDF sincrónicamente durante `emitir()`; si falla, falla la emisión. Preferir TCPDF vía Composer si el entorno lo permite; si no, definir fallback manual en diseño. El QR apunta a `{public_base_url}/validar/{token}`.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/backend-php/src/AdminCertificateService.php` | Modificado | PDF en emisión. |
| `apps/backend-php/index.php` | Modificado | Descarga PDF. |
| `apps/backend-php/src/Config.php` | Modificado | Claves externas. |
| `apps/backend-php/config/certificados-config.example.php` | Modificado | Placeholders ficticios. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Contrato PDF/DTO. |
| `docs/deploy/00-cpanel-certificados.md` | Modificado | Storage, protección y rollback. |

## Riesgos

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| Composer/extensiones no disponibles | Media | Confirmar antes; fallback manual solo con diseño aprobado. |
| PDF falla tras crear datos | Media | Generar antes del commit lógico. |
| PDFs expuestos públicamente | Alta | Storage fuera del webroot o `.htaccess`. |
| DNI en PDF no definido | Media | Default: enmascarado. |

## Plan de reversión

Revertir cambios PHP/docs/specs, quitar `pdfDownloadUrl`, retirar la ruta de descarga y eliminar PDFs ficticios del storage de prueba. No hay migraciones.

## Dependencias

- Confirmar Composer/extensiones en cPanel/Docker.
- Definir storage sin registrar rutas reales en Git.
- Decidir DNI en PDF; default: enmascarado.
- Confirmar `public_base_url` por entorno con ejemplo ficticio.

## Criterios de éxito

- [ ] Emisión exitosa devuelve `pdfDownloadUrl` y no devuelve token completo.
- [ ] QR abre `/certificados/validar/{token}` con URL absoluta configurable.
- [ ] Descarga admin responde PDF con autorización y headers correctos.
- [ ] Error de generación no deja certificado emitido sin PDF.
