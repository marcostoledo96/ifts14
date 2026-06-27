## Exploration: deploy/cpanel-certificados (M3-05)

### Current State
- El backend PHP está implementado y hardeneado: health, validación pública (`GET /certificados/{token}/verificacion`, `POST /certificados/consulta`), emisión/revocación admin, rate limiting básico, auditoría fault-tolerant, headers de seguridad, y validación de Content-Type/JSON.
- El frontend Angular 20 aún no tiene código implementado; solo existe `apps/frontend-angular/AGENTS.md`. La muestra de v0 en `muestra_pagina/` puede estar vacía o incompleta.
- Existe un smoke test previo (`certificados_qa`) que pasó en cPanel real con éxito (REMOTE VERIFY PASSED), validando que Apache sirve la carpeta, el fallback SPA funciona y la API responde correctamente.
- La documentación de deploy vigente (`docs/deploy/00-cpanel-certificados.md`) describe la estructura esperada, build Angular, backend PHP y `.htaccess`, pero refleja un estado anterior del backend y no incluye checklist manual detallado, rollback ni referencia al smoke exitoso.
- No existe una spec OpenSpec dedicada al deploy; los requisitos de deploy están dispersos en contratos backend y prompts de Marcos.
- El rate limiting y hardening están documentados en `docs/backend/00-php84-api.md` y `docs/backend/01-contrato-api-certificados.md`.

### Affected Areas
- `docs/deploy/00-cpanel-certificados.md` — actualizar con backend actual, checklist manual, rollback, y lecciones del smoke.
- `deploy/README.md` — ampliar con estructura de archivos a subir y enlaces a docs.
- `deploy/AGENTS.md` — validar vigencia; posible ajuste menor.
- `docs/backend/00-php84-api.md` — si cambia la ruta pública o `.htaccess` del backend.
- `openspec/specs/` — crear spec de deploy si se decide formalizar el ciclo.
- `apps/backend-php/.htaccess` — documentar/registrar reglas de reescritura para cPanel.
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — ya incluye M3-05; no requiere cambio salvo referencia cruzada.

### Approaches
1. **Actualizar docs existentes sin spec nueva**
   - Pros: Mínimo esfuerzo, reutiliza documentación vigente, no agrega archivos.
   - Cons: Menos trazabilidad SDD, no queda escenario formal de deploy/rollback, difícil de verificar en verify phase.
   - Effort: Low

2. **Crear spec OpenSpec de deploy + actualizar docs**
   - Pros: Formaliza el ciclo SDD con escenarios Given/When/Then (ej. "Given backend listo, When se ejecuta checklist, Then no se suben credenciales"), facilita verify y archive, alinea con metodología del repo.
   - Cons: Un archivo más; requiere redactar escenarios de deploy manual.
   - Effort: Low-Medium

3. **Preparar paquete de deploy controlado (zip estructurado + script de verificación local)**
   - Pros: Empaqueta exactamente lo que se sube, reduce error humano, permite validar localmente antes de cPanel.
   - Cons: Puede implicar mantener un script o Makefile; riesgo de incluir archivos no deseados si no se filtra bien.
   - Effort: Medium

### Recommendation
**Opción 2, en modo Ponytail full:** crear una spec OpenSpec mínima de deploy (`openspec/specs/deploy-cpanel-certificados/spec.md`) con escenarios de checklist manual, backup, subida, verificación y rollback; y actualizar `docs/deploy/00-cpanel-certificados.md` como fuente humana operativa. No preparar un paquete zip automatizado (Opción 3) porque el deploy es manual y Marcos prefiere control paso a paso; la Opción 1 deja el ciclo SDD incompleto para verify.

Estructura sugerida a entregar en este ciclo:
```
docs/deploy/00-cpanel-certificados.md          # Actualizado
openspec/specs/deploy-cpanel-certificados/spec.md  # Nuevo
apps/backend-php/.htaccess                     # Documentado/validado
```

Notas clave:
- **No subir nada a cPanel en este ciclo**: el objetivo es documentar y preparar, no ejecutar deploy.
- **Angular no está listo**: el documento debe contemplar deploy de backend-only o placeholder, y dejar claro que el frontend se agrega en ciclo posterior (M3-06 o dedicado).
- **Backup/rollback**: documentar paso manual en cPanel (File Manager: comprimir `certificados/` actual antes de sobrescribir).
- **Credenciales**: reforzar que `config/certificados-config.example.php` se sube, pero el real se crea manualmente en cPanel fuera del webroot o en ruta segura.
- **Smoke previo**: incluir lecciones aprendidas del `certificados_qa` (errores 403 con cuerpo HTML, `.htaccess` mínimo funcional).

### Risks
- **Riesgo de subir config real por error**: si el checklist no es explícito, Marcos podría arrastrar `certificados-config.php` real al paquete. Mitigación: checklist que valide que solo existe `.example.php` en el zip/carpeta de subida.
- **Riesgo de `.htaccess` incompatible con producción**: el smoke usó una regla mínima, pero el backend actual tiene más endpoints (admin, rate limiter escribiendo temporales). Mitigación: documentar reglas exactas y probar en carpeta aislada antes de tocar `/certificados/` real.
- **Riesgo de deploy sin Angular listo**: si se publica backend-only, la ruta `/certificados/` podría quedar sin index.html o con uno desactualizado. Mitigación: documentar que el deploy inicial puede ser API-only con un `index.html` mínimo de "en construcción", o esperar a M3-06.
- **Riesgo de no tener rollback documentado**: sin pasos claros, un error en cPanel requiere improvisar. Mitigación: incluir rollback explícito en el doc (restaurar zip de backup vía File Manager).

### Ready for Proposal
**Yes.** El backend está listo, el smoke validó la infraestructura cPanel/Apache, y falta únicamente documentar el proceso manual de deploy con checklist, .htaccess, backup y rollback. No se requiere código nuevo ni dependencias.

### Archivos leídos
1. `AGENTS.md` (raíz)
2. `README.md`
3. `GUIA.md`
4. `docs/00-indice-general.md`
5. `docs/opencode/optimizacion-tokens.md`
6. `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`
7. `deploy/AGENTS.md`
8. `deploy/README.md`
9. `docs/deploy/00-cpanel-certificados.md`
10. `docs/backend/00-php84-api.md`
11. `docs/backend/01-contrato-api-certificados.md`
12. `openspec/specs/backend-validacion-publica-certificados/spec.md`
13. `openspec/specs/api-rate-limiting/spec.md`
14. `openspec/changes/archive/2026-06-25-backend-base-php-certificados/exploration.md` (referencia de formato)
15. Estructura actual de `apps/backend-php/` (11 archivos + config example + tests)
16. Estructura actual de `apps/frontend-angular/` (solo `AGENTS.md`)
