# Design: Nueva certificación (emisión directa)

## Technical Approach

Pantalla única Angular 20 (`standalone`, `OnPush`, signals) que orquesta seams existentes y extiende `CertificationsService` con `emitir()`. Cumple REQ-EMIT-001…010: ruta estática, selectores activos, presentes `realizada` con anti-stale, preview tipográfica, POST con body exacto, handoff al detalle y errores visibles. Sin wizard ni campos fantasma.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Flujo UI | Pantalla única | Wizard 3 pasos | Contrato atómico + v0/explore; sin borrador |
| Preview data | Orquestar listados + asistencias + config | Endpoint “preparar emisión” | No inventar API |
| Presentes | `listarAsistenciasPorPar(cursoId, alumnoId)` nuevo en AttendanceService | N llamadas por fecha | Backend ya filtra `cursoId`+`alumnoId` |
| Duplicado | MAY aviso vía `listar({estado,cursoId,alumnoId})`; `409` autoridad | Solo POST | UX anticipada sin mentir |
| `issuedAt` | Hoy BA en cliente; `expiresAt: null` | Campo editable | Spec ciclo; PHP valida no futuro |
| DNI preview | `dniMostrar` | DNI completo | Admin no lo expone |
| Firmantes | Tipográficos desde `INSTITUTIONAL_CONFIG_SOURCE` | Logos/upload | Solo campos config reales |

## Data Flow

```
Select alumno/curso
    → gen++ (stale token)
    → parallel:
         COURSES.listarFechas(cursoId)
         ATTENDANCE.listarAsistenciasPorPar(cursoId, alumnoId)
         CERTS.listar({estado:'vigente', cursoId, alumnoId})  // MAY
         CONFIG.obtener()  // firmantes
    → if gen outdated → discard
    → preview + avisos (sin fechas / sin presentes / duplicado)
Emitir
    → disable CTA
    → CERTS.emitir({ alumnoId, cursoId, issuedAt, expiresAt:null })
    → 201 → Router /admin/certificaciones/:id
    → 400|409|500 → error visible, keep selection
```

## Seam Extensions

### CertificationsService
```ts
emitir(payload: EmitirCertificacionPayload): Promise<EmisionResult>;
// Payload: { alumnoId, cursoId, issuedAt, expiresAt }
// Result maps POST 201 data (id, certificateCode, …)
```
- `HttpCertificationsService`: `POST ${apiBaseUrl}/admin/certificados`, body exacto, lee `envelope.data`.
- `InMemoryCertificationsService`: emite mock elegible; simula `409` si ya hay vigente del par.
- Ampliar filtros HTTP: enviar `estado`/`cursoId`/`alumnoId` al GET list cuando existan (hoy solo client-side parcial).

### AttendanceService
```ts
listarAsistenciasPorPar(cursoId: number, alumnoId: number): Promise<readonly Asistencia[]>;
```
- HTTP: `GET /admin/asistencias?cursoId=&alumnoId=`; UI filtra `fechaEstado === 'realizada'`.
- Mock: filtrar seed por par.

### Students
- Exponer/filtrar `estado === 'activo'` en listado usado por la página (DTO backend ya trae `estado`; modelo puede sumarlo si falta).

### Courses
- Selectores: `listar({ estado: 'activo' })`; elegibilidad de fechas vía `listarFechas` + `estado === 'realizada'`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `certifications/pages/new/certification-new-page.ts` | Create | Orquestación signals |
| `.../certification-new-page.html` | Create | Selección + preview + panel |
| `.../certification-new-page.css` | Create | Tokens/chrome admin |
| `.../certification-new-page.spec.ts` | Create | Estados, emit, errores, stale |
| `certifications.models.ts` | Modify | Payload + EmisionResult |
| `certifications.service.ts` | Modify | `emitir` |
| `http-certifications.service.ts` (+spec) | Modify | POST + filtros query |
| `in-memory-certifications.service.ts` (+spec) | Modify | emitir mock |
| `attendances/.../attendance.types.ts` + HTTP/mock (+specs) | Modify | `listarAsistenciasPorPar` |
| `students.models` / HTTP si hace falta | Modify | `estado` activo |
| `app.routes.ts` (+spec) | Modify | `certificaciones/nueva` **antes** de `:id/*` |
| `certifications-list-page.html` | Modify | CTA “Nueva certificación” |
| `student-detail` CTA | Modify | Habilitar link a `nueva` si aplica |

## Route Order

Dentro de children admin, first-wins:

1. `certificaciones/nueva` ← **nuevo, estático**
2. `certificaciones/:id/pdf|entrega|revocar`
3. `certificaciones/:id`
4. `certificaciones`

## Signals / Stale

Patrón existente (`loadGeneration` / `loadGen` en list/preview):

- `alumnoId`, `cursoId`, `presentes`, `avisos`, `cargandoPar`, `emitendo`, `errorEmit`.
- Al cambiar par: `++loadGen`, set loading, clear presentes/error.
- Al resolver: aplicar solo si `gen === loadGen`.
- Emitir solo si `!bloqueado && !emitendo && !cargandoPar`.

## issuedAt Timezone

**Choice**: calcular `YYYY-MM-DD` con `America/Argentina/Buenos_Aires` en el cliente (p.ej. `Intl`/`temporal` o formatador local fijo) al armar el payload.  
**Rationale**: alinea con `validatePayload` PHP (misma zona; rechaza futuro). No enviar hora; solo fecha. Tests fijan un clock o stub de “hoy”.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit HTTP certs | POST body, envelope, 400/409/500 | `HttpTestingController` |
| Unit in-memory | emitir / 409 mock | Jasmine |
| Unit attendance | GET par + filter realizada | HttpTesting + mock |
| Page | vacíos, stale, disable doble submit, navigate on 201 | TestBed + RouterTestingHarness / spy Router |
| Routes | `nueva` no cae en `:id` | `app.routes.spec` |
| Privacy | sin DNI completo / email / token | asserts de template |

Verificación ciclo: `npm run test:ci`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`.

## Migration / Rollout

No migration. Feature reachable vía ruta + CTA; `useRealApi` conmuta mock/HTTP como el resto del admin.

## Open Questions

- [ ] ¿CTA en detalle de alumno navega con query `alumnoId` preseleccionado? (nice-to-have; no bloquea)
- [ ] ¿Fix mínimo de `publicValidationUrl` en detalle HTTP? Fuera de scope salvo que el handoff lo necesite (handoff usa `id`, no esa URL)
