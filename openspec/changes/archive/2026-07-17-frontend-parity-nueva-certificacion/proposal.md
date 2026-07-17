# Proposal: Paridad nueva certificación (P-11)

## Intent

Acercar Angular `certification-new-page` al editor documental v0 `nueva-certificacion-editor.tsx`: selección alumno/curso, preview (declaración, asistencia, firmas, trazabilidad), CTA Emitir, estados loading/sin fechas/check — sin wizard de 3 pasos ni campos de API inventados.

## Scope

### In Scope
- Layout v0: header, bloque selección, preview documental + aside resumen sticky
- Combobox alumno (búsqueda local sobre catálogo activo) + select curso + ciclo lectivo (`cuatrimestre`)
- Preview: banda ink, declaración, tabla presentes, autoridades tipográficas, bloque trazabilidad honesto
- Skeleton loading al resolver el par; avisos bloqueantes/warning; CTA Emitir/Cancelar
- Tests de página + locks de honestidad (sin folio/número pre-emisión)

### Out of Scope
- Wizard 3 pasos; inventar folio/código/QR real pre-emisión
- Upload logos/firmas; email SMTP; cambiar contrato `emitir`
- Backend/DB; dependencia lucide npm

## Approach

Calcar estructura/CSS de v0 en Angular 20 con seams existentes (`STUDENTS_SOURCE`, `COURSES_SOURCE`, `ATTENDANCE_SOURCE`, `INSTITUTIONAL_CONFIG_SOURCE`, `CERTIFICATIONS_SOURCE`). Preview presentacional; QR decorativo con nota de generación al emitir.

## Risks

| Risk | Mitigation |
|------|------------|
| Spec emit exige sin folio pre-emisión | Mantener REQ-EMIT-005; UI muestra “Se asigna al emitir” |
| DNI completo admin | Seguir `dniMostrar` |
| Firmas leídas como archivo digital | Badge “Configuración institucional”; sin claim de firma criptográfica |

## Ready for Spec

Yes.
