# Exploración — F4-01 Detalle de certificación administrativo

**Change**: `f4-01-certificate-detail`
**Tipo**: exploration (planning, no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-11
**Almacén de artefactos**: OpenSpec + Engram (hybrid)
**Rama actual**: `frontend/admin-certifications` (post F2-06 + fix `c0102d6` aún no mergeado)
**Rama objetivo sugerida**: `frontend/certificate-detail-pdf` (nueva, compartida con F4-02)

## Resumen ejecutivo

F4-01 evoluciona la `certification-preview-page` mínima creada por F2-06 hacia un **expediente administrativo** con encabezado, estado, datos del alumno/curso, registro de asistencia, documento réplica, auditoría y zona de riesgo, manteniendo el contrato mock-only. La referencia visual v0 de `muestra_pagina/components/admin/expediente-certificacion.tsx` está disponible y debe respetarse como _hard acceptance criterion_ de paridad visual. Todas las acciones (descargar PDF, copiar link, entrega manual, regenerar, revocar) quedan **deshabilitadas con handoff explícito** a F4-02, F5-04, F6-01 y F6-03. F4-02 (vista previa PDF complementario) puede acoplarse en la misma rama/PR si el forecast queda dentro del budget 4000.

## Quick path

1. Confirmar si F2-06 + fix `c0102d6` están mergeados a `main` antes de crear `frontend/certificate-detail-pdf`.
2. Abrir change `f4-01-certificate-detail` con `sdd-new` y ejecutar el pipeline completo (explore → propose → spec → design → tasks → apply → verify → archive).
3. F4-01 reemplaza `certification-preview-page` (misma ruta `/admin/certificaciones/:id`); no agrega ruta nueva.
4. F4-02 (vista previa PDF) se acopla al mismo PR si el forecast ≤ 3500 líneas; si supera, abrir `f4-02-pdf-preview` como PR encadenado en la misma rama.

## Estado actual (F2-06 cerrado)

| Capa | Estado | Evidencia |
|---|---|---|
| F2-06 Certificaciones admin | ✅ merge rama `frontend/admin-certifications` (PR #36) + fix `c0102d6` pendiente de merge | `openspec/changes/archive/2026-07-08-f2-06-admin-certifications/`, `archive-report.md` PASS 394/394 |
| Previsualización actual | Mínima: `<dl>` con `documentMasked`, `tokenPrefix`, URL truncada, `attendedDates`, `auditEvents`; CTAs disabled con copy handoff | `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.{ts,html,css,spec.ts}` |
| Modelos y seam de inyección | Listos para reuso: `Certificacion`, `CertificacionDetalle`, `AuditEvent`, `CertificationsService`, `CERTIFICATIONS_SOURCE` | `certifications.models.ts`, `certifications.service.ts`, `in-memory-certifications.service.ts` |
| Datos mock | Seed de 6 certificados ficticios, `documentMasked` `XX****XX`, `tokenPrefix` `prefijo_demo_xxx`, URL truncada a 60 chars (`URL_PUBLICA_MAX`) | `in-memory-certifications.service.ts` líneas 17-125 |
| Rutas | `/admin/certificaciones` y `/admin/certificaciones/:id` registradas; `CERTIFICATIONS_SOURCE` provider a nivel de ruta `admin` | `app.routes.ts` líneas 111-126 |
| Spec de F2-06 | 4 requirements, 8 escenarios, handoff explícito a F4-01/F4-02/F5-01/F5-04/F6-01 | `openspec/specs/admin-certifications-frontend/spec.md` |

### Contratos backend ya archivados (habilitan F4-01 sin tocar backend)

| Spec | Estado | Habilita F4-01 |
|---|---|---|
| `admin-certificate-consulta` | archivado | `GET /admin/certificados/{id}` con `attendedDates`, `auditEvents` y `links` relativos |
| `admin-certificate-delivery` | archivado | `entrega-manual` y `qr.png` (relevante para F5-04, no para F4-01) |
| `admin-certificate-revocation` | archivado | `POST .../revocar` (relevante para F6-01, no para F4-01) |
| `backend-contrato-api-certificados` | sincronizado D0 | DTO público con DNI completo + `attendedDates`; admin con `documentMasked` y `tokenPrefix` |
| `backend-pdf-qr-certificados` | archivado | PDF + QR (relevante para F4-02, no para F4-01) |
| `database-cursos-alumnos-asistencias` | archivado | Modelo cursos / alumnos / asistencias; `attendedDates` ya se modela desde F2-06 |

### Decisiones D0 que restringen F4-01

- QR/token **permanente**; reenvío normal **no** rota token.
- DNI completo visible **solo** en validación pública; admin, logs, auditoría y errores **sin** DNI completo.
- `documentMasked` `XX****XX` y `tokenPrefix` `prefijo_demo_xxx` ya implementados y validados por checks negativos.
- URL pública truncada a 60 chars (`URL_PUBLICA_MAX = 60`) — constante nombrada.
- Auth admin `X-Admin-Key` temporal; login real fuera del MVP.
- `muestra_pagina/` solo como referencia visual; no compilar, no portar React/Next literalmente, no copiar credenciales demo.
- Email fuera del MVP; entrega manual sin SMTP.

## Áreas afectadas

| Archivo / spec | Rol en F4-01 |
|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.{ts,html,css,spec.ts}` | **Evoluciona** hacia el expediente: misma ruta, mismo seam, UI rica con layout 2 columnas, secciones Panel, QR decorativo, action buttons disabled, zona de riesgo disabled. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.models.ts` | Reutiliza `CertificacionDetalle`. **No requiere cambios** si se mantienen los campos actuales; agregar `numeroCertificado` y `rectora`/`asesora` solo si la spec los exige. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | Reutiliza seed. **Opcional**: extender con `numeroCertificado`, `fechaEmision` legible y `autoridades` (Rector/a, Asesor/a Pedagógica) ya que la referencia los muestra. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts` y `no-real-data.spec.ts` | **Extender** para cubrir los literales del nuevo componente (URLs mock, números de certificado, `Rector/a`/`Asesor/a`). |
| `apps/frontend-angular/src/app/features/admin/sidebar-admin.{ts,html,spec.ts}` | **No requiere cambios** (`isActive()` ya cubre el prefijo `/admin/certificaciones`). |
| `apps/frontend-angular/src/app/app.routes.{ts,spec.ts}` | **No requiere cambios** (la ruta `:id` ya está registrada en orden seguro). |
| `openspec/specs/admin-certifications-frontend/spec.md` | **Modificar**: cambiar el requirement `Previsualización segura y handoff explícito` para reflejar el alcance de expediente; agregar requirements de paridad visual, layout 2 columnas, secciones, QR decorativo, zona de riesgo disabled. |
| `docs/frontend/00-angular20-port-v0.md` | **Actualizar** durante `sdd-archive`: registrar el estado F4-01, sus límites y el handoff residual a F4-02/F5-04/F6-01. |
| `muestra_pagina/components/admin/expediente-certificacion.tsx` | **Solo referencia visual** (lectura segura). Inventario en `docs/frontend/00-angular20-port-v0.md`. No compilar ni portar. |
| `muestra_pagina/components/admin/vista-previa-pdf.tsx` | **Solo referencia visual** para F4-02 si se acopla al mismo PR. No compilar ni portar. |

## Criterios de aceptación hard

- **Paridad visual**: la UI del expediente F4-01 debe mantener paridad visual igual o mejor que `muestra_pagina/app/admin/certificaciones/[id]`. La vía preferida es copiar o simular el diseño/estilo al portar a Angular 20; **no** portar React/Next literalmente. La verificación compara captura contra captura.
- **Mock-only**: sin HTTP, sin `X-Admin-Key`, sin storage/cookies/IndexedDB, sin datos reales, sin DNI completo administrativo, sin token completo, sin email, sin revocación real, sin PDF/QR real, sin entrega manual real. La sustitución por `HttpCertificationsService` queda para un ciclo con sesión segura aprobada (PHP HttpOnly o equivalente).
- **DNI/QR/token**: mantener `documentMasked`, `tokenPrefix` y `publicValidationUrl` truncada a 60 chars. Ningún token completo, DNI completo, email, legajo ni matrícula en el DOM.
- **Acciones reales fuera de F4-01**: las cinco acciones (descargar PDF, copiar link, entrega manual, regenerar, revocar) y la zona de riesgo quedan **deshabilitadas con `aria-disabled="true"`** y copy explícito del ciclo de handoff (F4-02, F5-04, F6-01, F6-03).
- **Sin dependencias nuevas**: `package.json` y lockfiles sin cambios.
- **Cobertura de tests**: escenarios Given/When/Then deben cubrir render del expediente, presencia de secciones (ficha, acciones, QR decorativo, documento, zona de riesgo), `disabled`/`aria-disabled` en todas las acciones, ausencia de secretos y datos reales, id inválido/inexistente, breadcrumb al listado.
- **Build verde**: `npm run build` sin warnings; bundle lazy dentro de la tendencia F2-06 (preview 8.38 kB, listado 7.76 kB). F4-01 debería mantener o reducir el tamaño del bundle actual.

## Enfoques de implementación

### Opción A — F4-01 reemplaza `certification-preview-page` (recomendada)

- **Descripción**: la pantalla `/admin/certificaciones/:id` deja de llamarse "previsualización" y pasa a ser el "expediente de certificación" con la UI rica de la referencia v0. Mismo seam, mismo `CERTIFICATIONS_SOURCE`, mismo `CertificacionDetalle`. Mocks extendidos solo si la spec lo exige.
- **Pros**:
  - Reutiliza 100% del seam y los checks negativos de F2-06.
  - El path es claro: una sola ruta, una sola página, un solo PR.
  - Acopla natural con F4-02 (PDF preview) en la misma rama; ambos comparten rama `frontend/certificate-detail-pdf` según `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
  - Reduce superficie: la página mínima `certification-preview-page` desaparece; se reemplaza por el expediente.
  - El nombre del archivo y selector puede evolucionar a `certification-detail-page` o mantenerse como `certification-preview-page` con un rename opcional en la misma PR (decisión del design phase).
- **Contras**:
  - El rename del componente implica actualizar imports en `app.routes.ts` y en specs de runtime; riesgo bajo pero presente.
  - El forecast puede acercarse al budget 4000 (F2-06 cerró en 2600 inserciones / 47 bajas; la referencia v0 del expediente tiene 853 líneas TSX, lo que sugiere un port sustancial).
- **Esfuerzo**: **Medio**. Mocks + UI detalle + spec acotada + tests + QA.

### Opción B — F4-01 agrega una ruta nueva `/admin/certificaciones/:id/detalle`

- **Descripción**: se conserva la `certification-preview-page` mínima como vista resumida y se agrega una nueva ruta con la UI rica.
- **Pros**:
  - Permite revertir con un solo revert del PR de la nueva ruta.
  - Separa concerns: preview mínimo vs. detail rico.
- **Contras**:
  - Doble ruta, doble page, doble seam; contradice la guía de F2-06 que consolidó la previsualización en una sola pantalla.
  - Aumenta la superficie de UI y de tests; el usuario (Bedelía) debe aprender dos URLs para lo mismo.
  - La sidebar y el listado enlazarían a cuál? si a la nueva, la preview queda huérfana; si a la vieja, F4-01 no se ve.
- **Esfuerzo**: **Medio-Alto**. Sin reuso efectivo; trabajo casi duplicado.

### Opción C — F4-01 sin portar visual v0, solo ampliar `<dl>` actual

- **Descripción**: se mantiene la `certification-preview-page` con `<dl>` y se agregan dos o tres campos más al layout mínimo.
- **Pros**:
  - Diff chico, dentro del budget con margen.
  - Coherente con el estilo actual "previsualización segura".
- **Contras**:
  - **Rompe la paridad visual** (criterio de aceptación hard). La referencia v0 del expediente es rica, con layout 2 columnas, paneles, QR decorativo, zona de riesgo. Un `<dl>` extendido no alcanza.
  - El `archive-report.md` de F2-06 declara explícitamente el handoff a F4-01; hacer solo ampliación chiquita no cumple el contrato de handoff.
- **Esfuerzo**: **Bajo**. Pero viola el criterio de paridad.

## Decisión de alcance F4-01 vs F4-02

| Tema | F4-01 | F4-02 |
|---|---|---|
| Página | Expediente (admin) — `app/admin/certificaciones/[id]` | Vista previa PDF — `app/admin/certificaciones/[id]/pdf` |
| Datos | Mock-only, `documentMasked`/`tokenPrefix`/URL truncada/auditoría | Mock-only, replica institucional del documento (firmantes, QR decorativo) |
| Acciones | Todas disabled con handoff (descargar PDF/copiar link/entrega/regenerar/revocar) | Imprimir/Descargar PDF; sin generación real |
| Estado | Reactivo al cargar y al cambiar id (patrón F2-06 con `loadGen`) | Vista de documento, sin estado reactivo del backend |
| Bundle | Incremento por layout 2 columnas, paneles, QR SVG inline | Página standalone con `print:hidden` para barra de acciones |
| Rama | `frontend/certificate-detail-pdf` | `frontend/certificate-detail-pdf` (misma) |

**Recomendación de delivery**: single-pr (F4-01 + F4-02 en el mismo PR) si el forecast de `sdd-tasks` queda **≤ 3500 líneas**; chained-pr (dos PRs encadenados en la misma rama) si supera 3500. La guía del proyecto fija el budget en 4000; el forecast de F2-06 cerró en 2600, lo que sugiere que la unidad completa `certificate-detail-pdf` es manejable en un solo PR. La decisión final la toma `sdd-tasks` durante el forecast y `sdd-apply` la confirma con el guard de 400 líneas (`Section E` de `sdd-phase-common.md`).

## Recomendación

**Opción A** — F4-01 reemplaza la `certification-preview-page` mínima con la UI rica del expediente v0 (misma ruta, mismo seam, mock-only, todas las acciones disabled con handoff explícito a F4-02, F5-04, F6-01, F6-03). Acoplar F4-02 al mismo PR si el forecast lo permite; si no, abrir `f4-02-pdf-preview` como PR encadenado en la misma rama.

Razones:

1. **Coherencia con el handoff de F2-06**: el archive-report declara "Listo para el próximo ciclo" y los CTAs disabled actuales son literalmente la punta del iceberg que F4-01 debe completar.
2. **Reuso máximo**: seam `CERTIFICATIONS_SOURCE`, modelos `CertificacionDetalle`, seed de 6 certificados, constante `URL_PUBLICA_MAX`, checks negativos, sidebar, dashboard, rutas — todo está listo.
3. **Contratos backend sincronizados**: `admin-certificate-consulta` ya define el DTO de detalle con `attendedDates`, `auditEvents` y `links`; no se necesita esperar backend.
4. **Paridad visual disponible**: la referencia v0 en `muestra_pagina/components/admin/expediente-certificacion.tsx` es completa (estado, datos, acciones, QR, auditoría, zona de riesgo) y el sistema visual F1-02 ya tiene los tokens (`--ink`, `--circuit`, `--valid`, `--destructive`, etc.) mapeados en `apps/frontend-angular/src/styles.css`.
5. **Criterio de aceptación hard verificable**: la paridad visual es _hard acceptance_ y puede declararse en la spec y verificarse en `sdd-verify` con comparación de capturas.
6. **Riesgo acotable**: las acciones quedan disabled, lo que evita scope creep hacia revocación/PDF/QR/entrega real (los siguientes ciclos los habilitan con spec propia).

## Riesgos

- **Bloqueo de spec previa no cumplido**: si la spec F4-01 se redacta sin acotar historial, QR o revocación real, el ciclo puede invocar generación real de PDF/QR o revocación, lo que viola D0 y el bloqueo declarado. **Mitigación**: la spec debe declarar explícitamente "acciones reales de F4-02/F5-04/F6-01 quedan fuera; revocación, PDF/QR real y entrega manual se difieren a cambios posteriores con spec propia".
- **Mezcla de work units**: si F4-01 y F4-02 se acoplan en un solo PR, el diff puede acercarse al budget 4000. **Mitigación**: `sdd-tasks` debe pronosticar con guard lines explícitas; si supera 3500, dividir en dos PRs encadenados en la misma rama.
- **Confusión con la rama activa**: la rama actual es `frontend/admin-certifications` con el fix `c0102d6` aún no mergeado a `main`. **Mitigación**: el orquestador debe confirmar el estado del merge antes de crear `frontend/certificate-detail-pdf`; si no está mergeado, abrir desde la base explícita y aprobada.
- **Continuidad del fix PR #37**: el fix de recarga de preview debe respetarse; el patrón `loadGen` + `effect` debe replicarse en el expediente para no regresar el bug.
- **D0 DNI / token**: el expediente no debe exponer DNI completo ni token completo; debe continuar usando `documentMasked`, `tokenPrefix` y `URL_PUBLICA_MAX = 60`. **Mitigación**: extender `__checks__/no-secrets.spec.ts` y `no-real-data.spec.ts` con los literales del nuevo componente.
- **Riesgo de paridad visual**: si el detalle F4-01 se implementa sin comparar contra `muestra_pagina/app/admin/certificaciones/[id]`, el resultado puede desviar la identidad visual institucional. **Restricción**: la spec debe declarar la referencia v0 como _hard acceptance criterion_ y el verify debe comparar captura contra captura.
- **Cierre de F2-06**: el handoff asume que F2-06 está mergeado. Si la rama actual no se ha mergeado, F4-01 no debe abrirse hasta que la decisión de merge esté tomada. **Mitigación**: registrar en la propuesta F4-01 la base desde la que se ramifica y el estado del merge de F2-06.
- **Acciones clickeables vs disabled**: la referencia v0 muestra acciones que simulan con `setTimeout` y muestran feedback local. F4-01 debe decidir entre "todas disabled" (conservador, sigue patrón F2-06) o "clickeables con feedback mock" (más rico, sigue patrón v0). **Recomendación**: todas disabled para mantener la frontera con F4-02/F5-04/F6-01; un futuro ciclo puede habilitarlas con spec propia cuando haya backend integrado.
- **Tech debt del `HeaderInstitucional`**: el header raíz en `/admin/*` documentado en F2-03 sigue sin refactorizar. F4-01 debe respetarlo; no reabrir el refactor.

## Listo para propuesta

**Sí**, con las siguientes condiciones para el orquestador:

- Indicar al usuario que la fase siguiente recomendada es **F4-01 Detalle de certificación administrativo** (expediente) en la rama `frontend/certificate-detail-pdf`, con F4-02 (vista previa PDF) acoplable al mismo PR si el forecast lo permite.
- Confirmar si F2-06 + fix `c0102d6` ya están mergeados a `main` o siguen en la rama `frontend/admin-certifications`; sin esa confirmación no se puede crear `frontend/certificate-detail-pdf` desde una base explícita.
- Confirmar si se prefiere **single-pr** (F4-01 + F4-02) o **chained-pr** (un PR por ciclo) cuando el forecast del ciclo de implementación se acerque a 3500 líneas.
- Mantener el alcance mock-only y declarar el handoff explícito a F4-02, F5-04, F6-01 y F6-03 desde la spec de F4-01.
- Mantener la paridad visual como _hard acceptance criterion_ referenciando `muestra_pagina/app/admin/certificaciones/[id]`.
- Cerrar el change previo `planificar-siguiente-fase-matias` con `sdd-archive` (ya hecho durante este turn) antes de abrir el nuevo change, para mantener `openspec/changes/` limpio y la trazabilidad documental al día.

## Checklist de exploración (auto-verificación)

- [x] Leído `README.md`, `GUIA.md`, `docs/00-indice-general.md`.
- [x] Leído `docs/opencode/optimizacion-tokens.md` (ruta mínima del rol).
- [x] Leído `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` secciones F4-01 y F4-02.
- [x] Leído `openspec/changes/archive/2026-07-12-planificar-siguiente-fase-matias/exploration.md` (contexto previo).
- [x] Leído `openspec/changes/archive/2026-07-08-f2-06-admin-certifications/archive-report.md` (estado de handoff).
- [x] Leído `openspec/specs/admin-certifications-frontend/spec.md` (spec vigente F2-06).
- [x] Leído `openspec/specs/admin-certificate-consulta/spec.md`, `admin-certificate-delivery/spec.md`, `admin-certificate-revocation/spec.md` (contratos disponibles).
- [x] Leído `apps/frontend-angular/src/app/features/admin/certifications/{certifications.models,certifications.service,in-memory-certifications.service}.ts` y la preview-page actual.
- [x] Leído `apps/frontend-angular/src/app/app.routes.ts` (orden de rutas y provider).
- [x] Leído `muestra_pagina/components/admin/expediente-certificacion.tsx` (referencia visual v0 del expediente, scope completo).
- [x] Leído `muestra_pagina/app/admin/certificaciones/[id]/page.tsx` y sub-rutas `entrega`, `pdf`, `revocar` (frontera con F5-04/F4-02/F6-01).
- [x] No se inspeccionó material privado, secretos, dumps, logs ni descargas del servidor.
- [x] No se editó código de producto; solo se creó `exploration.md` en `openspec/changes/f4-01-certificate-detail/`.

## Próximo paso

`/sdd-new f4-01-certificate-detail` para abrir el change con `sdd-propose` (alcance, criterios, rollback), continuando con `sdd-spec` (delta sobre `admin-certifications-frontend`), `sdd-design`, `sdd-tasks` (forecast con guard lines), `sdd-apply`, `sdd-verify` y `sdd-archive`.
