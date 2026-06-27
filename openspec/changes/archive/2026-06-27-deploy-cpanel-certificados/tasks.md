# Tasks: deploy/cpanel-certificados (M3-05)

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas agregadas estimadas | 250-330 |
| Riesgo frente al presupuesto 400 | Low |
| Chained PRs recomendados | No |
| División sugerida | single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | size:exception (single PR viable) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size:exception
400-line budget risk: Low

### Suggested Work Units

| Unidad | Objetivo | PR probable | Notas |
|---|---|---|---|
| 1 | Guía cPanel completa + mapa `deploy/` | PR 1 | Base: main. Incluye `docs/deploy/00-cpanel-certificados.md` y `deploy/README.md`. Verificación documental, no deploy. |

## Phase 1: Guía operativa principal (`docs/deploy/00-cpanel-certificados.md`)

- [x] 1.1 Reescribir/ampliar la guía con: objetivo, ruta pública, estructura esperada, exclusiones y artefactos permitidos/prohibidos.
- [x] 1.2 Agregar checklist imprimible (pre, subida, validación, cierre) con afirmación explícita de que este ciclo no ejecuta la subida.
- [x] 1.3 Agregar fragmentos `.htaccess` orientativos (raíz SPA + subcarpeta API) marcados como ejemplo revisable; advertir que no capturen `/api/`.
- [x] 1.4 Agregar sección de backup manual y rollback en cPanel File Manager (renombrar/restaurar, sin improvisar).
- [x] 1.5 Agregar validación posterior con datos ficticios (health + endpoints públicos, sin DB real ni certificados reales).
- [x] 1.6 Mantener vigentes los pendientes de capacidad pública (rate limiting, fault-injection de auditoría).

## Phase 2: Mapa operativo de `deploy/` (`deploy/README.md`)

- [x] 2.1 Sustituir el contenido actual por un mapa breve: rol de la carpeta, enlace a `docs/deploy/00-cpanel-certificados.md`, lista de artefactos permitidos.
- [x] 2.2 Listar artefactos prohibidos (zips del servidor, credenciales, backups, configs reales) con una línea cada uno.

## Phase 3: Trazabilidad spec delta → guía

- [x] 3.1 Mapear cada requisito de `openspec/changes/deploy-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` a una sección verificable de la guía.
- [x] 3.2 Confirmar que los escenarios Given/When/Then se reflejan como criterios observables (pasos verificables, no prosa).

## Phase 4: Verificación documental y de seguridad

- [x] 4.1 Ejecutar `git status --ignored --short` y confirmar que no hay secretos, configs reales, dumps ni zips staged.
- [x] 4.2 Buscar en el diff rutas hacia `material_privado_no_versionar/`, valores `.env` y credenciales reales; el resultado debe ser cero.
- [x] 4.3 Si se incluyen bloques `bash`/`php` como ejemplos, ejecutar `php -l` sobre archivos locales versionables; no ejecutar contra cPanel.
- [x] 4.4 Confirmar que no se creó `.env`, que `public_html` no se tocó y que la rama queda limpia de cambios fuera del alcance.
