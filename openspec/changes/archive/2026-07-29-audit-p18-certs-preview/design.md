# Design: Auditoría P18 — Preview certificación

## Technical Approach

Auditoría quirúrgica en `certification-preview-page.*` (+ delta MODIFIED «Previsualización segura…»). Cerrar honesty (sin raw `Error.message`) y leak D0 post-regen; alinear Regenerar=API vs Descargar PDF→`/pdf`. Soft config/entrega/QR intactos. Sin HTTP/backend, sin P17 archive, sin commit.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Reintentar gate | Solo por texto de `error()` · boolean · `errorRecuperable` | Texto frágil; boolean ok; flag = paridad siblings (P15/date-certs/course-detail) pese a explore «no rename» | **`errorRecuperable` load-only** — true solo fallo hard recuperable de `obtener`; false en id inválido / not-found / éxito. Acciones QR/regen **nunca** lo setean. Documentar: no es rename soft; mirror P15. |
| Load hard copy | Raw message · fijo es-AR | Raw viola honesty | **Fijo**: *«No se pudo cargar la certificación.»* + recuperable; *«Certificación no encontrada.»* + no recuperable (id null / 404 / mensaje not-found). |
| QR / regen errors | Fixed only · `mensajeErrorApi` laxo · **P15-strict** | Laxo puede filtrar `Error.message` | **P15-strict** local: solo `HttpErrorResponse` → `error.error.message` trim; else genérico (*«No se pudo descargar el QR.»* / *«No se pudo regenerar el PDF.»*). Nunca `(e as Error).message`. |
| Post-regen URL | Full (hoy) · `truncarUrl` · omitir | Full = leak D0 | **Omitir** `r.publicValidationUrl` del bloque ok; conservar mensaje + nota permanencia. Clipboard / `entregaUrl` canónica intactos; panel validación sigue con `truncarUrl`. |
| Spec Regenerar | Navigate `/pdf` · seam API | Spec drift vs P6-02 | **Regenerar = `certs.regenerarPdf`**; **Descargar PDF = navigate `/pdf`**. |
| Soft / archive | Reescribir soft · tocar P17 | Fuera de alcance | **No tocar** soft paths ni archive P17 uncommitted. |

## Data Flow

```
effect(id) → cargar()
  reset error + errorRecuperable=false
  cid null → «Certificación no encontrada.» + recuperable=false  (sin Reintentar)
  allSettled[ obtener(hard), config(soft), entrega(soft) ]
    det rejected:
      not-found → mensaje fijo + recuperable=false
      else      → «No se pudo cargar…» + recuperable=true
    soft paths unchanged
HTML error(): mensaje + @if (errorRecuperable()) Reintentar → cargar()
descargarQr / regenerarPdf catch → mensajeErrorApi (P15-strict)
regenerarPdf ok → regeneracionResultado sin pintar publicValidationUrl
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../preview/certification-preview-page.ts` | Modify | `errorRecuperable`; honesty load; `mensajeErrorApi` P15-strict; `onReintentar` |
| `.../preview/certification-preview-page.html` | Modify | Botón Reintentar si recuperable; omitir URL post-regen |
| `.../preview/certification-preview-page.spec.ts` | Modify | Anti-raw load/QR/regen; anti-leak URL; Reintentar solo recuperable; no debilitar firmas/acciones |
| `openspec/changes/audit-p18-certs-preview/specs/admin-certifications-frontend/spec.md` | Create | Delta MODIFIED «Previsualización…» (sdd-spec) |
| Soft / HTTP / P17 archive / P19–P21 | — | **Out of scope** |

## Interfaces / Contracts

```typescript
// Load-only (no usar en catches de QR/regen):
readonly errorRecuperable = signal(false);

// P15-strict — sin fallback a Error.message:
private mensajeErrorApi(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const msg = (err.error as { error?: { message?: string } } | null)?.error?.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  }
  return fallback;
}
```

`RegenerarPdfResult.publicValidationUrl` puede seguir en el modelo/API; **no** se renderiza en Acciones.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Honesty load/QR/regen | Reject con `Error('leak…')` → UI sin substring raw; genéricos/fijos |
| Unit | Reintentar | Invalid id / not-found: sin botón; hard recuperable: llama `cargar` |
| Unit | D0 post-regen | Fixture con URL full → DOM sin canónica completa; nota permanencia sí |
| Unit | Soft / firmas / P6-02 | Tests existentes verdes sin cambio de semántica |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Cambio solo UI admin preview + tests + delta spec. Sin feature flag. No commit en este ciclo salvo pedido explícito.

## Open Questions

- None — defaults locked (user): `errorRecuperable` load-only permitido; omit URL post-regen; P15-strict QR/regen.
