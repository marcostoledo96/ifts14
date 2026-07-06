# Frontend Angular 20 — port desde `muestra_pagina/`

Este documento es la fuente de verdad para portar a Angular 20 la referencia visual v0 del módulo `/certificados/`.

## Estado de referencia

`muestra_pagina/` contiene la referencia visual v0 final y completa generada en Next.js/React, con código fuente exportado y capturas para todos los flujos 4-22. Se usa solo como referencia visual y funcional: no se copian componentes, rutas, hooks ni estilos literalmente. El `muestra_pagina/MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final; el inventario de referencia se completa contra el listado seguro de la carpeta.

| Estado | Cantidad | Uso |
|---|---:|---|
| Pantallas con referencia v0 | 19 | Base visual para flujos 4-22. |
| Pantallas pendientes | 0 | — |

Los flujos 11-22 se ejecutan con los ciclos F4-F6 definidos en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (guía unificada de Matías).

## División de responsabilidades frontend

| Responsable | Ramas/ciclos | Alcance |
|---|---|---|
| Marcos | `frontend/angular-shell` (`F1-03`..`F1-05`), `frontend/public-validation-flow` (`F2-01`, `F2-02`), `frontend/api-readiness` (`F3-01`, `F3-02`, `F3-05`) | Fundación Angular, estructura semántica/accesible, validación pública con mocks ficticios, frontera de servicios y build `/certificados/`. No define el diseño visual final. |
| Matías | `frontend/v0-design-system` (`F1-01`, `F1-02`), admin (`F2-03`..`F2-06`), QA/handoff (`F3-03`, `F3-04`, `F3-06`) y F4-F6 (ciclos definidos en la guía unificada) salvo nuevo acuerdo | Sistema visual desde v0, UI/UX final, admin, responsive, accesibilidad, QA visual y handoff. |

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

## Flujos 11-22 con referencia v0 y ejecución bloqueada por spec

Los flujos 11-22 ya tienen referencia v0 disponible en `muestra_pagina/` y se ejecutan con los ciclos F4-F6 de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`. Cada ciclo mantiene su regla de bloqueo antes de implementar (spec previa de PDF, QR, permisos, auditoría o configuración según corresponda).

| Prompt | Flujo | Complejidad | Regla antes de implementar |
|---:|---|---|---|
| 11 | Detalle de certificación | Alta | Spec previa por PDF, QR, historial y revocación. |
| 12 | Vista previa PDF complementario | Alta | Spec previa de PDF y diseño aprobado. |
| 13 | Listado de cursos | Media | Contrato de datos o mocks explícitos. |
| 14 | Detalle de curso | Media | Contrato de curso, fechas y asistencias. |
| 15 | Listado de certificaciones | Media | Contrato de filtros, estados y paginación. |
| 16 | Listado de alumnos | Media | Cuidado con datos personales. |
| 17 | Detalle de alumno administrativo | Media | Spec previa de datos visibles. |
| 18 | Entrega manual de certificación | Baja | MVP sin email: copiar link / descargar PDF. |
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
- En validación pública, mostrar DNI completo por decisión institucional (D0); no exponer tokens completos ni datos reales.
- El certificado es de curso y debe mostrar fechas asistidas (`attendedDates`).
- QR/token permanente: las pantallas de entrega manual deben indicar "mismo QR"; no portar rotación de QR desde v0. El MVP no envía emails: la entrega es manual (copiar link / descargar PDF).
- Auth admin simple temporal (`X-Admin-Key`); no portar credenciales demo de `login-form.tsx`.
- Firmantes PDF: Rector/a y Asesor/a Pedagógica vía configuración institucional.
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
| Referencia v0 cambia mientras se porta | Revisar el listado seguro de `muestra_pagina/` al iniciar cada ciclo. |

## Build para cPanel

Cuando exista aplicación Angular real y el ciclo lo indique:

```bash
ng build --configuration production --base-href /certificados/
```

No desplegar ni copiar artefactos a cPanel desde OpenCode.

## Estado de la app Angular 20 (ciclo `frontend-angular-shell-public-validation-api-readiness`)

App creada en `apps/frontend-angular/` con Angular CLI 20.3.30 standalone. Desplegable bajo `/certificados/`. Shell semántico + página pública con `resource()` (tres bloques: `valid` / `not-verifiable` / `technical-error`, `aria-live="polite"`). Verificación: 35/35 tests, build prod verde (252.97 kB initial / 71.88 kB transfer, lazy 3.88 kB). Requiere `export PATH="$HOME/.local/bin:$PATH"`.

### Checkpoint M3-06 — integración Angular/API local

Conmutación local mock/API real sin reescribir la pantalla pública:

- `environment.ts` (prod) y `environment.development.ts` (dev) exponen `useRealApi: false` + `apiBaseUrl: '/certificados/api'`. El modo real queda **desactivado por defecto** en ambos entornos; en dev se activa a mano (toggle local, no commitear `true`) para el smoke.
- `app.config.ts` selecciona `HttpValidationSource` cuando `useRealApi: true`, `MockValidationSource` cuando `false`.
- `http-validation.source.ts` construye la URL como `${apiBaseUrl}/certificados/{encodeURIComponent(token)}/verificacion` (frontera única mock/real).
- `proxy.conf.json` reenvía `/certificados/api` → `http://127.0.0.1:8080` durante `ng serve` (`angular.json` `serve.options.proxyConfig`). **No** se habilita CORS/preflight en el backend por defecto (spec: "Preflight no requerido").
- Separación `base href /certificados/` (rutas Angular) vs `apiBaseUrl` (endpoint API): `baseHref` nunca se usa para resolver la URL de la API en `ng serve`.

Smoke local documentado (no ejecutado en este turno — PHP CLI no instalado localmente):

1. Levantar API PHP local en `:8080` (`bash scripts/m3-06-smoke.sh` requiere `php` CLI + MariaDB local ficticia alcanzable; prueba las rutas `/certificados/api/health` y `/certificados/api/certificados/{token}/verificacion`, valida el JSON de respuesta, usa token ficticio BIEN formado de 32+ chars → 404 `CERTIFICATE_NOT_FOUND` controlado cuando no hay certificado sembrado; 400, 404 genérico y 500 = FAIL conforme a spec).
2. En `environment.development.ts`, pasar `useRealApi: true` (solo local).
3. `ng serve` (proxy.conf.json activo) → abrir `http://localhost:4200/certificados/validar/<token-ficticio>`.
4. Capturar evidencia con tokens ficticios; sin datos reales.
5. Revertir `useRealApi` a `false`.

Evidencia de verificación de este turno (sin PHP CLI): `npm test --watch=false` 70/70 SUCCESS (incluye 2 casos nuevos de `apiBaseUrl` y 2 de `app.config`), `npm run build` verde (253.42 kB initial / 72 kB transfer, dentro de presupuestos). Smoke `scripts/m3-06-smoke.sh` queda **BLOCKED** hasta disponer de `php` CLI; el script está creado y documentado para ejecución manual futura.

### Estructura técnica

`angular.json`: `baseHref: "/certificados/"` en `production` y `development` (presupuestos 500 kB warn / 1 MB error), `index` explícito y salida plana para cPanel. `environments/environment{,.development}.ts`: ambos exponen `useRealApi: false` (mock por defecto) + `apiBaseUrl: '/certificados/api'`; en dev, `useRealApi: true` es un toggle local manual para smoke. `app.config.ts`: `provideRouter` + `withComponentInputBinding` + `provideHttpClient()` + `VALIDATION_SOURCE` seleccionado por `environment.useRealApi` (`true` → `HttpValidationSource`, `false` → `MockValidationSource`). `app.routes.ts`: `''` carga landing sin validación, `validar/:tokenCertificacion` carga la validación pública, `**` carga página no encontrada sin validar tokens. `app.ts`: shell `header[role=banner]` / `main#contenido` / `footer` con skip link.

### Shared certificates

`dto.ts` (DTOs del contrato PHP), `validation-source.ts` (interfaz + InjectionToken, frontera reemplazable), `mock-tokens.ts` (`MockValidationSource` + tokens `demo-valido|revocado|expirado|inexistente|error-tecnico`), `http-validation.source.ts` (`HttpValidationSource` con `HttpClient`, URL `${environment.apiBaseUrl}/certificados/{encodeURIComponent(token)}/verificacion`; usa suscripción cancelable vía `AbortSignal` en vez de `firstValueFrom`), `result-mapper.ts` (404/revocado/expirado/inexistente → `not-verifiable`; 5xx/red/JSON → `technical-error`), `validation.service.ts` (`verify(token)` consume `VALIDATION_SOURCE`; sin cambios al swap).

> **Pendiente D0 en el DTO Angular.** `dto.ts` todavía declara `student.documentMasked` y no incluye `attendedDates`. El contrato D0 (`documentNumber` completo + `attendedDates`) es el **objetivo/contrato pendiente**, no el estado actual. El ajuste del DTO/mapper/tests forma parte del split `backend-contrato-token-permanente-dni-fechas` / `backend-token-permanente-dni-fechas` (M4-01A/M4-01B); no describir `dto.ts` como ya alineado a D0 hasta que ese ciclo lo confirme.

### Límites de UI final

Base técnica, no diseño visual final. Diseño visual corresponde a Matías (F1-01/F1-02). Admin, PDF, QR, entrega manual y configuración institucional quedan fuera de este ciclo.

## Contrato API esperado

Cuando exista integración real:

- ruta pública conceptual: `/certificados/validar/:tokenCertificacion`;
- endpoint esperado: `/certificados/api/certificados/{token}/verificacion`;
- `404 CERTIFICATE_NOT_FOUND` se muestra como certificado no verificable, no como error técnico;
- la UI pública muestra DNI completo por decisión institucional (D0) y fechas asistidas (`attendedDates`);
- la UI pública no debe pedir DNI como input de búsqueda pública;
- QR/token permanente: pantallas de entrega manual indican "mismo QR", no rotación;
- los modelos TypeScript futuros deben respetar `docs/backend/01-contrato-api-certificados.md`.
