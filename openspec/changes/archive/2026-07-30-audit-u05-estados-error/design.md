# Design: U5 — estados loading / empty / error

## Technical Approach

Alineación quirúrgica página a página al patrón P9–P23 ya dominante (panel `estado-*`, Reintentar gated, empty con CTA navegable, honesty sin raw HTTP). Sin util/EmptyState compartido, sin API/D0, sin archive U4. Mapea proposal Approach 1 y specs lean `frontend-angular-shell` SHELL-STATE-01..04 (delta en paralelo vía sdd-spec).

## Architecture Decisions

| Decisión | Opción | Tradeoff | Decisión |
|----------|--------|----------|----------|
| Scope UI | Util EmptyState vs parches locales | DRY vs blast radius / hard lock | **Parches locales** |
| Reintentar listados | Dejar `btn-secondary` cursos vs canónico | Paridad visual vs “rediseño” | **`btn-primary`** (alumnos/certs/asistencias) |
| Empty certs | `cta-nueva` vs `btn-primary`+link | Estilo local vs patrón empty | **Empty → `btn-primary`**; header puede conservar `cta-nueva` |
| course-editor | Copiar `errorRecuperable` (detail/student-editor) | Señal + template vs solo copy | **`errorRecuperable` + Reintentar load-only** |
| QA gate | Flag `environment` vs `isDevMode` | Explicit prod vs harness local | **Solo `isDevMode`** + tests token `false` |
| 401 | Reescribir interceptor vs regresión | Riesgo login/logout | **Solo tests/spec**; NEVER+latch intacto |
| Entrega | Encadenar vs PR único | Review budget | **PR único** si ≤~400 líneas (`size:exception` aceptado) |

## Data Flow

### Listado (error / empty)

```
cargar/recargar → cargando
       │
       ├─ OK → filas → empty-total (CTA) | no-results (Limpiar) | tabla
       └─ catch → error honesty → Reintentar (btn-primary) → cargar
```

### course-editor (carga edit)

```
effect(mode,id) → recargar
       │
       ├─ id inválido → error not-found, errorRecuperable=false (sin Reintentar)
       ├─ obtener OK → aplicarDetalle
       └─ catch red/API → error honesty, errorRecuperable=true → Reintentar → recargar
Flash/submit errors: sin tocar errorRecuperable (no retry de carga).
```

### 401 (sin cambio de código)

```
HTTP 401 (≠ login) → clearSession → latch navigate /admin/login → NEVER
(página no recibe error → no panel error+Reintentar)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../courses/courses-list-page.html` | Modify | Reintentar: `btn-secondary` → `btn-primary` |
| `.../certifications/.../certifications-list-page.html` | Modify | Empty-total CTA: `cta-nueva` → `btn-primary` (mismo `routerLink`) |
| `.../courses/course-editor-page.ts` | Modify | `errorRecuperable`; set en catch/not-found; `onReintentar()` gated |
| `.../courses/course-editor-page.html` | Modify | Bloque `sinCurso`: Reintentar si recuperable + Volver a Cursos |
| `.../courses/course-editor-page.spec.ts` | Modify | RED/GREEN: load fail → Reintentar; not-found sin retry |
| `.../courses/courses-list-page.spec.ts` | Modify | Token QA `false` oculta barra |
| `.../students/.../students-list-page.spec.ts` | Modify | Idem QA `false` |
| `.../certifications/.../certifications-list-page.spec.ts` | Modify | Reforzar/asegurar QA `false` |
| `.../core/interceptors/csrf.interceptor.spec.ts` | Modify | Solo si faltan asserts NEVER/latch; **sin** cambio de `.ts` prod |
| `openspec/changes/.../specs/frontend-angular-shell/spec.md` | Create* | Delta SHELL-STATE-01..04 (*sdd-spec; no inventar aquí) |
| `attendances-list-page.*` / dashboard / config | Smoke | Sin cambio salvo regresión descubierta |
| Archive U4 / API / EmptyState util | — | **No tocar** |

## Interfaces / Contracts

Sin APIs nuevas. Contrato FE local (por página):

```typescript
readonly errorRecuperable = signal(false);
onReintentar(): void {
  if (!this.errorRecuperable()) return;
  void this.recargar(/* id actual */);
}
```

QA: `InjectionToken` factory `isDevMode`; template `@if (qaEnabled)`. Producción/staging: `isDevMode === false` → barra ausente.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit listados | Clase Reintentar / empty CTA | Query DOM `btn-primary`; empty link útil |
| Unit editor | Load fail vs not-found | Reintentar visible solo si recuperable; re-llama `obtener` |
| Unit QA | Token `false` | Ausencia de controles Vista QA |
| Unit 401 | Interceptor | clearSession + `/admin/login` + no propagate; login 401 sí propaga |
| E2E/smokes | Staging estados | **DEFER U9** |

## Threat Matrix

N/A — no hay cambio de routing shell, subprocess, VCS/PR automation ni clasificación de ejecutables. El interceptor 401 no se reescribe.

## Migration / Rollout

No migration. Deploy FE habitual. Rollback = revert commits FE + delta shell.

## Open Questions

- [x] Cursos Reintentar → `btn-primary` (locked)
- [x] Empty certs → `btn-primary`+link (locked)
- [x] QA sin flag `environment` (locked)
- [x] Dashboard/config solo smoke (locked)
- [x] Asistencias en SHELL-STATE-01 por paridad existente (locked)
- [ ] ¿Header certs `cta-nueva` se alinea en el mismo PR o queda fuera? **Default design: fuera** (solo empty-total)

## Size / delivery

Forecast authored ~150–280 líneas (HTML/TS/specs tests). **400-line budget risk: Low.** Single PR con `size:exception` si el review lo pide; no encadenar salvo creep.

## Ready for tasks?

**Sí** — approach locked, archivos concretos, tests definidos. Siguiente: `sdd-tasks` (tras o en paralelo con cierre de delta shell si aún no existe).
