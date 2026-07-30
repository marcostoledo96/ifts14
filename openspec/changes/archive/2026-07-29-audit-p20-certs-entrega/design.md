# Design: Auditoría P20 — Entrega manual

## Technical Approach

Cirugía en `certification-delivery-page.{ts,html,css,spec.ts}` + delta `admin-certificate-delivery-frontend`. Cerrar 409 operable, honesty P15-strict, wire `regenerarPdf` (D0: no rota token; omitir URL completa post-regen), PDF = folio `?descargar=1` con seam `navigate=false`. Mirror estructural de preview `aplicarEntrega` / `aplicarErrorCarga`. Sin HTTP/backend, sin tocar archive P19, sin commit.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Carga paralela | `Promise.all` · **`allSettled`** | all tumba ficha en 409 | **`allSettled`**: detalle **hard**; entrega **soft** |
| 409 UI | Hard fail · soft panel | Explore/propose locked | Soft: ficha visible + `entregaError` bedelía; Copiar/QR off; **sin** Reintentar |
| 409 detect | Solo status · solo code · **ambos** | Mirror preview | `code === 'TOKEN_NOT_RECOVERABLE' \|\| status === 409` (nested `error.error.code` / `error.code`) |
| 409 copy | Preview jargon · **locked Q2** | Preview menciona `token_cipher_key` | *«No se pudo recuperar el enlace de validación de este certificado. El QR no se regenera solo; contactá a sistemas.»* |
| Load hard | Raw · **fijo + flag** | Honesty | Mirror P18/P19 `aplicarErrorCarga`: not-found fijo + `errorRecuperable=false`; else *«No se pudo cargar la certificación.»* + `true` |
| Reintentar | Siempre · nunca · **gated** | Default locked 5 | Solo `@if (errorRecuperable())` en panel hard; 409/QR/PDF/regen **nunca** setean el flag |
| Action errors | Raw · laxo · **P15-strict** | Tests hoy esperan raw | Local `mensajeErrorApi(err, fallback)` — solo envelope `HttpErrorResponse.error.error.message`; else fallback es-AR |
| Regen | Stub · **wire seam** | REQ-DEL-005 stub | `volverARegenerarPdf` → `certs.regenerarPdf(cid)` → re-fetch `obtenerEntregaManual`; éxito sin `publicValidationUrl` en UI |
| PDF handoff | Blob TCPDF · **folio navigate** | Alinear REQ-DEL-008 | `router.navigate(..., { queryParams: { descargar: '1' } })`; no `descargarPdf` Blob |
| Test PDF | Solo spy navigate · **`navigate=false`** | Propose locked | `descargarPdf({ navigate?: boolean })` default true; `false` → `createUrlTree`+`serializeUrl`, sin location change |
| Scope | +HTTP · +P19 · front-only | Hard locks | Front-only; leave P19 archive; no P21 |

## Data Flow

```
effect(id) → cargar()
  reset: detalle/entrega/error/entregaError/qrError/regenerarMsg; errorRecuperable=false
  cid null → «Certificación no encontrada.» + recuperable=false
  allSettled[ obtener(cid), obtenerEntregaManual(cid) ]
    det rejected → aplicarErrorCarga(reason); return  // hard; ficha off
    det OK → detalle.set; aplicarEntrega(entR)        // soft 409/other
HTML hard error(): msg + @if (errorRecuperable) Reintentar → cargar()
HTML soft: ficha + entregaError; Copiar/QR disabled si !validarUrl()
QR/PDF catch → qrError = mensajeErrorApi(..., fallback)
volverARegenerarPdf → regenerarPdf → re-fetch entrega → regenerarMsg fijo (sin URL)
descargarPdf({navigate:true|false}) → folio tree ?descargar=1
```

```mermaid
sequenceDiagram
  participant U as Bedelía
  participant D as DeliveryPage
  participant C as CertificationsSource
  participant R as Router
  U->>D: /entrega/:id
  D->>C: allSettled obtener + obtenerEntregaManual
  alt detalle fail
    D-->>U: hard msg + Reintentar iff recuperable
  else entrega 409 TOKEN
    D-->>U: ficha + bedelía 409; CTAs Copiar/QR off
  else OK
    D-->>U: ficha + URL + CTAs
  end
  U->>D: Volver a generar PDF
  D->>C: regenerarPdf(cid)
  D->>C: obtenerEntregaManual(cid)
  D-->>U: regenerarMsg sin URL completa
  U->>D: Descargar PDF
  D->>R: navigate folio ?descargar=1 (o serialize si navigate=false)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../delivery/certification-delivery-page.ts` | Modify | `allSettled`; `errorRecuperable`; `entregaError`; `aplicarErrorCarga` / `aplicarEntrega`; `mensajeErrorApi`; wire regen + re-fetch; `descargarPdf({navigate})`; import `HttpErrorResponse` |
| `.../delivery/certification-delivery-page.html` | Modify | Reintentar gated; panel `entregaError`; disable Copiar/QR sin URL; regen async feedback |
| `.../delivery/certification-delivery-page.css` | Touch-if-needed | Estilos mínimos panel soft / Reintentar si faltan clases |
| `.../delivery/certification-delivery-page.spec.ts` | Modify | Anti-raw; 409 soft; Reintentar load-only; regen spy; `navigate=false` URL; drop stub/raw expects |
| `openspec/changes/.../specs/admin-certificate-delivery-frontend/spec.md` | Create | Delta MODIFIED 005/008 + honesty/409 (sdd-spec) |
| P19 archive / pdf-preview / backend / HTTP | — | **Out of scope** |

## Interfaces / Contracts

```typescript
readonly errorRecuperable = signal(false); // load-only
readonly entregaError = signal('');        // soft entrega / 409

private mensajeErrorApi(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const msg = (err.error as { error?: { message?: string } } | null)?.error?.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  }
  return fallback;
}

async descargarPdf(options: { navigate?: boolean } = {}): Promise<void>
// navigate!==false → router.navigate; else serializeUrl(createUrlTree(...)) sin location
```

Post-regen: **no** pintar `result.publicValidationUrl`; actualizar `entrega` vía re-fetch (mapea `pdfStatus` DTO).

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (Karma/Jasmine) | 409 soft + copy; hard recuperable/not-found; anti-raw QR/PDF/load; regen calls seam + no URL leak; PDF tree `?descargar=1` con `navigate=false` | Rewrite delivery `spec.ts`; spy `regenerarPdf` / `obtenerEntregaManual` / Router |
| Integration / E2E / HTTP | — | Out of scope |

## Threat Matrix

N/A — no routing config, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Existing Angular `Router.navigate` handoff unchanged in threat surface.

## Migration / Rollout

No migration required. Front-only; revert page + spec delta.

## Open Questions

- None — defaults 1–10 + LOCK accepted (409/load copy; re-fetch post-regen; HTTP only if mapping proven broken).
