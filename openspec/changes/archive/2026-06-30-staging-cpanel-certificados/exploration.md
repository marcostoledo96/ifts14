## Exploration: staging-cpanel-certificados

### Current State

- `main` tiene mergeados PR #16 (`backend/admin-certificate-delivery`: emisión, revocación, descarga PDF y reenvío por email con transporte `stub`/`smtp`) y PR #17 (`frontend/v0-design-system`: Matías auditó `muestra_pagina/`, pero el frontend Angular real sigue siendo un shell básico con landing, validación pública y 404; `useRealApi: false`).
- El backend PHP en `apps/backend-php/` está completo para staging: `GET /health`, validación pública con rate limiting, emisión/revocación/descarga PDF/reenvío admin, auditoría fault-tolerant, `Config::load()` desde archivo externo y `composer.lock` versionado.
- El frontend Angular tiene build production con `baseHref: /certificados/` y `apiBaseUrl: /certificados/api`, pero aún usa `MockValidationSource`; el port completo desde `muestra_pagina/` queda para ciclos posteriores.
- La documentación de deploy productivo existe y está actualizada: `docs/deploy/00-cpanel-certificados.md`, `deploy/README.md`, `openspec/specs/deploy-cpanel-certificados/spec.md`. El smoke `certificados_qa` pasó en cPanel real.
- No existe un plan de staging separado del productivo. La rama `deploy/staging-cpanel-certificados` no tiene commits ahead of `main`.

### Affected Areas

- `docs/deploy/01-staging-cpanel-certificados.md` — nuevo documento con plan, checklist, plantilla de config, smoke y rollback específicos de staging.
- `deploy/README.md` — agregar enlace al nuevo doc de staging y distinguirlo del doc productivo.
- `openspec/changes/staging-cpanel-certificados/exploration.md` — este artefacto.
- Posiblemente `deploy/staging/` — carpeta opcional para guardar plantillas de `.htaccess` y checklist si se decide incluir artefactos versionables.

### Approaches

1. **Documento de staging separado + checklist**
   - Pros: Mantiene limpia la guía productiva, enfoca el alcance staging, permite iterar sin tocar el deploy real, facilita la revisión.
   - Cons: Un archivo más; requiere mantener coherencia con `docs/deploy/00-cpanel-certificados.md`.
   - Effort: Low

2. **Agregar sección staging al doc productivo existente**
   - Pros: Menos archivos, centraliza la info de deploy.
   - Cons: Mezcla preparación de staging con producción, dificulta leer solo lo de staging, puede confundir al operador.
   - Effort: Low

3. **Crear paquete de staging completo bajo `deploy/staging/`**
   - Pros: Estructura lista para copiar a cPanel, incluye `.htaccess`, config example, checklist y comandos de smoke.
   - Cons: Más archivos, riesgo de que se confunda con paquete real si no se marca claramente como preparación documental.
   - Effort: Medium

### Recommendation

**Opción 1, en modo Ponytail full:** crear `docs/deploy/01-staging-cpanel-certificados.md` como guía de preparación exclusiva para staging, con ruta propuesta `/certificados_staging/`, checklist de paquete, plantilla de configuración, comandos de smoke y plan de rollback. Actualizar `deploy/README.md` con el enlace correspondiente. No crear paquete zip ni scripts de subida: este ciclo solo prepara documentación y checklist para un deploy controlado futuro.

Notas clave:

- Ruta staging propuesta: `/certificados_staging/` bajo el mismo dominio, para no competir con `/certificados/` productivo.
- El paquete de staging debe partir del backend PHP versionado y del build Angular actual (shell básico), no del port completo de `muestra_pagina/`.
- La configuración real de staging se crea manualmente en cPanel, fuera del repo, a partir de `apps/backend-php/config/certificados-config.example.php`.
- Los comandos de smoke usan datos ficticios contra `/certificados_staging/api/health` y `/certificados_staging/validar/TOKEN_FICTICIO`.
- El rollback documenta backup previo de `/certificados_staging/` vía File Manager y restauración desde zip.

### Risks

- **Mezcla de staging con productivo** si el checklist no distingue rutas. Mitigación: usar `/certificados_staging/` explícitamente en todo el doc y no mencionar `/certificados/` salvo como referencia.
- **Subida accidental de config real** si el paquete se arma sin filtrar. Mitigación: checklist que verifique que solo existe `.example.php` y ningún `.env`/config real.
- **Publicar frontend incompleto**. Mitigación: dejar claro que staging usa el shell Angular actual con modo mock/real configurable; el port completo de v0 se hace en ciclos posteriores.
- **Tocar cPanel real en este ciclo**. Mitigación: el doc debe reiterar que este cambio no ejecuta subida ni modifica `public_html`.

### Ready for Proposal

**Yes.** El backend de Marcos está mergeado, el frontend shell existe, el smoke productivo pasó y no hay blockers para preparar una guía de staging documental. No se requiere código nuevo ni dependencias.

### Archivos leídos

1. `AGENTS.md` (raíz)
2. `README.md`
3. `GUIA.md`
4. `docs/00-indice-general.md`
5. `docs/opencode/optimizacion-tokens.md`
6. `deploy/AGENTS.md`
7. `deploy/README.md`
8. `docs/deploy/00-cpanel-certificados.md`
9. `openspec/specs/deploy-cpanel-certificados/spec.md`
10. `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/exploration.md`
11. `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/proposal.md`
12. `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/design.md`
13. `apps/backend-php/index.php`
14. `apps/backend-php/AGENTS.md`
15. `apps/backend-php/.htaccess`
16. `apps/backend-php/config/certificados-config.example.php`
17. `apps/backend-php/README.md`
18. `apps/frontend-angular/AGENTS.md`
19. `apps/frontend-angular/angular.json`
20. `apps/frontend-angular/src/app/app.config.ts`
21. `apps/frontend-angular/src/app/app.routes.ts`
22. `apps/frontend-angular/proxy.conf.json`
23. `apps/frontend-angular/src/environments/environment.ts`
24. `muestra_pagina/AGENTS.md`
25. `muestra_pagina/MANIFIESTO_V0.md`
26. `deploy/cpanel/certificados_qa_smoke/README.md`

### Documentos a actualizar

- `docs/deploy/01-staging-cpanel-certificados.md` (nuevo).
- `deploy/README.md` (enlace al doc de staging).
