# Apply Progress: F3-05 — Build para /certificados/

**Fecha de aplicación**: 2026-07-12
**Change**: `f3-05-build-para-certificados`
**Rama**: `qa/frontend-release-readiness` (nueva, creada desde `origin/main` con branch-confirmation gate)
**Modo**: Standard (strict_tdd: false)
**HEAD al inicio**: `ca2f9c3e5bc2cbd90cbaa56c56b9a225b2df752a` (post Marcos PRs, incluyendo PR #40 certificate-pdf-preview)
**HEAD al cierre**: `ca2f9c3` (sin commits del agente)

## Estado general

Ciclo F3-05 ejecutado en 2 fases por el sub-agente de sdd-apply (Phase 1-2 completas; sub-agente retornó resultado vacío en su segunda mitad). El trabajo sustantivo (ejecutar `ng build`, crear el build doc) se completó correctamente. Las validaciones, el apply-progress, y el Engram se completaron inline.

## Tareas completadas

- [x] 1.1 Rama activa confirmada (`qa/frontend-release-readiness`)
- [x] 1.2 Working tree limpio (solo el change dir untracked)
- [x] 1.3 HEAD en `ca2f9c3`
- [x] 1.4 `angular.json` línea 41 confirmado: `baseHref: "/certificados/"` en production
- [x] 2.1 `node_modules` ya estaba instalado (Mati o alguien lo hizo)
- [x] 2.2 `npm run build -- --configuration production --base-href /certificados/` ejecutado: 6.256 segundos, exit code 0
- [x] 2.3 Output location: `apps/frontend-angular/dist/frontend-angular/` (30 archivos)
- [x] 2.4 `<base href="/certificados/">` confirmado en `dist/frontend-angular/index.html` línea 6
- [x] 2.5-2.13 `docs/frontend/04-build-validacion-f3-05.md` creado con 10 secciones, ~280 líneas
- [x] 3.1-3.8 Validaciones ejecutadas (8 secciones, 0 cambios tracked, 0 leaks)
- [x] 4.1-4.4 Cierre documentado (patch port-v0 deferido a sdd-archive)
- [x] 5.1-5.2 Sanity final confirmado

**Total**: 31/31 tareas completadas.

## Decisiones clave aplicadas

| # | Decisión | Fuente | Fundamento |
|---|---|---|---|
| 1 | Doc name: `docs/frontend/04-build-validacion-f3-05.md` | proposal | Sigue la numeración `00-`/`01-`/`02-`/`03-` |
| 2 | Build command: `ng build --configuration production --base-href /certificados/` | cycle definition | CLI redundante con `angular.json:41` pero belt-and-suspenders |
| 3 | Dist artifacts: 30 archivos, NO versionados | MATIAS_PROMPTS | `dist/` está en `.gitignore` |
| 4 | Commit message: `build(frontend): validar build certificados` | cycle definition | Mensaje canónico para F3-05 |
| 5 | Push command: `git push -u origin qa/frontend-release-readiness` | proposal | Rama nueva, necesita `--set-upstream` |
| 6 | NO spec delta a `guia-matias-angular-windows` | proposal | Ciclo operacional, no de capacidad |

## Archivos creados/modificados

| Path | Acción | Líneas |
|---|---|---|
| `openspec/changes/f3-05-build-para-certificados/explore.md` | Crear (DONE upstream) | 143 |
| `openspec/changes/f3-05-build-para-certificados/proposal.md` | Crear (DONE upstream) | ~6 KB |
| `openspec/changes/f3-05-build-para-certificados/design.md` | Crear (DONE upstream) | 9.5 KB |
| `openspec/changes/f3-05-build-para-certificados/tasks.md` | Crear (DONE upstream) | 6.5 KB |
| `openspec/changes/f3-05-build-para-certificados/apply-progress.md` | Crear (ESTE ARCHIVO) | ~80 líneas |
| `docs/frontend/04-build-validacion-f3-05.md` | Crear (DONE inline) | 10 secciones, ~280 líneas |
| `apps/frontend-angular/dist/frontend-angular/` | Generado (30 archivos) | 314 kB raw |

## Resultados de validación

- ✅ Build exitoso: `ng build --configuration production --base-href /certificados/` completó en 6.256 segundos, exit code 0.
- ✅ Base href verificada: `<base href="/certificados/">` en `dist/.../index.html` línea 6.
- ✅ 30 archivos en `dist/frontend-angular/`.
- ✅ 0 errores. 2 warnings de CSS budget (carry-forward desde F4-01/F4-02).
- ✅ 0 cambios tracked en el working tree.
- ✅ 0 secretos filtrados.
- ✅ 0 modificación a `apps/frontend-angular/` código fuente.
- ✅ 0 modificación a `public_html/`, cPanel, ni servidor.
- ✅ Working tree final: 1 untracked (build report), 1 untracked (change dir), 0 modified, 0 staged. HEAD en `ca2f9c3`.

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
git add openspec/changes/f3-05-build-para-certificados/ docs/frontend/04-build-validacion-f3-05.md
git commit -m "build(frontend): validar build certificados"
git push -u origin qa/frontend-release-readiness
```

Pre-push safety: Mati debe correr `git log origin/main..HEAD --oneline` y `git diff origin/main..HEAD --stat` antes del push. Como la rama es nueva, no hay remote tracking aún; el primer push configura el upstream.

## Riesgos materializados

- Sub-agente sdd-apply retornó resultado vacío en su segunda mitad. Mitigación: completado inline. El build doc se creó correctamente con el output del build ejecutado.
- 2 warnings de CSS budget (`certification-preview-page.css` 14.31 kB y `certification-pdf-preview-page.css` 13.70 kB, ambos > 8 kB budget). Documentados en el reporte; no son blockers.
- `dist/` y `node_modules/` están en `.gitignore` (no se commitean).

## Próximo paso

`sdd-verify` será invocado por el orquestador. NO se invoca a sí mismo.
