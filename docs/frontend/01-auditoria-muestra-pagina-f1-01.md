# Auditoría de `muestra_pagina/` — F1-01

> **Actualización posterior.** `muestra_pagina/` fue reemplazada por el export v0 final y completo (flujos 4-22). El estado "7 pantallas disponibles / 12 pendientes" de esta auditoría corresponde al momento del ciclo F1-01 y quedó superado; el inventario vigente está en `docs/frontend/00-angular20-port-v0.md` y los flujos 11-22 se ejecutan con los ciclos F4-F6 de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`. El `MANIFIESTO_V0.md`, `README.md` y `AGENTS.md` de `muestra_pagina/` fueron retirados al reemplazar la carpeta. El cuerpo de abajo se conserva como registro histórico del ciclo.

## 1. Resumen ejecutivo

En el momento del ciclo F1-01, la referencia visual v0 en `muestra_pagina/` contenía prompts 4-10 disponibles y prompts 11-22 pendientes. Ese estado quedó superado por el export final completo. Este registro no genera código de producto ni modifica `apps/frontend-angular/`; solo conserva evidencia histórica.

## 2. Estado de `muestra_pagina/`

Estructura real relevada (solo nombres, sin abrir contenido):

- 5 directorios: `app/`, `capturas/`, `components/`, `lib/`, `public/`.
- 11 archivos en raíz: `.gitignore`, `AGENTS.md`, `components.json`, `MANIFIESTO_V0.md`, `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `postcss.config.mjs`, `prompts_stitch_v0_ifts14.md`, `README.md`, `tsconfig.json`.
- 25 capturas PNG en `capturas/` (el informe de exploración asumía 26; el conteo real es 25).

Source of truth del inventario: `docs/frontend/00-angular20-port-v0.md` (el `MANIFIESTO_V0.md` de `muestra_pagina/` fue retirado al reemplazar la carpeta por el export final; ver nota de actualización al inicio de este documento).

## 3. Pantallas disponibles en ese momento

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

Los prompts 11-22 no se implementaron en este ciclo. Hoy se ejecutan desde la guía unificada de Matías.

| Prompt | Pendiente | Ciclo actual | Bloqueo obligatorio |
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

- F1-02: construir el sistema visual propio de Angular 20 sobre el scaffold existente, usando las pantallas disponibles en ese momento como referencia.
- F4-F6: abrir ciclos SDD para los prompts 11-22 cuando existan specs y diseños aprobados; los prompts están integrados en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- La decisión final sobre qué pantallas específicas se portan y en qué orden corresponde a ciclos F2+.
- No se aplica patch a `docs/frontend/00-angular20-port-v0.md` en este ciclo: la información existente ya cubre el estado relevado.
