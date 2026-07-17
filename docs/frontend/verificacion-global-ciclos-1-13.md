# Verificación global — frontend IFTS14 (ciclos 1–13)

**Fecha:** 2026-07-17  
**Entorno:** `ng serve` development (`useRealApi=false`) + API PHP Docker (solo auth/login) en `:8080`

## Gates técnicos

| Gate | Resultado |
|------|-----------|
| `npm run test:ci` | **747/747 SUCCESS** |
| `npx tsc --noEmit -p tsconfig.app.json` | **0** |
| `npm run build` | **0** |

## Smoke manual (Playwright, 10 pasos)

| # | Paso | Resultado | Notas |
|---|------|-----------|-------|
| 1 | Login | ✅ | `bedelia` / `password-demo-auth` → `/admin/dashboard` |
| 2 | Dashboard | ✅ | Panel carga con shell admin |
| 3 | Cursos | ✅ | Listado accesible (no se creó curso nuevo en esta corrida) |
| 4 | Alumnos | ✅ | Listado accesible (no se creó alumno nuevo) |
| 5 | Asistencias | ✅ | Marcado `/admin/cursos/1/fechas/1/asistencias` |
| 6 | Emitir certificación | ✅ | Página `/admin/certificaciones/nueva` |
| 7 | Preview | ✅ | Copiar/Compartir habilitados, sin F6-03, autoridades visibles |
| 8 | Entrega manual | ✅ | Modal OK; **Copiar link** con feedback; QR mock vía Blob (sin evento `download` en headless) |
| 9 | Validación pública vigente | ✅ | `/validar/demo-valido` → certificación válida |
| 10 | Revocado | ✅ | `/validar/demo-revocado` → “no es verificable” |

## Veredicto

**PASS WITH WARNINGS**

- Smoke en **mock local** (no staging real ni MariaDB completa).
- Pasos 3–4 y 6 no ejecutaron flujo completo crear→persistir (solo navegación a pantallas).
- Paso 8: descarga QR no capturada como evento Playwright en mock (comportamiento esperado con `createObjectURL`).
