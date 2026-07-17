## Exploration: Preview de certificado (completar) — Ciclo 12

### Current State
- Angular `CertificationPreviewPage` (`/admin/certificaciones/:id`) ya tiene expediente con paridad visual a `muestra_pagina/components/admin/expediente-certificacion.tsx`. PDF, entrega y revocar están enlaces funcionales; **Copiar link** sigue `disabled` con handoff **F6-03**.
- Autoridades en la réplica documental están hardcodeadas (`Autoridad Demo Uno/Dos`); el note dice “placeholders demo”. No inyecta `INSTITUTIONAL_CONFIG_SOURCE`.
- `GET /admin/configuracion-institucional` ya existe vía `HttpInstitutionalConfigService` (`rectorName/Role`, `advisorName/Role`). Emisión (`certification-new-page`) ya consume ese token.
- URL canónica para copiar: **`obtenerEntregaManual(id).publicValidationUrl`** (`GET …/entrega-manual`). No usar `detalle.publicValidationUrl`: en mock está truncada; en HTTP `toCertificacionDetalle` mapea erróneamente `links.pdf`.
- Entrega (`certification-delivery-page`) ya implementa `copiarLink()` + fallback `execCommand`. **No hay `navigator.share` / Web Share en el frontend.**
- Capturas: `exp-desktop.png` (sanitizada vacía), `exp-mobile.png`, `exp-revoked.png` existen; la fuente de verdad UI es el TSX + Angular actual.

### Affected Areas
- `…/preview/certification-preview-page.{ts,html,css,spec.ts}` — autoridades, habilitar Copiar/Compartir, mensaje config pendiente.
- `INSTITUTIONAL_CONFIG_SOURCE` + `HttpInstitutionalConfigService` — lectura GET (sin PUT).
- `CERTIFICATIONS_SOURCE.obtenerEntregaManual` — URL canónica para clipboard/share.
- `certification-delivery-page.ts` — patrón a reutilizar (opcional: extraer helper).
- Tests F6-03 que esperan Copiar disabled / texto “F6-03” — hay que actualizarlos.
- Fuera de alcance sugerido: PDF preview (también demo authorities) salvo follow-up.

### Approaches
1. **Inline en preview (recomendado)** — Cargar config + entrega-manual en paralelo con detalle; copiar/compartir en la página; reutilizar lógica de delivery.
   - Pros: bajo acoplamiento, cierra F6-03, reusa endpoints existentes.
   - Cons: duplica un poco clipboard/share vs delivery.
   - Effort: Low–Medium

2. **Helper compartido clipboard/share** — Extraer util usada por delivery + preview.
   - Pros: un solo contrato de fallback.
   - Cons: toca delivery/tests fuera del mínimo.
   - Effort: Medium

3. **Solo navegar a /entrega para copiar** — No habilitar botón en preview.
   - Pros: cero lógica nueva.
   - Cons: no cumple el focus (habilitar Copiar/Compartir en expediente).
   - Effort: Low (descartado)

### Recommendation
**Approach 1.** En `cargar()`: `Promise.all([certs.obtener, config.obtener, certs.obtenerEntregaManual])` (entrega puede fallar → deshabilitar Copiar/Compartir con mensaje). Mostrar `rector*/advisor*` desde config; si GET falla o nombres de autoridades vacíos → mensaje **“Configuración institucional pendiente”** (sin placeholders demo). **Copiar link**: clipboard de `publicValidationUrl` canónica + feedback “Link copiado” (como v0). **Compartir**: si `navigator.share` disponible → Web Share (`url` + título); si no o falla (salvo AbortError) → mismo clipboard. Deshabilitar ambas si revocado (paridad v0). Actualizar specs F6-03.

### Risks
- `detalle.publicValidationUrl` no es canónica → copiar URL inválida si se reusa por error.
- Web Share: soporte desigual (móvil HTTPS sí; desktop limitado); fallback clipboard obligatorio.
- Criterio “config no cargada” vs “nombres vacíos” (backend default `rectorName=''`) — unificar en proposal.
- Compartir no está en Acciones del v0 (solo Copiar) — es extensión explícita del ciclo.
- Budget CSS preview ya cerca del límite.

### Ready for Proposal
**Yes** — alcance claro, endpoints y patrones existentes; listo para `sdd-propose`.
