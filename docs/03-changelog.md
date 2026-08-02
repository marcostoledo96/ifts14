# Changelog del producto

Registro consolidado de lo implementado. No reemplaza el historial Git ni `openspec/changes/archive/`; resume el estado útil para onboarding.

## 2026-08 — Créditos de autores y preparación repo público

- Crédito de desarrollo en footers (público, login admin, shell admin) y en docs/README: Marcos Ezequiel Toledo y Matías Ríos, con LinkedIn en la documentación.
- Retiro de `muestra_pagina/` del árbol (y purge del historial). Docs de hosting saneadas (sin usuario cPanel/DB reales). Recordatorio: credenciales demo locales no van a staging/prod.

## 2026-07 — Operación en staging

- Folio/PDF institucional: fondo celeste con trama/circuitos; copy alineado al certificado oficial (intro IFTS 14 + «Ha aprobado el curso…» + cierre CABA); PDF TCPDF backend con el mismo criterio.
- Preparación producción opción A: plantillas `deploy/production/` (`AddHandler` ea-php84, `RewriteBase /certificados/`), checklist/manifiesto/instrucciones (gate PHP → DB/config separadas → smoke); guía `docs/deploy/00-cpanel-certificados.md` actualizada. Sin ZIP ni activación ni land a `main` en este paso.
- Staging `/certificados_staging/` operativo como entorno de trabajo.
- Auth admin: sesión PHP, CSRF, idle 4 h / absoluto 8 h, rate limit de login.
- Estados de certificado reducidos a **vigente | revocado** (migración `015`).
- Firmas institucionales con ratio 3:2, preview en expediente/folio y upload con recorte centrado.
- Métricas de certificaciones en listado/detalle de alumnos.
- Entrega manual sin rotar token; QR PNG admin on-demand.
- Idle/401: redirect limpio a login sin ruido de error en UI.
- Paquetes de deploy por ZIP + migraciones SQL (Composer/`vendor` como artefacto).
- Asistencias (U9 hotfix): `marcar()` en serie (evita 401 por lock de sesión PHP en cPanel); si `session_start` falla → **503** (no echa al login).

## Frontend (Angular 20)

- Shell admin, login, dashboard / mesa de trabajo.
- Cursos: listado, alta/edición, fechas, detalle.
- Detalle de curso (P8): not-found amigable, Reintentar en fallos recuperables, CTA «Ver fechas del curso» al hub, labels humanas y fechas es-AR.
- Listado de alumnos (P9): copy sin «legajo»; badges de contacto sin email literal ni chip «Con email»; métricas `0` vs «—»; HTTP intacto (mapeo OK).
- Editor de alumnos (P10): copy sin «legajo»; Reintentar en carga recuperable (+ `loadGeneration`); lote create con resumen sin navegar; 409 tipado sin PII; HTTP intacto (fallback 409 update omitido).
- Detalle de alumnos (P11): copy sin «legajo» (kicker Ficha); métricas `0` vs «—» (incl. revocadas); Reintentar solo en fallo recuperable (+ `loadGeneration`); HTTP intacto.
- Hub de asistencias (P12): agregación lineal de métricas N/M en `/admin/asistencias` (sin `.some` anidado; `cancelada` excluida; sin `alumnosActivos` como total); HTTP `listarHub` one-pass.
- Intermedia de fechas (P13): `/admin/asistencias/curso/:id` con `errorRecuperable`; títulos distintos not-found vs carga; Reintentar solo en fallo recuperable de `listarHub`; HTTP/hub/marcado intactos.
- Marcado de asistencias + emisión (P14): `errorRecuperable` + Reintentar solo en catch de carga; `mensajeErrorApi` en catch de `marcar`; emit/regen en serie (sin rotar token); tests fecha futura y orden serial. U9: `marcar` DELETE/POST también en serie (lock sesión cPanel).
- Certificados por fecha (P15): `errorRecuperable` + Reintentar solo en catch de carga; `mensajeErrorApi` en acciones Copiar/QR/PDF; enlace Expediente por fila; empty con CTA a marcar; listado por `cursoId`; DNI completo / anti-token; HTTP/backend intactos.
- Listado de certificaciones (P16): `paginasVisibles` + elipsis; `mostrarResumen` gated; grammar coincide/coinciden; filtros `vigente`|`revocado` + curso + texto; labels Válida/Revocado; DNI completo / anti-token; honesty con mensaje fijo + Reintentar (sin `errorRecuperable`); HTTP/backend intactos.
- Nueva certificación (P17): honesty P15-like (`errorCatalogosRecuperable` + `errorParRecuperable`; Reintentar solo loads); emit else vía `mensajeErrorApi` sin Reintentar/raw; copy rol edge vs Asistencias sin «complementario»; ruta/CTAs intactas; HTTP/backend intactos.
- Expediente preview (P18): honesty load hard + Reintentar gated; `mensajeErrorApi` P15-strict en QR/regen; Regenerar=API (no `/pdf`); Descargar PDF→`/pdf`; post-regen omite `publicValidationUrl` completa; DNI completo / anti-token; HTTP/backend intactos.
- Folio PDF (P19): honesty load hard + Reintentar gated; descarga `mensajeErrorApi` P15-strict; Descargar=html2canvas+jsPDF (no seam API); filename prefer `detalle.numero`; print A4 + firmas 3:2; QR canónico sin rotar; DNI completo / anti-token; HTTP/backend intactos.
- Entrega manual (P20): `allSettled` (detalle hard / entrega soft); 409 operable bedelía; `errorRecuperable` load-only; `mensajeErrorApi` P15-strict; `regenerarPdf` wired (sin rotar token; sin URL completa post-regen); PDF folio `?descargar=1`; DNI completo / anti-token; HTTP/backend intactos.
- Revocación (P21): honesty load (`errorRecuperable` + Reintentar gated; not-found sin Reintentar); submit `errorAccion` inline vía `mensajeErrorApi` P15-strict; `MOTIVO_MAX` 180; confirm/copy/sanitize motivo; flash `?revocada=1` diferido; DNI completo / anti-token; HTTP/backend intactos.
- Validación pública (P22): fechas folio `dd/mm/yyyy` es-AR (`formatearFechaFolio`); staging revoked≡404 documentado (REVOCADO solo con código explícito); Reintentar en técnico + no-encontrada; honesty sin raw/stack; DNI completo / anti-token; mapper/PHP intactos.
- NotFound / rutas huérfanas (P23): wildcard público → `NotFound` ES-AR + title; CTA único → `/admin/login` (sin `/validar`); catch-all admin prefix intacto (`/admin/typo` aislado); honesty sin stack/token/demo; sin AdminNotFound.
- Prolijidad FE (U1): sin `LandingPage`/`FolioShell` huérfanos; alias muerto `guardar()` removido (canónico `guardarYGenerar`); helper `paginasVisiblesWindow` en 4 listados; OnPush 30/30.
- Performance FE (U2): coalesce `listarHub` (`hubPending` HTTP+mock, invalidate en marcar/anular); cache de sesión `previewFirma`/`obtener`; `html2canvas`/`jspdf` solo vía `import()` al descargar PDF; nota de escala listados (cientos OK; miles → paginación/API diferida, no U6).
- Copy FE (U3): glosario UI (`docs/frontend/04-glosario-ui.md`); badge expediente **Revocado**; label **Documento**; copy «válidas»/«válida» alineada a Válida (sin lógica de negocio).
- A11y/responsive FE (U4): `trapTabKey` compartido; drawer admin con trap + `aria-modal`; diálogos entrega/revocar sin Tab al backdrop; CTAs públicos con `:focus-visible`; contraste diferido.
- Estados FE (U5): listados Reintentar/empty CTA con `btn-primary`; course-editor con Reintentar en carga recuperable; QA forced views solo `isDevMode`; 401 interceptor verificado por regresión.
- Alumnos: listado, alta/edición, detalle/expediente con trayectoria.
- Asistencias: hub por curso, intermedia de fechas, marcado, emisión/regeneración desde presentes.
- Certificaciones: listado, nueva, preview/expediente, folio PDF, entrega manual, revocación.
- Validación pública `/validar/:token` (vigente / revocado / no encontrado).
- Configuración institucional (textos y firmas).
- Sistema visual alineado a `muestra_pagina/` (tokens en `styles.css` + primitivos shared).
- Interceptor CSRF; servicios HTTP con envelope `data/meta`.

## Backend (PHP 8.4)

- `GET /health`.
- Validación pública por token (GET y consulta POST).
- CRUD admin de cursos, alumnos, fechas y asistencias.
- Emisión, consulta, entrega manual, QR PNG, PDF TCPDF, revocación.
- Config institucional y parámetros de sistema.
- Cifrado de DNI y token recuperable; hashes para búsqueda/validación.
- Hardening de rutas, rate limiting, readiness scripts.
- Sesión admin (U6): `lastSeen` se renueva en `session`/`authorize` (lecturas auth); TTL docs idle **14400** / absoluto **28800**; fallo de storage en rate-limit de login → **503** `SERVICE_UNAVAILABLE` (distinto de **429**).
- Sesión admin (U9): fallo de `session_start` por contención de lock → **503** (no **401**); sesiones concurrentes con la misma credencial permitidas (sin kick mutuo).
- Seguridad rutas/cookie (U7): deny Apache `src|config` antes de FallbackResource; cookie de sesión `lifetime=0` (D-009) vs absoluto app-side.

## Base de datos

Migraciones `001`–`015` bajo `database/migrations/` (certificados, tokens, alumnos/cursos/asistencias, integridad, email opcional, apellido/nombre, parámetros, firmas, estados vigente/revocado). Detalle en `docs/database/` y `database/docs/`.

## Calidad y proceso

- Specs en `openspec/specs/` por módulo.
- Tests PHP y specs Angular en áreas críticas (auth, emisión, PDF, HTTP).
- Checklist QA manual en `docs/qa/CHECKLIST-TESTING-MANUAL.md`.
- Gates CI documentados para frontend/backend/MariaDB/seguridad documental.

## Fuera de alcance actual

- Producción del módulo aún no activada.
- Sin SMTP ni mails automáticos.
- Gestor de usuarios y roles.
- Importación masiva real.
- Colas de trabajos asíncronos.

Ver roadmap: [`04-roadmap.md`](04-roadmap.md).
