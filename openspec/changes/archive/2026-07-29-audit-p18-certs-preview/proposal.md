# Proposal: Auditoría P18 — Preview certificación

## Intent

Cerrar §P18 en `/admin/certificaciones/:id`: firmas/acciones/revocado/URL truncada OK, pero hay `Error.message` crudo en carga/QR/regen y `publicValidationUrl` completa post-regen (leak D0). Spec aún exige Regenerar→`/pdf` vs API (P6-02).

## Scope

### In Scope

- Honesty en `certification-preview-page.*` (sin `errorRecuperable`).
- Cerrar leak D0 post-`regenerarPdf` (truncar u omitir; `entregaUrl` truncada).
- Reintentar solo en load hard controlado; id inválido/not-found **sin** Reintentar si distinguible.
- Tests honesty + anti-leak; delta MODIFIED «Previsualización segura…».

### Out of Scope

- Soft config/entrega/QR; HTTP/backend/token rotation.
- P17 archive; P19–P21; commit/push; «Entrega manual»; rediseño réplica.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-certifications-frontend`: MODIFIED «Previsualización segura y handoff explícito» — Regenerar=API (no `/pdf`); Descargar PDF→`/pdf`; honesty; URL truncada/omitida post-regen; anti-token; Reintentar solo load hard recuperable.

## Approach

Enfoque 1, defaults locked:

1. Página + tests + delta; solo `certification-preview-page.*`.
2. Load hard: fijo es-AR (*«No se pudo cargar la certificación.»* + id inválido existente). Acciones: `mensajeErrorApi` P15-strict / genérico. Sin raw `Error.message`. Sin `errorRecuperable`.
3. Reintentar → `cargar()` solo si `error()` es load hard controlado; no id inválido/not-found ni errores de acción.
4. Post-regen: no URL canónica completa (truncar u omitir); nota permanencia QR; clipboard intacto.
5. Spec: Regenerar=API; Descargar PDF→`/pdf`; anti-token; soft intactos.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.../preview/certification-preview-page.ts` | Modified | Honesty; sin URL full post-regen |
| `.../preview/certification-preview-page.html` | Modified | Truncar/omitir URL; Reintentar |
| `.../preview/certification-preview-page.spec.ts` | Modified | Anti-raw + anti-leak |
| `openspec/.../admin-certifications-frontend/spec.md` | Modified | Delta «Previsualización…» |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| URL canónica post-regen | High | Truncar/omitir; test |
| Introducir `errorRecuperable` | Med | Hard lock |
| Regenerar→`/pdf` | Med | Spec=API |
| Mezclar P17 / P19–P21 | Med | No tocar; no commit |

## Rollback Plan

Revertir solo `certification-preview-page.*` y el delta de spec.

## Dependencies

- Explore `audit-p18-certs-preview` (defaults locked).
- Honesty P15/P16 (sin `errorRecuperable` en preview).

## Success Criteria

- [ ] Sin raw `Error.message` en cargar/detR/catch/descargarQr/regenerarPdf.
- [ ] Reintentar solo load hard; no id inválido/not-found distinguible.
- [ ] Post-regen sin URL completa; `entregaUrl` truncada.
- [ ] Spec Regenerar=API; Descargar PDF→`/pdf`; anti-token.
- [ ] Soft intactos; tests verdes; hard locks OK.
