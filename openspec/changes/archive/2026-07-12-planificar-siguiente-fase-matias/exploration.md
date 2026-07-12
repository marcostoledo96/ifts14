# Exploración — Siguiente fase de planificación para Matías

**Change**: `planificar-siguiente-fase-matias`
**Tipo**: exploration (planificación, no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-11
**Almacén de artefactos**: OpenSpec + Engram (hybrid)
**Rama actual**: `frontend/admin-certifications` (post F2-06 + fix PR #37)

## Contexto y pregunta

El ciclo F2-06 (Certificaciones admin) cerró el 2026-07-08 y su archive-report declara explícitamente "Listo para el próximo ciclo" con handoff a `F4-01 / F4-02 / F5-01 / F5-04 / F6-01`. La guía unificada `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` mantiene `F0-F6` con 25 ciclos pendientes (3 de 28 hechos: F0-01, F0-02, F0-03). El objetivo de esta exploración es identificar **cuál es la siguiente fase de planificación dependency-ready** que Matías puede comenzar, y dejar trazabilidad documental del porqué antes de abrir un change de implementación.

## Estado actual (F0-F2 cerrado para Matías)

| Fase | Estado | Evidencia |
|---|---|---|
| F0-01 verificar entorno Windows | ✅ | `docs/00-indice-general.md`; archive `2026-06-26-f0-01-verificar-entorno-windows` |
| F0-02 verificar OpenCode/Gentle-AI | ✅ | archive `2026-06-28-f0-02-verificar-opencode-gentle-ai` |
| F0-03 leer documentación mínima | ✅ | archive `2026-06-28-f0-03-leer-documentacion-minima-y-mision` |
| F1-01 auditar `muestra_pagina/` | ✅ | archive `2026-06-30-f1-01-auditar-muestra-pagina` |
| F1-02 v0 design system | ✅ | archive `2026-07-07-f1-02-v0-design-system`; PR #33 mergeada |
| F2-03 admin login shell | ✅ | archive `2026-07-07-f2-03-admin-login-shell`; PR #34 mergeada |
| F2-04 admin courses dates | ✅ | archive `2026-07-07-f2-04-admin-courses-dates`; PR #35 mergeada |
| F2-05 admin attendance | ✅ | archive `2026-07-08-f2-05-admin-attendance`; PR #36 mergeada |
| F2-06 admin certifications | ✅ | archive `2026-07-08-f2-06-admin-certifications`; rama actual con fix PR #37 (`c0102d6`) |

Pendientes declarados en la guía:

- **F3** release-readiness: `F3-03` tests automáticos, `F3-04` QA manual, `F3-06` handoff a Marcos (Matías); `F3-01/02/05` son Marcos (api-readiness).
- **F4** semana 4: `F4-01` detalle de certificación, `F4-02` vista previa PDF, `F4-03` listado de cursos, `F4-04` detalle de curso.
- **F5** semana 5: `F5-01` listado de certificaciones, `F5-02` listado de alumnos, `F5-03` detalle administrativo de alumno, `F5-04` entrega manual de certificación.
- **F6** semana 6: `F6-01` revocar certificación, `F6-02` placeholder carga masiva, `F6-03` auditoría básica, `F6-04` configuración institucional.

### Decisiones D0 vigentes que restringen las próximas fases

- QR/token **permanente**; reenvío normal **no** rota token.
- DNI completo visible **solo** en validación pública; admin, logs, auditoría y errores **sin** DNI completo.
- Certificado de curso con fechas asistidas.
- Auth admin `X-Admin-Key` temporal; login real queda fuera.
- Email fuera del MVP; entrega es manual.
- Compositor en cPanel con gate: si no hay Composer, `vendor/` se genera localmente como artefacto operativo, nunca versionado.
- Firmantes PDF: Rector/a y Asesor/a Pedagógica.
- `muestra_pagina/` solo como referencia visual; no compilar, no portar React/Next literalmente, no copiar credenciales demo.

### Contratos backend disponibles que habilitan F4-F5

| Spec / archive | Estado | Habilita |
|---|---|---|
| `backend-contrato-api-certificados` (ajuste 2026-07-01) | sincronizado D0 | DTO público con DNI completo + `attendedDates`; admin con QR/token permanente |
| `backend-modelo-datos-certificados` (ajuste 2026-07-01) | sincronizado D0 | tablas `cert_*`; token permanente; exposición pública |
| `admin-certificate-emission` | archivado | emisión |
| `admin-certificate-delivery` (ajuste 2026-07-01) | sincronizado D0 | entrega manual, reenvío conserva token |
| `admin-certificate-revocation` | archivado | revocación |
| `admin-certificate-consulta` (2026-07-06) | archivado | contrato de consulta admin |
| `backend-pdf-qr-certificados` (2026-06-30) | archivado | PDF + QR |
| `database-cursos-alumnos-asistencias` (2026-07-02) | archivado | modelo cursos / alumnos / asistencias |

### División operativa frontend vigente

Marcos puede tomar `frontend/angular-shell`, `frontend/public-validation-flow` y `frontend/api-readiness` para destrabar backend. Matías conserva `frontend/v0-design-system`, admin (`F2-03..F2-06`), `F3-03/04/06` y F4-F6 salvo acuerdo posterior. Matías **no** debe tocar `frontend/public-validation-flow` ni `frontend/api-readiness` sin coordinación explícita con Marcos.

## Áreas afectadas por la siguiente fase

| Área | Rol en la siguiente fase |
|---|---|
| `openspec/specs/admin-certifications-frontend/spec.md` | Spec actual de F2-06; handoff explícito a F4-01/F4-02/F5-01/F5-04/F6-01. Será modificado o extendido en el change de implementación que siga. |
| `openspec/specs/admin-foundation/spec.md` | Spec de F2-03/04/05; conserva "Sesión mock solo en memoria" sin cambios; nuevos requirements admin deben coordinarse con sus requirements vigentes. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Fuente de verdad de la planificación F0-F6. Índice de fases con `F0-01..F0-03` ✅ y el resto ⏳; tabla Estrategia de ramas referencia los work units. |
| `docs/frontend/00-angular20-port-v0.md` | Documenta estado real del port visual y debe actualizarse durante `sdd-archive` del ciclo elegido. |
| `docs/00-indice-general.md` | Puede requerir alta si se agrega una spec o doc nuevo durante la fase. |
| `apps/frontend-angular/src/app/features/admin/certifications/` | Carpeta de la feature; F2-06 dejó service, listado y preview. F4-01/F4-02 extienden esta área con detalle y PDF. |
| `muestra_pagina/` (referencia visual v0) | Listado seguro; las pantallas 11-18 (F4-01, F4-02, F4-03, F4-04) tienen referencia v0 utilizable. |

## Candidatos evaluados como "siguiente fase"

### Opción A — F4-01 Detalle de certificación administrativo (recomendada)

- Rama: `frontend/certificate-detail-pdf` (compartida con F4-02 vista previa PDF).
- Objetivo: detalle administrativo con estado, trazabilidad y acciones, usando mocks explícitos si no hay backend integrado.
- Bloqueo declarado: "spec previa si incluye historial, QR o revocación real".
- Contratos disponibles: `backend-pdf-qr-certificados` (archivado 2026-06-30), `admin-certificate-consulta` (archivado 2026-07-06), `admin-certificate-revocation` (archivado). La spec previa se puede acotar a "detalle + acciones deshabilitadas" para evitar invocar revocación o historial real.

- **Pros**:
  - Primer ciclo en el orden de handoff declarado por F2-06.
  - Comparte rama con F4-02 (PDF complementario), lo que permite cerrar la unidad `certificate-detail-pdf` con un solo PR si las dos pantallas caben en el budget.
  - Extiende directamente el preview creado por F2-06 (`CertificationPreviewPage`) con un detalle administrativo más completo.
  - Los contratos backend de consulta, PDF/QR y revocación ya están archivados y sincronizados con D0.
  - Referencia visual v0 utilizable para `muestra_pagina/app/admin/certificaciones/[id]`.

- **Contras**:
  - Requiere spec previa para acotar qué acciones del detalle se exponen y cuáles quedan deshabilitadas con handoff a F6-01.
  - Si se decide abrir junto con F4-02 (PDF), el diff puede acercarse al budget de 4000 líneas (PR #33-F2-06 cerró en 2600 inserciones / 47 bajas; la unidad `certificate-detail-pdf` es comparable).

- **Esfuerzo**: Medio. Mocks + UI detalle + spec acotada + tests + QA. Encaja en una sola sesión SDD si se limita a mock-only sin generación real de PDF/QR.

### Opción B — F5-01 Listado de certificaciones (alternativa natural)

- Rama: `frontend/admin-certifications` (compartida con F2-06 ya mergeada, F5-04, F6-01, F6-03).
- Objetivo: listado administrativo con filtros, paginación y estados.
- Bloqueo declarado: "contrato de filtros, paginación y estados".
- Contrato disponible: `admin-certificate-consulta` archivado 2026-07-06.

- **Pros**:
  - Reutiliza la misma rama del PR que acaba de mergearse (F2-06), continuando la unidad visual sin cambiar de contexto.
  - El listado mock de F2-06 ya está navegable con filtro por estado y búsqueda libre; F5-01 añade paginación, filtros por curso/alumno y, eventualmente, datos reales cuando se integre `HttpCertificationsService`.
  - El contrato de consulta está archivado y sincronizado con D0.

- **Contras**:
  - Segundo en el orden de handoff de F2-06 (F4-01 → F4-02 → F5-01).
  - Mezclar la rama `frontend/admin-certifications` con un nuevo PR extenso (paginación + filtros + datos reales) puede diluir el historial de F2-06 y dificultar el code review por slice.

- **Esfuerzo**: Medio-Alto. Incluye contrato, paginación, filtros, transición a datos reales (parcial) y migración del shell existente.

### Opción C — F4-03 Listado de cursos (alternativa independiente)

- Rama: `frontend/admin-courses` (compartida con F4-04 detalle de curso).
- Objetivo: listado administrativo de cursos con filtros, fechas y estados.
- Bloqueo declarado: "contrato o mocks explícitos para cursos, fechas y estados".
- Contrato disponible: `database-cursos-alumnos-asistencias` archivado 2026-07-02; `admin-foundation` spec ya cubre `/admin/cursos` y `/admin/cursos/[id]`.

- **Pros**:
  - Independiente del handoff F2-06; útil para paralelizar si Marcos está trabajando en `frontend/public-validation-flow` o `frontend/api-readiness`.
  - Extiende `F2-04` (admin courses dates) ya mergeado, completando la unidad `admin-courses`.
  - Referencia v0 utilizable para `muestra_pagina/app/admin/cursos`.

- **Contras**:
  - Tercero en relevancia para cerrar el flujo de certificaciones (F4-01 / F5-01 son previos).
  - Aleja la atención de la unidad `admin-certifications`, que es la más cercana al merge de F2-06.

- **Esfuerzo**: Medio. UI listado + filtros + detalle de curso si se hace junto con F4-04.

### Opción D — F3-06 Handoff a Marcos (cierre documental)

- Rama: `qa/frontend-release-readiness` (compartida con F3-03 tests, F3-04 QA).
- Objetivo: cierre documental de la familia F2 como release-ready, sin código nuevo.
- No tiene bloqueo declarado; depende de F3-03/04 que son tests/QA de lo ya implementado.

- **Pros**:
  - Cierra F2 formalmente antes de empezar F4-F6; reduce la cola de "release-readiness" abierta.
  - Es solo documental; entra fácilmente en el budget de revisión.
  - Alinea con la nota de la guía: "Al cerrar F3-06, continuá con los ciclos F4-F6".

- **Contras**:
  - No es una fase de producto; no avanza la unidad `admin-certifications` ni `certificate-detail-pdf`.
  - F3-03 y F3-04 (tests automáticos y QA manual) pueden no estar ejecutados todavía sobre F2-06; hacer handoff sin ellos puede dejar un release-readiness superficial.
  - Es una fase *de cierre*, no *de inicio*; si lo que el usuario quiere es "comenzar la siguiente fase de producto", F3-06 es administrativo.

- **Esfuerzo**: Bajo. Documentación + reporte + handoff a Marcos.

## Recomendación

**Opción A — F4-01 Detalle de certificación administrativo**, con F4-02 (vista previa PDF) como work unit acoplable en la misma rama si el budget lo permite.

Razones:

1. **Orden de handoff**: F2-06 lista explícitamente `F4-01 / F4-02 / F5-01 / F5-04 / F6-01` como siguiente fase. F4-01 es el primero.
2. **Dependencias listas**: los contratos `backend-pdf-qr-certificados`, `admin-certificate-consulta` y `admin-certificate-revocation` están archivados y sincronizados con D0.
3. **Coherencia con la unidad visual**: la rama `frontend/certificate-detail-pdf` es nueva y no se mezcla con la rama activa `frontend/admin-certifications`, lo que mantiene el historial de PRs por unidad revisable.
4. **Bloqueo acotable**: la spec previa puede limitarse a "detalle + acciones deshabilitadas con handoff a F6-01" para no introducir revocación ni QR real en este ciclo.
5. **Referencia visual v0 disponible**: la pantalla 11 (`muestra_pagina/app/admin/certificaciones/[id]`) tiene exportación v0 utilizable.

**Criterio de aceptación obligatorio — paridad visual**: el detalle administrativo F4-01 debe mantener paridad visual igual o mejor que `muestra_pagina/app/admin/certificaciones/[id]`. La vía preferida es copiar o simular el diseño/estilo de esa referencia al portar a Angular 20, sin portar React/Next literalmente. Este criterio es _hard acceptance_ y debe declararse explícitamente en la spec y el verify de F4-01.

**Siguiente paso operativo recomendado**:

1. Cerrar este change `planificar-siguiente-fase-matias` con `sdd-archive` (planning-only, sin código de producto).
2. Abrir un nuevo change `f4-01-certificate-detail` con `sdd-new` y ejecutar `explore → propose → spec → design → tasks → apply → verify → archive` sobre el ciclo F4-01, manteniendo el alcance mock-only y el handoff explícito a F4-02, F5-01, F5-04, F6-01.
3. Si el budget de revisión lo permite (single-pr, hasta 4000 líneas), acoplar F4-02 en el mismo PR. Si no, abrir `f4-02-pdf-preview` como PR encadenado en la misma rama `frontend/certificate-detail-pdf`.

## Riesgos

- **Bloqueo de spec previa no cumplido**: si la spec F4-01 se redacta sin acotar historial/QR/revocación real, el ciclo puede invocar generación real de PDF/QR o revocación, lo que viola D0 y el bloqueo declarado. Mitigación: spec debe declarar explícitamente "acciones reales de F6-01 quedan fuera; revocación y PDF real se difieren a cambios posteriores".

- **Mezcla de work units**: si F4-01 y F4-02 se acoplan en un solo PR, el diff puede acercarse al budget 4000 (F2-06 cerró en 2600 inserciones / 47 bajas en 32 archivos). Mitigación: si el forecast supera 3500 líneas, dividir en dos PRs encadenados en la misma rama.

- **Confusión con la rama activa**: la rama actual es `frontend/admin-certifications`; el work unit `frontend/certificate-detail-pdf` requiere crear una rama nueva desde `main` o desde una base explícita y actualizada. Mitigación: usar la regla del repo (`git switch -c` con aprobación explícita de Matías, comando exacto, evidencia previa y árbol limpio).

- **Continuidad del fix PR #37**: el último commit `c0102d6` ("fix(frontend): recargar preview de certificacion al cambiar ruta") aún no se ha mergeado a `main` desde la rama `frontend/admin-certifications`. Mitigación: antes de crear `frontend/certificate-detail-pdf`, decidir si F2-06 está mergeado o sigue en la rama; si no está mergeado, abrir el nuevo ciclo desde una base explícita y aprobada, no desde `main` ciega.

- **D0 DNI / token**: el detalle administrativo no debe exponer DNI completo ni token completo; debe continuar usando `documentMasked` y `tokenPrefix` y la constante de truncado a 60 chars ya documentada en F2-06. Mitigación: extender el check negativo `__checks__/no-secrets.spec.ts` y `no-real-data.spec.ts` con los nuevos literales del feature F4-01.

- **Cierre de F2-06**: el handoff asume que F2-06 está mergeado. Si la rama actual no se ha mergeado todavía, F4-01 no debe abrirse hasta que la decisión de merge esté tomada. Mitigación: registrar explícitamente en la propuesta F4-01 la base desde la que se ramifica y el estado del merge de F2-06.

- **Riesgo de paridad visual**: si el detalle F4-01 se implementa sin comparar contra `muestra_pagina/app/admin/certificaciones/[id]`, el resultado puede desviar la identidad visual institucional y romper el criterio de aceptación obligatorio de paridad. Restricción: la spec F4-01 debe declarar la referencia visual exacta como _hard acceptance criterion_ y el verify debe comparar captura contra captura.

## Listo para propuesta

**Sí**, con las siguientes condiciones para el orquestador:

- Indicar al usuario que la fase siguiente recomendada es **F4-01 Detalle de certificación administrativo**, en la rama `frontend/certificate-detail-pdf`, con F4-02 (vista previa PDF) acoplable en el mismo PR si el budget lo permite.
- Confirmar si F2-06 ya está mergeado a `main` o sigue en la rama `frontend/admin-certifications` con el fix `c0102d6`; sin esa confirmación no se puede crear `frontend/certificate-detail-pdf` desde una base explícita.
- Confirmar si se prefiere single-pr (F4-01 + F4-02) o chained-pr (un PR por ciclo) cuando el forecast del ciclo de implementación se acerque a 3500 líneas.
- Cerrar este change `planificar-siguiente-fase-matias` con `sdd-archive` después de que la propuesta F4-01 quede alineada con el orquestador, para mantener `openspec/changes/` limpio y dejar la decisión documentada.
