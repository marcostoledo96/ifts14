# Auditoría de `muestra_pagina/` — F1-01

## 1. Resumen ejecutivo

La referencia visual v0 en `muestra_pagina/` contiene **7 pantallas disponibles** (prompts 4-10) y **12 flujos pendientes** (prompts 11-22). Este ciclo no genera código de producto ni modifica `apps/frontend-angular/`; solo verifica el inventario y deja registro en `docs/frontend/` para que F1-02 arranque sobre evidencia confirmada.

## 2. Estado de `muestra_pagina/`

Estructura real relevada (solo nombres, sin abrir contenido):

- 5 directorios: `app/`, `capturas/`, `components/`, `lib/`, `public/`.
- 11 archivos en raíz: `.gitignore`, `AGENTS.md`, `components.json`, `MANIFIESTO_V0.md`, `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `postcss.config.mjs`, `prompts_stitch_v0_ifts14.md`, `README.md`, `tsconfig.json`.
- 25 capturas PNG en `capturas/` (el informe de exploración asumía 26; el conteo real es 25).

Source of truth del inventario: `muestra_pagina/MANIFIESTO_V0.md`.

## 3. Las 7 pantallas disponibles

| Prompt | Pantalla/flujo | Referencia v0 | Estado de portabilidad |
|---|---|---|---|
| 4 | Validación pública válida | `app/page.tsx`, `components/validacion/*` | Listo para portar; v0 puede mostrar DNI enmascarado, pero prevalece D0 (DNI completo en validación pública). |
| 5 | Estados públicos no exitosos | `app/estados/page.tsx`, `components/validacion/estado-*` | Listo; diferenciar válido/revocado/no encontrado/error técnico. |
| 6 | Dashboard administrativo | `app/admin/dashboard/page.tsx`, `components/admin/*` | Listo; ajustar al shell de Marcos. |
| 7 | Login administrativo | `app/admin/login/page.tsx`, `components/admin/login-form.tsx` | Listo; no persistir credenciales reales. |
| 8 | Crear/editar curso con fechas | `app/admin/cursos/nuevo/page.tsx`, `app/admin/cursos/[id]/editar/page.tsx`, `components/admin/curso-editor.tsx` | Listo; validar contrato de curso. |
| 9 | Registrar asistencias presentes | `app/admin/cursos/[id]/asistencias/page.tsx`, `components/admin/asistencias-editor.tsx` | Listo; usar mocks seguros. |
| 10 | Emitir certificación directa | `app/admin/certificaciones/nueva/page.tsx`, `components/admin/nueva-certificacion-editor.tsx` | Listo; no generar PDF/QR sin spec previa. |

## 4. Las 12 pendientes

Los prompts 11-22 no se implementan en Fase 1. Ya están derivados en `MATIAS_PROMPTS_SDD_FASE2.md`.

| Prompt | Pendiente | Bloque Fase 2 | Bloqueo obligatorio |
|---|---|---|---|
| 11 | Detalle de certificación | F4 | Spec previa si incluye historial, QR o revocación real. |
| 12 | Vista previa PDF complementario | F4 | Spec previa de PDF, layout y datos permitidos. |
| 13 | Listado de cursos | F4 | Contrato o mocks explícitos. |
| 14 | Detalle de curso | F4 | Contrato de curso, fechas y asistencias. |
| 15 | Listado de certificaciones | F5 | Contrato de filtros, estados y paginación. |
| 16 | Listado de alumnos | F5 | Definir datos visibles; DNI completo solo si spec lo exige en contexto privado/administrativo. |
| 17 | Detalle de alumno administrativo | F5 | Spec previa de datos personales permitidos. |
| 18 | Entrega manual de certificación | F5 | MVP sin email: copiar link / descargar PDF. |
| 19 | Revocar certificación | F6 | Spec de permisos, confirmación y efecto irreversible. |
| 20 | Carga masiva placeholder | F6 | Alcance placeholder; sin importación real. |
| 21 | Auditoría básica | F6 | Contrato de eventos y permisos. |
| 22 | Configuración institucional | F6 | Configuración aprobada; sin datos reales sensibles. |

## 5. Diseño visual vs código fuente exportado

Esta auditoría es de referencia visual. Las capturas y el `MANIFIESTO_V0.md` definen composición, paleta, tipografía, espaciados y estados. El código exportado en `app/`, `components/`, `lib/`, `tsconfig.json` y `next.config.mjs` es Next.js/React; no se copia literalmente a `apps/frontend-angular/`. El trabajo de portado debe extraer la intención visual y reescribirla en componentes Angular 20 propios, con accesibilidad, responsive y rendimiento mejorados.

## 6. Riesgos para portar a Angular 20

El scaffold de Marcos en `apps/frontend-angular/` está verificado: 35/35 tests y build de producción verde. Los principales riesgos para el portado visual son:

- **Traducción de rutas**: App Router de Next.js no es 1:1 con Angular standalone routing.
- **Componentes propios**: hay que reescribir los componentes de `components/` en Angular, no reutilizar JSX.
- **Lockfile incompatible**: `pnpm-lock.yaml` de v0 no aplica al proyecto Angular; no instalar dependencias desde `muestra_pagina/`.
- **Capturas no etiquetadas por prompt**: 25 PNG sin metadato que las vincule directamente a cada prompt; requiere mapeo manual.
- **Tokens de Tailwind/shadcn**: si v0 usa tokens no aprobados para Angular, hay que convertirlos a criterios visuales del sistema de Matías.
- **Datos personales**: la validación pública muestra DNI completo por decisión D0; logs, auditoría, errores y respuestas administrativas no exponen DNI completo. Si v0 lo enmascara, prevalece D0; no portar capturas con datos reales de personas.
- **Scope creep**: prompts 11-22 requieren spec, PDF, QR, permisos, auditoría o configuración previa; no implementarlos en Fase 1.

## 7. Próximos pasos

- F1-02: construir el sistema visual propio de Angular 20 sobre el scaffold existente, usando las 7 pantallas disponibles como referencia.
- F4-F6: abrir ciclos SDD para los prompts 11-22 cuando existan specs y diseños aprobados; `MATIAS_PROMPTS_SDD_FASE2.md` ya tiene los prompts listados.
- La decisión final sobre qué pantallas específicas se portan y en qué orden corresponde a ciclos F2+.
- No se aplica patch a `docs/frontend/00-angular20-port-v0.md` en este ciclo: la información existente ya cubre el estado relevado.
