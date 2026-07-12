# Propuesta: Corregir fechas y estados en F4-02

## Intención

Corregir dos desvíos de F4-02: resume `attendedDates` como período y solo identifica la revocación. Debe mostrar fechas exactas y advertir todo estado no vigente sin impedir imprimir.

## Alcance

### Incluido
- Renderizar cada `attendedDates` exacta dentro del certificado, sin resumir mes/año.
- Mostrar marca y banda textual `BORRADOR`, `VENCIDO` o `REVOCADO`; `vigente` queda limpio.
- Mantener una página A4 apaisada, sin clipping ni chrome administrativo.
- Extender tests y checker Angular real para ids `1`, `3`, `4` y `5`, incluyendo privacidad.
- Actualizar spec y documentación F4-02.

### Excluido
- Bloquear impresión según estado.
- Cambiar DTO, backend, API, persistencia, auth, QR/token o rutas.
- Agregar dependencias o generar PDF/QR real.
- Alterar F4-01 o evidencia OpenSpec archivada.

## Capacidades

### Nuevas capacidades

Ninguna.

### Capacidades modificadas
- `admin-certifications-frontend`: listar fechas exactas e identificar todo estado no vigente, preservando impresión y privacidad.

## Enfoque

Aplicar el enfoque A: eliminar `periodo()`, renderizar el array existente y generalizar las clases de revocación a una marca/banda base con variantes. Reutilizar las reglas de impresión verificadas. Adaptar el checker real dentro del cambio activo, sin reescribir evidencia archivada.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/.../pages/pdf/certification-pdf-preview-page.{ts,html,css,spec.ts}` | Modificado | Fechas, marcas y tests. |
| `apps/frontend-angular/.../certifications/__checks__/` | Modificado | Privacidad y secretos para cuatro estados. |
| `openspec/changes/f4-02-codex-feedback/evidence/print-app-check.mjs` | Nuevo | Checker real por id. |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modificado al archivar | Contrato funcional actualizado mediante delta. |
| `docs/frontend/F4-02-vista-previa-pdf.md` | Modificado al archivar | Comportamiento y evidencia. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Fechas adicionales generan clipping o más páginas | Media | Checker real para ids 1/3/4/5 y conservación de reglas print. |
| Variantes duplican CSS o superan budget | Baja | Base compartida y solo modificadores de color/texto. |
| Nueva UI expone datos prohibidos | Baja | Checks DOM de privacidad y secretos por caso. |

## Plan de reversión

Revertir el delta de template, helper y estilos junto con sus tests/checker; restaurar `periodo()` y las clases exclusivas de revocación. No requiere migración ni rollback de datos.

## Dependencias

- Datos mock y reglas print existentes; sin dependencias nuevas.

## Criterios de éxito

- [ ] Los ids 1/3/4/5 muestran todas sus fechas ISO exactas y nunca “dictado entre”.
- [ ] Solo id 1 queda limpio; ids 3/4/5 muestran marca y banda correctas.
- [ ] Cada caso imprime una sola página A4, sin clipping, chrome ni datos prohibidos.
- [ ] Tests/checks y build Angular finalizan correctamente sin cambios de DTO/backend/dependencias.
