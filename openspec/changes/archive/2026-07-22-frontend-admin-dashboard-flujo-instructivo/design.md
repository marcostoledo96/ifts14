# Design: Instructivo de flujo en dashboard admin

## Decisions

1. **Panel antes de Pendientes** (después de Acciones): misma familia visual `.panel` / filas tipo pendiente.
2. **Una guía** `/admin/guia` con secciones `#cursos`, `#alumnos`, `#asistencias`, `#certificaciones`, `#configuracion`.
3. **Datos estáticos tipados** en el componente (sin API).
4. **CTAs reales** a rutas existentes; copy D0 (QR permanente, DNI completo en UI).

## UI

### Dashboard
- Título: Flujo de trabajo
- Meta: enlace «Ver guía completa» → `/admin/guia`
- 5 filas: número mono, título, frase, «Abrir» → sección

### Guía
- `UiBackLink` → `/admin/dashboard`
- Intro corta + nav de anclas + 5 secciones con pasos y enlace a la sección

## Non-goals
Modal, 5 páginas, localStorage, item sidebar.
