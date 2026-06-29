# Frontend Angular 20 — port desde `muestra_pagina/`

Este documento es la fuente de verdad para portar a Angular 20 la referencia visual v0 del módulo `/certificados/`.

## Estado de referencia

`muestra_pagina/` contiene una referencia v0 utilizable generada en Next.js/React, con código fuente exportado y capturas para los prompts 4-10. Se usa solo como referencia visual y funcional: no se copian componentes, rutas, hooks ni estilos literalmente.

| Estado | Cantidad | Uso |
|---|---:|---|
| Pantallas disponibles | 7 | Base visual para prompts 4-10. |
| Pantallas pendientes | 12 | Planificadas en `MATIAS_PROMPTS_SDD_FASE2.md`. |

La carpeta también debe incluir `muestra_pagina/MANIFIESTO_V0.md` para declarar origen, alcance, pantallas incluidas, capturas disponibles y pendientes antes de portar o auditar la referencia.

## División de responsabilidades frontend

| Responsable | Ramas/ciclos | Alcance |
|---|---|---|
| Marcos | `frontend/angular-shell` (`F1-03`..`F1-05`), `frontend/public-validation-flow` (`F2-01`, `F2-02`), `frontend/api-readiness` (`F3-01`, `F3-02`, `F3-05`) | Fundación Angular, estructura semántica/accesible, validación pública con mocks ficticios, frontera de servicios y build `/certificados/`. No define el diseño visual final. |
| Matías | `frontend/v0-design-system` (`F1-01`, `F1-02`), admin (`F2-03`..`F2-06`), QA/handoff (`F3-03`, `F3-04`, `F3-06`) y F4-F6 salvo nuevo acuerdo | Sistema visual desde v0, UI/UX final, admin, responsive, accesibilidad, QA visual y handoff. |

Secuencia de desbloqueo: Marcos puede iniciar `frontend/angular-shell`; Matías trabaja `frontend/v0-design-system`; Marcos avanza `frontend/public-validation-flow`; Matías aplica sistema visual y admin; Marcos formaliza `frontend/api-readiness`; Matías cierra QA/handoff. Coordinar cambios en archivos globales Angular antes de editar `angular.json`, `package.json`, estilos globales o rutas raíz.

## Inventario disponible en v0

| Prompt | Pantalla/flujo | Referencia v0 |
|---:|---|---|
| 4 | Validación pública válida | `app/page.tsx`, `components/validacion/*` |
| 5 | Estados públicos no exitosos | `app/estados/page.tsx`, `components/validacion/estado-*` |
| 6 | Dashboard administrativo | `app/admin/dashboard/page.tsx`, `components/admin/*` |
| 7 | Login administrativo | `app/admin/login/page.tsx`, `components/admin/login-form.tsx` |
| 8 | Crear/editar curso con fechas | `app/admin/cursos/nuevo/page.tsx`, `app/admin/cursos/[id]/editar/page.tsx`, `components/admin/curso-editor.tsx` |
| 9 | Registrar asistencias presentes | `app/admin/cursos/[id]/asistencias/page.tsx`, `components/admin/asistencias-editor.tsx` |
| 10 | Emitir certificación directa | `app/admin/certificaciones/nueva/page.tsx`, `components/admin/nueva-certificacion-editor.tsx` |

## Inventario pendiente

| Prompt | Pendiente | Complejidad | Regla antes de implementar |
|---:|---|---|---|
| 11 | Detalle de certificación | Alta | Spec previa por PDF, QR, historial y revocación. |
| 12 | Vista previa PDF complementario | Alta | Spec previa de PDF y diseño aprobado. |
| 13 | Listado de cursos | Media | Contrato de datos o mocks explícitos. |
| 14 | Detalle de curso | Media | Contrato de curso, fechas y asistencias. |
| 15 | Listado de certificaciones | Media | Contrato de filtros, estados y paginación. |
| 16 | Listado de alumnos | Media | Cuidado con datos personales. |
| 17 | Detalle de alumno administrativo | Media | Spec previa de datos visibles. |
| 18 | Enviar/reenviar certificación | Baja | Contrato de envío aprobado. |
| 19 | Revocar certificación | Baja | Spec de permisos y estado irreversible. |
| 20 | Carga masiva placeholder | Baja | Alcance placeholder, sin importación real. |
| 21 | Auditoría básica | Media | Contrato de eventos y permisos. |
| 22 | Configuración institucional | Alta | Configuración aprobada; no usar datos reales sensibles. |

## Tokens visuales observados

| Aspecto | Criterio portable a Angular |
|---|---|
| Paleta | Base institucional sobria, fondos claros, contraste alto, acentos controlados para estados. |
| Tipografía | Sans-serif legible para UI; monoespaciada solo para códigos, tokens abreviados o trazabilidad. |
| Layout público | Composición tipo folio/certificado, jerarquía clara y lectura vertical cómoda. |
| Layout admin | Shell administrativo con navegación simple, acciones principales visibles y tablas/listas legibles. |
| Espaciado | Aire suficiente entre bloques; evitar tarjetas anidadas sin necesidad. |
| Estados | Diferenciar válido, revocado, no encontrado y error técnico sin lenguaje ambiguo. |

## Componentes candidatos

| Componente Angular futuro | Responsabilidad |
|---|---|
| `HeaderInstitucional` | Identidad del IFTS 14, contexto del módulo y navegación mínima. |
| `FolioCertificado` | Presentación pública del certificado o constancia verificable. |
| `BloqueTrazabilidad` | Fecha, curso, estado y metadatos no sensibles. |
| `AdminShell` | Estructura común de administración. |
| `AccionesPrincipales` | Acciones primarias y secundarias consistentes. |
| `BandejaPendientes` | Resumen de tareas administrativas pendientes. |
| `EstadoValidacion` | Válido, revocado, no encontrado y error técnico. |

## Reglas de portado

- Extraer intención visual, no código React/Next.
- Implementar componentes Angular propios bajo `apps/frontend-angular/` cuando el ciclo SDD lo apruebe.
- No inventar contratos API, PDF, QR, permisos ni configuración institucional.
- En validación pública, usar DNI enmascarado y no exponer tokens completos ni datos reales.
- En contextos privados o de entrega al estudiante, el certificado enviado o mostrado puede requerir DNI completo; esa decisión debe quedar especificada fuera de la respuesta pública de validación.
- Si la referencia v0 muestra DNI completo en un contexto público, no portarlo: prevalece el contrato de validación pública con documento enmascarado.
- Usar mocks solo si el ciclo los declara explícitamente.
- Priorizar foco visible, navegación por teclado, responsive y contraste.
- No instalar dependencias visuales sin decisión documentada.

## Riesgos de portado

| Riesgo | Mitigación |
|---|---|
| Copiar JSX, hooks o App Router | Reescribir en Angular con componentes, routing y servicios propios. |
| Tokens de Tailwind/shadcn no trasladables | Convertirlos en criterios visuales o Tailwind aprobado para Angular, no en copia literal. |
| Scope creep en PDF, QR o revocación | Exigir spec previa antes de implementar. |
| Datos personales en pantallas admin | Minimizar exposición y usar mocks seguros. |
| Referencia v0 cambia mientras se porta | Revisar `muestra_pagina/README.md` al iniciar cada ciclo. |

## Build para cPanel

Cuando exista aplicación Angular real y el ciclo lo indique:

```bash
ng build --configuration production --base-href /certificados/
```

No desplegar ni copiar artefactos a cPanel desde OpenCode.

## Estado de la app Angular 20 (ciclo `frontend-angular-shell-public-validation-api-readiness`)

App creada en `apps/frontend-angular/` con Angular CLI 20.3.30 standalone. Desplegable bajo `/certificados/`. Shell semántico + página pública con `resource()` (tres bloques: `valid` / `not-verifiable` / `technical-error`, `aria-live="polite"`). Verificación: 35/35 tests, build prod verde (252.97 kB initial / 71.88 kB transfer, lazy 3.88 kB). Requiere `export PATH="$HOME/.local/bin:$PATH"`.

### Estructura técnica

`angular.json`: `baseHref: "/certificados/"` en `production` y `development` (presupuestos 500 kB warn / 1 MB error), `index` explícito y salida plana para cPanel. `environments/environment{,.development}.ts`: prod `useMockApi: false` (HTTP real), dev `useMockApi: true` (mock). `app.config.ts`: `provideRouter` + `withComponentInputBinding` + `provideHttpClient()` + `VALIDATION_SOURCE` seleccionado por `environment.useMockApi`. `app.routes.ts`: `''` carga landing sin validación, `validar/:tokenCertificacion` carga la validación pública, `**` carga página no encontrada sin validar tokens. `app.ts`: shell `header[role=banner]` / `main#contenido` / `footer` con skip link.

### Shared certificates

`dto.ts` (DTOs del contrato PHP, sin DNI completo/hash/pepper/tablas), `validation-source.ts` (interfaz + InjectionToken, frontera reemplazable), `mock-tokens.ts` (`MockValidationSource` + tokens `demo-valido|revocado|expirado|inexistente|error-tecnico`), `http-validation.source.ts` (`HttpValidationSource` con `HttpClient` + `firstValueFrom`, URL `/certificados/api/certificados/{token}/verificacion`), `result-mapper.ts` (404/revocado/expirado/inexistente → `not-verifiable`; 5xx/red/JSON → `technical-error`), `validation.service.ts` (`verify(token)` consume `VALIDATION_SOURCE`; sin cambios al swap).

### Límites de UI final

Base técnica, no diseño visual final. Diseño visual corresponde a Matías (F1-01/F1-02). Admin, PDF, QR, reenvío y configuración institucional quedan fuera de este ciclo.

## Contrato API esperado

Cuando exista integración real:

- ruta pública conceptual: `/certificados/validar/:tokenCertificacion`;
- endpoint esperado: `/certificados/api/certificados/{token}/verificacion`;
- `404 CERTIFICATE_NOT_FOUND` se muestra como certificado no verificable, no como error técnico;
- la UI pública no debe pedir DNI completo para validar un certificado;
- la respuesta pública debe usar DNI enmascarado; la entrega privada o estudiantil del certificado puede requerir DNI completo según spec aprobada;
- los modelos TypeScript futuros deben respetar `docs/backend/01-contrato-api-certificados.md`.
