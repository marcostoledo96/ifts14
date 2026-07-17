# Design: Preview de certificado — Copiar/Compartir y autoridades

## Technical Approach

Cerrar F6-03 **inline** en `CertificationPreviewPage` (Approach 1): carga paralela de detalle + config institucional + entrega-manual; Copiar/Compartir usan solo `obtenerEntregaManual().publicValidationUrl`; autoridades desde `INSTITUTIONAL_CONFIG_SOURCE`. Cumple REQ-CPREV-001…007. Sin helper compartido, sin backend, sin tocar PDF preview.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Alcance | Inline en preview | Helper clipboard/share; solo navegar a /entrega | Explore/proposal: mínimo acoplamiento; cierra CTAs en expediente |
| Carga | `Promise.allSettled` de `obtener` + `config.obtener` + `obtenerEntregaManual` | Un solo `Promise.all` | Detalle falla → expediente error; entrega/config fallan soft |
| URL canónica | Solo `entrega.publicValidationUrl` | `detalle.publicValidationUrl` | Mock truncada; HTTP mapea `links.pdf` (no canónica) |
| Clipboard | Copiar patrón delivery (`writeText` + `execCommand`) | Extraer util | Ponytail: no tocar delivery/tests |
| Compartir | `navigator.share` si existe; else clipboard | Solo clipboard | Spec ciclo; `AbortError` = silencio |
| Config pendiente | GET fail **OR** ambos `rectorName`/`advisorName` vacíos tras trim | Solo fail; roles vacíos | Lock 3; un nombre basta para firmas |
| Acciones vs config | Config pendiente **no** deshabilita Copiar/Compartir | Bloquear por config | Non-goal + REQ-CPREV-006 |
| F6-03 | Remover handoff `link` y textos | Dejar disabled | Cierre REQ-CPREV-007 |

## Data Flow

```
effect(id) → cargar(gen++)
  → allSettled:
       CERTS.obtener(id)              → hard: error expediente si rejected
       CONFIG.obtener()               → soft: null → configPendiente
       CERTS.obtenerEntregaManual(id) → soft: null → sin URL canónica
  → if gen stale → discard
  → signals: detalle, config?, urlCanonica?, configPendiente
  → puedeCopiarCompartir = !revocado && urlCanonica no vacía

Copiar:
  url = urlCanonica → clipboard → feedback "Link copiado" (~2.6s)

Compartir:
  if navigator.share → share({url, title})
    AbortError → return (sin error, sin clipboard)
    otro error / sin share → mismo clipboard que Copiar
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `…/preview/certification-preview-page.ts` | Modify | Inject config; carga paralela; signals; `copiarLink`/`compartir`; quitar `handoffs.link` |
| `…/preview/certification-preview-page.html` | Modify | Habilitar Copiar; botón Compartir; autoridades reales / mensaje pendiente; quitar F6-03 |
| `…/preview/certification-preview-page.css` | Modify | Estilos mínimos Compartir / aviso pendiente si hace falta |
| `…/preview/certification-preview-page.spec.ts` | Modify | REQ-CPREV escenarios; eliminar asserts F6-03 disabled |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modify | Delta F6-03 → comportamiento habilitado (en archive) |

Sin cambios a HTTP/mock services (ya exponen `obtenerEntregaManual` y config GET).

## Interfaces / Contracts

```ts
// Signals nuevos (preview)
entregaUrl = signal<string | null>(null);      // canónica o null
configPendiente = signal(boolean);
autoridades = signal<{ rectorName, rectorRole, advisorName, advisorRole } | null>(null);
copiado = signal(false);
puedeCopiarCompartir = computed(
  () => !estadoRevocado() && !!entregaUrl()?.trim(),
);

// Criterio pendiente (lock)
configPendiente =
  configRejected
  || (!rectorName.trim() && !advisorName.trim());
```

Display decorativo de URL (ficha QR) puede seguir mostrando `detalle.publicValidationUrl` truncada; **acciones nunca la usan**.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit page | Carga paralela; entrega fail → expediente OK + CTAs off | Mock CERTS/CONFIG spies |
| Unit page | Copiar usa URL entrega, no detalle | Spy clipboard + URLs distintas |
| Unit page | Revocado → ambos disabled | Fixture estado |
| Unit page | AbortError → sin clipboard/error | Reject `share` con `name:'AbortError'` |
| Unit page | Sin share → clipboard | Stub `navigator.share` ausente |
| Unit page | Config fail / nombres vacíos → mensaje; CTAs on | Spies |
| Unit page | Sin F6-03 / sin Autoridad Demo / solo masked | Text asserts |
| Privacy checks | `__checks__` existentes | No regresión |

Comando focalizado: `npx ng test --include='**/certification-preview-page.spec.ts'`.

## Migration / Rollout

No migration. Feature flag = comportamiento al abrir `/admin/certificaciones/:id`. Rollback = revert preview + specs F6-03.

## Open Questions

None — locks del spec resuelven AbortError, URL canónica y criterio de config pendiente.
