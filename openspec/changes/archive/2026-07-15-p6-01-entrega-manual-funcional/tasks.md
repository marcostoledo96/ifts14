# Tasks: P6-01 — Entrega Manual Funcional

**Review Workload Forecast**: ~180 líneas, ~10 archivos. Bajo la cuota de 1000. PR única.

## Tasks

### T1: Agregar EntregaManualDto (CRITICAL)
- [x] `certifications.models.ts`: nueva interface con `certificadoId`, `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`, `pdfAvailable`, `pdfStatus`

### T2: Extender CertificationsService (CRITICAL)
- [x] `certifications.service.ts`: agregar `obtenerEntregaManual(id: number): Promise<EntregaManualDto>`
- [x] `http-certifications.service.ts`: implementar `GET /admin/certificados/{id}/entrega-manual`
- [x] `in-memory-certifications.service.ts`: mock con datos de seed existentes

### T3: Actualizar CertificationDeliveryPage (CRITICAL)
- [x] `certification-delivery-page.ts`:
  - ngOnInit: llamar `obtenerEntregaManual(id)` → guardar DTO
  - Mostrar `publicValidationUrl` del DTO (no hardcodeada)
  - Copiar link: `navigator.clipboard` + fallback `document.execCommand`
  - Descargar QR: fetch `qr.png` → Blob → `URL.createObjectURL` → download
  - PDF outdated: si `pdfStatus === 'outdated'`, mostrar alert + botón "Volver a generar"

### T4: Actualizar template delivery (HIGH)
- [x] `certification-delivery-page.html`:
  - Binding a `entrega?.publicValidationUrl`
  - Botón "Copiar link" con feedback "Copiado ✓"
  - Botón "Descargar QR" con handler
  - Alert condicional para PDF desactualizado
  - Botón "Volver a generar PDF"

### T5: Habilitar botón en preview (HIGH)
- [x] `certification-preview-page.html`: quitar `disabled` y `aria-disabled` del botón "Entrega manual"

### T6: Tests (HIGH)
- [x] `certification-delivery-page.spec.ts`: tests con `HttpTestingController`, mock clipboard, mock Blob
- [x] `certification-preview-page.spec.ts`: verificar botón habilitado

### T7: Ejecutar tests
- [x] `npm run test:ci` — todos los tests deben pasar

## Dependencias

```
T1 → T2 → T3 → T4 → T7
T3 → T6
T5 independiente
```

## Estimación

~180 líneas netas. 10 archivos (7 mod, 0 nuevos, 0 elim).
