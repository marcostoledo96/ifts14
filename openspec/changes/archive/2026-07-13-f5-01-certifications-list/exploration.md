# Exploración — f5-01-certifications-list

> Estado: exploración. Esta fase NO implementa producto.
> Rama activa: `frontend/certifications-list` (base `850d6a8`).
> Cambio OpenSpec: `f5-01-certifications-list`.
> Idioma: español argentino formal, conciso. Especificaciones, copy de UI y comentarios en español. Identificadores de código según convención del proyecto (TypeScript/Angular existente). No inyectar voseo rioplatense en artefactos.

## Goal y alcance confirmados

Origen de verdad: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (F0-F6 unificado, semana 5) y la spec vigente `admin-certifications-frontend` dejada por F2-06.

| Campo | Valor |
|---|---|
| Ciclo | F5-01 — Listado de certificaciones |
| Rama sugerida | `frontend/certifications-list` (ya activa en local, sin commits propios) |
| Objetivo | Evolucionar el listado de `/admin/certificaciones` a paridad funcional y visual con la referencia v0, agregando **filtros, paginación y estados** sobre el seam `CERTIFICATIONS_SOURCE`, sin integrar backend ni datos reales. |
| Alcance | Lista navegable con tabla desktop (≥`md`) y tarjetas mobile (<`md`); chips de filtro por estado de validez y estado de entrega; búsqueda libre (alumno, DNI-mascarado, curso, número); paginación client-side; estados de carga, error, vacío-total y sin-coincidencias diferenciados; resumen accesible "Mostrando N de M"; limpiar filtros; conmutador de vistas para QA; paridad visual con `muestra_pagina/components/admin/lista-certificaciones.tsx` (768 líneas) portado a Angular 20 con tokens F1-02. |
| Fuera de alcance | Emisión, revocación, PDF, QR, entrega manual, integración HTTP/HttpClient, `X-Admin-Key`, storage/cookies, datos reales o sensibles, datos privados, DNI completo en UI admin, tokens completos, emails, matrículas, dependencias nuevas, Tailwind/shadcn/lucide/CVA, copia literal React/Next, datos reales desde backend (F5-04/F6-01/F6-03), cualquier cambio sobre `apps/backend-php/`, `database/`, `deploy/`, `material_privado_no_versionar/` o el `muestra_pagina/` salvo lectura segura de la referencia visual. |

Restricción obligatoria del prompt raíz y de D0: "**No expongas DNI completo en pantallas públicas ni token completo.**"

## Estado actual post F4-04

`frontend/certifications-list` está en `850d6a8` (Merge PR #48 — `frontend/course-detail`), limpio, sin commits propios. Toda la base F2-06, F4-01 y F4-02 está mergeada a `main`.

App Angular 20 en `apps/frontend-angular/`:

- Build prod verde al cierre de F4-04. Estructura por features; `src/app/features/admin/` contiene la base común de F2-03 y las features completas de F2-04, F2-05 y F2-06.
- `features/admin/certifications/` (F2-06):
  - `certifications.models.ts` (35 líneas): `EstadoCertificado = 'borrador' | 'vigente' | 'revocado' | 'vencido'`, `Certificacion`, `CertificacionDetalle`, `AuditEvent`, `CertificacionesFiltros { estado?, q? }`.
  - `certifications.service.ts` (18 líneas): interfaz `CertificationsService { listar, obtener, contar }` + `InjectionToken CERTIFICATIONS_SOURCE`.
  - `in-memory-certifications.service.ts` (167 líneas): seed de 6 certificados ficticios, `documentMasked` `XX****XX`, `tokenPrefix` `prefijo_demo_xxx`, `URL_PUBLICA_MAX = 60` (constante nombrada) y `truncarUrl()`.
  - `pages/list/certifications-list-page.{ts,html,css,spec.ts}`: **estado actual** — banner demo, `<input type="search">` (alumno/curso), `<select>` por estado, grilla 1-2 columnas con `<article class="card-cert">`, sin tabla desktop, sin cards mobile con métricas, sin chips de validez, sin paginación, sin limpiar filtros, sin vista de QA conmutable.
  - `pages/preview/certification-preview-page.{ts,html,css,spec.ts}` (F4-01): expediente completo con loadGen + effect, todas las acciones disabled con handoff F4-02/F5-04/F6-01/F6-03.
  - `pages/pdf/certification-pdf-preview-page.{ts,html,css,spec.ts}` (F4-02): vista imprimible A4 apaisado con `window.print()`.
  - `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts`: 4 + ~9 escenarios sobre el feature completo, enumeración de métodos/getters/constructores + funciones module-level.
- Ruteo (`app.routes.ts`): `/admin/certificaciones*` registrado en orden seguro; `CERTIFICATIONS_SOURCE` provider a nivel del bloque admin. Catch-all admin preservado.
- Sidebar y dashboard (`sidebar-admin.*`, `admin-dashboard-page.*`): Certificaciones activa como navegación real con conteo desde `CERTIFICATIONS_SOURCE.contar()` (signal hidratado con fallback honrado a `0`).
- Especificación vigente: `openspec/specs/admin-certifications-frontend/spec.md` (4 requirements, 8 escenarios) — **menciona filtro por estado y búsqueda libre pero NO menciona paginación, chips de filtro por entrega, ni la diferenciación carga/error/vacío/sin-coincidencias que F4-03 ya implementó para cursos**. F5-01 cierra esos gaps.

Contrato backend (referencia, NO se conecta): `docs/backend/01-contrato-api-certificados.md` y specs `admin-certificate-consulta`, `admin-certificate-emission`, `admin-certificate-delivery`, `admin-certificate-revocation`. `GET /admin/certificados` ya define filtros `estado`, `cursoId` y `alumnoId`; el DTO es camelCase con `documentMasked` (no DNI completo), `tokenPrefix` (no token completo), `certificateCode` (no UUID) y `links` relativos. La paginación **no está documentada en el contrato backend** (queda para una decisión posterior; F5-01 puede paginar client-side sobre el seed mock).

Inventario v0 en `muestra_pagina/components/admin/lista-certificaciones.tsx` (referencia visual, NO se copia):

| Aspecto v0 | Mapeo F5-01 |
|---|---|
| Búsqueda libre (`alumno`/`dni`/`curso`/`numero`) con icono `Search` | `<input type="search">` (sin icono Lucide; reusar patrón F4-03) |
| Chips de filtro de validez (`valida`/`revocada`/`pendiente`) | Replicar con `aria-pressed`; usar enum `EstadoCertificado` (vigente, revocado, borrador, vencido) |
| Chips de filtro de entrega (`entregado`/`pendiente-entrega`/`requiere-nueva-entrega`) | **Replicar como grupo aparte**; el seed actual **no tiene campo `envio`** — F5-01 debe **agregarlo a `Certificacion`** como nuevo campo opcional `envio: 'entregado' \| 'pendiente-entrega' \| 'requiere-nueva-entrega'` y poblar el seed con valores consistentes (sin plausibles). |
| Vista conmutable para QA (`datos`/`cargando`/`error`/`vacio-total`) | Misma idea; QA-only, sin persistencia ni URL state; patrón equivalente a F4-03 con `cargando/error/vacioTotal/sinCoincidencias` |
| Tabla desktop con 7 columnas (N.°, alumno/DNI, curso, emisión, validez, entrega, acción) | Tabla `<caption>` + `<th scope="col">`; mobile cards con `<dl>` de métricas |
| Cards mobile | Replicar paridad F4-03 con `<article class="card-cert-mobile">` |
| Contador "Mostrando N de M" | `<p aria-live="polite">` con resumen de página actual |
| Paginación `1 2 3 …` con `«`/`»` y `aria-current="page"` | **No existe** en Angular. F5-01 la introduce: `PAGINA_TAMANO` constante (5), `Paginacion` componente inline, navegación accesible |
| `PAGINA_TAMANO = 5` (constante v0) | Adoptar como `PAGINA_TAMANO` en `in-memory-certifications.service.ts` y `certifications-list-page.ts` |
| `ValidezBadge` con punto y label | Replicar como `EstadoBadge` o `ValidezChip` reutilizable |
| `EnvioEstado` con icono | Replicar como `EnvioChip` sin icono Lucide (reusar tokens) |
| Botón "Limpiar filtros" condicional | Reusar patrón F4-03: `onLimpiarFiltros()` con `hayFiltrosActivos` computed |
| Botón "Nueva certificación" (`/admin/certificaciones/nueva`) | **Diferido a F5-04 o ciclo posterior** (no emisión real, no en alcance F5-01). El botón no debe mostrarse en F5-01, o si se muestra, debe estar `disabled` con copy "Disponible en F5-04/F6" — mejor omitir. |
| `TablaCargando` (5 skeleton rows) | Adoptar con `<output aria-busy="true">` |
| `EstadoError` con "Reintentar" | Reusar patrón F4-03 |
| `EstadoSinResultados` con "Limpiar filtros" | Reusar patrón F4-03 |
| `EstadoVacio` con CTA "Emitir primera certificación" | Reusar patrón F4-03 pero **sin CTA** (F5-01 no habilita emisión); copy "Sin coincidencias" o "No hay certificaciones registradas" |

## Áreas afectadas (cambio activo)

Frontend Angular 20 (`apps/frontend-angular/src/app/`):

- `features/admin/certifications/certifications.models.ts` — **extender** `Certificacion` con `envio?: 'entregado' | 'pendiente-entrega' | 'requiere-nueva-entrega'` y `numero?: string` (derivado de `id` para paridad con v0 que muestra `IFTS14-2024-001`); agregar `TipoEnvio` y `PAGINA_TAMANO = 5`; mantener `CertificacionesFiltros` extendiendo a `estado?`, `q?`, `envio?` (sin `cursoId`/`alumnoId` en F5-01 — la v0 no los usa como tales; el contrato backend ya los define pero el listado mock puede derivar `cursoNombre`/`nombreAlumno` desde el seed).
- `features/admin/certifications/in-memory-certifications.service.ts` — poblar el seed con `envio` y `numero` consistentes; **agregar** `listar(filtros, paginacion?)` que devuelva `{ items, total, pagina, totalPaginas }` o extender el retorno a `{ items, total }` con la página controlada desde el componente; `contar()` se mantiene.
- `features/admin/certifications/pages/list/certifications-list-page.{ts,html,css,spec.ts}` — **evolución in-place**:
  - `ts`: signals para `q`, `estado`, `envio`, `pagina`, `vistaQA`; computed `hayFiltrosActivos`, `vacioTotal`, `sinCoincidencias`, `totalPaginas`, `itemsVisibles`; `loadGen` (patrón F4-03 para descartar respuestas obsoletas); `onSearch`, `onEstado`, `onEnvio`, `onPagina`, `onLimpiarFiltros`, `onReintentar`, `onVistaQA`.
  - `html`: bloque `.filtros` con chips `aria-pressed` para validez y entrega; bloque `.results-summary` con "Mostrando N de M" + limpiar; bloque `.vista-qa` (QA-only, no afecta a usuarios reales); bloque `.courses-table-wrap` con `<table>` desktop con 7 columnas; `<ul class="cards-mobile">` con `<article>` por certificación; `<nav class="paginacion">` con `«`/números/`»`; estados `cargando`, `error`, `vacioTotal`, `sinCoincidencias` diferenciados.
  - `css`: tokens F1-02; `.estado-chip` con variantes `estado-vigente`, `estado-borrador`, `estado-revocado`, `estado-vencido`; `.envio-chip` con variantes `envio-entregado`, `envio-pendiente`, `envio-requiere`; `.paginacion` con focus visible; `.vista-qa` botones `aria-pressed`; `.demo-banner` (ya existe).
  - `spec`: ≥15 tests (estilo F4-03 — `certifications-list-page.spec.ts` actual tiene 10): render del banner demo, búsqueda, filtro por estado, filtro por envío, limpiar filtros, paginación (página 2/3, «, », aria-current, página inválida), empty state sin/sin filtros, error con reintento, vista QA conmutable, no expone token/DNI/email/legajo/matrícula/UUID, navegación al detalle preserva link, mobile/desktop responsive (no testeable unitariamente — verificar en F3-04 QA manual con Playwright).
- `features/admin/certifications/__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` — **extender** para cubrir los literales del nuevo componente (DNI en el listado si se porta verbatim, números `IFTS14-2024-NNN`, etiquetas `entregado/pendiente/requiere`).
- `app.routes.ts` y `app.routes.spec.ts` — sin cambios funcionales; sólo verificar que el orden seguro se preserva.
- `features/admin/sidebar-admin.{ts,html,spec.ts}` — sin cambios (el ítem ya está activo y `isActive()` cubre el prefijo).
- `features/admin/admin-dashboard-page.{ts,html,spec.ts}` — sin cambios (el conteo ya viene de `CERTIFICATIONS_SOURCE.contar()`).
- `apps/frontend-angular/AGENTS.md` — sin cambios.
- `openspec/specs/admin-certifications-frontend/spec.md` — **modificar**: agregar requirement de paridad visual y paginación client-side; extender requirement de listado con chips de validez y entrega, búsqueda ampliada, paginación 5, contador, limpiar filtros, vista QA; mantener los handoffs a F5-04/F6-01/F6-03.
- `docs/frontend/00-angular20-port-v0.md` — agregar bloque "Estado F5-01 — Listado de certificaciones (mock)" siguiendo el patrón de F4-03/F4-04, con archivos creados, archivos modificados, límites, verificación y handoff a F5-04/F6-01/F6-03.
- `docs/frontend/F5-01-listado-certificaciones-paridad-v0.md` (nuevo) — documentar ruta, secciones, filtros, paginación, paridad, frontera de datos, evidencia visual.

`muestra_pagina/components/admin/lista-certificaciones.tsx` — **solo referencia visual** (lectura segura). No compilar ni portar literalmente; respetar identidad institucional del IFTS 14. Capturas aplicables para `parity-notes.md`: `admin-desktop.png` (151.8 kB) y `admin-mobile.png` (106.7 kB) para el contexto general; no hay captura dedicada del listado de certificaciones en `muestra_pagina/capturas/` — usar las del shell admin como referencia de layout y composición visual, no como comparación pixel-a-pixel.

## Lo que NO se toca

Reglas absolutas (heredadas y reforzadas para F5-01):

- **Backend, deploy, base de datos, `material_privado_no_versionar/`** — Marcos mantiene autoridad total. OpenCode no debe leer ni versionar ese material.
- **Auth real ni `X-Admin-Key`** — la sesión mock de F2-03 sigue siendo el único modo admin en F5-01. La clave admin nunca debe aparecer en bundle, `localStorage`/`sessionStorage`/cookies/IndexedDB, ni en llamadas HTTP desde Angular.
- **HTTP/HttpClient/fetch/XMLHttpRequest desde el browser** — la frontera con la API PHP queda para `frontend/api-readiness` (Marcos). F5-01 sigue mock-only aunque el contrato backend ya defina `GET /admin/certificados?estado=&cursoId=&alumnoId=` y `GET /admin/certificados/{id}`.
- **Storage del navegador** — sin `localStorage`/`sessionStorage`/cookies/IndexedDB; la sesión mock es solo en memoria.
- **Datos reales o sensibles** — sin DNI completo en UI admin (D0 reserva DNI completo solo al DTO público de validación), sin token completo, sin email, sin matrícula, sin legajo. Los mocks usan `documentMasked` `XX****XX` y `tokenPrefix` `prefijo_demo_xxx`. El campo `numero` derivado debe ser ficticio (ej. `IFTS14-CERT-0001`) sin DNI plausible ni UUID.
- **Email, SMTP, PHPMailer, transporte `stub|smtp`** — fuera del MVP. F5-01 no envía email.
- **Generación real de PDF/QR** — la previsualización y el PDF viven en F4-01/F4-02 ya implementados; F5-01 no los toca.
- **Emisión ni revocación reales** — los CTAs de emisión/entrega/revocación siguen deshabilitados con handoff; F5-01 no habilita ninguno.
- **Copia literal de React/Next** — `muestra_pagina/` se usa solo como referencia visual y de composición; reimplementar la intención en Angular 20 con tokens F1-02. No usar `lucide-react` ni equivalente, no usar Tailwind/shadcn/CVA, no portar imports React/Next, no usar `AdminShell` ni `next/link` ni `params: Promise<{ id: string }>`.
- **Dependencias nuevas** — `package.json` y lockfiles sin cambios. Reutilizar `BandaEstado`, `CampoDato`, `HeaderInstitucional`, `FolioShell` y tokens CSS de F1-02/F4-03.
- **Operaciones Git automáticas** — diff-confirmation gate antes de `git add`, pre-push safety antes de `git push`, ningún `git push` directo a `main`. PR, merge, rebase requieren aprobación explícita con comando exacto y evidencia previa.
- **Cambios fuera del alcance** — no tocar `apps/backend-php/`, `database/`, `deploy/`, ni el `muestra_pagina/` (sólo lectura segura para inventario).

## Reuso desde F2-04/F2-05/F2-06/F4-01/F4-02/F4-03

| Recurso | Origen | Reuso en F5-01 |
|---|---|---|
| `MOCK_SESSION` + `adminGuard` | `features/admin/mock-session.ts`, `admin-guard.ts` | Ruta `/admin/certificaciones*` con `canActivate: [adminGuard]` (ya está) |
| `AdminShell` + `SidebarAdmin` | `features/admin/admin-shell.*`, `sidebar-admin.*` | Sin cambios; `isActive()` ya cubre el prefijo |
| Patrón `*_SOURCE` | `COURSES_SOURCE`, `ATTENDANCE_SOURCE`, `CERTIFICATIONS_SOURCE` | Reusar `CERTIFICATIONS_SOURCE` (sin nuevos seams) |
| `InMemoryXService` | `in-memory-courses.service.ts`, `in-memory-certifications.service.ts` | Extender el mock con `envio`/`numero` y método de paginación client-side |
| Páginas con `loadGen` | `courses-list-page.ts` (F4-03), `certification-preview-page.ts` (F4-01) | Adoptar `loadGen` en `certifications-list-page.ts` para descartar respuestas obsoletas |
| Tabla desktop + cards mobile | `courses-list-page.html` (F4-03) | Replicar patrón con 7 columnas; mobile `<article>` con `<dl>` de métricas |
| Chips de filtro con `aria-pressed` | `courses-list-page.html` (F4-03) | Replicar para validez y entrega |
| Resumen accesible + limpiar filtros | `courses-list-page.html` (F4-03) | Replicar con "Mostrando N de M" |
| Estados carga/error/vacío/sin-coincidencias | `courses-list-page.html` (F4-03) | Replicar con cuatro ramas explícitas |
| `__checks__/no-secrets.spec.ts`, `no-real-data.spec.ts` | Mismo patrón F2-06 | Aplicar a F5-01; enumerar el nuevo componente y las nuevas funciones module-level |
| `BandaEstado`, `CampoDato`, `FolioShell`, `HeaderInstitucional` | `shared/ui/` | Reutilizar `BandaEstado` para estado de validez; sin nuevos tokens |
| Tokens CSS F1-02 + F4-03 | `apps/frontend-angular/src/styles.css` + `courses-list-page.css` | Reutilizar sin redefinir; reusar `.estado-chip` y `.filter-chips` |
| `RouterTestingHarness` + `withComponentInputBinding()` | `app.routes.spec.ts` | Verificar orden y provider; F5-01 no agrega ruta nueva |
| `loadGen` (descarta stale) | `certification-preview-page.ts` (F4-01) | Replicar patrón en `certifications-list-page.ts` para evitar regresión de carga obsoleta |

## Gaps identificados (alcance F5-01)

Comparación `muestra_pagina/components/admin/lista-certificaciones.tsx` vs `apps/frontend-angular/src/app/features/admin/certifications/pages/list/certifications-list-page.html` actual:

| Aspecto v0 | Estado Angular actual | Acción F5-01 |
|---|---|---|
| Chips de filtro de validez (3 estados) | Ausente; hay `<select>` por estado único | **Replicar** como grupo de chips `aria-pressed` |
| Chips de filtro de entrega (3 estados) | Ausente | **Replicar** como grupo aparte (requiere `envio` en `Certificacion`) |
| Búsqueda libre en 4 campos (alumno/DNI/curso/numero) | Solo `nombreAlumno` y `cursoNombre` | **Extender** a `numero` (si se agrega) y mantener la búsqueda actual |
| Tabla desktop con 7 columnas | Cards responsive 1-2 columnas | **Reemplazar** por tabla ≥`md` con caption + th scope + 7 columnas |
| Cards mobile con `<dl>` de métricas | Cards con `<dl>` básico | **Replicar** métricas (validez + entrega + emisión + alumno) |
| Contador "Mostrando N de M" | Ausente | **Agregar** `<p aria-live="polite">` |
| Paginación `« 1 2 3 … »` con `aria-current="page"` | Ausente | **Introducir** con `PAGINA_TAMANO = 5` y componente inline |
| Botón "Limpiar filtros" | Ausente | **Agregar** condicional con `hayFiltrosActivos()` |
| Vista conmutable para QA (4 estados) | Diferenciado por rama `@if` | **Agregar** `vistaQA` QA-only con 4 botones `aria-pressed` (datos/cargando/error/vacío-total) |
| `ValidezBadge` con punto y label | `estado-chip` plano | **Extender** con punto de color (sin icono Lucide) |
| `EnvioEstado` con icono | Ausente | **Replicar** sin icono (tokens) |
| `TablaCargando` (5 skeleton rows) | Texto "Cargando certificaciones…" | **Reemplazar** con `<output aria-busy="true">` + 5 `<li>` skeleton |
| `EstadoError` con "Reintentar" | `<p role="alert">` sin acción | **Reemplazar** con bloque dedicado + botón "Reintentar" |
| `EstadoSinResultados` con "Limpiar filtros" | `<output aria-live="polite">` plano | **Reemplazar** con bloque dedicado + botón "Limpiar filtros" |
| `EstadoVacio` con CTA "Emitir primera certificación" | `<output>` plano | **Reemplazar** con bloque dedicado **sin CTA** (F5-01 no habilita emisión) |
| Botón "Nueva certificación" (`/admin/certificaciones/nueva`) | Ausente | **No incluir** (handoff F5-04/F6 posterior); si se incluye, `disabled` con copy explícito |
| Paridad visual con tokens F1-02 | Tokens F1-02 aplicados | **Mantener y mejorar**; reusar `courses-list-page.css` como base |

## Riesgos y edge cases

| Riesgo | Mitigación |
|---|---|
| Re-pisar `adminGuard` o `MOCK_SESSION` | No modificar `mock-session.ts` ni `admin-guard.ts`; sólo registrar `canActivate: [adminGuard]` en el nuevo bloque de rutas (sin cambio) |
| Mezclar paridad visual de F2-06 con F4-03 | Usar F4-03 (`courses-list-page.html`) como **plantilla estructural** y v0 como **referencia de composición visual**; los dos convergen |
| `envio` mal poblado en seed | Constreñir a `TipoEnvio` enum; tests cubren los tres valores y la ausencia (null) |
| Paginación: ¿client-side o server-side? | **Client-side** sobre el seed mock; el contrato backend aún no define `page`/`pageSize`; la sustitución por `HttpCertificationsService` queda para una fase posterior con sesión segura aprobada (PHP HttpOnly o equivalente) |
| Página inválida (> `totalPaginas`) | Computed corrige a `1`; `aria-current` en la página vigente; sin excepciones |
| Filtros activos sin matches (sin-coincidencias) | Rama `@else if (sinCoincidencias())` con botón "Limpiar filtros" (copy de v0) |
| Vista inicial vacía (sin filtros, sin matches) | Rama `@else if (vacioTotal())` con copy "Sin certificaciones registradas" (sin CTA) |
| `loadGen` no adoptado y carga obsoleta al cambiar filtro rápido | Adoptar el patrón de F4-03: `loadGen++` en cada `recargar()`, ignorar respuesta si `gen !== loadGen` |
| `0x1`/`1e0` como ids en la tabla | No aplica: el listado recibe `Certificacion` (no `id` desde ruta), `c.id` siempre es `number` |
| `documentMasked` accidentalmente completado | Pattern `XX****XX` validado por `__checks__/no-real-data.spec.ts` ya existente; re-verificar al extender el seed con `envio`/`numero` |
| `tokenPrefix` mal derivado de un token completo en mock | Construir el prefijo independientemente del token (`prefijo_demo_xxx`); ningún mock debe tener un token verificable real |
| Sesión mock no activa al navegar directo a `/admin/certificaciones` | `adminGuard` ya redirige a `/admin/login`; el test de `app.routes.spec.ts` ya cubre el caso |
| Sobre-ingeniería: crear `PaginationService`, `FilterService`, `VistaQaService` cuando el spec dice "no emisión, no PDF, no QR" | Limitar el alcance a signals + computed + métodos del componente; sin servicios nuevos. Marcar `ponytail:` cualquier abstracción especulativa. |
| Regresión visual en el dashboard o sidebar | Reuso de `<a routerLink>` y conteo ficticio; smoke manual contra el listado |
| `app.routes.spec.ts` que prueba orden y provider con mocks se vuelve frágil | Mantener el patrón actual: tests con `RouterTestingHarness` y `withComponentInputBinding()`; agregar caso de "id inválido en el listado" sin tirar runtime |
| Tamaño de revisión > 4000 líneas | F4-03 midió ~900 líneas adicionales; F5-01 (listado + chips + paginación + vista QA + checks + spec + docs) ~1000-1500 → dentro del budget. Si supera, dividir en dos PRs (chips+filtros en uno, paginación+vista QA en otro) antes de `apply` |
| Confusión entre `documentMasked` (admin) y `documentNumber` (público) | Spec `admin-certifications-frontend` debe aclarar: en UI admin siempre `documentMasked`; DNI completo solo en `validar/:tokenCertificacion` pública |
| Git push directo a `main` | Prohibido por AGENTS.md; toda operación Git con aprobación explícita y comandos exactos |
| Tech debt conocido: `HeaderInstitucional` raíz en `/admin/*` | Documentado en F2-03/F4-03; no tocar en F5-01 |
| Vista QA conmutable expone estados de error en producción | Marcar con `data-qa="..."` o clase `.vista-qa` envuelta en `display: none` salvo `?qa=...` o un guard de `environment`; alternativa más simple: la vista QA vive solo en runtime de tests, no se renderiza en producción. **Decidir en design** entre (a) botones siempre visibles con `aria-pressed` y copy "Vista de revisión", o (b) solo accesible bajo flag de runtime/tests. v0 la expone siempre; F4-03 no la implementó. Recomendación: seguir v0 con copy "Vista de revisión (QA)" para paridad. |

## Enfoque recomendado y alternativas

| Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|
| **A. Listado evolucionado in-place con tabla+cards+chips+paginación+vista QA (recomendado)** | Cobertura completa del handoff; reuso pleno de F2-04/F2-05/F2-06/F4-03; budget cómodo; habilita F5-04 sin reescribir | Página más amplia; mezcla paridad v0 con patrón F4-03 | Bajo–Medio |
| B. Solo chips + limpiar filtros + vista QA (sin paginación ni tabla) | Mínimo, dentro del budget; preserva cards | F5-01 dejaría la paginación y la tabla desktop como handoff total; aleja la paridad visual del v0 | Muy bajo |
| C. Listado + paginación + chips + vista QA, **sin tabla ni cards mobile duales** | Centrado en una sola vista | Rompe paridad con v0 (tabla vs cards); mobile pierde usabilidad | Bajo–Medio |
| D. Paginación server-side vía `HttpCertificationsService` con HttpOnly | Realista, contract-ready | **Rompe mock-only** y requiere backend aprobado; F5-01 está declarado mock-only; excede alcance | Alto + scope creep |

**Recomendación: A.** Es la lectura literal del prompt raíz ("implementar el listado de certificaciones con filtros, paginación y estados usando mocks explícitos o contrato documentado"), el espejo natural de F4-03 (que activó Cursos con lista + tabla + chips + métricas) y la única vía que cumple el handoff declarado en el archive F2-06 ("listado real desde backend" → F5-01 lo hace navegable con todos los affordances visibles para cuando llegue la integración). La paginación client-side sobre el seed mock es honesta: la sustitución por `HttpCertificationsService` queda para una fase con sesión segura aprobada.

## Forecast de tamaño

Estimación contra presupuesto de revisión de **4000 líneas** (`additions + deletions`):

- `features/admin/certifications/certifications.models.ts` (extender `Certificacion` con `envio`/`numero` y `CertificacionesFiltros` con `envio?`): ~10-20 líneas adicionales.
- `features/admin/certifications/in-memory-certifications.service.ts` (poblar seed con `envio`/`numero`; método de paginación client-side): ~50-80 líneas.
- `features/admin/certifications/pages/list/certifications-list-page.{ts,html,css,spec.ts}` (evolución in-place con tabla, cards, chips, paginación, vista QA, estados diferenciados): ~500-800 líneas.
- `features/admin/certifications/__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` (extender para los nuevos literales): ~40-80 líneas.
- `openspec/specs/admin-certifications-frontend/spec.md` (modificar requirement de listado + agregar requirement de paridad/paginación): ~60-100 líneas.
- `docs/frontend/00-angular20-port-v0.md` + `docs/frontend/F5-01-listado-certificaciones-paridad-v0.md` (nuevo) + `openspec/changes/f5-01-certifications-list/evidence/parity-notes.md` (nuevo): ~80-150 líneas.
- Tests existentes adaptados y agregados: ~150-250 líneas.

**Total estimado: ~900-1500 líneas.** Budget risk: **Low**. Si la implementación supera 2500 líneas, dividir en dos PRs (chips + limpiar filtros + vista QA en uno, paginación + tabla desktop + mobile cards duales en otro) usando `work-unit-commits` antes de `apply`. No se requiere `size:exception` salvo que aparezca scope creep.

**Chained PRs recommended: No** (corte por feature auto-contenido en single PR con work units por fase). **Decision needed before apply: No** (alcance claro y dentro del budget).

## Lista de verificación de exploración (auto-verificación)

- [x] Leído `README.md`, `GUIA.md`, `docs/00-indice-general.md`, `docs/opencode/optimizacion-tokens.md`.
- [x] Leído `AGENTS.md` raíz y `apps/frontend-angular/AGENTS.md`, `openspec/AGENTS.md`, `docs/AGENTS.md`, `docs/opencode/AGENTS.md`.
- [x] Leído `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` sección F5-01 (líneas 1577-1599) y contexto F0-F6.
- [x] Leído `openspec/specs/admin-certifications-frontend/spec.md` (spec vigente F2-06) y `openspec/specs/admin-certificate-consulta/spec.md` (contrato backend).
- [x] Leído `openspec/changes/archive/2026-07-08-f2-06-admin-certifications/{exploration,archive-report}.md` (estado de handoff).
- [x] Leído `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/exploration.md` (criterios de paridad y handoffs).
- [x] Leído `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/exploration.md` (criterios de print styles y CTAs del expediente).
- [x] Leído `openspec/changes/archive/2026-07-12-f4-03-courses-list/{exploration,proposal,tasks,verify-report,parity-notes}.md` (patrón de tabla+cards+chips+estados+limpiar filtros+sin métricas reales).
- [x] Leído `apps/frontend-angular/src/app/features/admin/certifications/{certifications.models,certifications.service,in-memory-certifications.service,__checks__/no-secrets,__checks__/no-real-data,pages/list/certifications-list-page,pages/preview/certification-preview-page,pages/pdf/certification-pdf-preview-page}.{ts,html,css,spec.ts}`.
- [x] Leído `apps/frontend-angular/src/app/{app.routes,app.routes.spec,admin-dashboard-page,sidebar-admin,admin-shell,admin-guard,mock-session}.{ts,html,css,spec.ts}`.
- [x] Leído `apps/frontend-angular/src/app/features/admin/courses/courses.models.ts`, `courses-list-page.{ts,html,css,spec.ts}` e `in-memory-courses.service.ts` como referencia de patrón.
- [x] Leído `docs/backend/01-contrato-api-certificados.md` (contrato backend) y `docs/backend/00-php84-api.md` (endpoints disponibles).
- [x] Leído `muestra_pagina/components/admin/lista-certificaciones.tsx` (768 líneas, referencia visual v0 completa).
- [x] Leído `muestra_pagina/app/admin/certificaciones/page.tsx` (entrada de ruta v0).
- [x] Listado el árbol `muestra_pagina/capturas/` (no hay captura dedicada del listado de certificaciones; usar `admin-desktop.png`/`admin-mobile.png` como contexto general).
- [x] CodeGraph: explorado `CertificationsListPage`, `InMemoryCertificationsService`, `CertificacionesFiltros`, `Paginacion` de `lista-certificaciones.tsx` y `lista-alumnos.tsx` para confirmar el panorama.
- [x] Verificado el estado de las ramas: `frontend/certifications-list` en `850d6a8` (base limpia, sin commits propios); `frontend/admin-certifications` mergeada; F4-01/F4-02/F4-03/F4-04 todos mergeados a `main`.
- [x] No se inspeccionó material privado, secretos, dumps, logs ni descargas del servidor.
- [x] No se editó código de producto; solo se creó `exploration.md` en `openspec/changes/f5-01-certifications-list/`.

## Ready for proposal

**Yes.** La próxima fase recomendada es `sdd-propose` sobre `openspec/changes/f5-01-certifications-list/proposal.md`, con el siguiente esqueleto:

1. **Why** — cerrar el handoff declarado en el archive F2-06 ("listado real desde backend"), evolucionando el listado mock de F2-06 a paridad funcional y visual con la referencia v0 (filtros, paginación, estados diferenciados), sin tocar backend ni salir del alcance mock-only. Habilita F5-04 (entrega manual) y F6-01 (revocación) sobre una base navegable y contract-ready.
2. **What changes** — spec `admin-certifications-frontend` (modificada: agregar requirement de paridad visual y paginación; extender requirement de listado con chips de validez/entrega, búsqueda ampliada, paginación 5, contador, limpiar filtros, vista QA) + código Angular 20 bajo `features/admin/certifications/{models,in-memory,pages/list,__checks__}` + `docs/frontend/00-angular20-port-v0.md` (bloque "Estado F5-01") + `docs/frontend/F5-01-listado-certificaciones-paridad-v0.md` (nuevo) + `evidence/parity-notes.md` (nuevo).
3. **Impact** — sólo frontend; sin backend, sin deploy, sin DB, sin auth real, sin deps nuevas. Mismas rutas `/admin/certificaciones` y `/admin/certificaciones/:id`; sin cambio en sidebar/dashboard/guard/sesión. Se reemplaza el componente `CertificationsListPage` in-place; no se renombran archivos.
4. **Rollback** — revertir PR; el shell admin sigue funcionando con el placeholder deshabilitado como antes de F2-06.
5. **Out of scope** — emisión real, revocación real, PDF/QR reales, entrega manual, integración HTTP, `X-Admin-Key`, claves admin temporales, backend, deploy, base de datos, `.htaccess`, material privado, auth real, cookies/`localStorage`/`sessionStorage`/IndexedDB, datos reales, DNI completo administrativo, tokens completos, emails, legajos, matrículas, credenciales demo de `muestra_pagina/`, Tailwind/shadcn/lucide/CVA, copia literal React/Next, dependencias nuevas (`package.json`/lockfiles sin cambios), y la sustitución real por `HttpCertificationsService` (queda para una fase con sesión segura aprobada). El botón "Nueva certificación" del v0 queda fuera (handoff F5-04/F6).

Sugerencia de nombre de cambio OpenSpec: `f5-01-certifications-list` (alineado a la rama y al índice de fases de Matías).

## Siguiente fase sugerida

`sdd-propose` sobre el cambio `f5-01-certifications-list` en `openspec/changes/f5-01-certifications-list/proposal.md`.
