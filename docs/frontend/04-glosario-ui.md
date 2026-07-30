# Glosario UI — etiquetas visibles

Canon breve de copy hacia Bedelía y superficies públicas del módulo `/certificados/`. Español argentino formal. API/DTO/filtros pueden seguir `vigente` / `revocado`; este glosario rige **solo** strings visibles.

## Certificación (admin)

| Modelo / API | Label / badge visible |
|---|---|
| `vigente` | **Válida** (plural en mensajes: **válidas**) |
| `revocado` | **Revocado** (no «Revocada») |

## Curso (listado)

| Concepto | Label visible |
|---|---|
| Curso habilitado | **Activo** |
| Curso deshabilitado | **Inactivo** |

> **DEFER:** chips Activo/Inactivo del hub de asistencias quedan fuera de U3 (riesgo de drift con el patrón 4-chips).

## Fecha de curso

| Concepto | Label visible |
|---|---|
| Fecha futura / planificada | **Programada** |
| Fecha ya cursada | **Realizada** |

## Pantallas y operaciones

| Concepto | Label visible |
|---|---|
| Detalle de una certificación (`/admin/certificaciones/:id`) | **Expediente** |
| Copiar link / QR / PDF sin rotar token | **Entrega manual** |
| Campo DNI completo en ficha admin (valor `documentMasked`, política D0) | **Documento** (no «Documento (mascarado)»; no forzar label «DNI») |

## Público ≠ admin

El chrome de validación pública usa **VÁLIDO** / **REVOCADO** (folio ceremonial). Misma semántica que admin **Válida** / **Revocado**, superficie distinta: **no** forzar paridad literal ni rediseñar el folio.

## Fuera de alcance de este glosario

- Soft-errors / vacíos (U5).
- Copy operativo de dominio que nombra el estado de API en diálogos (p. ej. comparaciones `estado === 'vigente'`).
- Usos de «vigente» no-estado (p. ej. «configuración institucional vigente»).
