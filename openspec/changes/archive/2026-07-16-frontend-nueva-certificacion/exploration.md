## Exploration: Nueva certificación (emisión directa)

### Current State

La referencia v0 no plantea un wizard de varios pasos: es una pantalla única de emisión directa. Bedelía selecciona alumno y curso, revisa una previsualización, ve validaciones bloqueantes y emite sin borrador ni aprobación posterior.

**Angular actual**

- No existe página ni ruta `admin/certificaciones/nueva`. Hoy `nueva` sería capturado por `certificaciones/:id`; la ruta estática debe agregarse antes de las rutas `:id`.
- `CertificationsService` y sus implementaciones solo listan, obtienen, revocan, regeneran PDF y recuperan entrega manual. Falta `emitir`.
- `certifications.models.ts` no tipa request ni respuesta de emisión.
- `HttpCoursesService` permite listar cursos y obtener sus fechas; `CursoFecha.estado` distingue `programada | realizada | cancelada`.
- `HttpStudentsService` lista alumnos, pero descarta `estado`, no expone email y solo recibe `dniMostrar` enmascarado.
- `GET /admin/asistencias` admite `cursoId` y `alumnoId`; el adapter Angular existente no expone la consulta combinada y trabaja por `fechaId`.
- Existen listado y detalle de certificaciones. El handoff natural tras emitir es navegar a `/admin/certificaciones/:id`; desde allí ya existen acciones hacia PDF y entrega manual.
- Riesgo existente fuera del alta: `HttpCertificationsService.toCertificacionDetalle()` asigna `publicValidationUrl` desde `dto.links.pdf`, no desde una URL pública.

**Referencia visual v0**

- `muestra_pagina/app/admin/certificaciones/nueva/page.tsx` monta el editor dentro de `AdminShell`.
- `nueva-certificacion-editor.tsx` define selección superior, preview institucional amplia, panel lateral sticky, loading skeleton, estado vacío, avisos y confirmación.
- Estados relevantes: cargando, datos válidos, curso sin fechas, alumno sin presentes, duplicado vigente, alumno sin email y emisión exitosa.
- En desktop usa preview + panel lateral; en mobile apila contenido y conserva controles utilizables.
- Las ocho capturas solicitadas (`cert-desktop.png`, `cert-mobile.png`, `cert-390.png`, `cert-375.png`, `cert-loaded.png`, `cert-loading.png`, `cert-check.png`, `cert-sinfechas.png`) no existen en el repositorio ni hay archivos PNG bajo `muestra_pagina/`. La evidencia visual disponible es el TSX completo y el prompt §10.

### Contrato backend real de emisión

**Endpoint:** `POST /admin/certificados`
**Éxito:** HTTP `201`, envelope `{ data, meta: { requestId } }`.

Body aceptado:

| Campo | Tipo | Regla real |
|---|---|---|
| `alumnoId` | entero positivo | Obligatorio; alumno activo. |
| `cursoId` | entero positivo | Obligatorio; curso activo. |
| `issuedAt` | `YYYY-MM-DD` | Obligatorio; no futuro según `America/Argentina/Buenos_Aires`. |
| `expiresAt` | `YYYY-MM-DD \| null` | Opcional; si existe, no anterior a emisión ni al día actual. |

No se envían fechas, DNI, email, firmas, logos, QR ni número. El backend:

1. consulta alumno y curso activos;
2. obtiene asistencias no anuladas del par alumno/curso;
3. incluye solo fechas con estado `realizada`, ordenadas por `orden, fecha`;
4. rechaza si no hay presentes elegibles;
5. rechaza un certificado vigente duplicado;
6. toma configuración institucional, descifra DNI solo en servidor, genera token permanente, snapshot y PDF;
7. confirma la transacción únicamente si el PDF fue generado.

`data` de respuesta:

| Campo | Tipo |
|---|---|
| `id` | number |
| `certificateCode` | string |
| `status` | `"vigente"` |
| `student` | `{ displayName, documentMasked }` |
| `course` | `{ name }` |
| `issuedAt` | string |
| `expiresAt` | string \| null |
| `tokenPrefix` | string |
| `publicValidationUrl` | string |
| `pdfDownloadUrl` | string |

Errores relevantes: `400 VALIDATION_ERROR` para payload, alumno/curso inactivo o inexistente y ausencia de asistencias realizadas; `409 CERTIFICATE_ALREADY_EXISTS` para duplicado vigente; `500 CONFIGURATION_ERROR` o falla técnica si faltan claves/configuración/PDF.

### Listados y filtros disponibles

| Necesidad | Contrato disponible | Observación |
|---|---|---|
| Cursos activos | `GET /admin/cursos?estado=activo` | El adapter actual filtra estado del lado cliente. |
| Fechas realizadas | `GET /admin/cursos/:id/fechas` | Devuelve todos los estados; filtrar `realizada`. |
| Alumnos | `GET /admin/alumnos` | Sin filtros; devuelve `id`, `apellidoNombre`, `dniMostrar`, `estado`. |
| Asistencias del par | `GET /admin/asistencias?cursoId=:id&alumnoId=:id` | Devuelve fecha y `fechaEstado`; filtrar `realizada`. |
| Duplicado vigente | `GET /admin/certificados?estado=vigente&cursoId=:id&alumnoId=:id` | El backend soporta los tres filtros; el adapter Angular hoy no los envía. |

### Discrepancias con v0

| v0 / prompt | Contrato real | Recomendación |
|---|---|---|
| DNI completo en preview | Listados admin solo exponen `dniMostrar` enmascarado | Mostrar `dniMostrar`; el PDF final sí usa DNI completo en servidor. No inventar endpoint. |
| Email y aviso “sin email” | Backend no guarda ni expone email | Omitir aviso y resumen de email. La entrega siempre es manual. |
| Logos y firmas gráficas | Configuración solo tiene institución, texto y nombres/cargos | Mostrar identidad existente y firmantes tipográficos; no simular archivos. |
| Ciclo lectivo | Backend no lo expone | Omitir el bloque. |
| Carga horaria por jornada | No existe campo | Omitir horas; usar fecha y `descripcion`. |
| Folio preliminar y número antes de emitir | El backend genera `certificateCode` al emitir | Preview sin número definitivo; completarlo tras el `201`. |
| Payload mock incluye `fechas` | Backend no acepta fechas | Enviar solo los cuatro campos reales; las fechas se derivan en servidor. |
| Duplicado validado antes del submit | Hay filtro backend, pero adapter no lo usa | Validación anticipada opcional; conservar el `409` como autoridad final. |
| “Emitir certificado” | Endpoint emite certificación + QR + PDF atómicamente | Mantener acción única y bloquear doble submit. |

### Affected Areas

- `apps/frontend-angular/src/app/app.routes.ts` y `.spec.ts` — ruta estática antes de `certificaciones/:id`.
- `features/admin/certifications/certifications.models.ts` — request/response tipados.
- `features/admin/certifications/certifications.service.ts` — método `emitir`.
- `http-certifications.service.ts` y spec — `POST /admin/certificados`, envelope y errores.
- `in-memory-certifications.service.ts` y spec — emisión determinista para `useRealApi=false`.
- Nueva página `features/admin/certifications/pages/new/` — selección, preview, estados, emisión y navegación.
- Servicios/modelos de cursos, alumnos y asistencias — exponer estado de alumno y una consulta del par sin duplicar HTTP en la página.
- `certifications-list-page.html` y detalle de alumno — habilitar enlaces a nueva emisión cuando corresponda.
- Tests de página, ruta, accesibilidad, doble submit, `400/409/500` y handoff.

### Approaches

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| **Pantalla orquestadora sobre seams existentes** | No inventa endpoints; reutiliza cursos, alumnos, asistencias y certificaciones; mantiene mock/HTTP | Varias consultas y coordinación de estados; requiere ampliar adapters | Medium |
| **Nuevo endpoint backend “preparar emisión”** | Un DTO listo para preview; evita N+1 y resuelve elegibilidad centralmente | No existe; cambia backend y contrato fuera del ciclo frontend | High |
| **Port visual con mocks locales** | Paridad rápida con TSX | Duplica datos, no emite realmente y contradice servicios/API existentes | Medium |

### Recommendation

Elegir **pantalla orquestadora sobre seams existentes**:

1. Implementar una única pantalla Angular con signals y `OnPush`, no un wizard largo.
2. Cargar alumnos y cursos mediante sus tokens; conservar solo entidades activas.
3. Al seleccionar el par, consultar fechas/asistencias, descartar respuestas stale y mostrar solo presentes sobre fechas `realizada`.
4. Consultar duplicado vigente como aviso anticipado, pero tratar el `409` del POST como autoridad.
5. Extender `CertificationsService.emitir()` con body exacto `{ alumnoId, cursoId, issuedAt, expiresAt }`.
6. Usar fecha de emisión local de Buenos Aires y `expiresAt: null` salvo que una spec futura pida edición de vencimiento.
7. Portar la jerarquía visual del TSX, eliminando campos no sustentados: email, DNI completo, horas, ciclo, logos/firmas gráficas y folio preliminar.
8. Tras `201`, navegar a `/admin/certificaciones/:id`; el detalle existente conduce a PDF y entrega manual.
9. Implementar primero tests de contrato, estados bloqueantes, loading/error, doble envío y navegación.

### Risks

- Las capturas obligatorias no están disponibles; verify visual deberá usar TSX + prompt y capturas nuevas del Angular.
- La preview exacta de v0 no es posible con el contrato actual: DNI completo, email, logos, firmas, ciclo y carga horaria no se exponen.
- El mensaje `400 VALIDATION_ERROR` no distingue alumno/curso inválido de ausencia de asistencias; la UI debe usar copy seguro y genérico.
- La validación anticipada puede quedar obsoleta; el backend y su `409` siguen siendo la fuente de verdad.
- Consultar fechas/asistencias por selección puede generar carreras; usar generación/abort y no mezclar respuestas.
- `publicValidationUrl` está mal mapeado en el detalle HTTP actual; corregirlo o no depender de ese campo para el handoff.
- La ruta `nueva` en posición incorrecta será capturada como `:id`.

### Ready for Proposal

**Yes.** Hay contrato real suficiente para proponer una pantalla frontend sustentada. El proposal debe declarar explícitamente las reducciones respecto de v0 y no incorporar campos ni endpoints inexistentes.
