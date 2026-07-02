# Propuesta: entrega manual de certificados

## Intención

Reemplazar la entrega automática por email por un flujo manual de Bedelía: el sistema emite el certificado, conserva el QR/token permanente y devuelve link público/PDF para envío externo.

## Alcance

### Incluido
- Eliminar email activo: sin SMTP, PHPMailer, transporte `stub|smtp` ni `/reenviar` automático.
- Ampliar `POST /certificados/api/admin/certificados`: devuelve `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`; nunca token completo.
- Agregar `GET /certificados/api/admin/certificados/{id}/entrega-manual`: admin-only, lectura, sin email ni rotación; devuelve link/PDF.
- Guardar recuperabilidad segura: `token_hash`, `token_prefijo`, `token_cifrado` o equivalente; clave externa a Git.
- Mantener TCPDF; el QR apunta al link público permanente.
- Actualizar docs, specs y prompts frontend afectados.

### Fuera de alcance
- Login real, SMTP, proveedores externos, adjuntos, `vendor/` versionado, datos reales o dumps.
- Regeneración automática de certificados existentes sin `token_cifrado`.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `admin-certificate-delivery`: pasa de reenvío por email a entrega manual de link/PDF.
- `backend-contrato-api-certificados`: cambia DTO de emisión y reemplaza `/reenviar`.
- `backend-modelo-datos-certificados`: exige token recuperable cifrado, no texto plano.
- `certificate-pdf-qr-generation`: mantiene QR permanente y descarga administrativa.
- `admin-certificate-emission`: respuesta incluye link público, PDF y prefijo seguro.
- `actualizar-plan-matias-v0`: prompt 18 debe hablar de copiar link/descargar PDF.

## Enfoque

Usar token cifrado con AES-256-GCM o equivalente seguro, clave externa, endpoint manual de solo lectura y eliminación del transporte de email. Certificados ya emitidos sin token cifrado solo podrán descargar PDF existente; no podrán reconstruir `publicValidationUrl` sin regeneración auditada explícita.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/backend-php/` | Modificado | Rutas, servicio, config, tests y dependencias email. |
| `database/migrations/` | Modificado | Agregar `token_cifrado` o migración nueva si `001` ya fue aplicada. |
| `docs/`, `openspec/specs/`, `MATIAS_PROMPTS_SDD_FASE2.md` | Modificado | Contrato manual y copia UI. |

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Pérdida de clave de cifrado | Media | Documentar generación, ubicación externa y backup operativo. |
| Certificados viejos sin token | Alta | Limitar respuesta; no regenerar salvo decisión auditada. |
| UI/prompts siguen diciendo “reenviar” | Media | Actualizar prompts y docs en `archive`. |

## Plan de reversión

Revertir rutas/servicios manuales y deltas documentales. Conservar `token_hash`, `token_prefijo`, `token_cifrado` y PDFs; no reactivar SMTP/PHPMailer sin ciclo SDD nuevo.

## Dependencias

- Clave de cifrado externa a Git.
- Confirmar si `001_certificados_qr.sql` ya fue desplegada: `ALTER` o migración `002`.

## Criterios de éxito

- [ ] No existe flujo activo de email ni `/reenviar`.
- [ ] Emisión y entrega manual devuelven link/PDF sin token completo.
- [ ] El QR conserva el token permanente.
- [ ] Certificados sin `token_cifrado` tienen comportamiento limitado y documentado.
