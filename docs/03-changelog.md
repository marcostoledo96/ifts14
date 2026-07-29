# Changelog del producto

Registro consolidado de lo implementado. No reemplaza el historial Git ni `openspec/changes/archive/`; resume el estado útil para onboarding.

## 2026-07 — Operación en staging

- Staging `/certificados_staging/` operativo como entorno de trabajo.
- Auth admin: sesión PHP, CSRF, idle 4 h / absoluto 8 h, rate limit de login.
- Estados de certificado reducidos a **vigente | revocado** (migración `015`).
- Firmas institucionales con ratio 3:2, preview en expediente/folio y upload con recorte centrado.
- Métricas de certificaciones en listado/detalle de alumnos.
- Entrega manual sin rotar token; QR PNG admin on-demand.
- Idle/401: redirect limpio a login sin ruido de error en UI.
- Paquetes de deploy por ZIP + migraciones SQL (Composer/`vendor` como artefacto).

## Frontend (Angular 20)

- Shell admin, login, dashboard / mesa de trabajo.
- Cursos: listado, alta/edición, fechas, detalle.
- Detalle de curso (P8): not-found amigable, Reintentar en fallos recuperables, CTA «Ver fechas del curso» al hub, labels humanas y fechas es-AR.
- Listado de alumnos (P9): copy sin «legajo»; badges de contacto sin email literal ni chip «Con email»; métricas `0` vs «—»; HTTP intacto (mapeo OK).
- Editor de alumnos (P10): copy sin «legajo»; Reintentar en carga recuperable (+ `loadGeneration`); lote create con resumen sin navegar; 409 tipado sin PII; HTTP intacto (fallback 409 update omitido).
- Detalle de alumnos (P11): copy sin «legajo» (kicker Ficha); métricas `0` vs «—» (incl. revocadas); Reintentar solo en fallo recuperable (+ `loadGeneration`); HTTP intacto.
- Hub de asistencias (P12): agregación lineal de métricas N/M en `/admin/asistencias` (sin `.some` anidado; `cancelada` excluida; sin `alumnosActivos` como total); HTTP `listarHub` one-pass.
- Intermedia de fechas (P13): `/admin/asistencias/curso/:id` con `errorRecuperable`; títulos distintos not-found vs carga; Reintentar solo en fallo recuperable de `listarHub`; HTTP/hub/marcado intactos.
- Marcado de asistencias + emisión (P14): `errorRecuperable` + Reintentar solo en catch de carga; `mensajeErrorApi` en catch de `marcar`; emit/regen en serie (sin rotar token); tests fecha futura y orden serial; HTTP `marcar`/backend intactos. Smoke staging multi-PDF (verify 4.4) pendiente.
- Certificados por fecha (P15): `errorRecuperable` + Reintentar solo en catch de carga; `mensajeErrorApi` en acciones Copiar/QR/PDF; enlace Expediente por fila; empty con CTA a marcar; listado por `cursoId`; DNI completo / anti-token; HTTP/backend intactos.
- Listado de certificaciones (P16): `paginasVisibles` + elipsis; `mostrarResumen` gated; grammar coincide/coinciden; filtros `vigente`|`revocado` + curso + texto; labels Válida/Revocado; DNI completo / anti-token; honesty con mensaje fijo + Reintentar (sin `errorRecuperable`); HTTP/backend intactos.
- Nueva certificación (P17): honesty P15-like (`errorCatalogosRecuperable` + `errorParRecuperable`; Reintentar solo loads); emit else vía `mensajeErrorApi` sin Reintentar/raw; copy rol edge vs Asistencias sin «complementario»; ruta/CTAs intactas; HTTP/backend intactos.
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
