# Propuesta: F4-04 — Detalle de curso

## Intención

Evolucionar in-place `/admin/cursos/:id` para que Bedelía consulte fechas y estado de carga de asistencias con paridad igual o mejor que la referencia v0, sin convertir el detalle en un nuevo feature ni simular asociaciones ambiguas.

## Alcance

### Incluido
- Ficha con acento institucional, tabla desktop y tarjetas mobile equivalentes.
- Estado `Pendiente` o cantidad de presentes por fecha; una sola acción contextual `Cargar`/`Ver` hacia la pantalla existente.
- `Agregar fecha` enlazado al editor existente `/admin/cursos/:id/editar`, incluido el estado vacío.
- Seams opcionales; métricas asociadas por `cursoId` y contrato real cuando el modelo lo permita. Sin inferir certificaciones por nombre.
- Recarga reactiva con `effect()` y guard de generación contra respuestas obsoletas.
- Un único resumen accesible `aria-live="polite"` para carga, error y conteos.

### Fuera de alcance
- Backend, HTTP, `X-Admin-Key`, persistencia browser, rutas nuevas o cambios F5+.
- Alta inline de fechas, gestión de alumnos, emisión/entrega de certificados o asociación por `cursoNombre`.
- Dependencias nuevas, Tailwind o port literal de React/Next.

## Capacidades

### Nuevas capacidades
Ninguna.

### Capacidades modificadas
- `admin-courses-frontend`: enriquecer el detalle responsive con métricas opcionales, navegación existente, estados accesibles y paridad v0 verificable.

## Enfoque

Modificar solo `course-detail-page.{ts,html,css,spec.ts}`. Mantener `COURSES_SOURCE`; consumir seams disponibles con inyección opcional, aislamiento de fallos y fallback honrado `—`/`0`. No crear acoplamiento entre features. Si certificaciones carecen de `cursoId`, diferir esa métrica al contrato correspondiente.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.*` | Modificada | UI, carga reactiva y tests |
| `openspec/specs/admin-courses-frontend/spec.md` | Modificada | Delta funcional F4-04 |
| `docs/frontend/` | Handoff | Actualización durante archivo |

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Datos obsoletos | Media | `effect()` + generación |
| Métrica engañosa | Media | Solo `cursoId`; fallback rotulado |
| Regresión responsive/a11y | Media | Tests y capturas desktop/mobile |

## Plan de reversión

Revertir los cuatro archivos de la página y el delta; la ruta y servicios existentes permanecen intactos.

## Dependencias y handoffs

- Reutiliza editor y marcado de asistencia existentes.
- Certificaciones por `cursoId`, integración backend y acciones F5+ quedan para ciclos posteriores.

## Criterios de éxito

- [ ] Tabla desktop y tarjetas mobile ofrecen contenido y acciones equivalentes.
- [ ] Paridad visual igual o mejor que `muestra_pagina/components/admin/curso-detalle.tsx`, verificada con capturas.
- [ ] Un único resumen `aria-live`; tabla, tarjetas, foco y estados son accesibles.
- [ ] Sin DNI completo, email, token, UUID, legajo, matrícula, datos reales, red ni secretos.
- [ ] Seams ausentes/fallidos no rompen la página ni inventan asociaciones.
- [ ] Tests de componente y build Angular pasan; PR único bajo presupuesto 4000.
