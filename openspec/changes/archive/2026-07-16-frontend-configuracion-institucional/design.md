# Design: Configuración institucional Angular

## Technical Approach

Implementar Approach 1 del proposal/spec: seam HTTP realineado al DTO backend + página standalone con chrome v0 (banner, secciones sustentadas, sticky dirty) sin campos inventados. Patrones: `course-editor-page` (signals/`cargando`/`guardando`/`error`), DI `useRealApi` de cursos/alumnos, sidebar/`app.routes` existentes.

Código, comentarios y UI copy en inglés; artefactos SDD en español argentino.

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|----------|--------|----------|--------|
| Modelo | 1:1 camelCase API vs mapping ES (`nombre`…) | Mapping añade deuda; API ya está en inglés | **1:1** `institutionName`, `certificateText`, `rectorName`, `rectorRole`, `advisorName`, `advisorRole`, `updatedAt`. Eliminar `direccion`/`logoUrl`. |
| Seam | Solo GET vs +`guardar()` | Sin PUT no cumple REQ-CFG-005 | Extender `InstitutionalConfigService` con `guardar(payload)` → HTTP **PUT** `/admin/configuracion-institucional`; leer `envelope.data`. |
| Mock `useRealApi=false` | HTTP-only (hoy) vs `InMemory*` | HTTP-only rompe demo/offline; mock alinea con COURSES/STUDENTS | **Sí mock**: `InMemoryInstitutionalConfigService` + toggle en `app.routes` como el resto. Spec openspec P5-02 “HTTP-only” se actualiza en archive. |
| Form state | ReactiveForms vs signals | Curso usa signals | **Signals** + snapshot para dirty/discard. |
| Validación longitud | Truncar vs bloquear PUT | Truncar silencioso confunde | **Bloquear** PUT si vacío o supera 160/80/255; mensaje de validación. |
| Contacto/Validación | Omitir vs bloque estático | Omitir reduce chrome v0 | **Bloque estático informativo** (sin inputs). |

### Rationale mock

Explore y proposal marcaron riesgo HTTP-only. Otros seams admin ya conmutan mock/HTTP. El mock permite specs de página sin `HttpTestingController` end-to-end y demos con `useRealApi=false`. Seed con defaults PHP (`IFTS N.° 14`, roles default).

## Data Flow

```
Sidebar → /admin/configuracion → InstitutionalConfigPage
        → inject(INSTITUTIONAL_CONFIG_SOURCE)
              ├─ useRealApi=false → InMemoryInstitutionalConfigService
              └─ useRealApi=true  → HttpInstitutionalConfigService
                                        GET/PUT …/admin/configuracion-institucional
                                        envelope.data → InstitutionalConfig
Page: snapshot ← obtener()
      form signals ← user edits → dirty = form ≠ snapshot
      guardar() → PUT → snapshot = response; dirty=false
      descartar() → form = snapshot
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../institutional-config/institutional-config.service.ts` | Modify | Modelo 1:1 + `guardar()` en interfaz. |
| `.../institutional-config/http-institutional-config.service.ts` | Modify | Mapear DTO completo; PUT `guardar`. |
| `.../institutional-config/in-memory-institutional-config.service.ts` | Create | Seed mutable en memoria. |
| `.../institutional-config/institutional-config.service.spec.ts` | Modify | GET/PUT HTTP + mock básico. |
| `.../institutional-config/pages/institutional-config-page.ts` | Create | Página OnPush + signals. |
| `.../institutional-config/pages/institutional-config-page.html` | Create | Banner, 3 secciones, preview, sticky, estático contacto. |
| `.../institutional-config/pages/institutional-config-page.css` | Create | Tokens admin existentes; sticky bar. |
| `.../institutional-config/pages/institutional-config-page.spec.ts` | Create | Load/save/dirty/discard/validation. |
| `apps/frontend-angular/src/app/app.routes.ts` | Modify | Child `configuracion` lazy; provider `useRealApi ? Http : InMemory`. |
| `.../sidebar-admin.ts` (+ html/spec) | Modify | Ítem Configuración → `/admin/configuracion`; `isActive` exacto/prefix. |
| `app.routes.spec.ts` / `sidebar-admin.spec.ts` | Modify | Cubrir ruta e ítem activo. |

Path exacto de página:  
`apps/frontend-angular/src/app/features/admin/institutional-config/pages/institutional-config-page.{ts,html,css,spec.ts}`  
Clase: `InstitutionalConfigPage`, selector `app-institutional-config-page`.

## Interfaces / Contracts

```typescript
export interface InstitutionalConfig {
  readonly institutionName: string;
  readonly certificateText: string;
  readonly rectorName: string;
  readonly rectorRole: string;
  readonly advisorName: string;
  readonly advisorRole: string;
  readonly updatedAt: string | null;
}

export type InstitutionalConfigWrite = Omit<InstitutionalConfig, 'updatedAt'>;

export interface InstitutionalConfigService {
  obtener(): Promise<InstitutionalConfig>;
  guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig>;
}
```

Límites cliente: NAME 160, ROLE 80, TEXT 255 (igual PHP).

Estado página (signals): `form` (campos editables), `snapshot`, `updatedAt`, `cargando`, `guardando`, `error`, `ok`, `savedFlash`; `dirty` = computed igualdad superficial form↔snapshot.

## Integración rutas + sidebar

- Route child bajo `path: 'admin'` + `AdminShell`:  
  `{ path: 'configuracion', title: 'Admin · Institutional configuration — IFTS 14', loadComponent: () => import('.../institutional-config-page').then(m => m.InstitutionalConfigPage) }`
- Sidebar: agregar `{ label: 'Configuración', route: '/admin/configuracion', icon: … }` (pie o lista; preferir cerca de logout como v0 React).
- `isActive`: igualdad o `startsWith('/admin/configuracion')`.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit HTTP | GET/PUT URL, method, body, `data` mapping, 4xx/5xx | `HttpTestingController` |
| Unit mock | obtener/guardar muta seed | Jasmine directo |
| Unit page | load success/fail+retry, dirty, discard, block empty name, save success/error | stub `INSTITUTIONAL_CONFIG_SOURCE` |
| Unit nav | ruta registrada; sidebar link + active | `app.routes.spec` / `sidebar-admin.spec` |
| Verify | — | `test:ci` + `tsc --noEmit` + `build` |

Sin E2E en este ciclo.

## Migration / Rollout

No migration DB. Breaking change de tipo `InstitutionalConfig` (nadie consume UI aún; solo specs del seam). Actualizar specs del servicio en el mismo PR.

## Open Questions

- [x] Mock con `useRealApi` — **sí** (decisión de diseño).
- [ ] Copy exacto del banner/impacto (inglés) — fijar en apply siguiendo prompt §22 traducido o copy institucional breve.
- [ ] Ícono SVG exacto del ítem Configuración — reutilizar path settings simple inline como otros ítems.
