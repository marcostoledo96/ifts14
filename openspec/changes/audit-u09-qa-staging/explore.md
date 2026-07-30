# Explore + evidencia U9 — QA staging real (Playwright)

**Cambio:** `audit-u09-qa-staging`  
**Rama:** `audit/u09-qa-staging`  
**Base URL:** `https://staging.example.edu.ar/certificados_staging/`  
**Fecha pasada:** 2026-07-30  
**Config idle/absolute (operador):** 14400 / 28800 confirmados en bootstrap staging (sin copiar secretos).

## Matriz (sin DNI/token completos)

| Check | Resultado | Evidencia |
|---|---|---|
| Health API | **PASS** | `GET …/api/health` → 200 `{status:ok}` |
| Login staging | **PASS** | Sesión admin → dashboard |
| Poll sesión + CSRF | **PASS** | `GET …/api/admin/auth/session` autenticado con CSRF |
| CSRF en mutación | **PASS** | POST sin `X-CSRF-Token` → 403 `CSRF_INVALID` |
| Deny `api/src/*` | **PARTIAL** | No sirve código; responde **406** (host) en lugar de 403 |
| Nav listados | **PASS** | Cursos (6), Alumnos, Asistencias, Certificaciones, Config |
| Flujo emit | **PASS** | Matematicas/MTM fecha 2026-07-30 → «4 certificados emitidos» (ids 14–17) |
| Entrega manual + PDF | **PASS** | Cert 13: entrega-manual 200; PDF `application/pdf` ~110 KB |
| Validación pública (válida) | **PASS** | Cert 13 API verificación `status=vigente`; HTML con válida |
| Regenerar PDF / token | **PASS** | Prefijo token estable `HpoFiXYAGCUo` antes=después |
| Revocar | **PASS** | Cert 17 → expediente **Revocado**; auditoría `revocacion ok` |
| Validación pública post-revocar | **PARTIAL** | Admin muestra Revocado; link/QR públicos deshabilitados (esperado). No se reabrió URL pública con token (clipboard ocupado / link oculto tras revocar) |
| Idle 401 / D-009 30 min | **DEFER** | Requiere espera ≥30 min con reloj; config 14400/28800 ya alineada |
| SPA 404 | **PARTIAL** | `/admin/ruta-inexistente-u09` cayó al dashboard (sin pantalla 404 explícita) |
| Marcar asistencias → 401 | **PASS (fix)** | Causa: `marcar()` en paralelo → lock sesión PHP → 401 falso. Fix: serie + BE 503. Operador subió `*-fix401` y confirmó **estable** (2026-07-30). |
| Sesiones concurrentes mismo user/pass | **OK by design** | Cada login = session ID + CSRF independientes; sin kick mutuo. Caveat: last-write-wins en mismos datos. |

## Notas

- No se leyeron ni pegaron secretos del bootstrap.
- Evidencias usan ids de certificado / prefijos de token; DNI en UI no se reproducen aquí.
- Error consola `message channel closed` = extensiones del navegador, no la app.

## Siguiente

- D-009 timed repro opcional.
- Archivar U9 tras merge del PR → `staging1.0`.
- **L1** (`staging1.0` → `main`) solo con OK explícito de Marcos.
