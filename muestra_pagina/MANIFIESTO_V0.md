# Manifiesto V0 — referencia visual de muestra_pagina/

Fecha de actualización: 2026-07-01.

## Origen

Exportación v0 generada como referencia visual para el port a Angular 20 del módulo `/certificados/`. No es código de producto.

## Stack de la referencia

Next.js/React con App Router, Tailwind y shadcn/ui. Se usa solo como referencia; el producto usa Angular 20.

## Pantallas incluidas

| Prompt | Ruta v0 | Pantalla | Componentes clave |
|---:|---|---|---|
| 4 | `app/page.tsx` | Validación pública válida | `components/validacion/folio-certificado`, `header-institucional`, `footer-institucional`, `bloque-trazabilidad`, `acciones` |
| 5 | `app/estados/page.tsx` | Estados no exitosos (revocada, no encontrada, error) | `components/validacion/estado-revocada`, `estado-no-encontrada`, `estado-error` |
| 6 | `app/admin/dashboard/page.tsx` | Dashboard administrativo | `components/admin/admin-shell`, `resumen-operativo`, `bandeja-pendientes`, `actividad-reciente`, `acciones-principales`, `sidebar-admin` |
| 7 | `app/admin/login/page.tsx` | Login administrativo (mock visual) | `components/admin/login-form` |
| 8 | `app/admin/cursos/*`, `app/admin/cursos/[id]/editar` | Crear/editar curso con fechas | `components/admin/curso-editor`, `curso-detalle`, `lista-cursos` |
| 9 | `app/admin/cursos/[id]/asistencias` | Registrar asistencias presentes | `components/admin/asistencias-editor` |
| 10 | `app/admin/certificaciones/nueva` | Emitir certificación directa | `components/admin/nueva-certificacion-editor`, `expediente-certificacion` |
| 11 | `app/admin/certificaciones/[id]` | Detalle de certificación | `components/admin/expediente-certificacion`, `vista-previa-pdf` |
| 12 | `app/admin/certificaciones/[id]/pdf` | Vista previa PDF | `components/admin/vista-previa-pdf` |
| 13 | `app/admin/cursos/page.tsx` | Listado de cursos | `components/admin/lista-cursos` |
| 14 | `app/admin/cursos/[id]/page.tsx` | Detalle de curso | `components/admin/curso-detalle` |
| 15 | `app/admin/certificaciones/page.tsx` | Listado de certificaciones | `components/admin/lista-certificaciones` |
| 16 | `app/admin/alumnos/page.tsx` | Listado de alumnos | `components/admin/lista-alumnos` |
| 17 | `app/admin/alumnos/[id]/page.tsx` | Detalle administrativo de alumno | `components/admin/alumno-detalle` |

## Capturas disponibles

`capturas/` contiene evidencia visual de las pantallas en desktop y mobile (375/390), incluyendo estados de carga, error, revocada, no encontrada, PDF, entrega manual y flujos administrativos.

## Rutas conceptuales cubiertas

- `/` — validación pública válida.
- `/estados` — estados públicos no exitosos.
- `/admin/dashboard` — dashboard administrativo.
- `/admin/login` — login admin (mock).
- `/admin/cursos` — listado de cursos.
- `/admin/cursos/nuevo`, `/admin/cursos/[id]/editar` — alta/edición de curso con fechas.
- `/admin/cursos/[id]/asistencias` — registro de asistencias.
- `/admin/certificaciones` — listado de certificaciones.
- `/admin/certificaciones/nueva` — emisión directa.
- `/admin/certificaciones/[id]` — detalle de certificación.
- `/admin/certificaciones/[id]/pdf` — vista previa PDF.
- `/admin/alumnos` — listado de alumnos.
- `/admin/alumnos/[id]` — detalle de alumno.

## Alineación con decisiones D0

| Decisión D0 | Estado en v0 | Observación |
|---|---|---|
| QR/token permanente | Pendiente de validar en cada pantalla de entrega manual | Las pantallas de entrega manual deben decir "mismo QR"; si v0 muestra rotación o reenvío por email, no portar esos comportamientos. La entrega es manual: copiar link / descargar PDF. |
| DNI completo en validación pública | Pendiente de validar | `folio-certificado.tsx` debe mostrar DNI completo; si v0 lo enmascara, prevalece la decisión D0. |
| Certificado de curso con fechas asistidas | Pendiente de validar | El folio y el PDF deben mostrar fechas asistidas del curso. |
| Auth admin simple temporal | Mock visual en `login-form.tsx` | No portar credenciales demo; el producto usa `X-Admin-Key`. |
| Firmantes PDF: Rector/a y Asesor/a Pedagógica | Pendiente de validar | `vista-previa-pdf` debe incluirlos vía configuración institucional. |

## Qué NO copiar literalmente

- Componentes React/Next, hooks, App Router, JSX.
- Tokens de Tailwind/shadcn sin convertir a criterios visuales Angular.
- Credenciales demo de `login-form.tsx`.
- Comportamiento de rotación de QR si aparece en pantallas de entrega manual.
- Reenvío por email, SMTP o PHPMailer: no existen en el MVP. La entrega es manual (copiar link / descargar PDF).
- DNI enmascarado si aparece en validación pública (prevalece D0: DNI completo).

## Pantallas pendientes

Las pantallas de prompts 18-22 (entrega manual, revocación, carga masiva, auditoría, configuración institucional) no tienen referencia v0 dedicada todavía o se cubren parcialmente en componentes admin existentes. Ver `MATIAS_PROMPTS_SDD_FASE2.md` para la planificación de F4-F6.