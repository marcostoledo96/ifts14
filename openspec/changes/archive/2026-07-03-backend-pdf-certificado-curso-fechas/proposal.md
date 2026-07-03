# Propuesta: PDF institucional de certificado de curso con fechas y firmantes

## Intención

Convertir el PDF emitido por backend en un certificado institucional: debe usar configuración existente, mostrar firmantes, texto institucional y fechas certificadas del snapshot, sin cambiar el flujo de emisión, descarga, entrega manual ni QR/token permanente.

## Alcance

### Incluido
- Leer `cert_configuracion_institucional` durante la emisión.
- Renderizar nombre institucional, texto certificado, rector/a, asesor/a pedagógica y fechas desde `cert_certificado_fechas`.
- Mantener valores seguros por defecto si falta la fila de configuración.
- Ajustar pruebas procedurales backend para asegurar generación PDF y no regresión de emisión/descarga/entrega manual.

### Excluido
- API para editar configuración institucional.
- SMTP, email, reenvío automático o `/reenviar`.
- Frontend, migraciones y assets nuevos de logo/escudo.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `certificate-pdf-qr-generation`: el PDF debe incorporar configuración institucional, firmantes y texto configurable con fallback seguro.
- `admin-certificate-emission`: la emisión debe alimentar el PDF con configuración institucional sin alterar el DTO ni rotar token.

## Enfoque

Aplicar el mínimo viable recomendado: `AdminCertificateService::emitir()` lee una única configuración institucional existente y pasa un DTO simple a `CertificatePdfService::generate()`. El PDF usa el snapshot ya persistido de fechas; si falta configuración, usa textos genéricos seguros. No se toca `index.php` ni contratos HTTP.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/backend-php/src/AdminCertificateService.php` | Modificado | Lectura de configuración institucional existente. |
| `apps/backend-php/src/CertificatePdfService.php` | Modificado | Layout y contenido institucional del PDF. |
| `apps/backend-php/tests/` | Modificado | Checks de emisión/PDF sin regresión. |
| `docs/backend/`, `openspec/specs/` | Modificado | Sincronización en `sdd-archive`. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| PDF binario difícil de afirmar por texto | Media | Verificar generación, persistencia y datos enviados al render. |
| Configuración ausente | Media | Fallback seguro sin abortar emisión. |
| Alcance crece hacia API admin | Media | Dejar edición de configuración fuera de este ciclo. |

## Plan de reversión

Revertir cambios en los dos servicios PHP y pruebas asociadas. Los PDFs ya generados pueden conservarse como artefactos; certificados, tokens permanentes, snapshots y rutas administrativas no se invalidan.

## Dependencias

- Tabla existente `cert_configuracion_institucional` de migración `003`.
- TCPDF/Composer disponible según gate operativo vigente.

## Criterios de éxito

- [ ] Un certificado emitido genera PDF institucional con firmantes, texto y fechas snapshot.
- [ ] La ausencia de configuración no rompe la emisión.
- [ ] No cambian emisión, descarga PDF, entrega manual ni QR/token permanente.
